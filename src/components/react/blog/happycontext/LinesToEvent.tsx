import { Figure, GraphPaper, HandNote, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

const WIDTH = 640
const HEIGHT = 250

const lines = [
  { text: 'Request started', x: 8 },
  { text: 'user authenticated', x: 34 },
  { text: 'fetching cart', x: 58 },
  { text: 'processing payment', x: 44 },
  { text: 'payment successful', x: 70 },
  { text: 'request completed', x: 20 },
]

const parts: Array<{
  name: string
  mark: MarkName
  width: number
  fields: Array<string>
}> = [
  { name: 'request', mark: 'blue', width: 74, fields: ['method, path', 'status, ms'] },
  { name: 'user', mark: 'lilac', width: 56, fields: ['user_id', 'feature'] },
  { name: 'cart', mark: 'sage', width: 74, fields: ['cart_id, items', 'total_cents'] },
  { name: 'payment', mark: 'amber', width: 70, fields: ['method', 'status'] },
]

/** Six separate log lines on the left, one wide event on the right. */
export function LinesToEvent() {
  let offset = 356
  return (
    <Figure
      bleed
      title="One request: six log lines, or one wide event"
      caption="Gather context in the middleware and the handlers. Then emit one structured event through the logger that you already use."
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="On the left, six separate log lines for one request: request started, user authenticated, fetching cart, processing payment, payment successful, request completed. On the right, one wide event with four groups of fields: request, user, cart, and payment."
      >
        <GraphPaper width={WIDTH} height={HEIGHT} bleed={30} />
        <text className="fig-strong" x="8" y="22">
          6 log lines
        </text>
        <g filter="url(#pp-marker)">
          {lines.map((line, index) => (
            <rect
              key={line.text}
              x={line.x}
              y={36 + index * 30}
              width={line.text.length * 6.4 + 26}
              height="21"
              style={{ fill: 'var(--m-sand)' }}
            />
          ))}
        </g>
        {lines.map((line, index) => (
          <text
            key={line.text}
            x={line.x + 12}
            y={51 + index * 30}
            style={{ fill: '#141413', fontSize: 11 }}
          >
            {line.text}
          </text>
        ))}
        <path
          className="ink-stroke"
          d="M262 124C282 112 304 112 326 122"
          markerEnd="url(#pp-ink-arrow)"
        />
        <text className="fig-strong" x="356" y="84">
          1 wide event
        </text>
        <g filter="url(#pp-marker)">
          {parts.map((part) => {
            const x = offset
            offset += part.width
            return (
              <rect
                key={part.name}
                x={x + 1}
                y="96"
                width={part.width - 2}
                height="44"
                style={{ fill: MARKS[part.mark] }}
              />
            )
          })}
        </g>
        {parts.map((part, index) => {
          const x =
            356 + parts.slice(0, index).reduce((sum, p) => sum + p.width, 0)
          return (
            <g key={part.name}>
              <text
                x={x + part.width / 2}
                y="123"
                textAnchor="middle"
                style={{ fill: '#141413' }}
              >
                {part.name}
              </text>
              {part.fields.map((field, line) => (
                <text
                  key={field}
                  x={x + part.width / 2}
                  y={158 + line * 13}
                  textAnchor="middle"
                  fontSize="9.5"
                >
                  {field}
                </text>
              ))}
            </g>
          )
        })}
        <HandNote x={404} y={212} text="one request = one row to query" rotate={-2} />
      </svg>
    </Figure>
  )
}
