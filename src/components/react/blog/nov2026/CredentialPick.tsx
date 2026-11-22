import type { ReactNode } from 'react'

import { Figure, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

function Box({
  x,
  y,
  w,
  h = 32,
  mark,
  children,
  strong = false,
}: {
  x: number
  y: number
  w: number
  h?: number
  mark: MarkName
  children?: ReactNode
  strong?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        filter="url(#pp-marker)"
        style={{ fill: MARKS[mark] }}
      />
      {children ? (
        <text
          className={strong ? 'fig-strong' : undefined}
          x={x + w / 2}
          y={y + h / 2 + 4}
          textAnchor="middle"
        >
          {children}
        </text>
      ) : null}
    </g>
  )
}

const configOrder = ['upstream-a', 'upstream-b', 'upstream-c']
const idOrder = [
  { key: 'b', id: '433eca…' },
  { key: 'a', id: '73c2bb…' },
  { key: 'c', id: 'a27600…' },
]
const roundRobin = ['b', 'a', 'c', 'b', 'a', 'c']
const fillFirst = ['b', 'b', 'b', 'b', 'b', 'b']

/** How CLIProxyAPI v8 picks one key out of a group for each request. */
export function CredentialPick() {
  return (
    <Figure
      bleed
      title="Which upstream key serves each request"
      legend={[
        { label: 'config order', mark: 'sand' },
        { label: 'the key that is picked', mark: 'lilac' },
      ]}
      caption="Three keys in one openai-compatibility group, same priority. IDs are the first characters of the SHA-256 that the proxy computes for each key."
    >
      <svg
        viewBox="0 0 640 250"
        role="img"
        aria-label="Left: three keys a, b and c in config order. Middle: the proxy sorts them by credential ID, a hash, which puts b first, then a, then c. Right: round-robin sends six requests to b, a, c, b, a, c. Fill-first sends all six to b, the key with the lowest ID, not the first key in the file."
      >
        <text className="fig-strong" x="10" y="20">
          in the file
        </text>
        {configOrder.map((key, index) => (
          <Box key={key} x={10} y={34 + index * 42} w={120} mark="sand">
            {key}
          </Box>
        ))}
        <path className="ink-stroke" markerEnd="url(#pp-ink-arrow)" d="M136 92H166" />
        <text className="fig-strong" x="172" y="20">
          sorted by ID
        </text>
        {idOrder.map((item, index) => (
          <Box
            key={item.key}
            x={172}
            y={34 + index * 42}
            w={130}
            mark={index === 0 ? 'lilac' : 'sand'}
          >
            {`${item.key} · ${item.id}`}
          </Box>
        ))}
        <path className="ink-stroke" markerEnd="url(#pp-ink-arrow)" d="M308 92H338" />
        <text className="fig-strong" x="344" y="20">
          requests 1 to 6
        </text>
        <text x="344" y="52">
          round-robin
        </text>
        {roundRobin.map((key, index) => (
          <Box key={`rr-${index}`} x={344 + index * 48} y={60} w={40} mark="lilac">
            {key}
          </Box>
        ))}
        <text x="344" y="128">
          fill-first
        </text>
        {fillFirst.map((key, index) => (
          <Box key={`ff-${index}`} x={344 + index * 48} y={136} w={40} mark="lilac">
            {key}
          </Box>
        ))}
        <g>
          <text className="fig-hand" x="372" y="232" transform="rotate(-3 372 232)">
            not upstream-a
          </text>
          <path
            className="ink-stroke"
            markerEnd="url(#pp-ink-arrow)"
            d="M392 214C380 200 370 188 364 174"
          />
        </g>
      </svg>
    </Figure>
  )
}
