export interface Message<T> {
  payload: T
}

export class ChannelBridge<Send, Receive> {
  private port: MessagePort

  constructor(port: MessagePort) {
    this.port = port
    this.port.start()
  }

  send(data: Send): void {
    this.port.postMessage(data)
  }

  onMessage(callback: (data: Receive) => void): void {
    this.port.addEventListener('message', (event: MessageEvent<Receive>) => {
      callback(event.data)
    })
  }

  close(): void {
    this.port.close()
  }
}

export class ChannelBuilder<Send, Receive> {
  private target: Worker | Window | null = null
  private targetOrigin: string = '*'
  private handshakeKey: string | undefined
  private constructor() {}

  static create<Send, Receive>(): ChannelBuilder<Send, Receive> {
    return new ChannelBuilder<Send, Receive>()
  }

  /**
   * @param target The Worker instance or the Iframe's contentWindow.
   * @param origin Target origin for Iframes. Defaults to "*". Ignored for Workers.
   */
  withTarget(target: Worker | Window, origin: string = '*'): this {
    this.target = target
    this.targetOrigin = origin
    return this
  }

  /**
   * @param key the specific signal string the target listens for
   */
  withHandshakeKey(key: string): this {
    this.handshakeKey = key
    return this
  }

  build(): ChannelBridge<Send, Receive> {
    if (!this.target) {
      throw new Error('Target must be provided before building.')
    }

    const { port1, port2 } = new MessageChannel()
    const payload = { key: this.handshakeKey }

    // Workers and Windows have different postMessage signatures
    this.target instanceof Worker
      ? this.target.postMessage(payload, [port2])
      : this.target.postMessage(payload, this.targetOrigin, [port2])

    return new ChannelBridge<Send, Receive>(port1)
  }
}
