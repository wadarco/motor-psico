import { useEffect, useMemo, useRef } from 'react'

function DocumentPreview({ html }: { readonly html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)

  const srcDoc = useMemo(() => {
    const nodes = document.querySelectorAll('link[rel="stylesheet"]')
    const styles = Array.from(nodes).map((node) => node.outerHTML)
    return html.replace('</head>', `${styles.join('')}</head>`)
  }, [html])

  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return
    const ctrl = new AbortController()

    iframe.addEventListener(
      'load',
      () => {
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        iframe.height = 'auto'
        if (doc) iframe.height = `${doc.documentElement.scrollHeight}px`
      },
      { signal: ctrl.signal },
    )

    return () => ctrl.abort()
  }, [])

  return <iframe ref={ref} className="w-full" title="preview" srcDoc={srcDoc} />
}

export default { Root: DocumentPreview }
