export const FormatInputs = [
  'biblatex',
  'bibtex',
  'bits',
  'commonmark_x',
  'commonmark',
  'creole',
  // 'csljson',
  'csv',
  'djot',
  'docbook',
  // 'docx',
  'dokuwiki',
  // 'endnotexml',
  // 'epub',
  // 'fb2',
  'gfm',
  'haddock',
  'html',
  'ipynb',
  'jats',
  'jira',
  'json',
  'latex',
  'man',
  'markdown_github',
  'markdown_mmd',
  'markdown_phpextra',
  'markdown_strict',
  'markdown',
  'mediawiki',
  'muse',
  'native',
  'odt',
  'opml',
  'org',
  'ris',
  'rst',
  'rtf',
  't2t',
  'textile',
  'tikiwiki',
  'tsv',
  'twiki',
  'typst',
  'vimwiki',
] as const
export type FormatInputs = (typeof FormatInputs)[number]

class PandocError extends Error {
  public readonly status: number
  public override readonly cause?: string

  constructor(status: number, cause?: string) {
    super(`Pandoc process failed: \n${status}`, { cause })
    this.name = 'PandocError'
    this.status = status

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PandocError)
    }
  }
}

type PandocResult<T = string> = { ok: T } | { err: PandocError }

interface PandocCommand {
  readonly inputFormat: FormatInputs
  readonly outputFormat: string
  readonly text: string
  readonly killSignal?: AbortSignal
}

export async function runPandoc(options: PandocCommand): Promise<PandocResult> {
  const proc = Bun.spawn({
    cmd: ['pandoc', '-f', options.inputFormat, '-t', options.outputFormat],
    stdin: Buffer.from(options.text, 'utf-8'),
    signal: options.killSignal,
    killSignal: 9, // SIGKILL
  })
  const exitCode = await proc.exited

  if (exitCode !== 0) {
    const errMsg = await new Response(proc.stderr).text()
    return { err: new PandocError(exitCode, errMsg) }
  }

  return { ok: await new Response(proc.stdout).text() }
}
