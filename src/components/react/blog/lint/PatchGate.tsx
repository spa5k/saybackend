import { Figure, GraphPaper, HandNote, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

const WIDTH = 640
const HEIGHT = 330

const inputs: Array<{ label: string; mark: MarkName }> = [
  { label: 'prompt', mark: 'sand' },
  { label: 'agent instructions', mark: 'lilac' },
  { label: 'retrieved source', mark: 'sand' },
  { label: 'nearby examples', mark: 'amber' },
]

const checks = ['syntax lint', 'type lint', 'project rules']

function Block({
  x,
  y,
  w,
  label,
  mark,
}: {
  x: number
  y: number
  w: number
  label: string
  mark: MarkName
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height="38"
        filter="url(#pp-marker)"
        style={{ fill: MARKS[mark] }}
      />
      <text x={x + w / 2} y={y + 23} textAnchor="middle" style={{ fill: 'var(--ink)' }}>
        {label}
      </text>
    </g>
  )
}

/**
 * What goes into a generated patch, and the gate that runs after it. The
 * inputs only make a good patch likely. The gate does not depend on them.
 */
export function PatchGate() {
  const inputWidth = 142
  const inputX = (index: number) => 14 + index * (inputWidth + 14)
  const checkWidth = 150
  const checkX = (index: number) => 81 + index * (checkWidth + 14)
  return (
    <Figure title="What the model reads, and what checks the result">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Four inputs go into the generated patch: the prompt, the agent instructions, the retrieved source, and the nearby examples. After the patch is generated, three checks run on it: syntax lint, type lint, and project rules."
      >
        <GraphPaper width={WIDTH} height={HEIGHT} bleed={30} />
        {inputs.map((input, index) => (
          <g key={input.label}>
            <path
              className="flow-edge"
              markerEnd="url(#pp-arrow)"
              d={`M${inputX(index) + inputWidth / 2} 74C${inputX(index) + inputWidth / 2} 106 320 96 320 124`}
            />
            <Block
              x={inputX(index)}
              y={34}
              w={inputWidth}
              label={input.label}
              mark={input.mark}
            />
          </g>
        ))}
        <Block x={230} y={128} w={180} label="generated patch" mark="sand" />
        <path
          className="flow-edge"
          markerEnd="url(#pp-arrow)"
          d="M320 168V216"
        />
        <path
          className="fig-axis"
          strokeDasharray="3 4"
          d="M40 192H600"
        />
        {checks.map((check, index) => (
          <Block
            key={check}
            x={checkX(index)}
            y={222}
            w={checkWidth}
            label={check}
            mark="sage"
          />
        ))}
        <HandNote x={432} y={150} text={'the model can\nignore all of these'} rotate={-3} />
        <HandNote x={46} y={296} text="the same error, whoever wrote the code" rotate={-2} />
      </svg>
    </Figure>
  )
}
