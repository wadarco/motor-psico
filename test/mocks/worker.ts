import { ChannelFactory } from '~/lib/messaging/ChannelBridge.ts'
import { MessageBuilder } from '~/lib/messaging/Message.ts'

const terminateBuider = MessageBuilder.of('~test:terminate').withPayload()

self.addEventListener('message', (evt) => {
  if (evt.data?.type === ChannelFactory.handshakeType) {
    const channel = ChannelFactory.accept(evt)
    const terminate = terminateBuider.build()
    channel.on('test:sending', () => channel.send(terminate))
  }
})
