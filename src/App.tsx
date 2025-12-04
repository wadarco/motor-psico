import { type ChangeEvent, useCallback, useEffect, useState } from 'react'
import DocumentPreview from './components/DocumentPreview.tsx'
import PageSet from './components/PageSet.tsx'
import { useWebSocket } from './hooks/useWebSocket.ts'
import { FormatInputs } from './lib/pandoc.ts'

interface AppProps {
  readonly wsUrl: string
}

export default function App({ wsUrl }: AppProps) {
  const [textarea, setTextarea] = useState('')
  const [from, setFrom] = useState<string>('markdown')
  const ws = useWebSocket(wsUrl)
  const [outputSelector, setOutputSelector] = useState<'preview' | 'output'>(
    'output',
  )

  const handleChange = useCallback((ev: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = ev.target

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
    setTextarea(ev.currentTarget.value)
  }, [])

  useEffect(() => {
    ws.sendMessage({ text: textarea, from })
  }, [ws, from, textarea])

  return (
    <div className="grid h-screen grid-cols-[1fr] grid-rows-[auto_1fr] overflow-hidden md:grid-cols-2 md:grid-rows-1">
      <PageSet.Root className="border-b md:border-r md:border-b-0">
        <PageSet.Header>
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
        </PageSet.Header>

        <textarea
          className="min-h-40 w-full resize-none text-dn-foreground-200 outline-none [scrollbar-width:thin] placeholder:text-dn-foreground-100"
          name="text"
          placeholder="Start typing here"
          onChange={handleChange}
        />
      </PageSet.Root>

      <PageSet.Root>
        <PageSet.Header className="pb-4">
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
        </PageSet.Header>

        {ws.message &&
          (outputSelector === 'preview' ? (
            <DocumentPreview.Root html={ws.message} />
          ) : (
            <div className="overflow-auto [scrollbar-width:thin]">
              {ws.message}
            </div>
          ))}
      </PageSet.Root>
    </div>
  )
}
