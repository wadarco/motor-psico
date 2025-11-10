import '../styles.css'
import { isValidRenderEvent } from './utils.ts'

window.addEventListener('message', (event) => {
  const root = document.getElementById('root')
  if (!isValidRenderEvent(event) || !root) return

  const domParser = new DOMParser()
  const { source } = event.data.payload
  const doc = domParser.parseFromString(source, 'text/html')

  for (const node of Array.from(root.childNodes)) {
    root.removeChild(node)
  }

  for (const node of Array.from(document.head.querySelectorAll('style'))) {
    document.head.removeChild(node)
  }

  doc.querySelectorAll('style').forEach((node) => {
    document.head.appendChild(node)
  })

  root.appendChild(doc.body)
  parent.postMessage(
    {
      type: '~document-preview/resize',
      payload: { height: document.body.offsetHeight },
    },
    window.location.origin,
  )
})
