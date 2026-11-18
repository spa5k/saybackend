import { FigureFrame, toneColor } from './FigureFrame'
import type { FigureText, Tone } from './FigureFrame'

type Segment = {
  label: string
  value: number
  tone: Tone
  /** Draw the segment as an outline, for the part that is not the subject. */
  hollow?: boolean
}

type Props = FigureText & {
  segments: Array<Segment>
  /** The unit of the total, for example "runs". */
  unit: string
}

export default function ProportionBar({ segments, unit, ...figure }: Props) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <FigureFrame {...figure}>
      <div
        className="flex h-8 w-full overflow-hidden rounded-md border border-[var(--border)]"
        aria-hidden="true"
      >
        {segments.map((segment) => (
          <span
            key={segment.label}
            className="block h-full"
            style={{
              width: `${(segment.value / total) * 100}%`,
              background: segment.hollow
                ? `repeating-linear-gradient(135deg, ${toneColor(segment.tone)} 0 2px, transparent 2px 8px)`
                : toneColor(segment.tone),
            }}
          />
        ))}
      </div>
      <ul className="m-0 mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-baseline gap-2 text-sm">
            <span
              className="mt-1 block h-2.5 w-2.5 flex-none rounded-sm"
              style={{ background: toneColor(segment.tone) }}
              aria-hidden="true"
            />
            <span>
              <strong className="font-mono">
                {segment.value} of {total} {unit}
              </strong>
              <span className="text-[var(--muted-foreground)]">
                {' '}
                {segment.label}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </FigureFrame>
  )
}
