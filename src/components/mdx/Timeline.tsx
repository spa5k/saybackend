import { FigureFrame, toneColor } from './FigureFrame'
import type { FigureText, Tone } from './FigureFrame'

type Item = {
  date: string
  title: string
  text: string
  tone?: Tone
}

type Props = FigureText & {
  items: Array<Item>
}

export default function Timeline({ items, ...figure }: Props) {
  return (
    <FigureFrame {...figure}>
      <ol className="m-0 list-none p-0">
        {items.map((item, index) => {
          const color = toneColor(item.tone ?? 'green')
          const last = index === items.length - 1

          return (
            <li
              key={`${item.date}-${item.title}`}
              className="grid grid-cols-[14px_1fr] gap-x-3"
            >
              <div className="flex flex-col items-center" aria-hidden="true">
                <span
                  className="mt-1.5 block h-2.5 w-2.5 flex-none rounded-full"
                  style={{ background: color }}
                />
                {last ? null : (
                  <span className="mt-1 block w-px flex-1 bg-[var(--border)]" />
                )}
              </div>
              <div className={last ? '' : 'pb-5'}>
                <div className="font-mono text-[11px] font-medium tracking-wide text-[var(--muted)] uppercase">
                  {item.date}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">
                  {item.title}
                </div>
                <p className="mt-1 mb-0 text-sm text-[var(--muted-foreground)]">
                  {item.text}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </FigureFrame>
  )
}
