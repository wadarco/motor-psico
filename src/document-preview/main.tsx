import '../styles.css'
import { ChannelFactory, MessageBuilder } from '~/lib/messaging.ts'

const DocMessage = MessageBuilder.of<{ source: string }>('~preview/document')

const handler = ({ source }: typeof DocMessage.Payload) => {
  const root = document.getElementById('root')
  if (!root) return

  const domParser = new DOMParser()
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
  const ResizeMessage = MessageBuilder.of<{ height: number }>('~preview/resize')
  const mutationObserver = new MutationObserver(() => {
    channel.send(ResizeMessage.build({ height: document.body.offsetHeight }))
  })

  channel.on('~preview/document', handler)
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  })
})
