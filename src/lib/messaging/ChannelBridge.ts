import { isMessage, type Message, message } from './Message.ts'

export class ChannelBridge<
  Outbound extends Message<string, unknown> = never,
  Inbound extends Message<string, unknown> = never,
> {
  declare readonly InboundType: Inbound
  private readonly boundTransports = new Set<Transport>()
  private readonly methods = new Map<
    Inbound['type'],
    Set<<I>(msg: I) => void>
  >()

  private handleMessage = (msg: unknown) => {
    if (!isMessage(msg) || !this.methods.has(msg.type)) return
    this.notify(msg)
  }

  private notify<T extends Inbound['type']>(message: Message<T, unknown>) {
    const handlers = this.methods.get(message.type)
    if (handlers) for (const handler of handlers) handler(message.payload)
  }

  bindTo<I, O>(channel: Transport<I, O>): ChannelBridge<Outbound, Inbound> {
    if (!this.boundTransports.has(channel)) {
      channel.subscribe(this.handleMessage)
      this.boundTransports.add(channel)
    }
    return this
  }

  unbindFrom<I, O>(target: Transport<I, O>): ChannelBridge<Outbound, Inbound> {
    if (this.boundTransports.has(target)) {
      target.unsubscribe(this.handleMessage)
      this.boundTransports.delete(target)
    }
    return this
  }

  on<T extends string, A>(
    type: T,
    handler: (msg: A) => void,
  ): ChannelBridge<Outbound, Message<T, A> | Inbound> {
    const methods = this.methods.get(type) ?? new Set()
    methods.add(handler as () => void)
    this.methods.set(type, methods)
    return this
  }

  off<T extends string, A>(
    type: T,
    handler: (msg: A) => void,
  ): ChannelBridge<Outbound, Exclude<Inbound, Message<T, A>>> {
    const methods = this.methods.get(type)
    if (methods) methods.delete(handler as () => void)
    return this as unknown as ChannelBridge<never, never>
  }

  send(
    message: [Outbound] extends [never] ? Message<string, unknown> : Outbound,
  ): ChannelBridge<Outbound, Inbound> {
    for (const c of this.boundTransports) c.send(message)
    return this
  }
}

export interface Transport<Inbound = unknown, Outbound = unknown> {
  send(message: Outbound): void
  subscribe(f: (message: Inbound) => void): void
  unsubscribe(f: (message: Inbound) => void): void
}

export class MessageTransport implements Transport<never, never> {
  private readonly listeners = new Set<(message: unknown) => void>()

  constructor(private readonly port: MessagePort) {
    port.start()
    this.port.addEventListener('message', (evt) => this.notify(evt.data))
  }

  private notify(message: unknown): void {
    for (const listener of this.listeners) listener(message)
  }

  send<T>(message: T): void {
    this.port.postMessage(message)
  }

  subscribe<T>(f: (message: T) => void): void {
    this.listeners.add(f as () => void)
  }

  unsubscribe<T>(f: (message: T) => void): void {
    this.listeners.delete(f as () => void)
  }
}

export interface ChannelDependencies {
  messageType: string
  Bridge: typeof ChannelBridge
  Transport: typeof MessageTransport
}

interface ChannelStrategy<T> {
  createBridge(client: T, deps: ChannelDependencies): ChannelBridge
}

export class ChannelFactory {
  constructor(private readonly deps: ChannelDependencies) {}

  create<T>(client: T, strategy: ChannelStrategy<T>): ChannelBridge {
    return strategy.createBridge(client, this.deps)
  }
}

export class InitiatorStrategy implements ChannelStrategy<Window | Worker> {
  createBridge(
    client: Window | Worker,
    deps: ChannelDependencies,
  ): ChannelBridge {
    const channel = new MessageChannel()
    const transport = new deps.Transport(channel.port1)
    const bridge = new deps.Bridge()
      .on(deps.messageType, () => open())
      .bindTo(transport) as ChannelBridge

    const open = () => bridge.off(deps.messageType, open)
    const handshake = message(deps.messageType)(channel.port2)

    client instanceof Worker
      ? client.postMessage(handshake, [channel.port2])
      : client.postMessage(handshake, '*', [channel.port2])

    return bridge
  }
}

export class EventStrategy implements ChannelStrategy<MessageEvent> {
  createBridge(evt: MessageEvent, deps: ChannelDependencies): ChannelBridge {
    const { data } = evt
    if (!(data.payload instanceof MessagePort)) {
      throw new Error('Invalid MessagePort payload')
    }
    const transport = new deps.Transport(data.payload)
    const handshake = message(deps.messageType)()

    return new deps.Bridge().bindTo(transport).send(handshake)
  }
}
