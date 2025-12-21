import { useEffect, useRef } from 'react'
import {
  type ChannelBridge,
  ChannelFactory,
} from '~/lib/messaging/ChannelBridge.ts'

function DocumentPreview({ html }: { readonly html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const channelRef = useRef<ChannelBridge | null>(null)

  useEffect(() => {
    const frame = ref.current
    if (!frame) return

    const handleLoad = () => {
      if (!frame.contentWindow) return
      channelRef.current = ChannelFactory.createAndTransfer(frame.contentWindow)
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
