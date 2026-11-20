import type { ReactNode } from 'react'

/**
 * A dark band across the full width of a post: one large number, the
 * sentence that explains it, and an optional handwritten note.
 */
export function NumberBand({
  value,
  children,
  note,
}: {
  value: string
  children: ReactNode
  note?: string
}) {
  return (
    <aside className="number-band not-typography">
      <span className="number-band-value">{value}</span>
      <div className="number-band-text">
        {children}
        {note ? <span className="hand">{note}</span> : null}
      </div>
    </aside>
  )
}
