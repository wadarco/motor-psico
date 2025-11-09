import '../styles.css'

window.addEventListener('message', (event) => {
  const root = document.getElementById('root')

  if (
    event.origin !== window.origin ||
    event.data.type !== '~document-preview/render' ||
    root === null
  ) {
    return
  }

  const domParser = new DOMParser()
  const doc = domParser.parseFromString(event.data.payload, 'text/html')

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
