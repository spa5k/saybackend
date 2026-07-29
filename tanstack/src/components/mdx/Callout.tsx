import type { PropsWithChildren } from 'react'

export default function Callout({
  children,
  title,
  type = 'default',
}: PropsWithChildren<{
  title?: string
  type?: 'info' | 'warning' | 'default'
}>) {
  return (
    <aside className={`mdx-callout mdx-callout-${type}`}>
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
    </aside>
  )
}
