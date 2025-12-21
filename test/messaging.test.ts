import { afterAll, describe, expect, test } from 'bun:test'
import { ChannelFactory } from '~/lib/messaging/ChannelBridge.ts'
import { MessageBuilder } from '~/lib/messaging/Message.ts'

describe('test', () => {
  const worker = new Worker('test/mocks/worker.ts', { type: 'module' })

  test('creating', (done) => {
    const channel = ChannelFactory.createAndTransfer(worker)
    channel.on(ChannelFactory.handshakeType, () => done())
  })

  test('sending', (done) => {
    const channel = ChannelFactory.createAndTransfer(worker)
    const messageBuilder = MessageBuilder.of('test:sending')

    channel
      .on('~test:terminate', (data) => {
        expect(data).toBe(null)
        done()
      })
      .send(messageBuilder.build())
  })

  afterAll(() => worker.terminate())
})
