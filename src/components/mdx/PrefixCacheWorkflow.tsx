import { Arrow, Chip, EditorialFigure, Reveal, T, fig } from './editorialFigure'

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
      <Reveal>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="How a new request reuses the prefix cache"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        >
          {/* Step markers and titles */}
          {COLUMNS.map((col, i) => (
            <g
              key={col.title}
              className="lf-fade"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
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
                size={11}
                weight={600}
                color={fig.accent}
                anchor="middle"
              >
                {i + 1}
              </T>
              <T x={col.x + 28} y={67} size={13} weight={600} color={fig.ink}>
                {col.title}
              </T>
              {col.mono && (
                <T x={col.x + 28} y={81} size={10.5} color={fig.faint} mono>
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
          <Arrow
            x1={174}
            y1={150}
            x2={196}
            y2={150}
            className="lf-draw"
            style={{ animationDelay: '0.5s' }}
          />
          <Arrow
            x1={352}
            y1={150}
            x2={374}
            y2={150}
            className="lf-draw"
            style={{ animationDelay: '0.6s' }}
          />
          <Arrow
            x1={530}
            y1={150}
            x2={552}
            y2={150}
            className="lf-draw"
            style={{ animationDelay: '0.7s' }}
          />

          {/* Step bodies */}
          <g className="lf-fade" style={{ animationDelay: '0.3s' }}>
            <Chip x={22} y={136} w={102} label="prompt tokens" />
          </g>
          <T
            x={22}
            y={216}
            size={10.5}
            color={fig.muted}
            mono
            className="lf-fade"
            style={{ animationDelay: '0.45s' }}
          >
            hash each block
          </T>
          <T
            x={22}
            y={234}
            size={10.5}
            color={fig.faint}
            className="lf-fade"
            style={{ animationDelay: '0.5s' }}
          >
            from the start, in order
          </T>

          <g className="lf-fade" style={{ animationDelay: '0.35s' }}>
            <T x={200} y={124} size={10.5} color={fig.muted} mono>
              lookup cache map
            </T>
            <Chip
              x={200}
              y={136}
              w={112}
              label="blk 0 · 1 · 2"
              state="computed"
            />
          </g>
          <T
            x={200}
            y={216}
            size={10.5}
            color={fig.faint}
            className="lf-fade"
            style={{ animationDelay: '0.55s' }}
          >
            shared prefix, already
          </T>
          <T
            x={200}
            y={234}
            size={10.5}
            color={fig.faint}
            className="lf-fade"
            style={{ animationDelay: '0.6s' }}
          >
            computed by an earlier request
          </T>

          <g className="lf-fade" style={{ animationDelay: '0.4s' }}>
            <T x={378} y={124} size={10.5} color={fig.muted} mono>
              touch reused · free if unused
            </T>
            <Chip x={378} y={136} w={64} label="blk 3" state="new" />
          </g>
          <T
            x={378}
            y={216}
            size={10.5}
            color={fig.faint}
            className="lf-fade"
            style={{ animationDelay: '0.65s' }}
          >
            touched blocks survive eviction
          </T>
          <T
            x={378}
            y={234}
            size={10.5}
            color={fig.faint}
            className="lf-fade"
            style={{ animationDelay: '0.7s' }}
          >
            the tail allocates if there is room
          </T>

          <g className="lf-fade" style={{ animationDelay: '0.45s' }}>
            <Chip
              x={556}
              y={136}
              w={104}
              label="reuse prefix"
              state="computed"
            />
            <Chip x={556} y={164} w={96} label="decode tail" state="new" />
          </g>
          <T
            x={556}
            y={216}
            size={10.5}
            color={fig.faint}
            className="lf-fade"
            style={{ animationDelay: '0.75s' }}
          >
            nothing below the boundary
          </T>
          <T
            x={556}
            y={234}
            size={10.5}
            color={fig.faint}
            className="lf-fade"
            style={{ animationDelay: '0.8s' }}
          >
            is reprocessed
          </T>
        </svg>
      </Reveal>
    </EditorialFigure>
  )
}
