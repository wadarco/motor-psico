export interface Message<T extends string, A> {
  readonly type: T
  readonly payload: A
}

export const message =
  <T extends string>(type: T) =>
  <P = null>(payload?: P): Message<T, P> => ({
    type,
    payload: payload ?? (null as P),
  })

export function isMessage(value: unknown): value is Message<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  return 'type' in value && typeof value.type === 'string' && 'payload' in value
}
