import { useEffect, useRef } from 'react'
import type { RenderAction } from '~/document-preview/utils.ts'
import { useChannel } from '~/hooks/useChannel.ts'

function DocumentPreview({ html }: { readonly html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const contentWindowRef = useRef<Window>(null)
  const frameChannel = useChannel<RenderAction, { height: string }>(
    '~preview/connect',
    contentWindowRef,
  )

  useEffect(() => {
    const frame = ref.current
    if (!frame || !frame.contentWindow) return

    contentWindowRef.current = frame.contentWindow
  }, [])

  useEffect(() => {
    const msg: RenderAction = {
      type: '~document-preview/render',
      payload: { source: html },
    }

    frameChannel.sendMessage(msg)
  }, [html, frameChannel.sendMessage])

  return (
    <iframe
      ref={ref}
      className="min-h-40 w-full"
      height={frameChannel.message ? `${frameChannel.message.height}px` : ''}
      title="preview"
      loading="eager"
      src="/document-preview"
    />
  )
}

export default { Root: DocumentPreview }
