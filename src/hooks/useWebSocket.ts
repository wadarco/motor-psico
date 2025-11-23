import { useCallback, useEffect, useRef, useState } from 'react'

export function useWebSocket<T>(url: string) {
  const [message, setMessage] = useState<string>()
  const wsRef = useRef<WebSocket>(null)

  const sendMessage = useCallback((msg: T) => {
    const ws = wsRef.current
    if (!ws) return
    const data = JSON.stringify(msg)

    ws.readyState === WebSocket.OPEN
      ? ws.send(data)
      : ws.addEventListener('open', () => ws.send(data), { once: true })
  }, [])

  useEffect(() => {
    wsRef.current = new WebSocket(url)
    wsRef.current.addEventListener('message', (event) => setMessage(event.data))

    return () => {
      wsRef.current?.close()
    }
  }, [url])

  return { message, sendMessage }
}
