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
  const socket = useMemo(() => new WebSocket(wsUrl), [wsUrl])
  const [outputSelector, setOutputSelector] = useState<'preview' | 'output'>(
    'output',
  )

  const styles = useMemo(() => {
    const nodes = document.querySelectorAll('link[rel="stylesheet"]')
    return Array.from(nodes)
      .map((node) => node.outerHTML)
      .join('')
  }, [])

  const handleChange = useCallback((ev: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = ev.target

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
    setTextarea(ev.currentTarget.value)
  }, [])

  useEffect(() => {
    if (socket.readyState === socket.OPEN) {
      const msg = JSON.stringify({ text: textarea, from })
      socket.send(msg)
    }
  }, [socket, from, textarea])

  useEffect(() => {
    socket.addEventListener('message', (ev) => setMessage(ev.data))
  }, [socket])

  return (
    <div className="grid h-screen grid-flow-col grid-rows-[auto_1fr] md:grid-cols-2 md:grid-rows-1">
      <div className="h-full border-dn-foreground-100/80 border-b p-4 md:border-r md:border-b-0">
        <select
          className="mb-2 rounded py-2 text-dn-foreground-200 outline-none hover:bg-dn-background-100/60"
          name="from"
          value={from}
          onChange={(ev) => setFrom(ev.target.value)}
        >
          {FormatInputs.map((format) => (
            <option
              className="bg-dn-background-100"
              key={format}
              value={format}
            >
              {format}
            </option>
          ))}
        </select>

        <textarea
          className="min-h-40 w-full resize-none text-dn-foreground-200 outline-none placeholder:text-dn-foreground-100"
          name="text"
          placeholder="Start typing here"
          onChange={handleChange}
        />
      </div>

      <div className="p-4">
        <div className="p w-fit overflow-hidden pb-4">
          <button
            className={`cursor-pointer rounded-l-xl border border-dn-foreground-100 px-2 py-1 ${
              outputSelector === 'output'
                ? 'border-dn-foreground-200 bg-dn-foreground-200 text-dn-background-200'
                : ''
            }`}
            onClick={() => setOutputSelector('output')}
            type="button"
          >
            Output
          </button>
          <button
            className={`-ml-[1px] cursor-pointer rounded-r-xl border border-dn-foreground-100 px-2 py-1 ${outputSelector === 'preview' ? 'border-dn-foreground-200 bg-dn-foreground-200 text-dn-background-200' : ''}`}
            onClick={() => setOutputSelector('preview')}
            type="button"
          >
            Preview
          </button>
        </div>

        {message &&
          (outputSelector === 'preview' ? (
            <iframe
              title="preview"
              sandbox=""
              srcDoc={`${styles}<div class="prose lg:prose">${message}<div/>`}
            />
          ) : (
            <div>{message}</div>
          ))}
      </div>
    </div>
  )
}
