export interface Result<out A, out E = never> {
  isOk(): this is Ok<A, E>
  isErr(): this is Err<A, E>
  match<R>(handlers: { Ok: (value: A) => R; Err: (error: E) => R }): R
}

class Ok<A, E = never> implements Result<A, E> {
  constructor(public readonly value: A) {}

  isOk(): this is Ok<A, E> {
    return true
  }

  isErr(): this is Err<A, E> {
    return false
  }

  match<R>(handlers: { Ok: (value: A) => R; Err: (error: E) => R }): R {
    return handlers.Ok(this.value)
  }
}

class Err<A = never, E = never> implements Result<A, E> {
  constructor(public readonly error: E) {}

  isOk(): this is Ok<A, E> {
    return false
  }

  isErr(): this is Err<A, E> {
    return true
  }

  match<R>(handlers: { Ok: (value: A) => R; Err: (error: E) => R }): R {
    return handlers.Err(this.error)
  }
}

export const ok = <const T>(value: T) => new Ok(value)
export const err = <const T>(value: T) => new Err(value)
