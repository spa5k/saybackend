import { Arrow, Chip, EditorialFigure, T, fig } from './editorialFigure'

type Props = {
  title?: string
  caption?: string
}

const W = 720
const H = 340

const COLUMNS = [
  { x: 22, title: 'New request', mono: null },
  { x: 200, title: 'Look up', mono: 'get_computed_blocks()' },
  { x: 378, title: 'Allocate', mono: 'allocate_slots()' },
  { x: 556, title: 'Result', mono: null },
]

export default function PrefixCacheWorkflow({ title, caption }: Props) {
  return (
    <EditorialFigure title={title} caption={caption}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="How a new request reuses the prefix cache"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        {/* Step markers and titles */}
        {COLUMNS.map((col, i) => (
          <g key={col.title}>
            <rect
              x={col.x}
              y={56}
              width={16}
              height={16}
              rx={2}
              fill="none"
              stroke={fig.lineStrong}
              strokeWidth={1}
            />
            <T
              x={col.x + 8}
              y={68}
              size={10}
              weight={600}
              color={fig.ink}
              anchor="middle"
            >
              {i + 1}
            </T>
            <T x={col.x + 28} y={67} size={12} weight={600} color={fig.ink}>
              {col.title}
            </T>
            {col.mono && (
              <T x={col.x + 28} y={81} size={8.5} color={fig.faint} mono>
                {col.mono}
              </T>
            )}
            <line
              x1={col.x}
              y1={92}
              x2={col.x + 150}
              y2={92}
              stroke={fig.line}
            />
          </g>
        ))}

        {/* Arrows between steps */}
        <Arrow x1={174} y1={150} x2={196} y2={150} />
        <Arrow x1={352} y1={150} x2={374} y2={150} />
        <Arrow x1={530} y1={150} x2={552} y2={150} />

        {/* Step bodies */}
        <Chip x={22} y={136} w={102} label="prompt tokens" />
        <T x={22} y={216} size={9.5} color={fig.muted} mono>
          hash each block
        </T>
        <T x={22} y={234} size={9.5} color={fig.faint}>
          from the start, in order
        </T>

        <T x={200} y={124} size={9.5} color={fig.muted} mono>
          lookup cache map
        </T>
        <Chip x={200} y={136} w={112} label="blk 0 · 1 · 2" state="new" />
        <T x={200} y={216} size={9.5} color={fig.faint}>
          shared prefix, already
        </T>
        <T x={200} y={234} size={9.5} color={fig.faint}>
          computed by an earlier request
        </T>

        <T x={378} y={124} size={9.5} color={fig.muted} mono>
          touch reused · free if unused
        </T>
        <Chip x={378} y={136} w={64} label="blk 3" state="new" />
        <T x={378} y={216} size={9.5} color={fig.faint}>
          touched blocks survive eviction
        </T>
        <T x={378} y={234} size={9.5} color={fig.faint}>
          the tail allocates if there is room
        </T>

        <Chip x={556} y={136} w={104} label="reuse prefix" state="new" />
        <Chip x={556} y={164} w={96} label="decode tail" state="computed" />
        <T x={556} y={216} size={9.5} color={fig.faint}>
          nothing below the boundary
        </T>
        <T x={556} y={234} size={9.5} color={fig.faint}>
          is reprocessed
        </T>
      </svg>
    </EditorialFigure>
  )
}
