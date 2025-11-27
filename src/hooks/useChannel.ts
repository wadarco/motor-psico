import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { type ChannelBridge, ChannelBuilder } from '~/lib/messaging'

export function useChannel<Send, Receive>(
  key: string,
  target: RefObject<Worker | Window | null>,
) {
  const [message, setMessage] = useState<Receive>()
  const channelRef = useRef<ChannelBridge<Send, Receive>>(null)

  const sendMessage = useCallback(
    (data: Send) => void channelRef.current?.send(data),
    [],
  )

  useEffect(() => {
    if (!target.current) return
    const _target = target.current
    const origin = window.location.origin

    target.current.addEventListener(
      'load',
      () => {
        channelRef.current = ChannelBuilder.create<Send, Receive>()
          .withHandshakeKey(key)
          .withTarget(_target, origin)
          .build()

        channelRef.current?.onMessage(setMessage)
      },
      { once: true },
    )
  }, [key, target.current])

  return { message, sendMessage }
}
