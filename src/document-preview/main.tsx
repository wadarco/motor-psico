import '../styles.css'

const handler = (port: MessagePort) => (event: MessageEvent) => {
  const root = document.getElementById('root')
  if (!root) return

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
  port.postMessage({
    type: '~document-preview/resize',
    payload: { height: document.body.offsetHeight },
  })
}

window.addEventListener('message', ({ data, ports }) => {
  if (data?.key !== '~preview/connect' || !ports[0]) return
  const port = ports[0]

  port.start()
  port.addEventListener('message', handler(port))
})
