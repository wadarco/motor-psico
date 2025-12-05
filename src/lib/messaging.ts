export interface Message<T extends string, A> {
  readonly type: T
  readonly payload: A
}

export class MessageBuilder<T extends string, A> {
  readonly Payload!: A
  private constructor(private readonly type: T) {}

  static of<T extends string>(type: T): MessageBuilder<T, null> {
    return new MessageBuilder<T, null>(type)
  }

  withPayload<const P = null>(): MessageBuilder<T, P> {
    return this as unknown as MessageBuilder<T, P>
  }

  build(...args: null extends A ? [payload?: A] : [payload: A]): Message<T, A> {
    return {
      type: this.type,
      payload: args[0] ?? (null as A),
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
  private readonly messageQueue = new Set<Message<string, unknown>>()
  private isOpen: boolean = false

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
    this.isOpen
      ? this.port.postMessage(message)
      : this.messageQueue.add(message)
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

  open() {
    this.isOpen = true
    if (this.messageQueue.size === 0) return

    for (const message of this.messageQueue) {
      this.port.postMessage(message)
      this.messageQueue.delete(message)
    }
  }

  close(): void {
    this.isOpen = false
    this.port.close()
    this.listeners.clear()
  }
}

export namespace ChannelFactory {
  export const handshakeType = '~channel:handshake'
  const handshakeMessage = MessageBuilder.of(handshakeType)

  export function createAndTransfer(target: Worker | Window) {
    const channel = new MessageChannel()
    const bridge = new ChannelBridge(channel.port1)
    const message = handshakeMessage.build()

    const open = (): void => {
      bridge.open()
      bridge.off(handshakeType, open)
    }
    bridge.on(handshakeType, open)

    target instanceof Worker
      ? target.postMessage(message, [channel.port2])
      : target.postMessage(message, '*', [channel.port2])

    return bridge
  }

  export function accept(evt: MessageEvent) {
    const port = evt.ports?.[0]

    if (!port) {
      throw new Error(
        'ChannelBridge cannot be created: No MessagePort found in event.',
      )
    }

    const bridge = new ChannelBridge(port)
    const message = handshakeMessage.build()
    bridge.open()
    bridge.send(message)

    return bridge
  }
}
