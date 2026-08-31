import { createChartScene, defineChart, lineY, ruleX } from '@tanstack/charts'
import { renderChartSvg } from '@tanstack/charts/svg'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleLog } from 'd3-scale'

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

const WIDTH = 720
const HEIGHT = 288

const definition = defineChart({
  marks: [
    lineY(POINTS, {
      id: 'breakeven',
      x: 'requests',
      y: 'tokens',
      stroke: 'var(--green)',
      strokeWidth: 3,
    }),
    ruleX([{ requests: 10 }], {
      x: 'requests',
      stroke: 'var(--green)',
      strokeDasharray: '4 4',
      strokeWidth: 1.5,
    }),
    ruleX([{ requests: 1963 }], {
      x: 'requests',
      stroke: 'var(--brick)',
      strokeDasharray: '4 4',
      strokeWidth: 1.5,
    }),
  ],
  scales: {
    x: {
      scale: () => scaleLog().domain([2, 2100]).nice(),
      axis: { label: 'Requests reusing the prefix (N)' },
    },
    y: {
      scale: scaleLinear,
      domain: [100, 700],
      grid: true,
      axis: { label: 'Longest prefix not worth caching (tokens)' },
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
    <figure className="my-8">
      {title && (
        <figcaption className="mb-4 text-[var(--foreground)]">
          <strong className="font-serif text-lg">{title}</strong>
        </figcaption>
      )}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
        <div
          className="w-full"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="mt-4 flex items-center gap-6 text-xs font-semibold">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--green)]" />
            Cheaper to cache (above the line)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--brick)]" />
            Not worth caching (below the line)
          </span>
        </div>
      </div>
      {caption && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{caption}</p>
      )}
    </figure>
  )
}
