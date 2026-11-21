import { Figure, GraphPaper, HandNote, MARKS } from './Figure'
import type { MarkName } from './Figure'
import type { ReactNode } from 'react'

type Step = {
  label: string
  mark?: MarkName
  /** Small text under the block. */
  sub?: string
}

type Props = {
  title: string
  steps: Array<Step>
  /** A handwritten note under one step. */
  note?: { at: number; text: string }
  caption?: ReactNode
}

const WIDTH = 640
const GAP = 26
const HEIGHT = 38

function wrap(label: string, max: number) {
  const lines: Array<string> = []
  let current = ''
  for (const word of label.split(' ')) {
    if (current && `${current} ${word}`.length > max) {
      lines.push(current)
      current = word
    } else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current) lines.push(current)
  return lines
}

/** A request path: a row of blocks with an arrow from each one to the next. */
export function Chain({ title, steps, note, caption }: Props) {
  const width = Math.min(
    184,
    (WIDTH - 20 - GAP * (steps.length - 1)) / steps.length,
  )
  const total = steps.length * width + (steps.length - 1) * GAP
  const left = (WIDTH - total) / 2
  const hasSub = steps.some((step) => step.sub)
  const subLines = Math.max(
    0,
    ...steps.map((step) => step.sub?.split('\n').length ?? 0),
  )
  const subSpace = hasSub ? 10 + subLines * 13 : 8
  const height = 22 + HEIGHT + subSpace + (note ? 40 : 0)
  const x = (index: number) => left + index * (width + GAP)
  const max = Math.floor(width / 6.6)

  return (
    <Figure title={title} caption={caption}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={`${title}. ${steps.map((step) => step.label).join(', then ')}.`}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        <g filter="url(#pp-marker)">
          {steps.map((step, index) => (
            <rect
              key={step.label}
              x={x(index)}
              y="16"
              width={width}
              height={HEIGHT}
              style={{ fill: MARKS[step.mark ?? 'sand'] }}
            />
          ))}
        </g>
        {steps.map((step, index) => {
          const lines = wrap(step.label, max)
          return (
            <g key={step.label}>
              {lines.map((line, lineIndex) => (
                <text
                  key={line}
                  x={x(index) + width / 2}
                  y={
                    16 +
                    HEIGHT / 2 +
                    4 +
                    (lineIndex - (lines.length - 1) / 2) * 13
                  }
                  textAnchor="middle"
                  style={{ fill: 'var(--ink)', fontSize: 11 }}
                >
                  {line}
                </text>
              ))}
              {step.sub?.split('\n').map((line, lineIndex) => (
                <text
                  key={line}
                  x={x(index) + width / 2}
                  y={16 + HEIGHT + 15 + lineIndex * 13}
                  textAnchor="middle"
                  style={{ fontSize: 11 }}
                >
                  {line}
                </text>
              ))}
              {index > 0 ? (
                <path
                  className="flow-edge"
                  markerEnd="url(#pp-arrow)"
                  d={`M${x(index) - GAP + 3} ${16 + HEIGHT / 2}H${x(index) - 3}`}
                />
              ) : null}
            </g>
          )
        })}
        {note ? (
          <HandNote
            x={Math.min(x(note.at) + 30, WIDTH - 240)}
            y={height - 10}
            text={note.text}
            rotate={-2}
            arrowToFrom="left"
            arrowTo={[x(note.at) + width / 2, 16 + HEIGHT + subSpace]}
          />
        ) : null}
      </svg>
    </Figure>
  )
}
