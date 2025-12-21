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

export function isMessage(value: unknown): value is Message<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  return 'type' in value && typeof value.type === 'string' && 'payload' in value
}
