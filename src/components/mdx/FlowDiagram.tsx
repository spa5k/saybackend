import {
  FigureFrame,
  figurePanel,
  figurePanelTitle,
  toneColor,
} from './FigureFrame'
import type { FigureText, Tone } from './FigureFrame'

type Step = {
  label: string
  text?: string
  tone?: Tone
}

type Column = {
  title: string
  steps: Array<Step>
  note?: string
}

type Props = FigureText & {
  columns: Array<Column>
}

export default function FlowDiagram({ columns, ...figure }: Props) {
  return (
    <FigureFrame {...figure}>
      <div
        className={
          columns.length > 1
            ? 'grid grid-cols-1 gap-4 sm:grid-cols-2'
            : 'grid grid-cols-1 gap-4'
        }
      >
        {columns.map((column) => (
          <div key={column.title} className={figurePanel}>
            <div className={figurePanelTitle}>{column.title}</div>
            <ol className="m-0 list-none p-0">
              {column.steps.map((step, index) => {
                const color = toneColor(step.tone ?? 'ink')
                const last = index === column.steps.length - 1

                return (
                  <li key={step.label}>
                    <div
                      className="rounded border px-3 py-2"
                      style={{ borderColor: color }}
                    >
                      <div
                        className="font-mono text-xs font-semibold"
                        style={{ color }}
                      >
                        {index + 1}. {step.label}
                      </div>
                      {step.text ? (
                        <p className="mt-1 mb-0 text-xs text-[var(--muted-foreground)]">
                          {step.text}
                        </p>
                      ) : null}
                    </div>
                    {last ? null : (
                      <div
                        className="py-0.5 text-center font-mono text-sm leading-none text-[var(--muted)]"
                        aria-hidden="true"
                      >
                        ↓
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
            {column.note ? (
              <p className="mt-3 mb-0 text-xs text-[var(--muted-foreground)]">
                {column.note}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </FigureFrame>
  )
}
