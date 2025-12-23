import { afterAll, describe, expect, test } from 'bun:test'
import {
  ChannelBridge,
  ChannelFactory,
  InitiatorStrategy,
  MessageTransport,
} from '~/lib/messaging/ChannelBridge.ts'
import { message } from '~/lib/messaging/Message.ts'

describe('test', () => {
  const worker = new Worker('test/mocks/worker.ts', { type: 'module' })
  const factory = new ChannelFactory({
    messageType: '~channel:handshake',
    Bridge: ChannelBridge,
    Transport: MessageTransport,
  })

  test('sending', (done) => {
    const channel = factory.create(worker, new InitiatorStrategy())
    const testingMsg = message('test:sending')()

    channel
      .on('~test:terminate', (data) => {
        expect(data).toBe(null)
        done()
      })
      .send(testingMsg)
  })

  afterAll(() => worker.terminate())
})
