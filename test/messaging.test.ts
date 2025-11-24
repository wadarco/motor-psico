import { describe, expect, mock, test } from 'bun:test'
import { ChannelBuilder } from '~/lib/messaging.ts'

describe('messaging', () => {
  const worker = new Worker('test/mocks/worker.ts', { type: 'module' })

  test('channel:builder', (done) => {
    type MainToEndpoint = string
    type EndpointToMain = { status: string; payload: string }

    const channel = ChannelBuilder.create<MainToEndpoint, EndpointToMain>()
      .withTarget(worker)
      .withHandshakeKey('take-port')
      .build()

    const onMsg = mock((data: EndpointToMain) => {
      expect(data.status).toBe('received')
      done()
    })

    channel.onMessage(onMsg)
    channel.send('')
  })
})
