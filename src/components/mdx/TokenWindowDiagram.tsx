type CellState = 'copied-old' | 'copied-new' | 'untouched' | 'incoming'

type Cell = {
  label: string
  state: CellState
}

type Props = {
  title?: string
  caption?: string
}

const panel = 'rounded-lg border border-[var(--border)] bg-[var(--card)] p-3'
const panelTitle =
  'mb-2 font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]'
const panelNote = 'mt-3 text-xs text-[var(--muted-foreground)]'

const cellColor = (state: CellState) => {
  switch (state) {
    case 'copied-old':
      return 'var(--brick)'
    case 'copied-new':
    case 'incoming':
      return 'var(--green)'
    case 'untouched':
      return 'var(--muted)'
  }
}

const history = ['p', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9']
const windowStart = 7

const before: Array<Cell> = [
  ...history.map((label) => ({ label, state: 'copied-old' as const })),
  { label: 'new', state: 'incoming' },
]

const after: Array<Cell> = [
  ...history.map((label, index) => ({
    label,
    state:
      index < windowStart ? ('untouched' as const) : ('copied-new' as const),
  })),
  { label: 'new', state: 'incoming' },
]

function Row({ cells }: { cells: Array<Cell> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className={`rounded border px-2 py-1 font-mono text-xs ${
            cell.state === 'untouched' ? 'opacity-70' : ''
          }`}
          style={{
            borderColor: cellColor(cell.state),
            color: cellColor(cell.state),
            borderStyle: cell.state === 'untouched' ? 'dashed' : 'solid',
            background:
              cell.state === 'incoming' ? 'var(--green-soft)' : 'var(--card)',
          }}
        >
          {cell.label}
        </div>
      ))}
    </div>
  )
}

export default function TokenWindowDiagram({ title, caption }: Props) {
  return (
    <figure className="my-8">
      {title && (
        <figcaption className="mb-4 text-[var(--foreground)]">
          <strong className="font-sans text-lg">{title}</strong>
        </figcaption>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={panel}>
          <div className={panelTitle}>Before · one decode step</div>
          <Row cells={before} />
          <p className={panelNote}>
            Every token string in the history is copied. Only the last few are
            read.
          </p>
        </div>
        <div className={panel}>
          <div className={panelTitle}>After · one decode step</div>
          <Row cells={after} />
          <p className={panelNote}>
            The copy starts at the first index that the slices can read.
          </p>
        </div>
      </div>
      {caption && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{caption}</p>
      )}
    </figure>
  )
}
