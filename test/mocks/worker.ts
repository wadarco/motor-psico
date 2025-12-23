import {
  ChannelBridge,
  ChannelFactory,
  EventStrategy,
  MessageTransport,
} from '~/lib/messaging/ChannelBridge.ts'
import { message } from '~/lib/messaging/Message.ts'

const factory = new ChannelFactory({
  messageType: '~channel:handshake',
  Bridge: ChannelBridge,
  Transport: MessageTransport,
})
const createTerminate = message('~test:terminate')

self.addEventListener('message', (evt) => {
  const msg = createTerminate()
  factory.create(evt, new EventStrategy()).send(msg)
})
