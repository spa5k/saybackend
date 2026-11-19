import type { ReactNode } from 'react'

/** The points for and against one option, side by side. */
export function ProsCons({
  pros,
  cons,
}: {
  pros: Array<string>
  cons: Array<string>
}) {
  const column = (label: string, items: Array<string>, sign: string) => (
    <div className={`pros-cons-${sign === '+' ? 'for' : 'against'}`}>
      <p className="hand">{label}</p>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <span className="pros-cons-sign" aria-hidden="true">
              {sign}
            </span>
            {/* The items come from the post's own data files. */}
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <div className="pros-cons not-typography">
      {column('for', pros, '+')}
      {column('against', cons, '−')}
    </div>
  )
}

function inlineCode(text: string): Array<ReactNode> {
  return text
    .split(/(`[^`]+`)/)
    .map((part, index) =>
      part.startsWith('`') ? (
        <code key={index}>{part.slice(1, -1)}</code>
      ) : (
        part
      ),
    )
}

/** "If you need this, pick that": one hand-drawn arrow per decision. */
export function DecisionList({
  rows,
}: {
  rows: Array<{ need: string; pick: string; why?: string }>
}) {
  return (
    <ul className="decision-list not-typography">
      {rows.map((row) => (
        <li key={row.need}>
          <span className="decision-need">{inlineCode(row.need)}</span>
          <svg viewBox="0 0 54 14" aria-hidden="true">
            <path
              className="ink-stroke"
              d="M2 9C16 3 34 3 50 8"
              markerEnd="url(#pp-ink-arrow)"
            />
          </svg>
          <span className="decision-pick">
            <strong>{inlineCode(row.pick)}</strong>
            {row.why ? <small>{inlineCode(row.why)}</small> : null}
          </span>
        </li>
      ))}
    </ul>
  )
}
