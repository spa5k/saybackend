import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Shared drawing language for editorial figures in blog posts.
 *
 * Lieflat porcelain skin: warm paper #F7F2EB, a single-hue ink-blue ramp.
 * 明度即数据 — the darkest blue is the hero, lighter blues recede. Hairline
 * geometric strokes, Inter labels, JetBrains Mono IDs. No gradients, no
 * shadows, no 3D. The card shell (title / sub / src) lives in styles.css.
 */

export const fig = {
  /** Warm paper ground. */
  paper: '#F7F2EB',
  /** Inset panel fill (neutral cream). */
  panel: '#F1ECE1',
  /** Deeper inset fill. */
  panelDeep: '#E7E0D0',
  /** Primary figure text — warm near-black. */
  ink: '#1F1B16',
  /** Secondary text — warm gray. */
  muted: '#6E655A',
  /** Tertiary text — warm light gray. */
  faint: '#9C9386',
  /** Hairline strokes. */
  line: '#D8D1C2',
  /** Stronger hairlines. */
  lineStrong: '#C0B7A4',
  /** Cache family: deep ink blue — cached reads, the hero. */
  accent: '#081F5C',
  /** Compute family: deep amber — chips, rules, small strokes. */
  data: '#B45309',
  /** Compute family: bright amber — lines, dots, write badges. */
  data2: '#D97706',
  /** Soft amber — savings hairlines, fifth-rung dots. */
  faintdata: '#EFBE7D',
  /** Grid lines. */
  grid: '#E4DED2',
  /** Rebuild family: brick — compaction, checkpoints. */
  brick: '#9D3A32',
}

/** Tints of the cache blue (same hue, different value). */
export const accentTint = (alpha: number) => `rgba(8, 31, 92, ${alpha})`

/** Tints of the compute amber. */
export const amberTint = (alpha: number) => `rgba(217, 119, 6, ${alpha})`

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
  transform?: string
  /** Paint a paper halo under the glyph so labels stay readable over lines. */
  halo?: boolean
  className?: string
  style?: CSSProperties
}

/** Lexend-by-default SVG label. */
export function T({
  x,
  y,
  children,
  size = 11,
  color = fig.ink,
  weight = 400,
  anchor = 'start',
  mono: isMono = false,
  ls = 0,
  opacity = 1,
  transform,
  halo = false,
  className,
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
      transform={transform}
      fontFamily={isMono ? monoFamily : labelFamily}
      className={className}
      style={{
        fontFamily: isMono ? monoFamily : labelFamily,
        ...(halo
          ? { paintOrder: 'stroke', stroke: fig.paper, strokeWidth: 3 }
          : {}),
        ...style,
      }}
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
  className?: string
  style?: CSSProperties
}

/**
 * Small flat token chip: hairline box, mono label. Custom semantic map:
 * computed = cache-resident (blue), new = freshly computed (amber),
 * evicted = expired (warm gray, hollow + dashed).
 */
export function Chip({
  x,
  y,
  w,
  label,
  h = 22,
  state = 'computed',
  size = 10.5,
  className,
  style,
}: ChipProps) {
  const stroke =
    state === 'new'
      ? fig.data
      : state === 'evicted'
        ? fig.lineStrong
        : fig.accent
  const fill =
    state === 'new'
      ? amberTint(0.16)
      : state === 'evicted'
        ? fig.paper
        : accentTint(0.08)
  const color =
    state === 'new' ? fig.data : state === 'evicted' ? fig.faint : fig.accent
  return (
    <g className={className} style={style}>
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
  className?: string
  style?: CSSProperties
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
  className,
  style,
}: ArrowProps) {
  const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1)
  const headLen = 4.5
  const hx = horizontal ? x2 - Math.sign(x2 - x1) * headLen : x2
  const hy = horizontal ? y2 : y2 - Math.sign(y2 - y1) * headLen
  const open = horizontal ? -1 : 1
  return (
    <g
      stroke={color}
      strokeWidth={1}
      fill="none"
      strokeDasharray={dash}
      className={className}
      style={style}
    >
      <line x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} />
      {head && (
        <path
          d={`M ${hx - (horizontal ? 0 : open * 3)} ${hy - (horizontal ? open * 3 : 0)} L ${x2} ${y2} L ${hx - (horizontal ? 0 : -open * 3)} ${hy - (horizontal ? -open * 3 : 0)}`}
        />
      )}
    </g>
  )
}

/** Small-caps Lexend panel label. */
export function PanelLabel({
  x,
  y,
  children,
  color = fig.accent,
  className,
  style,
}: {
  x: number
  y: number
  children: ReactNode
  color?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={11.5}
      fontWeight={600}
      fill={color}
      letterSpacing={1.6}
      fontFamily={labelFamily}
      className={className}
      style={{ textTransform: 'uppercase', ...style }}
    >
      {children}
    </text>
  )
}

/**
 * Lieflat reveal: figures animate in when scrolled into view (threshold
 * 0.3), click the plate to replay. Reduced-motion is handled in CSS.
 * SSR-safe: children always render; only the lf-* animation classes are
 * gated behind data-on.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setOn(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="lf-reveal"
      data-on={on}
      onClick={() => {
        setOn(false)
        requestAnimationFrame(() => setOn(true))
      }}
    >
      {children}
    </div>
  )
}

/**
 * HTML figure shell: Inter title, porcelain plate, Inter caption.
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
        fontSize: 12,
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
 * HTML figure shell for interactive figures: Inter title, porcelain plate,
 * an optional control row and an optional verdict line under the drawing,
 * plus the usual caption.
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
