import { Chip, EditorialFigure, PanelLabel, T, fig } from './editorialFigure'

type Props = {
  title?: string
  caption?: string
}

const W = 720
const H = 340

/** Tiny flat geometric glyphs, one per quadrant. */
function StackGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke={fig.lineStrong} strokeWidth={1}>
      <rect x={x + 4} y={y} width={10} height={3.5} rx={1} />
      <rect x={x + 2} y={y + 5} width={14} height={3.5} rx={1} />
      <rect x={x} y={y + 10} width={18} height={3.5} rx={1} />
    </g>
  )
}

function ListGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={fig.lineStrong} strokeWidth={1}>
      <line x1={x} y1={y + 1} x2={x + 12} y2={y + 1} />
      <line x1={x} y1={y + 6} x2={x + 12} y2={y + 6} />
      <line x1={x} y1={y + 11} x2={x + 8} y2={y + 11} />
    </g>
  )
}

function HashGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={fig.lineStrong} strokeWidth={1}>
      <line x1={x + 4} y1={y} x2={x + 2} y2={y + 13} />
      <line x1={x + 11} y1={y} x2={x + 9} y2={y + 13} />
      <line x1={x} y1={y + 4} x2={x + 13} y2={y + 4} />
      <line x1={x} y1={y + 9} x2={x + 13} y2={y + 9} />
    </g>
  )
}

function ReqGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke={fig.lineStrong} strokeWidth={1}>
      <line x1={x} y1={y + 6} x2={x + 7} y2={y + 6} />
      <path d={`M ${x + 4} ${y + 3} L ${x + 7} ${y + 6} L ${x + 4} ${y + 9}`} />
      <rect x={x + 9} y={y + 1} width={9} height={10} rx={1} />
    </g>
  )
}

export default function PrefixCacheStructure({ title, caption }: Props) {
  return (
    <EditorialFigure title={title} caption={caption}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Prefix cache data structure"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        {/* Outer frame and internal dividers */}
        <rect
          x={0.5}
          y={0.5}
          width={W - 1}
          height={H - 1}
          fill="none"
          stroke={fig.line}
        />
        <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={fig.line} />
        <line x1={0} y1={186} x2={W} y2={186} stroke={fig.line} />

        {/* Block pool */}
        <PanelLabel x={28} y={34}>
          Block pool
        </PanelLabel>
        <StackGlyph x={310} y={22} />
        <line
          x1={28}
          y1={44}
          x2={340}
          y2={44}
          stroke={fig.line}
          strokeOpacity={0.6}
        />
        <Chip x={28} y={62} w={58} label="blk 0" state="computed" />
        <Chip x={96} y={62} w={58} label="blk 1" state="computed" />
        <Chip x={164} y={62} w={58} label="blk 2" state="computed" />
        <Chip x={232} y={62} w={58} label="blk 3" state="new" />
        <T x={28} y={112} size={9.5} color={fig.faint}>
          key-value blocks, hashed by content
        </T>
        <T x={28} y={128} size={9.5} color={fig.faint}>
          written once, reused by later requests
        </T>

        {/* Free block queue */}
        <PanelLabel x={388} y={34}>
          Free block queue
        </PanelLabel>
        <ListGlyph x={676} y={22} />
        <line
          x1={388}
          y1={44}
          x2={700}
          y2={44}
          stroke={fig.line}
          strokeOpacity={0.6}
        />
        <Chip x={388} y={62} w={58} label="blk 1" state="evicted" />
        <Chip x={456} y={62} w={58} label="blk 2" state="evicted" />
        <Chip x={524} y={62} w={58} label="blk 4" state="new" />
        <T x={388} y={112} size={9.5} color={fig.faint}>
          blocks no request currently references
        </T>
        <T x={388} y={128} size={9.5} color={fig.faint}>
          reallocated when a request grows
        </T>

        {/* Cache blocks */}
        <PanelLabel x={28} y={220}>
          Cache blocks · hash → block ID
        </PanelLabel>
        <HashGlyph x={308} y={208} />
        <line
          x1={28}
          y1={230}
          x2={340}
          y2={230}
          stroke={fig.line}
          strokeOpacity={0.6}
        />
        {[
          ['h(blk0)', 'blk 0', fig.ink],
          ['h(blk0+1)', 'blk 1', fig.ink],
          ['h(blk0+1+2)', 'blk 2', fig.ink],
          ['h(blk0+1+2+3)', 'blk 3', fig.accent],
        ].map(([key, value, color], i) => (
          <g key={key}>
            <T x={28} y={248 + i * 20} size={10} color={fig.muted} mono>
              {key}
            </T>
            <T x={158} y={248 + i * 20} size={10} color={fig.faint}>
              →
            </T>
            <T x={176} y={248 + i * 20} size={10} color={color} mono>
              {value}
            </T>
          </g>
        ))}
        <T x={28} y={326} size={9.5} color={fig.faint}>
          the chained hash makes the match exact
        </T>

        {/* Request blocks */}
        <PanelLabel x={388} y={220}>
          Request blocks → allocated
        </PanelLabel>
        <ReqGlyph x={676} y={208} />
        <line
          x1={388}
          y1={230}
          x2={700}
          y2={230}
          stroke={fig.line}
          strokeOpacity={0.6}
        />
        <T x={388} y={248} size={10} color={fig.muted} mono>
          req A
        </T>
        <T x={470} y={248} size={10} color={fig.ink} mono>
          blk 0 · 1 · 2
        </T>
        <T x={388} y={268} size={10} color={fig.muted} mono>
          req B
        </T>
        <text
          x={470}
          y={268}
          fontSize={10}
          style={{ fontFamily: 'var(--font-mono, monospace)' }}
          fill={fig.ink}
        >
          blk 0 · 1 · 2<tspan fill={fig.accent}> · 3</tspan>
        </text>
        <T x={388} y={326} size={9.5} color={fig.faint}>
          each request keeps its own block list
        </T>
      </svg>
    </EditorialFigure>
  )
}
