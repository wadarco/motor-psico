import { ChannelFactory, MessageBuilder } from '~/lib/messaging.ts'

const TestMsg = MessageBuilder.of('test').withPayload<{ value: 'test' }>()

self.addEventListener('message', (evt) => {
  if (evt.data?.type === ChannelFactory.InitMessageType) {
    const channel = ChannelFactory.accept(evt)
    channel.send(TestMsg.build({ value: 'test' }))
  }
})
