import '../styles.css'
import { ChannelFactory, MessageBuilder } from '~/lib/messaging.ts'

const domParser = new DOMParser()
const DocMessage = MessageBuilder.of('~preview/document').withPayload<{
  source: string
}>()

const handler = ({ source }: typeof DocMessage.Payload) => {
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
  if (evt.data?.type !== ChannelFactory.InitMessageType) return

  const channel = ChannelFactory.accept(evt)
  channel.on('~preview/document', handler)
})

document.documentElement.style.scrollbarWidth = 'thin'
