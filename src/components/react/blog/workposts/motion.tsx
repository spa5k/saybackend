import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

import './motion.css'

/*
 * Shared motion for the work posts. Two players:
 *   useSteps  plays once when the figure scrolls into view; pair it with
 *             StepControls when the reader should step through it.
 *   useLoop   plays on a loop while the figure is on screen, with no buttons.
 * Both render the last step on the server and under reduced motion, so a
 * reader without animation sees the result.
 */

export const TINY = { fontSize: 10 } as const
export const SMALL = { fontSize: 11 } as const
export const LABEL = { fontSize: 12 } as const
export const MONO = { fontSize: 11.5, fontFamily: 'var(--font-mono)' } as const

export function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function useSteps(count: number, ms: number) {
  const ref = useRef<SVGSVGElement>(null)
  const [step, setStep] = useState(count - 1)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || reducedMotion()) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setStep(0)
        setPlaying(true)
      },
      { threshold: 0.5 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => {
      if (step >= count - 1) setPlaying(false)
      else setStep(step + 1)
    }, ms)
    return () => window.clearTimeout(timer)
  }, [playing, step, count, ms])

  return {
    ref,
    step,
    go: (next: number) => {
      setPlaying(false)
      setStep(next)
    },
    replay: () => {
      setStep(0)
      setPlaying(!reducedMotion())
    },
  }
}

/** Loops through `count` steps while the figure is visible. No controls. */
export function useLoop(count: number, ms: number, holdLast = 2) {
  const ref = useRef<SVGSVGElement>(null)
  const [step, setStep] = useState(count - 1)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || reducedMotion()) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.4 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const wait = step >= count - 1 ? ms * holdLast : ms
    const timer = window.setTimeout(
      () => setStep(step >= count - 1 ? 0 : step + 1),
      wait,
    )
    return () => window.clearTimeout(timer)
  }, [visible, step, count, ms, holdLast])

  return { ref, step }
}

export function StepControls({
  labels,
  step,
  go,
  replay,
}: {
  labels: Array<string>
  step: number
  go: (next: number) => void
  replay: () => void
}) {
  return (
    <span className="paper-widget wp-controls">
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          className={index === step ? 'is-active' : undefined}
          aria-pressed={index === step}
          onClick={() => go(index)}
        >
          {index + 1}. {label}
        </button>
      ))}
      <button type="button" onClick={replay}>
        Replay
      </button>
    </span>
  )
}

/** A flat marker box. */
export function Box({
  x,
  y,
  w,
  h,
  mark,
  opacity = 1,
}: {
  x: number
  y: number
  w: number
  h: number
  mark: MarkName
  opacity?: number
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      opacity={opacity}
      filter="url(#pp-marker)"
      style={{ fill: MARKS[mark] }}
    />
  )
}

/** A marker box with a title and an optional second line, and a ring when active. */
export function Node({
  x,
  y,
  w,
  h = 44,
  mark,
  title,
  value,
  ring = false,
}: {
  x: number
  y: number
  w: number
  h?: number
  mark: MarkName
  title: string
  value?: ReactNode
  ring?: boolean
}) {
  return (
    <g>
      <Box x={x} y={y} w={w} h={h} mark={mark} />
      <rect
        className={ring ? 'wp-ring is-on' : 'wp-ring'}
        x={x - 4}
        y={y - 4}
        width={w + 8}
        height={h + 8}
        rx="6"
      />
      <text
        className="fig-strong"
        x={x + w / 2}
        y={value === undefined ? y + h / 2 + 4 : y + h / 2 - 3}
        textAnchor="middle"
        style={LABEL}
      >
        {title}
      </text>
      {value === undefined ? null : (
        <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" style={SMALL}>
          {value}
        </text>
      )}
    </g>
  )
}

/** A path that shows motion along it when live. */
export function Edge({
  d,
  live = false,
  arrow = false,
}: {
  d: string
  live?: boolean
  arrow?: boolean
}) {
  return (
    <path
      className={live ? 'wp-edge is-live' : 'wp-edge'}
      d={d}
      markerEnd={arrow ? 'url(#pp-ink-arrow)' : undefined}
    />
  )
}

/** One line of status text under a drawing. */
export function Status({ y, children }: { y: number; children: ReactNode }) {
  return (
    <text className="fig-strong" x="320" y={y} textAnchor="middle" style={LABEL}>
      {children}
    </text>
  )
}
