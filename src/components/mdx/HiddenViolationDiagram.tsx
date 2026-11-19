import {
  FigureFrame,
  figureNote,
  figurePanel,
  figurePanelTitle,
} from './FigureFrame'
import type { FigureText } from './FigureFrame'

type LineKind = 'directive' | 'blanked' | 'known' | 'added' | 'plain'

type Line = {
  code: string
  kind: LineKind
  mark?: string
}

const normalRun: Array<Line> = [
  {
    code: '/* oxlint-disable no-memo-under-react-compiler */',
    kind: 'directive',
  },
  { code: 'const a = useCallback(…)', kind: 'known', mark: 'hidden' },
  { code: '… 11 more, already in the baseline', kind: 'plain' },
  { code: 'const added = useCallback(…)', kind: 'added', mark: 'hidden' },
]

const hiddenRun: Array<Line> = [
  { code: '/* (directive blanked) */', kind: 'blanked' },
  { code: 'const a = useCallback(…)', kind: 'known', mark: 'reported' },
  { code: '… 11 more, already in the baseline', kind: 'plain' },
  { code: 'const added = useCallback(…)', kind: 'added', mark: 'reported' },
]

function lineColor(kind: LineKind) {
  switch (kind) {
    case 'directive':
      return 'var(--brick)'
    case 'added':
      return 'var(--green)'
    case 'blanked':
    case 'plain':
      return 'var(--muted)'
    case 'known':
      return 'var(--foreground)'
  }
}

function CodeLines({ lines }: { lines: Array<Line> }) {
  return (
    <div className="grid gap-1 font-mono text-xs">
      {lines.map((line) => (
        <div
          key={line.code}
          className="flex flex-wrap items-baseline justify-between gap-x-3 rounded border px-2 py-1"
          style={{
            borderColor: lineColor(line.kind),
            borderStyle: line.kind === 'blanked' ? 'dashed' : 'solid',
            color: lineColor(line.kind),
            background:
              line.kind === 'added' ? 'var(--green-soft)' : 'var(--card)',
          }}
        >
          <span className="break-all whitespace-pre-wrap">{line.code}</span>
          {line.mark ? (
            <span className="text-[10px] tracking-wide uppercase">
              {line.mark}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default function HiddenViolationDiagram(figure: FigureText) {
  return (
    <FigureFrame {...figure}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={figurePanel}>
          <div className={figurePanelTitle}>Normal run</div>
          <CodeLines lines={normalRun} />
          <p className={figureNote}>
            The directive silences the rule for the rest of the file. The new
            line is not reported, so the count does not change.
          </p>
        </div>
        <div className={figurePanel}>
          <div className={figurePanelTitle}>Hidden mode</div>
          <CodeLines lines={hiddenRun} />
          <p className={figureNote}>
            The script blanks the directive and lints again. The result:{' '}
            <code>allowed 12, found 13</code>.
          </p>
        </div>
      </div>
    </FigureFrame>
  )
}
