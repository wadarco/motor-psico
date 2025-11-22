import { useEffect, useState } from 'react'

export interface MessageAction<T = unknown> {
  readonly type: string
  readonly payload: T
}

export function useMessage<T extends MessageAction>(type: string) {
  const [message, setMessage] = useState<T['payload']>()

  useEffect(() => {
    const handler = ({ origin, data }: MessageEvent<MessageAction<T>>) => {
      if (origin !== window.origin || data.type !== type) return
      setMessage(data.payload)
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  })

  return message
}
