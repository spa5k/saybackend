type CacheBlock = {
  label: string
  status: 'computed' | 'new' | 'evicted'
}

type Props = {
  title?: string
  caption?: string
}

const blockColor = (status: CacheBlock['status']) => {
  switch (status) {
    case 'computed':
      return 'var(--green)'
    case 'new':
      return 'var(--brick)'
    case 'evicted':
      return 'var(--muted)'
  }
}

const panel = 'rounded-lg border border-[var(--border)] bg-[var(--card)] p-3'
const panelTitle =
  'mb-2 font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]'

export default function PrefixCacheStructure({ title, caption }: Props) {
  const computed: CacheBlock[] = [
    { label: 'blk 0', status: 'computed' },
    { label: 'blk 1', status: 'computed' },
    { label: 'blk 2', status: 'computed' },
    { label: 'blk 3', status: 'new' },
  ]

  const pending: CacheBlock[] = [
    { label: 'blk 1', status: 'evicted' },
    { label: 'blk 2', status: 'evicted' },
    { label: 'blk 4', status: 'new' },
  ]

  return (
    <figure className="my-8">
      {title && (
        <figcaption className="mb-4 text-[var(--foreground)]">
          <strong className="font-sans text-lg">{title}</strong>
        </figcaption>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={panel}>
          <div className={panelTitle}>Block pool</div>
          <div className="flex flex-wrap gap-2">
            {computed.map((b) => (
              <div
                key={b.label}
                className="rounded border px-2 py-1 font-mono text-xs"
                style={{
                  borderColor: blockColor(b.status),
                  color: blockColor(b.status),
                  background:
                    b.status === 'computed'
                      ? 'var(--green-soft)'
                      : 'var(--card)',
                }}
              >
                {b.label}
              </div>
            ))}
          </div>
        </div>
        <div className={panel}>
          <div className={panelTitle}>Free block queue</div>
          <div className="flex flex-wrap gap-2">
            {pending.map((b) => (
              <div
                key={b.label}
                className="rounded border px-2 py-1 font-mono text-xs opacity-70"
                style={{
                  borderColor: blockColor(b.status),
                  color: blockColor(b.status),
                }}
              >
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={panel}>
          <div className={panelTitle}>Cache blocks · hash → block ID</div>
          <div className="space-y-1.5 font-mono text-xs">
            {[
              ['h(blk0)', '→ blk 0'],
              ['h(blk0+1)', '→ blk 1'],
              ['h(blk0+1+2)', '→ blk 2'],
              ['h(blk0+1+2+3)', '→ blk 3'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <span className="text-[var(--muted)]">{k}</span>
                <span className="text-[var(--green)]">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={panel}>
          <div className={panelTitle}>Request blocks · request → allocated</div>
          <div className="space-y-1.5 font-mono text-xs">
            {[
              ['req A', 'blk 0 · blk 1 · blk 2'],
              ['req B', 'blk 0 · blk 1 · blk 2 · blk 3'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <span className="text-[var(--muted)]">{k}</span>
                <span className="text-[var(--foreground)]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {caption && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{caption}</p>
      )}
    </figure>
  )
}
