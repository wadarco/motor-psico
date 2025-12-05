import { afterAll, describe, expect, test } from 'bun:test'
import { ChannelFactory, MessageBuilder } from '~/lib/messaging.ts'

describe('messaging', () => {
  const worker = new Worker('test/mocks/worker.ts', { type: 'module' })

  test('creating', (done) => {
    const channel = ChannelFactory.createAndTransfer(worker)

    channel.on(ChannelFactory.handshakeType, () => {
      channel.close()
      done()
    })
  })

  test('sending', (done) => {
    const channel = ChannelFactory.createAndTransfer(worker)
    const messageBuilder = MessageBuilder.of('test:sending')

    channel.on('~test:terminate', (data) => {
      channel.close()
      expect(data).toBe(null)
      done()
    })
    channel.send(messageBuilder.build())
  })

  afterAll(() => worker.terminate())
})
