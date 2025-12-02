export interface Message<T extends string, A> {
  readonly type: T
  readonly payload: A
}

export class MessageBuilder<T extends string, A> {
  readonly Payload!: A
  private constructor(private readonly type: T) {}

  static of<Payload>(type: string): MessageBuilder<typeof type, Payload> {
    return new MessageBuilder<typeof type, Payload>(type)
  }

  build(payload: A): Message<T, A> {
    return {
      type: this.type,
      payload,
    }
  }
}

export interface MessageLister<T extends string, A> {
  readonly type: T
  readonly handler: (msg: Message<T, A>) => void
}

export class ChannelBridge {
  private readonly listeners = new Map<
    string,
    Set<<Receive>(message: Receive) => void>
  >()

  constructor(private readonly port: MessagePort) {
    this.port.start()
    this.port.addEventListener('message', ({ data }) => this.notify(data))
  }

  private notify<Receive>(message: Message<string, Receive>) {
    const handlers = this.listeners.get(message.type)
    if (!handlers) return
    for (const handler of handlers) {
      handler(message.payload)
    }
  }

  send<T extends string, A>(message: Message<T, A>): void {
    this.port.postMessage(message)
  }

  // biome-ignore lint/suspicious/noExplicitAny: TODO/infer
  on<T extends string>(type: T, handler: (message: any) => void): void {
    const handlers = this.listeners.get(type) ?? new Set()
    handlers.add(handler)
    this.listeners.set(type, handlers)
  }

  // biome-ignore lint/suspicious/noExplicitAny: TODO/infer
  off<T extends string>(type: T, handler: (message: any) => void): void {
    const handlers = this.listeners.get(type)
    if (handlers) handlers.delete(handler)
  }

  close(): void {
    this.port.close()
    this.listeners.clear()
  }
}

export namespace ChannelFactory {
  export const InitMessageType = '~channel/INIT_CHANNEL'
  export type InitMessageType = typeof InitMessageType

  export function createAndTransfer(target: Worker | Window) {
    const channel = new MessageChannel()
    const HandshakeMessage = MessageBuilder.of<null>(InitMessageType)
    const message = HandshakeMessage.build(null)

    target instanceof Worker
      ? target.postMessage(message, [channel.port2])
      : target.postMessage(message, '*', [channel.port2])

    return new ChannelBridge(channel.port1)
  }

  export function accept(evt: MessageEvent) {
    const port = evt.ports?.[0]

    if (!port) {
      throw new Error(
        'ChannelBridge cannot be created: No MessagePort found in event.',
      )
    }
    return new ChannelBridge(port)
  }
}
