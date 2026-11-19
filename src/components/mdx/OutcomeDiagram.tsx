import {
  FigureFrame,
  figureNote,
  figurePanel,
  figurePanelTitle,
  toneColor,
} from './FigureFrame'
import type { FigureText, Tone } from './FigureFrame'

type Input = {
  label: string
  text: string
}

type Outcome = {
  /** The condition, in plain words. */
  when: string
  /** The result that the condition leads to. */
  result: string
  tone: Tone
  detail?: string
}

type Props = FigureText & {
  inputsTitle: string
  inputs: Array<Input>
  outcomesTitle: string
  outcomes: Array<Outcome>
}

export default function OutcomeDiagram({
  inputsTitle,
  inputs,
  outcomesTitle,
  outcomes,
  ...figure
}: Props) {
  return (
    <FigureFrame {...figure}>
      <div className={figurePanel}>
        <div className={figurePanelTitle}>{inputsTitle}</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {inputs.map((input) => (
            <div key={input.label}>
              <div className="font-mono text-xs font-semibold text-[var(--foreground)]">
                {input.label}
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {input.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div
        className="my-2 text-center font-mono text-sm text-[var(--muted)]"
        aria-hidden="true"
      >
        ↓
      </div>
      <div className={figurePanel}>
        <div className={figurePanelTitle}>{outcomesTitle}</div>
        <ul className="m-0 grid list-none gap-2 p-0">
          {outcomes.map((outcome) => (
            <li
              key={outcome.when}
              className="grid grid-cols-1 gap-1 rounded border px-3 py-2 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4"
              style={{ borderColor: toneColor(outcome.tone) }}
            >
              <div>
                <div className="text-sm text-[var(--foreground)]">
                  {outcome.when}
                </div>
                {outcome.detail ? (
                  <p className={figureNote} style={{ marginTop: 2 }}>
                    {outcome.detail}
                  </p>
                ) : null}
              </div>
              <strong
                className="font-mono text-xs uppercase"
                style={{ color: toneColor(outcome.tone) }}
              >
                {outcome.result}
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </FigureFrame>
  )
}
