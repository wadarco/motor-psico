import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { RenderAction } from '~/document-preview/utils.ts'

function DocumentPreview({ html }: { readonly html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [height, setHeight] = useState<number>()

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

  useLayoutEffect(() => {
    const ctrl = new AbortController()

    window.addEventListener('message', (msg) => {
      if (
        msg.origin !== window.origin ||
        msg.data.type !== '~document-preview/resize' ||
        !ref.current
      ) {
        return
      }

      setHeight(msg.data.payload.height)
    })

    return () => {
      ctrl.abort
    }
  }, [])

  return (
    <iframe
      ref={ref}
      className="min-h-40 w-full"
      height={height}
      title="preview"
      loading="eager"
      src="/document-preview"
    />
  )
}

export default { Root: DocumentPreview }
