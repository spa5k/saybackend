import { FigureFrame, figurePanel, figurePanelTitle } from './FigureFrame'
import type { FigureText } from './FigureFrame'

type Sample = {
  title: string
  before: number
  after: number
  /** Exact values as printed in the source, with the unit. */
  beforeDisplay: string
  afterDisplay: string
  reduction: string
}

type Props = FigureText & {
  /** Each sample has its own scale. The samples must not be compared. */
  samples: Array<Sample>
}

export default function PairedSamples({ samples, ...figure }: Props) {
  return (
    <FigureFrame {...figure}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {samples.map((sample) => {
          const max = Math.max(sample.before, sample.after)

          return (
            <div key={sample.title} className={figurePanel}>
              <div className={figurePanelTitle}>{sample.title}</div>
              {(
                [
                  ['Before', sample.before, sample.beforeDisplay, 'brick'],
                  ['After', sample.after, sample.afterDisplay, 'green'],
                ] as const
              ).map(([label, value, display, tone]) => (
                <div key={label} className="mb-2">
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                    <span className="text-[var(--muted-foreground)]">
                      {label}
                    </span>
                    <strong className="font-mono">{display}</strong>
                  </div>
                  <div
                    className="bg-muted h-3 overflow-hidden rounded-full"
                    aria-hidden="true"
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${(value / max) * 100}%`,
                        background: `var(--${tone})`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <p className="mt-3 mb-0 font-mono text-xs text-[var(--foreground)]">
                {sample.reduction}
              </p>
            </div>
          )
        })}
      </div>
    </FigureFrame>
  )
}
