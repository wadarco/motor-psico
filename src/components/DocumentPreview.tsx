import { useEffect, useRef } from 'react'
import { useChannel } from '~/hooks/useChannel.ts'

function DocumentPreview({ html }: { readonly html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const contentWindowRef = useRef<Window>(null)
  const frameChannel = useChannel<{ source: string }, { height: number }>(
    '~preview/document',
    '~preview/resize',
    contentWindowRef,
  )

  useEffect(() => {
    const frame = ref.current
    if (!frame || !frame.contentWindow) return

    contentWindowRef.current = frame.contentWindow
  }, [])

  useEffect(() => {
    frameChannel.sendMessage({ source: html })
  }, [html, frameChannel.sendMessage])

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
