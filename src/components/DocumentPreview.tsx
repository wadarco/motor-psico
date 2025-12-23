import { useEffect, useRef } from 'react'
import {
  ChannelBridge,
  ChannelFactory,
  InitiatorStrategy,
  MessageTransport,
} from '~/lib/messaging/ChannelBridge.ts'

function DocumentPreview({ html }: { readonly html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const channelRef = useRef<ChannelBridge | null>(null)

  useEffect(() => {
    const frame = ref.current
    if (!frame) return

    const handleLoad = () => {
      if (!frame.contentWindow) return
      const factory = new ChannelFactory({
        messageType: '~channel:handshake',
        Bridge: ChannelBridge,
        Transport: MessageTransport,
      })

      channelRef.current = factory.create(
        frame.contentWindow,
        new InitiatorStrategy(),
      )
    }
    frame.contentWindow?.addEventListener('load', handleLoad)

    return () => {
      channelRef.current = null
      frame.removeEventListener('load', handleLoad)
    }
  }, [])

  useEffect(() => {
    channelRef.current?.send({
      type: '~preview/document',
      payload: { source: html },
    })
  }, [html])

  return (
    <iframe
      ref={ref}
      className="h-full min-h-40 w-full"
      title="preview"
      loading="eager"
      src="/document-preview"
    />
  )
}

export default { Root: DocumentPreview }
