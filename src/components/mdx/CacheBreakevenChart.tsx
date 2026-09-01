import {
  EditorialFigure,
  LegendSwatch,
  Reveal,
  T,
  fig,
} from './editorialFigure'

/**
 * F2 Hairline Line (basics-gallery "Thirty days of sign-ups").
 * OpenAI prompt-caching break-even L = 102.4 + 1177.6 / N on a log
 * request axis (the honest layout for a hyperbola). Hairline curve,
 * a dot per point, the two anchor points labeled: 221 tokens at ten
 * requests, the 103-token asymptote that never pays off.
 */

type BreakevenPoint = {
  requests: number
  tokens: number
}

type Props = {
  title?: string
  caption?: string
}

// Longest prefix length that is NOT worth expanding to a 1024-token cache.
const POINTS: BreakevenPoint[] = [
  { requests: 2, tokens: 691.2 },
  { requests: 3, tokens: 494.9 },
  { requests: 4, tokens: 396.8 },
  { requests: 5, tokens: 337.9 },
  { requests: 6, tokens: 298.7 },
  { requests: 8, tokens: 249.6 },
  { requests: 10, tokens: 220.2 },
  { requests: 20, tokens: 161.3 },
  { requests: 50, tokens: 125.9 },
  { requests: 100, tokens: 114.2 },
  { requests: 500, tokens: 104.8 },
  { requests: 1963, tokens: 103.0 },
].map((p) => ({ ...p, tokens: Number(p.tokens.toFixed(1)) }))

const TEN_REQUESTS = POINTS.find((p) => p.requests === 10)!
const ASYMPTOTE = POINTS[POINTS.length - 1]

const X_TICKS = [2, 10, 50, 100, 500, 1000, 2000]
const Y_TICKS = [200, 300, 400, 500, 600, 700]
const formatTick = (value: number) =>
  value >= 1000 ? `${value / 1000}k` : String(value)

const W = 720
const H = 320
const X0 = 64
const X1 = 646
const SPAN = X1 - X0
const BASE = 250
const SCALE = 0.21 // px per token above the 100-token floor

const LOG_MIN = Math.log(2)
const LOG_MAX = Math.log(2200)

const xOf = (requests: number) =>
  X0 + (SPAN * (Math.log(requests) - LOG_MIN)) / (LOG_MAX - LOG_MIN)
const yOf = (tokens: number) => BASE - (tokens - 100) * SCALE

export default function CacheBreakevenChart({ title, caption }: Props) {
  return (
    <EditorialFigure title={title} caption={caption}>
      <Reveal>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Break-even prefix length as reuse grows"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        >
          {/* y gridlines + axis labels */}
          {Y_TICKS.map((t) => (
            <g key={t}>
              <line
                x1={X0}
                y1={yOf(t)}
                x2={X1}
                y2={yOf(t)}
                stroke={fig.grid}
                strokeWidth={1}
                className="lf-fade"
                style={{ animationDelay: `${0.1 + t * 0.01}s` }}
              />
              <T
                x={X0 - 8}
                y={yOf(t) + 2.5}
                size={9}
                weight={600}
                color={fig.faint}
                anchor="end"
                className="lf-fade"
                style={{ animationDelay: `${0.1 + t * 0.01}s` }}
              >
                {t}
              </T>
            </g>
          ))}

          {/* asymptote rule: 102.4 tokens */}
          <line
            x1={X0}
            y1={yOf(102.4)}
            x2={X1}
            y2={yOf(102.4)}
            stroke={fig.faint}
            strokeWidth={1.2}
            strokeDasharray="3 3"
            className="lf-fade"
            style={{ animationDelay: '0.3s' }}
          />
          <T
            x={X0}
            y={yOf(102.4) - 6}
            size={9.5}
            weight={700}
            color={fig.muted}
            className="lf-fade"
            style={{ animationDelay: '0.4s' }}
          >
            asymptote 102.4
          </T>

          {/* ten-requests rule */}
          <line
            x1={xOf(TEN_REQUESTS.requests)}
            y1={118}
            x2={xOf(TEN_REQUESTS.requests)}
            y2={BASE}
            stroke={fig.data2}
            strokeWidth={1.2}
            strokeDasharray="4 4"
            className="lf-fade"
            style={{ animationDelay: '0.4s' }}
          />
          <T
            x={xOf(TEN_REQUESTS.requests)}
            y={110}
            size={9.5}
            weight={700}
            color={fig.data2}
            anchor="middle"
            className="lf-fade"
            style={{ animationDelay: '0.5s' }}
          >
            ten requests
          </T>

          {/* the break-even curve */}
          <polyline
            points={POINTS.map(
              (p) => `${xOf(p.requests)},${yOf(p.tokens)}`,
            ).join(' ')}
            fill="none"
            stroke={fig.accent}
            strokeWidth={1.8}
            pathLength={1}
            className="lf-draw"
            style={{ animationDuration: '1.2s' }}
          />

          {/* a dot per sampled point */}
          {POINTS.map((p) => (
            <circle
              key={`p${p.requests}`}
              cx={xOf(p.requests)}
              cy={yOf(p.tokens)}
              r={3}
              fill={fig.data2}
              className="lf-pop"
              style={{ animationDelay: `${0.4 + p.requests * 0.004}s` }}
            />
          ))}

          {/* anchor dots + labels */}
          <circle
            cx={xOf(TEN_REQUESTS.requests)}
            cy={yOf(TEN_REQUESTS.tokens)}
            r={5}
            fill={fig.accent}
            className="lf-pop"
            style={{ animationDelay: '0.9s' }}
          />
          <T
            x={xOf(TEN_REQUESTS.requests)}
            y={yOf(TEN_REQUESTS.tokens) - 13}
            size={12}
            weight={800}
            color={fig.accent}
            anchor="middle"
            halo
            className="lf-fade"
            style={{ animationDelay: '1s' }}
          >
            221
          </T>
          <circle
            cx={xOf(ASYMPTOTE.requests)}
            cy={yOf(ASYMPTOTE.tokens)}
            r={5}
            fill={fig.paper}
            stroke={fig.data2}
            strokeWidth={1.6}
            className="lf-pop"
            style={{ animationDelay: '0.95s' }}
          />
          <T
            x={xOf(ASYMPTOTE.requests)}
            y={yOf(ASYMPTOTE.tokens) - 13}
            size={12}
            weight={800}
            color={fig.data2}
            anchor="middle"
            halo
            className="lf-fade"
            style={{ animationDelay: '1.05s' }}
          >
            103
          </T>

          {/* x ticks */}
          {X_TICKS.map((t) => (
            <T
              key={`x${t}`}
              x={xOf(t)}
              y={BASE + 18}
              size={9}
              weight={600}
              color={fig.muted}
              anchor="middle"
              className="lf-fade"
              style={{ animationDelay: `${0.5 + t * 0.002}s` }}
            >
              {formatTick(t)}
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
            REQUESTS REUSING THE PREFIX (N) · LOG SCALE
          </T>
          <T
            x={26}
            y={250}
            size={9}
            weight={700}
            color={fig.muted}
            ls={0.04}
            transform="rotate(-90 26 250)"
            className="lf-fade"
            style={{ animationDelay: '1.1s' }}
          >
            LONGEST PREFIX NOT WORTH CACHING (TOKENS) ↑
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
          label="Cheaper to cache — above the line"
        />
        <LegendSwatch
          color={fig.data2}
          dash
          label="Not worth caching — below the line"
        />
      </div>
    </EditorialFigure>
  )
}
