import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FormatInputs } from './lib/utils.ts'

interface AppProps {
  readonly wsUrl: string
}

export default function App({ wsUrl }: AppProps) {
  const [textarea, setTextarea] = useState('')
  const [message, setMessage] = useState('')
  const [from, setFrom] = useState<string>('markdown')
  const [debouncedText, setDebouncedText] = useState(textarea)
  const socket = useMemo(() => new WebSocket(wsUrl), [wsUrl])

  const handleChange = useCallback((ev: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = ev.target

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
    setTextarea(ev.currentTarget.value)
  }, [])

  useEffect(() => {
    if (socket.readyState === socket.OPEN) {
      const msg = JSON.stringify({ text: debouncedText, from })
      socket.send(msg)
    }
  }, [socket, from, debouncedText])

  useEffect(() => {
    socket.addEventListener('message', (ev) => setMessage(ev.data))
  }, [socket])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedText(textarea), 300)
    return () => clearTimeout(timer)
  }, [textarea])

  return (
    <div className="p-4">
      <select
        className="mb-2 bg-dn-background-100 py-2 text-dn-foreground-200"
        name="from"
        value={from}
        onChange={(ev) => setFrom(ev.target.value)}
      >
        {FormatInputs.map((format) => (
          <option key={format} value={format}>
            {format}
          </option>
        ))}
      </select>

      <textarea
        className="w-full resize-none text-dn-foreground-100 outline-none"
        name="text"
        onChange={handleChange}
      />
      <hr />
      <div className="prose lg:prose py-2">
        {message && (
          <div
            /** biome-ignore lint/security/noDangerouslySetInnerHtml: render data */
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}
      </div>
    </div>
  )
}
