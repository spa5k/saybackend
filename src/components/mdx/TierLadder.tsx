import { FigureFrame } from './FigureFrame'
import type { FigureText } from './FigureFrame'

type Tier = {
  name: string
  needs: string
  proves: string
}

type Props = FigureText & {
  /** Lowest tier first. */
  tiers: Array<Tier>
  needsLabel: string
  provesLabel: string
}

export default function TierLadder({
  tiers,
  needsLabel,
  provesLabel,
  ...figure
}: Props) {
  return (
    <FigureFrame {...figure}>
      <ol className="m-0 grid list-none gap-2 p-0">
        {tiers.map((tier, index) => (
          <li
            key={tier.name}
            className="rounded border border-[var(--border)] bg-[var(--card)] px-3 py-2"
            style={{
              borderLeftWidth: 4 + index * 4,
              borderLeftColor: 'var(--green)',
            }}
          >
            <div className="font-mono text-sm font-semibold text-[var(--foreground)]">
              {index + 1}. {tier.name}
            </div>
            <dl className="m-0 mt-1 grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-mono text-[10px] tracking-wide text-[var(--muted)] uppercase">
                  {needsLabel}
                </dt>
                <dd className="m-0 text-[var(--muted-foreground)]">
                  {tier.needs}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] tracking-wide text-[var(--muted)] uppercase">
                  {provesLabel}
                </dt>
                <dd className="m-0 text-[var(--muted-foreground)]">
                  {tier.proves}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </FigureFrame>
  )
}
