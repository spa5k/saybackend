import { Motif, PAPER_OF } from './Motifs'
import type { MotifSpec } from './Motifs'
import type { ReactNode } from 'react'

type Props = {
  motif: MotifSpec
  eyebrow?: ReactNode
  title: ReactNode
  /** A line under the title: the byline of a post, or a short description. */
  meta?: ReactNode
  /** Use the h1 for the title. Turn off when the page has its own h1. */
  heading?: boolean
}

/**
 * The full-width band at the top of a page: graph paper, one large drawing
 * for the subject, and the title low on the left. The site header sits on
 * top of it.
 */
export function PageHero({
  motif,
  eyebrow,
  title,
  meta,
  heading = true,
}: Props) {
  const Title = heading ? 'h1' : 'p'
  const { paper = PAPER_OF[motif.name], ...drawing } = motif
  return (
    <header className="page-hero" data-paper={paper}>
      <svg
        className="page-hero-art"
        viewBox="0 0 1240 400"
        preserveAspectRatio="xMaxYMin slice"
        aria-hidden="true"
      >
        <rect width="1240" height="400" fill={`url(#pp-${paper})`} />
        {paper === 'ruled' ? (
          <path className="paper-margin" d="M150 0V400" />
        ) : null}
        {/* Moved down, so the drawing clears the site header. */}
        <g transform="translate(0 64)">
          <Motif {...drawing} />
        </g>
      </svg>
      <div className="page-hero-text">
        {eyebrow ? <p className="page-hero-eyebrow">{eyebrow}</p> : null}
        <Title className="page-hero-title">{title}</Title>
        {meta ? <div className="page-hero-meta">{meta}</div> : null}
      </div>
    </header>
  )
}
