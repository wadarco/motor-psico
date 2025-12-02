import { describe, test } from 'bun:test'
import { ChannelFactory, MessageBuilder } from '~/lib/messaging.ts'

describe('messaging', () => {
  const TestMsg = MessageBuilder.of<{ value: 'test' }>('test')

  test('creating', (done) => {
    const worker = new Worker('test/mocks/worker.ts', { type: 'module' })
    const channel = ChannelFactory.createAndTransfer(worker)
    const handler = (_message: typeof TestMsg.Payload) => {
      worker.terminate()
      channel.off('test', handler)
      channel.close()
      done()
    }
    channel.on('test', handler)
  })
})
