import { runPandoc } from '~/lib/pandoc'
import DocumentPreview from './document-preview/index.html'
import index from './index.html'

Bun.serve({
  routes: {
    '/*': index,
    '/document-preview': DocumentPreview,
    '/socket': (req, server) => {
      const success = server.upgrade(req, {
        data: {
          processCtrl: null,
        },
      })
      return !success
        ? new Response('WebSocket upgrade error', { status: 400 })
        : undefined
    },
  },

  websocket: {
    data: { processCtrl: null as AbortController | null },

    async message(ws, message) {
      if (ws.data.processCtrl !== null) ws.data.processCtrl.abort()
      const processCtrl = new AbortController()
      Object.assign(ws.data, { processCtrl })

      const { from, text } = JSON.parse(message.toString())
      const result = await runPandoc({
        inputFormat: from,
        outputFormat: 'html5',
        killSignal: processCtrl.signal,
        text,
      })

      if ('ok' in result) ws.sendText(result.ok, true)
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
})
