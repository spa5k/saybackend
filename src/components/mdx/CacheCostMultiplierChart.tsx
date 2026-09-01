import {
  EditorialFigure,
  LegendSwatch,
  Reveal,
  T,
  fig,
} from './editorialFigure'

/**
 * F2 Hairline Line (basics-gallery "Thirty days of sign-ups"), dual series.
 * One cache write at 1.25×, then each re-read at 0.1×. The cached line is
 * the hero (deep blue); the uncached line recedes. Every request column
 * hangs an F3-style hairline from uncached down to cached — one hairline
 * = what caching saves on that request. Dots per point, labeled endpoints.
 */

type CacheCostPoint = {
  requests: number
  cached: number
  uncached: number
}

type Props = {
  title?: string
  caption?: string
}

// One cache write (1.25x) then (N - 1) reads at 0.1x each.
const POINTS: CacheCostPoint[] = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1
  return {
    requests: n,
    cached: Number((1.25 + 0.1 * (n - 1)).toFixed(2)),
    uncached: n,
  }
})

const LAST = POINTS[POINTS.length - 1]

const W = 720
const H = 320
const X0 = 64
const X1 = 616
const PITCH = (X1 - X0) / 9
const BASE = 248
const SCALE = 21.2 // px per 1.0× of input cost

const xOf = (d: number) => X0 + d * PITCH
const yOf = (cost: number) => BASE - cost * SCALE

const Y_TICKS = [2, 4, 6, 8, 10]

export default function CacheCostMultiplierChart({ title, caption }: Props) {
  return (
    <EditorialFigure title={title} caption={caption}>
      <Reveal>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Relative input cost as the number of requests reusing a prefix grows"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        >
          {/* y gridlines + axis labels */}
          {Y_TICKS.map((c) => (
            <g key={c}>
              <line
                x1={X0}
                y1={yOf(c)}
                x2={X1}
                y2={yOf(c)}
                stroke={fig.grid}
                strokeWidth={1}
                className="lf-fade"
                style={{ animationDelay: `${0.1 + c * 0.05}s` }}
              />
              <T
                x={X0 - 8}
                y={yOf(c) + 2.5}
                size={9}
                weight={600}
                mono
                color={fig.faint}
                anchor="end"
                className="lf-fade"
                style={{ animationDelay: `${0.1 + c * 0.05}s` }}
              >
                {c}×
              </T>
            </g>
          ))}

          {/* first write reference rule at 1.25× */}
          <line
            x1={X0}
            y1={yOf(1.25)}
            x2={X1}
            y2={yOf(1.25)}
            stroke={fig.faint}
            strokeWidth={1.2}
            strokeDasharray="3 3"
            className="lf-fade"
            style={{ animationDelay: '0.3s' }}
          />

          {/* savings hairlines: uncached floor down to the cached line */}
          {POINTS.map((p, i) => (
            <line
              key={`s${p.requests}`}
              x1={xOf(i)}
              y1={yOf(p.uncached)}
              x2={xOf(i)}
              y2={yOf(p.cached)}
              stroke={fig.faintdata}
              strokeWidth={1.5}
              className="lf-fade"
              style={{ animationDelay: `${0.2 + i * 0.05}s` }}
            />
          ))}

          {/* uncached line: full recompute each turn */}
          <polyline
            points={POINTS.map((p, i) => `${xOf(i)},${yOf(p.uncached)}`).join(
              ' ',
            )}
            fill="none"
            stroke={fig.data2}
            strokeWidth={1.8}
            pathLength={1}
            className="lf-draw"
            style={{ animationDuration: '1.2s' }}
          />

          {/* cached line: one write, re-reads at 0.1× — the hero */}
          <polyline
            points={POINTS.map((p, i) => `${xOf(i)},${yOf(p.cached)}`).join(
              ' ',
            )}
            fill="none"
            stroke={fig.accent}
            strokeWidth={1.8}
            pathLength={1}
            className="lf-draw"
            style={{ animationDelay: '0.3s', animationDuration: '1.2s' }}
          />

          {/* dots: hollow = uncached, filled = cached */}
          {POINTS.map((p, i) => (
            <circle
              key={`u${p.requests}`}
              cx={xOf(i)}
              cy={yOf(p.uncached)}
              r={4}
              fill={fig.paper}
              stroke={fig.data2}
              strokeWidth={1.6}
              className="lf-pop"
              style={{ animationDelay: `${0.5 + i * 0.06}s` }}
            />
          ))}
          {POINTS.map((p, i) => (
            <circle
              key={`c${p.requests}`}
              cx={xOf(i)}
              cy={yOf(p.cached)}
              r={4}
              fill={fig.accent}
              className="lf-pop"
              style={{ animationDelay: `${0.55 + i * 0.06}s` }}
            />
          ))}

          {/* endpoint labels */}
          <T
            x={X0}
            y={yOf(1.25) - 9}
            size={11}
            weight={800}
            color={fig.accent}
            halo
            className="lf-fade"
            style={{ animationDelay: '0.9s' }}
          >
            1.25×
          </T>
          <T
            x={xOf(9)}
            y={yOf(LAST.cached) - 13}
            size={12}
            weight={800}
            color={fig.accent}
            anchor="end"
            halo
            className="lf-fade"
            style={{ animationDelay: '1s' }}
          >
            2.15×
          </T>
          <T
            x={xOf(9)}
            y={yOf(LAST.uncached) + 17}
            size={12}
            weight={800}
            color={fig.data2}
            halo
            className="lf-fade"
            style={{ animationDelay: '1s' }}
          >
            10×
          </T>

          {/* x labels + axis notes */}
          {POINTS.map((p, i) => (
            <T
              key={`x${p.requests}`}
              x={xOf(i)}
              y={BASE + 18}
              size={9.5}
              weight={600}
              color={fig.muted}
              anchor="middle"
              className="lf-fade"
              style={{ animationDelay: `${0.4 + i * 0.05}s` }}
            >
              {p.requests}
            </T>
          ))}
          <T
            x={W / 2}
            y={304}
            size={9}
            weight={700}
            color={fig.muted}
            anchor="middle"
            ls={0.1}
            className="lf-fade"
            style={{ animationDelay: '1.1s' }}
          >
            REQUESTS REUSING THE PREFIX · HAIRLINE = WHAT CACHING SAVES
          </T>
          <T
            x={26}
            y={190}
            size={9}
            weight={700}
            color={fig.muted}
            ls={0.08}
            transform="rotate(-90 26 190)"
            className="lf-fade"
            style={{ animationDelay: '1.1s' }}
          >
            RELATIVE INPUT COST ↑
          </T>

          {/* base rail */}
          <line
            x1={X0 - 6}
            y1={BASE}
            x2={X1 + 6}
            y2={BASE}
            stroke={fig.grid}
            strokeWidth={1}
            className="lf-fade"
          />
        </svg>
      </Reveal>
      <div
        style={{
          marginTop: 14,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px 26px',
        }}
      >
        <LegendSwatch
          color={fig.accent}
          label="Cached — one write, re-reads at 0.1×"
        />
        <LegendSwatch
          color={fig.data2}
          dash
          label="Uncached — full recompute each turn"
        />
        <LegendSwatch color={fig.faint} dash label="First write at 1.25×" />
      </div>
    </EditorialFigure>
  )
}
