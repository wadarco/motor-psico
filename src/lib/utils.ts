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

interface PandocOptions {
  readonly from: FormatInputs
  readonly to: string
  readonly text: string
  readonly signal?: AbortSignal
}

type PandocResult = { ok: string } | { err: string }

export async function pandoc(options: PandocOptions): Promise<PandocResult> {
  if (!FormatInputs.includes(options.from)) {
    const validFormats = FormatInputs.join(', ')
    return {
      err: `Invalid 'from' format: ${options.from}. Valid formats are: ${validFormats}`,
    }
  }
  const proc = Bun.spawn({
    cmd: ['pandoc', '-f', options.from, '-t', options.to],
    stdin: Buffer.from(options.text, 'utf-8'),
    signal: options.signal,
    killSignal: 9, //SIGKILL
  })

  if ((await proc.exited) !== 0) {
    const errMsg = await new Response(proc.stderr).text()
    return { err: `Pandoc failed with exit code ${proc.exitCode}:\n${errMsg}` }
  }

  return { ok: await new Response(proc.stdout).text() }
}
