import type { CSSProperties, ReactNode } from 'react'

export const MARKS = {
  lilac: 'var(--m-lilac)',
  blue: 'var(--m-blue)',
  sand: 'var(--m-sand)',
  amber: 'var(--m-amber)',
  rose: 'var(--m-rose)',
  sage: 'var(--m-sage)',
} as const

export type MarkName = keyof typeof MARKS

export type LegendItem = {
  label: string
  mark: MarkName
  shape?: 'square' | 'line' | 'dashed'
}

type FigureProps = {
  title?: string
  caption?: ReactNode
  legend?: Array<LegendItem>
  /** A taped note card, placed over the lower left of the figure. */
  card?: { title?: string; body: ReactNode }
  /** Run the figure across the full width of the page. */
  bleed?: boolean
  children: ReactNode
}

function markStyle(mark: MarkName) {
  return { '--mark': MARKS[mark] } as CSSProperties
}

export function Figure({
  title,
  caption,
  legend,
  card,
  bleed = false,
  children,
}: FigureProps) {
  return (
    <figure
      className={bleed ? 'fig bleed not-typography' : 'fig not-typography'}
    >
      {title ? <p className="fig-title">{title}</p> : null}
      <div className="fig-plot">{children}</div>
      {card ? (
        <div className="note-card taped">
          {card.title ? <strong>{card.title}</strong> : null}
          {card.body}
        </div>
      ) : null}
      {legend?.length ? (
        <ul className="fig-legend" data-pagefind-ignore="">
          {legend.map((item) => (
            <li key={item.label}>
              <span
                className={
                  item.shape === 'line' || item.shape === 'dashed'
                    ? `fig-legend-line ${item.shape}`
                    : 'mark-square'
                }
                style={markStyle(item.mark)}
              />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
      {caption ? (
        <figcaption className="fig-caption">{caption}</figcaption>
      ) : null}
    </figure>
  )
}

/** Hand-ruled graph paper that fades at the edges. */
export function GraphPaper({
  width,
  height,
  bleed = 50,
}: {
  width: number
  height: number
  bleed?: number
}) {
  return (
    <g mask="url(#pp-fade)" aria-hidden="true">
      <rect
        x={-bleed}
        y={-bleed * 0.7}
        width={width + bleed * 2}
        height={height + bleed * 1.4}
        fill="url(#pp-plus)"
        filter="url(#pp-rule)"
      />
    </g>
  )
}

/** A handwritten note inside an SVG figure, with an optional arrow. */
export function HandNote({
  x,
  y,
  text,
  rotate = -3,
  arrowTo,
  anchor = 'start',
  arrowToFrom = 'below',
}: {
  x: number
  y: number
  text: string
  rotate?: number
  arrowTo?: [number, number]
  anchor?: 'start' | 'middle' | 'end'
  /** Where the arrow leaves the note: under the text, or from its left. */
  arrowToFrom?: 'below' | 'left'
}) {
  const lines = text.split('\n')
  const lastY = arrowToFrom === 'left' ? y - 14 : y + (lines.length - 1) * 17
  const startX =
    arrowToFrom === 'left' ? x - 28 : anchor === 'end' ? x - 24 : x + 24
  return (
    <g>
      <g transform={`rotate(${rotate} ${x} ${y})`}>
        {lines.map((line, index) => (
          <text
            key={line}
            className="fig-hand"
            x={x}
            y={y + index * 17}
            textAnchor={anchor}
          >
            {line}
          </text>
        ))}
      </g>
      {arrowTo ? (
        <path
          className="ink-stroke"
          markerEnd="url(#pp-ink-arrow)"
          d={`M${startX} ${lastY + 8}Q${(startX + arrowTo[0]) / 2 + 8} ${
            (lastY + 8 + arrowTo[1]) / 2
          } ${arrowTo[0]} ${arrowTo[1]}`}
        />
      ) : null}
    </g>
  )
}

/** A hand-drawn pen circle around a word. */
export function Circled({ children }: { children: ReactNode }) {
  return (
    <span className="circled">
      {children}
      <svg aria-hidden="true">
        <use href="#pp-circle" />
      </svg>
    </span>
  )
}

export function formatValue(value: number) {
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  return String(Number(value.toPrecision(4)))
}

/** "48×" for a large gain. A gain below 2× gets no label. */
export function formatGain(before: number, after: number) {
  if (!(before > 0) || !(after > 0)) return ''
  const ratio = before / after
  if (ratio >= 10) return `${Math.round(ratio)}×`
  if (ratio >= 2) return `${Number(ratio.toFixed(1))}×`
  return ''
}
