import '../styles.css'
import {
  ChannelBridge,
  ChannelFactory,
  EventStrategy,
  MessageTransport,
} from '~/lib/messaging/ChannelBridge.ts'

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

const factory = new ChannelFactory({
  messageType: '~channel:handshake',
  Bridge: ChannelBridge,
  Transport: MessageTransport,
})

window.addEventListener('message', (evt) => {
  factory.create(evt, new EventStrategy()).on('~preview/document', handler)
})

document.documentElement.style.scrollbarWidth = 'thin'
