import {
  createChartScene,
  defineChart,
  dot,
  d3Curve,
  lineY,
  ruleX,
  ruleY,
  text,
} from '@tanstack/charts'
import { renderChartSvg } from '@tanstack/charts/svg'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { curveMonotoneX } from 'd3-shape'
import { scaleLog } from 'd3-scale'
import { EditorialFigure, LegendSwatch, fig } from './editorialFigure'

type BreakevenPoint = {
  requests: number
  tokens: number
}

type Props = {
  title?: string
  caption?: string
}

// OpenAI prompt-caching break-even: L = 102.4 + 1177.6 / N
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
const formatTick = (value: number) =>
  value >= 1000 ? `${value / 1000}k` : String(value)

const WIDTH = 720
const HEIGHT = 340

const definition = defineChart({
  marks: [
    lineY(POINTS, {
      id: 'breakeven',
      x: 'requests',
      y: 'tokens',
      stroke: fig.accent,
      strokeWidth: 1.5,
      curve: d3Curve(curveMonotoneX),
    }),
    ruleX([{ requests: TEN_REQUESTS.requests }], {
      x: 'requests',
      stroke: fig.accent,
      strokeOpacity: 0.5,
      strokeWidth: 1,
      strokeDasharray: '4 4',
    }),
    ruleX([{ requests: ASYMPTOTE.requests }], {
      x: 'requests',
      stroke: fig.muted,
      strokeOpacity: 0.5,
      strokeWidth: 1,
      strokeDasharray: '4 4',
    }),
    ruleY([{ y: 102.4 }], {
      y: 'y',
      stroke: fig.lineStrong,
      strokeOpacity: 0.7,
      strokeWidth: 1,
      strokeDasharray: '3 3',
    }),
    dot([TEN_REQUESTS], {
      id: 'ten-dot',
      x: 'requests',
      y: 'tokens',
      r: 3.5,
      fill: fig.paper,
      stroke: fig.accent,
      strokeWidth: 1.25,
    }),
    dot([ASYMPTOTE], {
      id: 'asymptote-dot',
      x: 'requests',
      y: 'tokens',
      r: 3.5,
      fill: fig.paper,
      stroke: fig.muted,
      strokeWidth: 1.25,
    }),
    text([{ x: TEN_REQUESTS.requests, y: TEN_REQUESTS.tokens, label: '221' }], {
      x: 'x',
      y: 'y',
      text: 'label',
      fill: fig.accent,
      fontSize: 10.5,
      anchor: 'start',
      dx: 8,
      dy: -10,
    }),
    text([{ x: ASYMPTOTE.requests, y: ASYMPTOTE.tokens, label: '103' }], {
      x: 'x',
      y: 'y',
      text: 'label',
      fill: fig.muted,
      fontSize: 10.5,
      anchor: 'end',
      dx: -8,
      dy: -12,
    }),
    text([{ x: 2, y: 102.4, label: 'asymptote 102.4' }], {
      x: 'x',
      y: 'y',
      text: 'label',
      fill: fig.faint,
      fontSize: 9.5,
      anchor: 'start',
      dx: 4,
      dy: -6,
    }),
  ],
  scales: {
    x: {
      scale: () => scaleLog().domain([2, 2200]),
      axis: {
        label: 'Requests reusing the prefix (N)',
        ticks: { values: X_TICKS, format: formatTick },
      },
    },
    y: {
      scale: scaleLinear,
      domain: [100, 720],
      grid: true,
      axis: {
        label: 'Longest prefix not worth caching (tokens)',
        ticks: { values: [200, 300, 400, 500, 600, 700] },
      },
    },
  },
})

const svg = renderChartSvg(
  createChartScene(definition, { width: WIDTH, height: HEIGHT }),
  {
    ariaLabel: 'Break-even prefix length as reuse grows',
  },
)

export default function CacheBreakevenChart({ title, caption }: Props) {
  return (
    <EditorialFigure title={title} caption={caption}>
      <div style={{ color: '#8f8877', fontFamily: 'inherit' }}>
        <div
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
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
          color={fig.muted}
          dash
          label="Not worth caching — below the line"
        />
      </div>
    </EditorialFigure>
  )
}
