import type { ReactNode } from 'react'

export type FigureText = {
  /** Short heading shown above the figure. */
  title: string
  /** Visible caption. State the source and the date of the numbers. */
  caption: string
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
        <figcaption className="mt-5 text-sm text-[var(--muted-foreground)]">
          {caption}
        </figcaption>
      </div>
    </figure>
  )
}
