import { FigureFrame, toneColor } from './FigureFrame'
import type { FigureText, Tone } from './FigureFrame'

type Row = {
  label: string
  value: number
  /** Exact value as printed in the source, with its unit. */
  display: string
  note?: string
  tone?: Tone
  /** Upper end of a range. The part above `value` is drawn as an estimate. */
  rangeTo?: number
}

type Props = FigureText & {
  rows: Array<Row>
  /** Scale maximum. Defaults to the largest value or range end. */
  max?: number
}

export default function ValueBarChart({ rows, max, ...figure }: Props) {
  const scale =
    max ?? Math.max(...rows.map((row) => row.rangeTo ?? row.value), 1)

  return (
    <FigureFrame {...figure}>
      <div className="grid gap-4">
        {rows.map((row) => {
          const color = toneColor(row.tone ?? 'brick')
          const width = Math.min((row.value / scale) * 100, 100)
          const rangeWidth = row.rangeTo
            ? Math.min(((row.rangeTo - row.value) / scale) * 100, 100 - width)
            : 0

          return (
            <div key={row.label}>
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <span className="font-mono text-sm font-semibold break-words">
                  {row.label}
                </span>
                <strong className="font-mono text-sm">{row.display}</strong>
              </div>
              <div
                className="bg-muted flex h-3 overflow-hidden rounded-full"
                aria-hidden="true"
              >
                <span
                  className="block h-full"
                  style={{
                    width: `${width}%`,
                    minWidth: row.value > 0 ? 3 : 0,
                    background: color,
                  }}
                />
                {rangeWidth > 0 ? (
                  <span
                    className="block h-full"
                    style={{
                      width: `${rangeWidth}%`,
                      background: `repeating-linear-gradient(135deg, ${color} 0 3px, transparent 3px 7px)`,
                    }}
                  />
                ) : null}
              </div>
              {row.note ? (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {row.note}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </FigureFrame>
  )
}
