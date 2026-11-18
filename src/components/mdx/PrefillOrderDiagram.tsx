type Props = {
  title?: string
  caption?: string
}

const panel = 'rounded-lg border border-[var(--border)] bg-[var(--card)] p-3'
const panelTitle =
  'mb-2 font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]'
const panelNote = 'mt-3 text-xs text-[var(--muted-foreground)]'
const cell = 'rounded border px-2 py-1 font-mono text-xs'

const requests = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6']
const removed = 'r4'

export default function PrefillOrderDiagram({ title, caption }: Props) {
  return (
    <figure className="my-8">
      {title && (
        <figcaption className="mb-4 text-[var(--foreground)]">
          <strong className="font-sans text-lg">{title}</strong>
        </figcaption>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={panel}>
          <div className={panelTitle}>Before · VecDeque&lt;RequestId&gt;</div>
          <div className="flex flex-wrap gap-2">
            {requests.map((request) => (
              <div
                key={request}
                className={cell}
                style={{
                  borderColor: 'var(--brick)',
                  color: 'var(--brick)',
                  textDecoration: request === removed ? 'line-through' : 'none',
                }}
              >
                {request}
              </div>
            ))}
          </div>
          <p className={panelNote}>
            To remove r4, <code>retain</code> compares every queued ID with it.
          </p>
        </div>
        <div className={panel}>
          <div className={panelTitle}>
            After · BTreeMap&lt;u64, RequestId&gt;
          </div>
          <div className="mb-2 font-mono text-xs text-[var(--muted)]">
            prefills[r4] → load, order 3
          </div>
          <div className="flex flex-wrap gap-2">
            {requests.map((request, order) => {
              const isRemoved = request === removed
              return (
                <div
                  key={request}
                  className={`${cell} ${isRemoved ? '' : 'opacity-70'}`}
                  style={{
                    borderColor: isRemoved ? 'var(--green)' : 'var(--muted)',
                    color: isRemoved ? 'var(--green)' : 'var(--muted)',
                    borderStyle: isRemoved ? 'solid' : 'dashed',
                    background: isRemoved ? 'var(--green-soft)' : 'var(--card)',
                    textDecoration: isRemoved ? 'line-through' : 'none',
                  }}
                >
                  {order}: {request}
                </div>
              )
            })}
          </div>
          <p className={panelNote}>
            The stored order key finds the entry in O(log N) steps. There is no
            scan.
          </p>
        </div>
      </div>
      {caption && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{caption}</p>
      )}
    </figure>
  )
}
