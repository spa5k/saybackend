import { useEffect, useRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'

export type FigureText = {
  /** Short heading shown above the figure. */
  title: string
  /** Visible caption. A note on how to read the figure, or its date. */
  caption?: string
  /** Text alternative for readers who cannot see the figure. */
  alt: string
}

export const figurePanel =
  'rounded-lg border border-[var(--border)] bg-[var(--card)] p-3'
export const figurePanelTitle =
  'mb-2 font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]'
export const figureNote = 'mt-3 text-xs text-[var(--muted-foreground)]'

export type Tone = 'green' | 'brick' | 'muted' | 'ink'

export function toneColor(tone: Tone) {
  switch (tone) {
    case 'green':
      return 'var(--green)'
    case 'brick':
      return 'var(--brick)'
    case 'muted':
      return 'var(--muted)'
    case 'ink':
      return 'var(--ink)'
  }
}

/**
 * Reports if the chart box is narrower than `minWideWidth`. A narrow chart
 * puts its labels above the bars. The server render and the first client
 * render use the wide layout.
 */
export function useNarrowChart(minWideWidth = 600) {
  const ref = useRef<HTMLDivElement>(null)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const box = ref.current
    if (!box) return
    const observer = new ResizeObserver(([entry]) => {
      setNarrow(entry.contentRect.width < minWideWidth)
    })
    observer.observe(box)
    return () => observer.disconnect()
  }, [minWideWidth])

  return [ref, narrow] as const
}

/**
 * Wraps a library chart. The chart measures its text with the inherited font,
 * so the font here must be the one that the chart styles apply to its labels.
 */
export function ChartBox({
  children,
  ref,
}: {
  children: ReactNode
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={ref}
      className="ts-chart-box min-w-0 font-mono text-xs text-[var(--ink)]"
    >
      {children}
    </div>
  )
}

export function FigureFrame({
  title,
  caption,
  alt,
  children,
}: FigureText & { children: ReactNode }) {
  return (
    <figure
      className="border-border bg-card my-8 rounded-xl border p-5 shadow-sm sm:p-6"
      role="group"
      aria-label={title}
    >
      {/* `not-typography` keeps the article list and paragraph styles out. */}
      <div className="not-typography">
        <div className="mb-5">
          <strong className="text-foreground block text-lg">{title}</strong>
        </div>
        <p className="sr-only">{alt}</p>
        {children}
        {caption && (
          <figcaption className="mt-5 text-sm text-[var(--muted-foreground)]">
            {caption}
          </figcaption>
        )}
      </div>
    </figure>
  )
}
