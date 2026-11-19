import { Figure, GraphPaper, HandNote, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

type Props = {
  title?: string
  caption?: string
}

const WIDTH = 640
const HEIGHT = 300
const LEFT = 84
const BLOCK_W = 82
const STEP = 92
const POOL_Y = 112
const BLOCK_H = 38

const pool: Array<{ mark: MarkName; refs: number; hash?: string }> = [
  { mark: 'lilac', refs: 2, hash: 'h0' },
  { mark: 'lilac', refs: 2, hash: 'h1' },
  { mark: 'lilac', refs: 2, hash: 'h2' },
  { mark: 'amber', refs: 1, hash: 'h3' },
  { mark: 'sand', refs: 0 },
  { mark: 'sand', refs: 0 },
]

const x = (index: number) => LEFT + index * STEP

function Span({
  from,
  to,
  y,
  label,
}: {
  from: number
  to: number
  y: number
  label: string
}) {
  const start = x(from)
  const end = x(to) + BLOCK_W
  return (
    <g>
      <path
        className="fig-axis"
        d={`M${start} ${y + 6}V${y}H${end}V${y + 6}`}
        filter="url(#pp-rule)"
      />
      <text className="fig-strong" x={start} y={y - 6}>
        {label}
      </text>
    </g>
  )
}

/**
 * The prefix cache drawn as one picture: requests on top, the block pool in
 * the middle, the hash chain and the free queue under it.
 */
export default function PrefixCacheStructure({ title, caption }: Props) {
  return (
    <Figure
      title={title}
      caption={caption}
      legend={[
        { label: 'Shared by both requests', mark: 'lilac' },
        { label: 'New for request B', mark: 'amber' },
        { label: 'Free', mark: 'sand' },
      ]}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="A block pool of six blocks. Request A uses blocks 0 to 2. Request B uses blocks 0 to 3. Blocks 0 to 2 have two references, block 3 has one, and blocks 4 and 5 have none and wait in the free queue. Each used block has a hash that includes the hash of the block before it."
      >
        <GraphPaper width={WIDTH} height={HEIGHT} bleed={30} />
        <Span from={0} to={3} y={34} label="request B" />
        <Span from={0} to={2} y={78} label="request A" />
        <text x={LEFT - 12} y={POOL_Y + 23} textAnchor="end">
          block pool
        </text>
        <g filter="url(#pp-marker)">
          {pool.map((block, index) => (
            <rect
              key={index}
              x={x(index)}
              y={POOL_Y}
              width={BLOCK_W}
              height={BLOCK_H}
              style={{ fill: MARKS[block.mark] }}
            />
          ))}
        </g>
        {pool.map((block, index) => (
          <g key={index}>
            <text
              x={x(index) + BLOCK_W / 2}
              y={POOL_Y + 23}
              textAnchor="middle"
              style={{ fill: '#141413' }}
            >
              blk {index}
            </text>
            <text
              x={x(index) + BLOCK_W / 2}
              y={POOL_Y + BLOCK_H + 16}
              textAnchor="middle"
              fontSize="10"
            >
              {block.refs} {block.refs === 1 ? 'ref' : 'refs'}
            </text>
            {block.hash ? (
              <>
                <path
                  className="fig-axis"
                  strokeDasharray="2 3"
                  d={`M${x(index) + BLOCK_W / 2} ${POOL_Y + BLOCK_H + 22}V${POOL_Y + BLOCK_H + 40}`}
                />
                <text
                  className="fig-strong"
                  x={x(index) + BLOCK_W / 2}
                  y={POOL_Y + BLOCK_H + 56}
                  textAnchor="middle"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {block.hash}
                </text>
                {index > 0 ? (
                  <path
                    className="flow-edge"
                    markerEnd="url(#pp-arrow)"
                    d={`M${x(index - 1) + BLOCK_W / 2 + 14} ${POOL_Y + BLOCK_H + 52}H${x(index) + BLOCK_W / 2 - 14}`}
                  />
                ) : null}
              </>
            ) : null}
          </g>
        ))}
        <text x={LEFT - 12} y={POOL_Y + BLOCK_H + 56} textAnchor="end">
          hash map
        </text>
        <path
          className="fig-axis"
          d={`M${x(4)} ${POOL_Y + BLOCK_H + 28}V${POOL_Y + BLOCK_H + 34}H${x(5) + BLOCK_W}V${POOL_Y + BLOCK_H + 28}`}
          filter="url(#pp-rule)"
        />
        <text
          className="fig-strong"
          x={x(4) + (STEP + BLOCK_W) / 2}
          y={POOL_Y + BLOCK_H + 50}
          textAnchor="middle"
        >
          free queue
        </text>
        <HandNote
          x={x(1) - 10}
          y={POOL_Y + BLOCK_H + 92}
          text="each hash includes the one before it"
          rotate={-2}
        />
        <HandNote
          x={x(4) - 4}
          y={POOL_Y + BLOCK_H + 80}
          text="no request uses these"
          rotate={-2}
        />
      </svg>
    </Figure>
  )
}
