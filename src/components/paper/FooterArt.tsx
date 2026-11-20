import { useEffect, useRef } from 'react'

import { MARKS } from './Figure'
import { SceneArt } from './SceneArt'
import type { Scene } from './scenes'

/**
 * The line drawing at the foot of each page. A page gets one of three
 * drawings from its path, so the same page always shows the same one. The
 * drawing holds no text: the links sit above it and the small print below.
 */
export type FooterKind = 'flow' | 'ridges' | 'contours'

const KINDS: Array<FooterKind> = ['flow', 'ridges', 'contours']
const WIDTH = 1000
const TINTS = [MARKS.lilac, MARKS.blue, MARKS.amber, MARKS.sage, MARKS.rose]

export function footerKindOf(pathname: string): FooterKind {
  const key = pathname.replace(/\/+$/, '') || '/'
  let hash = 0
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return KINDS[hash % KINDS.length]
}

const round = (value: number) => Math.round(value * 10) / 10

/* Flow: nine lines cross the page and join into one, which ends at the
   signature. Only a dash offset animates, so it costs nothing to run. */
const FLOW_LINES = 9
const FLOW_END = 760

function flowPath(index: number) {
  const y = 12 + index * 19.5
  const m = index - (FLOW_LINES - 1) / 2
  return `M-10 ${y}C${200 + index * 10} ${y + m * 6} ${340 - index * 8} ${
    90 + m * 10
  } 520 ${90 + m * 5}S700 ${round(90 + m * 1.2)} ${FLOW_END} 90`
}

function Flow() {
  return (
    <svg viewBox={`0 0 ${WIDTH} 180`} preserveAspectRatio="none">
      {Array.from({ length: FLOW_LINES }, (_, index) => {
        const d = flowPath(index)
        const fromMiddle = Math.abs(index - (FLOW_LINES - 1) / 2)
        return (
          <g key={index}>
            <path
              className="footer-line"
              style={{ strokeOpacity: 0.62 - fromMiddle * 0.09 }}
              d={d}
            />
            <path
              className="footer-dot"
              style={{
                stroke: TINTS[index % TINTS.length],
                animationDelay: `${-index * 0.83}s`,
                animationDuration: `${5 + (index % 3)}s`,
              }}
              d={d}
            />
          </g>
        )
      })}
    </svg>
  )
}

/* Ridges: stacked lines with two slow bumps that move through them. Each
   line is filled with paper, so a near line hides the far lines behind it. */
const RIDGE_LINES = 11
const RIDGE_MARK = 6

function ridgePath(index: number, time: number) {
  const base = 36 + index * 14
  let d = ''
  for (let x = -12; x <= WIDTH + 12; x += 8) {
    const u = x / WIDTH
    const first =
      Math.exp(
        -(
          ((u - (0.3 + 0.12 * Math.sin(time * 0.4 + index * 0.5))) / 0.09) **
          2
        ),
      ) *
      (18 + index * 1.5)
    const second =
      Math.exp(
        -(
          ((u - (0.68 + 0.1 * Math.cos(time * 0.3 + index * 0.4))) / 0.07) **
          2
        ),
      ) *
      (10 + (RIDGE_LINES - index) * 1.6)
    const y = base - first - second + Math.sin(x * 0.04 + time * 1.5 + index)
    d += `${x < -8 ? 'M' : 'L'}${x} ${round(y)}`
  }
  return `${d}L${WIDTH + 12} 230L-12 230Z`
}

/* Contours: map lines round two hills that drift. */
const CONTOUR_LINES = 8

function contourPath(index: number, time: number) {
  const ring = index % CONTOUR_LINES
  const second = index >= CONTOUR_LINES
  const cx = second
    ? 700 + Math.sin(time * 0.2) * 18
    : 300 + Math.cos(time * 0.25) * 16
  const cy = second ? 112 : 98
  const radius = 14 + ring * (second ? 15 : 19)
  let d = ''
  for (let step = 0; step <= 64; step += 1) {
    const angle = (step / 64) * Math.PI * 2
    const r =
      radius *
      (1 +
        0.13 *
          Math.sin(angle * 3 + time * 0.5 + ring * 0.5 + (second ? 2 : 0)) +
        0.08 * Math.cos(angle * 2 - time * 0.35 + ring * 0.3))
    d += `${step ? 'L' : 'M'}${round(cx + Math.cos(angle) * r * 2.3)} ${round(
      cy + Math.sin(angle) * r * 0.62,
    )}`
  }
  return `${d}Z`
}

/** Lines that change shape. They move only while the footer is on screen. */
function Waves({
  height,
  count,
  pathOf,
  classOf,
}: {
  height: number
  count: number
  pathOf: (index: number, time: number) => string
  classOf: (index: number) => string
}) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const paths = [...svg.querySelectorAll('path')]
    let frame = 0
    let last = 0
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (now - last < 33) return
      last = now
      paths.forEach((path, index) =>
        path.setAttribute('d', pathOf(index, now / 1000)),
      )
    }
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame)
      if (entry.isIntersecting) frame = requestAnimationFrame(tick)
    })
    observer.observe(svg)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [pathOf])

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${WIDTH} ${height}`}
      preserveAspectRatio="none"
    >
      {Array.from({ length: count }, (_, index) => (
        <path key={index} className={classOf(index)} d={pathOf(index, 0)} />
      ))}
    </svg>
  )
}

const ridgeClass = (index: number) =>
  index === RIDGE_MARK
    ? 'footer-line footer-ridge mark'
    : `footer-line footer-ridge${index < 4 ? ' far' : ''}`

const contourClass = (index: number) =>
  index === 3
    ? 'footer-line mark amber'
    : index === CONTOUR_LINES + 5
      ? 'footer-line mark teal'
      : 'footer-line far'

export function FooterArt({
  kind,
  scene,
}: {
  kind: FooterKind
  /** The drawing of the post on this page. It replaces the site drawing. */
  scene?: Scene
}) {
  if (scene) {
    return (
      <div className="footer-art">
        <SceneArt scene={scene} />
      </div>
    )
  }
  return (
    <div className={`footer-art ${kind}`} aria-hidden="true">
      {kind === 'flow' ? (
        <>
          <Flow />
          <span className="hand footer-sign">Kamran</span>
        </>
      ) : kind === 'ridges' ? (
        <Waves
          height={200}
          count={RIDGE_LINES}
          pathOf={ridgePath}
          classOf={ridgeClass}
        />
      ) : (
        <Waves
          height={200}
          count={CONTOUR_LINES * 2}
          pathOf={contourPath}
          classOf={contourClass}
        />
      )}
    </div>
  )
}
