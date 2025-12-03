import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  type ChannelBridge,
  ChannelFactory,
  MessageBuilder,
} from '~/lib/messaging.ts'

export function useChannel<Send, Receive>(
  type: string,
  listenTo: string,
  targetRef: RefObject<Worker | Window | null>,
) {
  const [message, setMessage] = useState<Receive>()
  const channelRef = useRef<ChannelBridge>(null)
  const msgBuilder = useMemo(
    () => MessageBuilder.of(type).withPayload<Send>(),
    [type],
  )

  const sendMessage = useCallback(
    (data: Send) => {
      if (!channelRef.current) return
      const payload = msgBuilder.build(data)
      return channelRef.current.send(payload)
    },
    [msgBuilder],
  )

  useEffect(() => {
    if (!targetRef.current) return
    const target = targetRef.current
    channelRef.current ??= ChannelFactory.createAndTransfer(target)

    const channel = channelRef.current
    const subscribe = () => channel.on(listenTo, setMessage)
    const isWindow = target instanceof Window

    isWindow && target.document.readyState !== 'complete'
      ? target.addEventListener('load', subscribe, { once: true })
      : subscribe()

    return () => {
      channel.close()
      channelRef.current = null
      if (isWindow) target.removeEventListener('load', subscribe)
    }
  }, [targetRef.current, listenTo])

  return { message, sendMessage }
}
