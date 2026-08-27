import { CheckCircle, Info, Lightbulb, Warning } from '@phosphor-icons/react'
import type { PropsWithChildren } from 'react'

const CALLOUT_PRESENTATION = {
  default: { label: 'Tip', Icon: Lightbulb },
  info: { label: 'Note', Icon: Info },
  success: { label: 'Success', Icon: CheckCircle },
  warning: { label: 'Caution', Icon: Warning },
} as const

type CalloutType = keyof typeof CALLOUT_PRESENTATION

export default function Callout({
  children,
  title,
  type = 'default',
}: PropsWithChildren<{
  title?: string
  type?: CalloutType
}>) {
  const { label, Icon } = CALLOUT_PRESENTATION[type]

  return (
    <aside className={`mdx-callout mdx-callout-${type}`}>
      <header className="mdx-callout-header">
        <span className="mdx-callout-icon" aria-hidden data-pagefind-ignore="">
          <Icon size={17} weight="duotone" />
        </span>
        <span className="mdx-callout-heading">
          <span className="mdx-callout-kind" data-pagefind-ignore="">
            {label}
          </span>
          {title ? <strong>{title}</strong> : null}
        </span>
      </header>
      <div className="mdx-callout-content">{children}</div>
    </aside>
  )
}
