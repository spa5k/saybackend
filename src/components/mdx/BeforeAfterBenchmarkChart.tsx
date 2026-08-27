type Benchmark = {
  label: string
  before: number
  after: number
}

type Props = {
  title: string
  unit: string
  data: Array<Benchmark>
}

export default function BeforeAfterBenchmarkChart({
  title,
  unit,
  data,
}: Props) {
  const max = Math.max(...data.flatMap(({ before, after }) => [before, after]))

  return (
    <figure className="border-border bg-card my-8 rounded-xl border p-5 shadow-sm sm:p-6">
      <figcaption className="mb-5">
        <strong className="text-foreground block text-lg">{title}</strong>
      </figcaption>
      <div className="mb-5 flex gap-5 text-xs font-semibold">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--brick)]" />
          Before
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--green)]" />
          After
        </span>
      </div>
      <div className="grid gap-5">
        {data.map((benchmark) => (
          <div key={benchmark.label}>
            <div className="mb-2 font-mono text-sm font-semibold">
              {benchmark.label}
            </div>
            {(
              [
                ['Before', benchmark.before, 'bg-[var(--brick)]'],
                ['After', benchmark.after, 'bg-[var(--green)]'],
              ] as const
            ).map(([label, value, color]) => (
              <div
                key={label}
                className="grid grid-cols-[3.2rem_1fr_auto] items-center gap-2 text-xs"
              >
                <span className="text-muted-foreground">{label}</span>
                <span
                  className="bg-muted h-3 overflow-hidden rounded-full"
                  aria-hidden="true"
                >
                  <span
                    className={`block h-full rounded-full ${color}`}
                    style={{ width: `${(value / max) * 100}%` }}
                  />
                </span>
                <strong className="min-w-24 text-right font-mono">
                  {value.toLocaleString()} {unit}
                </strong>
              </div>
            ))}
          </div>
        ))}
      </div>
    </figure>
  )
}
