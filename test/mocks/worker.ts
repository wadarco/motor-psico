import { ChannelFactory } from '~/lib/messaging/ChannelBridge.ts'
import { message } from '~/lib/messaging/Message.ts'

const createTerminate = message('~test:terminate')

self.addEventListener('message', (evt) => {
  if (evt.data?.type === ChannelFactory.handshakeType) {
    const channel = ChannelFactory.accept(evt)
    const terminate = createTerminate()
    channel.on('test:sending', () => channel.send(terminate))
  }
})
