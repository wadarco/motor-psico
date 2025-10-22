import { pandoc } from '~/lib/utils.ts'
import index from './index.html'

Bun.serve({
  routes: {
    '/*': index,
    '/socket': (req, server) => {
      const success = server.upgrade(req)
      return !success
        ? new Response('WebSocket upgrade error', { status: 400 })
        : undefined
    },
  },

  websocket: {
    async message(ws, message) {
      const { from, text } = JSON.parse(message.toString())
      const result = await pandoc({ from, to: 'html', text })
      if ('ok' in result) ws.sendText(result.ok, true)
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
})
