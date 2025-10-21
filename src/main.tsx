import { pandoc } from '~/lib/utils.ts'
import index from './index.html'

Bun.serve({
  routes: {
    '/*': index,
    '/socket': (req, server) => {
      const success = server.upgrade(req, {
        data: { connectionTag: `${crypto.randomUUID()}` },
      })
      if (!success) {
        return new Response('WebSocket upgrade failed for /socket', {
          status: 400,
        })
      }
    },
  },

  websocket: {
    data: {} as { connectionTag: string },

    open(ws) {
      ws.subscribe(ws.data.connectionTag)
    },
    async message(ws, message) {
      const { from, text } = JSON.parse(message.toString())
      const result = await pandoc({ from, to: 'html', text })

      if ('ok' in result) ws.sendText(result.ok, true)
      // 'err' in result
      //   ? ws.close(1011, 'Unsupported data')
      //   : ws.sendText(result.ok, true)
    },
    close(ws) {
      ws.unsubscribe(ws.data.connectionTag)
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
})
