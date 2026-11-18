import { FigureFrame } from './FigureFrame'
import type { FigureText } from './FigureFrame'

type Job = {
  label: string
  /** Real duration in seconds. */
  seconds: number
}

type Props = FigureText & {
  jobs: Array<Job>
}

const SECONDS_PER_MINUTE = 60

export default function MinuteRoundingDiagram({ jobs, ...figure }: Props) {
  const billed = (seconds: number) => Math.ceil(seconds / SECONDS_PER_MINUTE)
  const maxMinutes = Math.max(...jobs.map((job) => billed(job.seconds)), 1)

  return (
    <FigureFrame {...figure}>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold">
        <span className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm bg-[var(--green)]"
            aria-hidden="true"
          />
          Real duration
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm border border-dashed border-[var(--brick)]"
            aria-hidden="true"
          />
          Billed minutes
        </span>
      </div>
      <div className="grid gap-4">
        {jobs.map((job) => {
          const minutes = billed(job.seconds)

          return (
            <div key={job.label}>
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <span className="font-mono text-sm font-semibold break-words">
                  {job.label}
                </span>
                <strong className="font-mono text-sm">
                  {job.seconds} s real, {minutes}{' '}
                  {minutes === 1 ? 'minute' : 'minutes'} billed
                </strong>
              </div>
              <div
                className="relative h-5"
                style={{ width: `${(minutes / maxMinutes) * 100}%` }}
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${minutes}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: minutes }, (_, index) => (
                    <span
                      key={index}
                      className="block rounded-sm border border-dashed border-[var(--brick)]"
                    />
                  ))}
                </div>
                <span
                  className="absolute top-1 bottom-1 left-0.5 block rounded-sm bg-[var(--green)]"
                  style={{
                    width: `${(job.seconds / (minutes * SECONDS_PER_MINUTE)) * 100}%`,
                    minWidth: 3,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </FigureFrame>
  )
}
