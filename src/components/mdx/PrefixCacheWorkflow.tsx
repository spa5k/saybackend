type Props = {
  title?: string
  caption?: string
}

const stepBox = 'rounded-lg border border-[var(--border)] bg-[var(--card)] p-3'
const stepTitle =
  'mb-2 font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]'
const mono = 'font-mono text-xs'

export default function PrefixCacheWorkflow({ title, caption }: Props) {
  return (
    <figure className="my-8">
      {title && (
        <figcaption className="mb-4 text-[var(--foreground)]">
          <strong className="font-serif text-lg">{title}</strong>
        </figcaption>
      )}
      <div className="space-y-4">
        <div className={stepBox}>
          <div className={stepTitle}>New request</div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`${mono} rounded border border-[var(--green)] bg-[var(--green-soft)] px-2 py-1 text-[var(--green)]`}
            >
              prompt tokens
            </span>
            <span className="text-[var(--muted)]">→</span>
            <span
              className={`${mono} rounded border border-[var(--border)] px-2 py-1 text-[var(--foreground)]`}
            >
              hash each block
            </span>
          </div>
        </div>

        <div className={stepBox}>
          <div className={stepTitle}>get_computed_blocks()</div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`${mono} rounded border border-[var(--green)] bg-[var(--green-soft)] px-2 py-1 text-[var(--green)]`}
            >
              lookup cache map
            </span>
            <span className="text-[var(--muted)]">→</span>
            <span
              className={`${mono} rounded border px-2 py-1 text-[var(--green)]`}
              style={{ borderColor: 'var(--green)' }}
            >
              blk 0 · blk 1 · blk 2
            </span>
            <span className="text-[var(--muted)]">
              returns computed sequence
            </span>
          </div>
        </div>

        <div className={stepBox}>
          <div className={stepTitle}>allocate_slots()</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className={`${mono} text-[var(--muted)]`}>
                Touch computed blocks
              </div>
              <div className="mt-1 space-y-1">
                {[
                  'increment ref count',
                  'remove from free queue if unused',
                ].map((s) => (
                  <div key={s} className={`${mono} flex items-center gap-2`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                    <span className="text-[var(--foreground)]">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className={`${mono} text-[var(--muted)]`}>
                Allocate new blocks
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                <span
                  className={`${mono} rounded border border-[var(--brick)] px-2 py-1 text-[var(--brick)]`}
                >
                  blk 3
                </span>
                <span
                  className={`${mono} text-[var(--muted)]`}
                >{`if pool has capacity`}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={stepBox}>
          <div className={stepTitle}>Result</div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`${mono} rounded border border-[var(--green)] bg-[var(--green-soft)] px-2 py-1 text-[var(--green)]`}
            >
              reuse computed prefix
            </span>
            <span
              className={`${mono} rounded border border-[var(--brick)] px-2 py-1 text-[var(--brick)]`}
            >
              decode new tail
            </span>
          </div>
        </div>
      </div>
      {caption && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{caption}</p>
      )}
    </figure>
  )
}
