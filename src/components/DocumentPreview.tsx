import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { RenderAction, ResizeAction } from '~/document-preview/utils.ts'
import { useMessage } from '~/hooks/useMessage'

function DocumentPreview({ html }: { readonly html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const size = useMessage<ResizeAction>('~document-preview/resize')

  const handleLoad = useCallback(() => setIsLoaded(true), [])

  useLayoutEffect(() => {
    const frame = ref.current
    if (!frame) return

    const ctrl = new AbortController()
    frame.addEventListener('load', handleLoad, { signal: ctrl.signal })

    return () => ctrl.abort()
  }, [handleLoad])

  useLayoutEffect(() => {
    const frame = ref.current
    if (!frame?.contentWindow || !isLoaded) return

    const msg: RenderAction = {
      type: '~document-preview/render',
      payload: { source: html },
    }

    frame.contentWindow?.postMessage(msg, window.location.origin)
  }, [html, isLoaded])

  return (
    <iframe
      ref={ref}
      className="min-h-40 w-full"
      height={size ? `${size.height}px` : ''}
      title="preview"
      loading="eager"
      src="/document-preview"
    />
  )
}

export default { Root: DocumentPreview }
