import '../styles.css'
import { ChannelFactory } from '~/lib/messaging/ChannelBridge.ts'

const domParser = new DOMParser()

const handler = ({ source }: { source: string }) => {
  const root = document.getElementById('root')
  if (!root) return

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
}

window.addEventListener('message', (evt) => {
  if (evt.data?.type !== ChannelFactory.handshakeType) return

  const channel = ChannelFactory.accept(evt)
  channel.on('~preview/document', handler)
})

document.documentElement.style.scrollbarWidth = 'thin'
