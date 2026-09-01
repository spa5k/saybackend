import type { ReactNode } from 'react'

/**
 * Shared drawing language for editorial figures in blog posts.
 *
 * Warm parchment ground, a single ink-blue accent, warm gray everything
 * else, hairline geometric strokes, serif labels. No gradients, no
 * shadows, no 3D. Like a figure in a well-typeset report.
 */

export const fig = {
  /** Warm parchment ground — never pure white. */
  paper: '#f5f4ed',
  /** Inset panel fill. */
  panel: '#eae7d6',
  /** Deeper warm fill, for summary / checkpoint blocks. */
  panelDeep: '#ddd8c2',
  /** Primary figure text, warm near-black. */
  ink: '#25221b',
  /** Secondary text, warm gray. */
  muted: '#57513f',
  /** Tertiary text, faded warm gray. */
  faint: '#7d7660',
  /** Hairline strokes. */
  line: '#c4bb9f',
  /** Stronger hairlines. */
  lineStrong: '#94896c',
  /** The one hue accent: ink blue. */
  accent: '#1B365D',
}

/** Tints of the single accent hue (same hue, different value). */
export const accentTint = (alpha: number) => `rgba(27, 54, 93, ${alpha})`

export const labelFamily =
  "var(--font-sans, 'Lexend Variable', ui-sans-serif, system-ui, sans-serif)"
export const monoFamily =
  "var(--font-mono, 'JetBrains Mono Variable', ui-monospace, monospace)"

type TextProps = {
  x: number
  y: number
  children: ReactNode
  size?: number
  color?: string
  weight?: number
  anchor?: 'start' | 'middle' | 'end'
  mono?: boolean
  ls?: number
  opacity?: number
  style?: React.CSSProperties
}

/** Serif-by-default SVG label. */
export function T({
  x,
  y,
  children,
  size = 10.5,
  color = fig.ink,
  weight = 400,
  anchor = 'start',
  mono: isMono = false,
  ls = 0,
  opacity = 1,
  style,
}: TextProps) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fill={color}
      opacity={opacity}
      letterSpacing={ls}
      fontFamily={isMono ? monoFamily : labelFamily}
      style={{ fontFamily: isMono ? monoFamily : labelFamily, ...style }}
    >
      {children}
    </text>
  )
}

type ChipProps = {
  x: number
  y: number
  w: number
  label: string
  h?: number
  state?: 'computed' | 'new' | 'evicted'
  size?: number
}

/** Small flat token chip: hairline box, mono label. */
export function Chip({
  x,
  y,
  w,
  label,
  h = 20,
  state = 'computed',
  size = 9.5,
}: ChipProps) {
  const stroke =
    state === 'new'
      ? fig.accent
      : state === 'evicted'
        ? fig.line
        : fig.lineStrong
  const fill =
    state === 'new'
      ? accentTint(0.07)
      : state === 'evicted'
        ? fig.paper
        : fig.panel
  const color =
    state === 'new' ? fig.accent : state === 'evicted' ? fig.faint : fig.ink
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={3}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
        strokeDasharray={state === 'evicted' ? '3 3' : undefined}
      />
      <text
        x={x + w / 2}
        y={y + h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size}
        fill={color}
        style={{ fontFamily: monoFamily }}
      >
        {label}
      </text>
    </g>
  )
}

type ArrowProps = {
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  dash?: string
  head?: boolean
}

/** Single-line geometric arrow with an open head. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = fig.lineStrong,
  dash,
  head = true,
}: ArrowProps) {
  const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1)
  const headLen = 4.5
  const hx = horizontal ? x2 - Math.sign(x2 - x1) * headLen : x2
  const hy = horizontal ? y2 : y2 - Math.sign(y2 - y1) * headLen
  const open = horizontal ? -1 : 1
  return (
    <g stroke={color} strokeWidth={1} fill="none" strokeDasharray={dash}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {head && (
        <path
          d={`M ${hx - (horizontal ? 0 : open * 3)} ${hy - (horizontal ? open * 3 : 0)} L ${x2} ${y2} L ${hx - (horizontal ? 0 : -open * 3)} ${hy - (horizontal ? -open * 3 : 0)}`}
        />
      )}
    </g>
  )
}

/** Small-caps serif panel label. */
export function PanelLabel({
  x,
  y,
  children,
  color = fig.ink,
}: {
  x: number
  y: number
  children: ReactNode
  color?: string
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={10}
      fontWeight={600}
      fill={color}
      letterSpacing={1.8}
      fontFamily={labelFamily}
      style={{ textTransform: 'uppercase' }}
    >
      {children}
    </text>
  )
}

/**
 * HTML figure shell: serif title, parchment plate, serif caption.
 * Used by components that receive title/caption props from MDX.
 */
export function EditorialFigure({
  title,
  caption,
  children,
}: {
  title?: string
  caption?: string
  children: ReactNode
}) {
  return (
    <figure className="figure-plate">
      {title && (
        <figcaption className="figure-plate__title">{title}</figcaption>
      )}
      <div className="figure-plate__canvas">{children}</div>
      {caption && <p className="figure-plate__caption">{caption}</p>}
    </figure>
  )
}

/** One entry in a flat figure legend. */
export function LegendSwatch({
  color,
  dash = false,
  label,
}: {
  color: string
  dash?: boolean
  label: string
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontFamily: labelFamily,
        fontSize: 11,
        color: fig.muted,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 20,
          borderTop: `2px solid ${color}`,
          borderTopStyle: dash ? 'dashed' : 'solid',
          borderTopWidth: dash ? 1 : 2,
          marginTop: dash ? 0 : -1,
          height: dash ? 1 : 2,
        }}
      />
      {label}
    </span>
  )
}

/**
 * HTML figure shell for interactive figures: serif title, parchment plate,
 * an optional control row and an optional serif verdict line under the
 * drawing, plus the usual caption.
 */
export function InteractiveFigure({
  title,
  hint,
  controls,
  verdict,
  verdictAccent = false,
  caption,
  children,
}: {
  title?: string
  hint?: string
  controls?: ReactNode
  verdict?: string
  verdictAccent?: boolean
  caption?: string
  children: ReactNode
}) {
  return (
    <figure className="figure-plate">
      {title && (
        <figcaption className="figure-plate__title">{title}</figcaption>
      )}
      <div className="figure-plate__canvas">
        {children}
        {(hint || controls) && (
          <div className="fig-controls">
            {hint && <span className="fig-hint">{hint}</span>}
            {controls}
          </div>
        )}
        {verdict && (
          <p
            className={
              verdictAccent ? 'fig-verdict fig-verdict--accent' : 'fig-verdict'
            }
          >
            {verdict}
          </p>
        )}
      </div>
      {caption && <p className="figure-plate__caption">{caption}</p>}
    </figure>
  )
}

/** Flat editorial toggle chip, used in figure control rows. */
export function FigChip({
  active = false,
  disabled = false,
  onClick,
  children,
  title,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      className="fig-chip"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}
