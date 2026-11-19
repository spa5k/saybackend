import { Figure } from './Figure'
import type { ReactNode } from 'react'

type Props = {
  title: string
  /** In `text`, wrap the part that changed in square brackets. */
  steps: Array<{ label: string; text: string }>
  caption?: ReactNode
}

function highlighted(text: string) {
  return text
    .split(/(\[[^\]]*\])/)
    .map((part, index) =>
      part.startsWith('[') ? (
        <mark key={index}>{part.slice(1, -1)}</mark>
      ) : (
        <span key={index}>{part}</span>
      ),
    )
}

/** A value shown at each step of a change, with the changed part marked. */
export function StepStrings({ title, steps, caption }: Props) {
  return (
    <Figure caption={caption}>
      <div className="fig-panel">
        <div className="fig-panel-inner">
          <h3>{title}</h3>
          <ol className="step-strings">
            {steps.map((step, index) => (
              <li key={step.label}>
                <span className="step-strings-label">
                  <b>{index + 1}</b>
                  {step.label}
                </span>
                <code>{highlighted(step.text)}</code>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Figure>
  )
}
