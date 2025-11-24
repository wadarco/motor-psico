function onConnection(
  handshakeKey: string,
  callback: (port: MessagePort) => void,
) {
  const handler = (ev: MessageEvent) => {
    if (ev.data?.key !== handshakeKey || !ev.ports[0]) return
    callback(ev.ports[0])
  }

  self.addEventListener('message', handler)
}

onConnection('take-port', (port) => {
  port.addEventListener(
    'message',
    ({ data: payload }: MessageEvent<string>) => {
      // Reply to Main
      port.postMessage({ status: 'received', payload })
    },
  )
})
