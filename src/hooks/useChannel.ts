import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import {
  type ChannelBridge,
  ChannelFactory,
  MessageBuilder,
} from '~/lib/messaging.ts'

export function useChannel<Send, Receive>(
  type: string,
  listenTo: string,
  target: RefObject<Worker | Window | null>,
) {
  const [message, setMessage] = useState<Receive>()
  const channelRef = useRef<ChannelBridge>(null)
  const MsgBuilder = useRef(MessageBuilder.of<Send>(type))

  const sendMessage = useCallback(
    (data: Send) =>
      void channelRef.current?.send(MsgBuilder.current.build(data)),
    [],
  )

  useEffect(() => {
    if (!target.current) return
    const _target = target.current

    target.current.addEventListener(
      'load',
      () => {
        channelRef.current = ChannelFactory.createAndTransfer(_target)
        channelRef.current.on(listenTo, setMessage)
      },
      { once: true },
    )
  }, [target.current, listenTo])

  return { message, sendMessage }
}
