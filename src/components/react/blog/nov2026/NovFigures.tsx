import type { ReactNode } from 'react'

import { Figure, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

/** A marker box with a label in its middle. */
function Box({
  x,
  y,
  w,
  h = 40,
  mark,
  children,
  strong = false,
}: {
  x: number
  y: number
  w: number
  h?: number
  mark: MarkName
  children?: ReactNode
  strong?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        filter="url(#pp-marker)"
        style={{ fill: MARKS[mark] }}
      />
      {children ? (
        <text
          className={strong ? 'fig-strong' : undefined}
          x={x + w / 2}
          y={y + h / 2 + 4}
          textAnchor="middle"
        >
          {children}
        </text>
      ) : null}
    </g>
  )
}

/** A pen note with its arrow. One per figure. */
function Pen({
  x,
  y,
  text,
  d,
  turn = -4,
}: {
  x: number
  y: number
  text: string
  d: string
  turn?: number
}) {
  return (
    <g>
      <text className="fig-hand" x={x} y={y} transform={`rotate(${turn} ${x} ${y})`}>
        {text}
      </text>
      <path className="ink-stroke" markerEnd="url(#pp-ink-arrow)" d={d} />
    </g>
  )
}

/** REPACK (CONCURRENTLY): which lock is held while each step runs. */
export function RepackTimeline() {
  return (
    <Figure
      bleed
      title="REPACK (CONCURRENTLY): the lock held during each step"
      legend={[
        { label: 'reads and writes continue', mark: 'sand' },
        { label: 'the table is blocked', mark: 'rose' },
      ]}
      caption="Widths are not to scale. The length of each step depends on the table."
    >
      <svg
        viewBox="0 0 640 190"
        role="img"
        aria-label="A timeline in two rows. The lock row shows SHARE UPDATE EXCLUSIVE for most of the run and ACCESS EXCLUSIVE only at the end. The work row shows the copy to a new file, then the replay of decoded changes, then the swap."
      >
        <text className="fig-strong" x="10" y="52">
          lock
        </text>
        <text className="fig-strong" x="10" y="112">
          work
        </text>
        <Box x={70} y={30} w={470} mark="sand">
          SHARE UPDATE EXCLUSIVE
        </Box>
        <Box x={546} y={30} w={84} mark="rose" />
        <text x="588" y="22" textAnchor="middle">
          ACCESS EXCLUSIVE
        </text>
        <Box x={70} y={90} w={300} mark="blue">
          copy the rows to a new file
        </Box>
        <Box x={376} y={90} w={164} mark="lilac">
          replay decoded changes
        </Box>
        <Box x={546} y={90} w={84} mark="rose">
          swap
        </Box>
        <path className="fig-axis" d="M70 146H630" />
        <text x="70" y="164">
          start
        </text>
        <text x="630" y="164" textAnchor="end">
          done
        </text>
        <Pen
          x={392}
          y={176}
          text="only this part blocks"
          d="M548 168C566 162 578 152 584 136"
        />
      </svg>
    </Figure>
  )
}

/** WAIT FOR LSN: a write on the primary, then a read on the standby. */
export function WaitForLsn() {
  return (
    <Figure
      title="Read your own write from a standby"
      caption="The standby holds the second request until it has replayed the LSN of the first."
    >
      <svg
        viewBox="0 0 640 200"
        role="img"
        aria-label="Two lanes, primary and standby. Request 1 writes on the primary and gets an LSN back. Request 2 sends that LSN to the standby, waits until the standby has replayed it, and then reads."
      >
        <text className="fig-strong" x="10" y="58">
          primary
        </text>
        <text className="fig-strong" x="10" y="148">
          standby
        </text>
        <path className="fig-axis" d="M84 54H630" />
        <path className="fig-axis" d="M84 144H630" />
        <Box x={110} y={34} w={120} mark="blue">
          1. write
        </Box>
        <text x="244" y="48">
          returns its LSN
        </text>
        <path
          className="fig-axis"
          strokeDasharray="5 5"
          d="M230 74C300 96 380 104 430 124"
        />
        <text x="318" y="86">
          replication
        </text>
        <Box x={290} y={124} w={140} mark="sand">
          2. WAIT FOR LSN
        </Box>
        <Box x={436} y={124} w={90} mark="blue">
          read
        </Box>
        <Pen
          x={452}
          y={86}
          text="sees the write"
          d="M500 94C504 102 502 110 494 120"
        />
      </svg>
    </Figure>
  )
}

/** The two stages of the Go Dockerfile and the one file that crosses. */
export function TwoStages() {
  return (
    <Figure
      bleed
      title="What each stage holds"
      legend={[
        { label: 'stays in the build stage', mark: 'sand' },
        { label: 'ships', mark: 'lilac' },
      ]}
    >
      <svg
        viewBox="0 0 640 230"
        role="img"
        aria-label="Two boxes. The build stage holds the Go toolchain, the module cache, the build cache, the source and the binary. The final stage holds only the binary, copied from the build stage."
      >
        <rect
          x="10"
          y="34"
          width="330"
          height="186"
          style={{ fill: 'none', stroke: 'var(--rule)' }}
        />
        <rect
          x="470"
          y="34"
          width="160"
          height="186"
          style={{ fill: 'none', stroke: 'var(--rule)' }}
        />
        <text className="fig-strong" x="10" y="24">
          build stage: golang
        </text>
        <text className="fig-strong" x="470" y="24">
          final: distroless/static
        </text>
        <Box x={26} y={50} w={144} mark="sand">
          Go toolchain
        </Box>
        <Box x={180} y={50} w={144} mark="sand">
          source
        </Box>
        <Box x={26} y={100} w={144} mark="sand">
          module cache
        </Box>
        <Box x={180} y={100} w={144} mark="sand">
          build cache
        </Box>
        <Box x={180} y={160} w={144} mark="lilac" strong>
          /out/app
        </Box>
        <Box x={478} y={160} w={144} mark="lilac" strong>
          /app
        </Box>
        <path
          className="ink-stroke"
          markerEnd="url(#pp-ink-arrow)"
          d="M328 180H472"
        />
        <text x="404" y="204" textAnchor="middle">
          COPY --from=build
        </text>
        <text
          className="fig-hand"
          x="486"
          y="92"
          transform="rotate(-4 486 92)"
        >
          only the binary
        </text>
      </svg>
    </Figure>
  )
}

const outputs = [
  'pages and App Router pages',
  'route handlers',
  'prerenders',
  'static files',
  'middleware',
  'routing tables',
]
const targets = ['functions', 'static files', 'a routing config']

/** What onBuildComplete receives and what an adapter writes. */
export function AdapterFlow() {
  return (
    <Figure
      bleed
      title="An adapter turns the build output into what its platform expects"
      caption="The right column is one example. Each adapter writes the files of its own platform."
    >
      <svg
        viewBox="0 0 640 250"
        role="img"
        aria-label="On the left, the outputs of next build: pages, route handlers, prerenders, static files, middleware and routing tables. They go into the onBuildComplete hook of the adapter. On the right, the adapter writes functions, static files and a routing config for its platform."
      >
        <text className="fig-strong" x="10" y="20">
          next build
        </text>
        {outputs.map((output, index) => (
          <Box key={output} x={10} y={32 + index * 36} w={200} h={28} mark="sand">
            {output}
          </Box>
        ))}
        <path className="fig-axis" d="M214 136H262" />
        <Box x={266} y={104} w={150} h={64} mark="sage" strong>
          onBuildComplete
        </Box>
        <text className="fig-strong" x="476" y="74">
          the platform
        </text>
        {targets.map((target, index) => (
          <g key={target}>
            <path
              className="fig-axis"
              d={`M418 136C446 136 446 ${100 + index * 36} 472 ${100 + index * 36}`}
            />
            <Box x={476} y={86 + index * 36} w={154} h={28} mark="sage">
              {target}
            </Box>
          </g>
        ))}
        <Pen
          x={250}
          y={232}
          text="runs after the build"
          d="M322 214C330 206 336 196 338 184"
        />
      </svg>
    </Figure>
  )
}

const fields: Array<{
  name: string
  bits: number
  mark: MarkName
}> = [
  { name: 'unix_ts_ms', bits: 48, mark: 'blue' },
  { name: 'ver', bits: 4, mark: 'rose' },
  { name: 'rand_a', bits: 12, mark: 'amber' },
  { name: 'var', bits: 2, mark: 'rose' },
  { name: 'rand_b', bits: 62, mark: 'sand' },
]

/** The 128 bits of a UUIDv7 and how PostgreSQL fills them. */
export function UuidFields() {
  const scale = 600 / 128
  let start = 20
  return (
    <Figure
      bleed
      title="The 128 bits of a UUIDv7, and how PostgreSQL fills them"
      legend={[
        { label: 'time', mark: 'blue' },
        { label: 'fraction of the millisecond', mark: 'amber' },
        { label: 'random', mark: 'sand' },
        { label: 'fixed', mark: 'rose' },
      ]}
    >
      <svg
        viewBox="0 0 640 170"
        role="img"
        aria-label="One bar of 128 bits. 48 bits hold the Unix time in milliseconds, 4 bits the version, 12 bits the fraction of the millisecond in PostgreSQL, 2 bits the variant, and 62 bits are random."
      >
        {fields.map((field, index) => {
          const x = start
          const w = field.bits * scale
          start += w
          const mid = x + w / 2
          const up = index === 1 || index === 3
          return (
            <g key={field.name}>
              <rect
                x={x + 1}
                y="60"
                width={w - 2}
                height="50"
                filter="url(#pp-marker)"
                style={{ fill: MARKS[field.mark] }}
              />
              <text
                className="fig-strong"
                x={mid}
                y={up ? 34 : 90}
                textAnchor="middle"
              >
                {field.name}
              </text>
              <text x={mid} y={up ? 50 : 130} textAnchor="middle">
                {field.bits}
              </text>
              {up ? <path className="fig-axis" d={`M${mid} 54V60`} /> : null}
            </g>
          )
        })}
        <Pen
          x={196}
          y={162}
          text="the bits that sort"
          d="M186 152C140 152 100 142 76 118"
          turn={-2}
        />
      </svg>
    </Figure>
  )
}

const leaves = [0, 1, 2, 3, 4, 5]

function Tree({
  x,
  hot,
  mark,
  label,
}: {
  x: number
  hot: Array<number>
  mark: MarkName
  label: string
}) {
  return (
    <g>
      <text className="fig-strong" x={x + 135} y="20" textAnchor="middle">
        {label}
      </text>
      <rect
        x={x + 105}
        y="34"
        width="60"
        height="22"
        filter="url(#pp-marker)"
        style={{ fill: MARKS.sand }}
      />
      {leaves.map((leaf) => {
        const lx = x + leaf * 46
        const on = hot.includes(leaf)
        return (
          <g key={leaf}>
            <path className="fig-axis" d={`M${x + 135} 56L${lx + 20} 96`} />
            <rect
              x={lx}
              y="96"
              width="40"
              height="26"
              filter="url(#pp-marker)"
              style={{ fill: on ? MARKS[mark] : MARKS.sand }}
            />
            {on ? (
              <path
                className="ink-stroke"
                markerEnd="url(#pp-ink-arrow)"
                d={`M${lx + 20} 160V128`}
              />
            ) : null}
          </g>
        )
      })}
    </g>
  )
}

/** Where a new key lands in the index: one page, or any page. */
export function IndexInserts() {
  return (
    <Figure
      bleed
      title="Where new keys land in a B-tree index"
      caption="Each arrow is one insert. The drawing shows the mechanism, not a measurement."
    >
      <svg
        viewBox="0 0 640 200"
        role="img"
        aria-label="Two B-trees with six leaf pages each. With UUIDv7 or bigint keys, every insert lands on the rightmost leaf. With UUIDv4 keys, the inserts land on leaves across the whole row."
      >
        <Tree x={20} hot={[5]} mark="blue" label="UUIDv7 or bigint" />
        <Tree x={350} hot={[0, 2, 3, 5]} mark="rose" label="UUIDv4" />
        <Pen
          x={86}
          y={186}
          text="one page takes them all"
          d="M236 170C246 166 254 160 260 150"
          turn={-2}
        />
      </svg>
    </Figure>
  )
}

/** Which setting connects each part to the next. */
export function ProxyPath() {
  return (
    <Figure
      bleed
      title="Which setting connects each part"
      caption="Codex uses the same port, with /v1 at the end of its base URL."
    >
      <svg
        viewBox="0 0 640 190"
        role="img"
        aria-label="Three parts in a row. Claude Code sends requests to the proxy at the address in ANTHROPIC_BASE_URL, with a client key from access.api-keys. CLIProxyAPI listens on port 8317 and sends the request on with the saved provider login."
      >
        <Box x={10} y={56} w={150} h={56} mark="sand" strong>
          Claude Code
        </Box>
        <Box x={245} y={56} w={150} h={56} mark="amber" strong>
          CLIProxyAPI
        </Box>
        <Box x={480} y={56} w={150} h={56} mark="sand" strong>
          the provider
        </Box>
        <path
          className="ink-stroke"
          markerEnd="url(#pp-ink-arrow)"
          d="M164 84H240"
        />
        <path
          className="ink-stroke"
          markerEnd="url(#pp-ink-arrow)"
          d="M399 84H475"
        />
        <text x="320" y="132" textAnchor="middle">
          127.0.0.1:8317
        </text>
        <text x="202" y="36" textAnchor="middle">
          ANTHROPIC_BASE_URL
        </text>
        <text x="202" y="132" textAnchor="middle">
          a key from access.api-keys
        </text>
        <text x="437" y="36" textAnchor="middle">
          the saved login
        </text>
        <Pen
          x={76}
          y={176}
          text="not an Anthropic key"
          d="M214 166C218 158 218 150 214 142"
          turn={-2}
        />
      </svg>
    </Figure>
  )
}

/** A thin connector with a pen arrow head. */
function Arrow({ d, dashed = false }: { d: string; dashed?: boolean }) {
  return (
    <path
      className="ink-stroke"
      markerEnd="url(#pp-ink-arrow)"
      strokeDasharray={dashed ? '5 5' : undefined}
      d={d}
    />
  )
}

/** Get-or-create with DO NOTHING and with DO SELECT. */
export function OnConflictSelect() {
  return (
    <Figure
      title="Get-or-create when the row already exists"
      legend={[
        { label: 'the conflict', mark: 'rose' },
        { label: 'the row comes back', mark: 'blue' },
      ]}
    >
      <svg
        viewBox="0 0 640 190"
        role="img"
        aria-label="Two rows. With DO NOTHING, the insert hits a conflict, returns no row, and the code runs a second SELECT. With DO SELECT, the insert hits the same conflict and returns the existing row in one statement."
      >
        <text className="fig-strong" x="10" y="58">
          DO NOTHING
        </text>
        <text className="fig-strong" x="10" y="138">
          DO SELECT
        </text>
        {[34, 114].map((y) => (
          <g key={y}>
            <Box x={120} y={y} w={100} mark="sand">
              INSERT
            </Box>
            <Arrow d={`M224 ${y + 20}H250`} />
            <Box x={256} y={y} w={100} mark="rose">
              conflict
            </Box>
            <Arrow d={`M360 ${y + 20}H386`} />
          </g>
        ))}
        <Box x={392} y={34} w={96} mark="sand">
          no row
        </Box>
        <Arrow d="M492 54H514" />
        <Box x={520} y={34} w={110} mark="sand">
          SELECT again
        </Box>
        <Box x={392} y={114} w={238} mark="blue" strong>
          the existing row
        </Box>
        <Pen
          x={410}
          y={182}
          text="one statement"
          d="M398 176C380 172 368 164 362 150"
          turn={-2}
        />
      </svg>
    </Figure>
  )
}

/** What standalone output copies and what it leaves out. */
export function StandaloneFolder() {
  return (
    <Figure
      bleed
      title="What next build puts in .next/standalone"
      legend={[
        { label: 'copied by the build', mark: 'sage' },
        { label: 'left out', mark: 'sand' },
      ]}
    >
      <svg
        viewBox="0 0 640 220"
        role="img"
        aria-label="A folder named .next/standalone holds server.js, the traced files and the needed parts of node_modules. Two folders, public and .next/static, are outside it, and you copy them in yourself."
      >
        <rect
          x="10"
          y="34"
          width="360"
          height="124"
          style={{ fill: 'none', stroke: 'var(--rule)' }}
        />
        <text className="fig-strong" x="10" y="24">
          .next/standalone
        </text>
        <Box x={26} y={50} w={150} mark="sage" strong>
          server.js
        </Box>
        <Box x={190} y={50} w={164} mark="sage">
          traced files
        </Box>
        <Box x={26} y={102} w={328} mark="sage">
          the needed parts of node_modules
        </Box>
        <Box x={470} y={50} w={160} mark="sand" strong>
          public
        </Box>
        <Box x={470} y={102} w={160} mark="sand" strong>
          .next/static
        </Box>
        <Arrow dashed d="M466 70H378" />
        <Arrow dashed d="M466 122H378" />
        <Pen
          x={452}
          y={190}
          text="you copy these"
          d="M520 172C528 166 534 158 536 148"
        />
      </svg>
    </Figure>
  )
}

/** The page cache with several instances, before and after a shared handler. */
export function SharedCache() {
  const pods = [0, 1, 2]
  return (
    <Figure
      bleed
      title="The server cache with three instances"
      legend={[
        { label: 'fresh', mark: 'sage' },
        { label: 'stale', mark: 'sand' },
      ]}
      caption="Left: revalidateTag() ran on the first instance only."
    >
      <svg
        viewBox="0 0 640 210"
        role="img"
        aria-label="Left, the default: each of three instances has its own cache, and after a revalidateTag call on the first instance the other two are stale. Right, with a custom cache handler: the three instances share one store, so all of them are fresh."
      >
        <text className="fig-strong" x="10" y="20">
          default: a cache in each instance
        </text>
        <text className="fig-strong" x="350" y="20">
          a shared cacheHandler
        </text>
        {pods.map((pod) => (
          <g key={pod}>
            <Box x={10 + pod * 100} y={36} w={88} mark="sand">
              {`instance ${pod + 1}`}
            </Box>
            <path className="fig-axis" d={`M${54 + pod * 100} 76V112`} />
            <Box
              x={10 + pod * 100}
              y={112}
              w={88}
              mark={pod === 0 ? 'sage' : 'sand'}
            >
              {pod === 0 ? 'fresh' : 'stale'}
            </Box>
            <Box x={350 + pod * 96} y={36} w={84} mark="sand">
              {`instance ${pod + 1}`}
            </Box>
            <path className="fig-axis" d={`M${392 + pod * 96} 76V112`} />
          </g>
        ))}
        <Box x={350} y={112} w={276} mark="sage" strong>
          one store
        </Box>
        <Pen
          x={372}
          y={196}
          text="every instance reads it"
          d="M532 178C540 172 544 164 544 156"
          turn={-2}
        />
      </svg>
    </Figure>
  )
}

const moves = [
  ['port', 'server.port'],
  ['api-keys', 'access.api-keys'],
  ['auth-dir', 'oauth.auth-dir'],
  ['request-retry', 'routing.retry.request-retry'],
  ['debug', 'observability.logs.debug'],
]

/** Where five old config keys live in the v8 layout. */
export function ConfigMoves() {
  return (
    <Figure title="Where the old keys went in the v8 config">
      <svg
        viewBox="0 0 640 250"
        role="img"
        aria-label="Five old top-level keys and their v8 names: port is server.port, api-keys is access.api-keys, auth-dir is oauth.auth-dir, request-retry is routing.retry.request-retry, and debug is observability.logs.debug."
      >
        <text className="fig-strong" x="10" y="20">
          old key
        </text>
        <text className="fig-strong" x="330" y="20">
          config-version: 8
        </text>
        {moves.map(([from, to], index) => {
          const y = 34 + index * 42
          return (
            <g key={from}>
              <Box x={10} y={y} w={150} h={30} mark="sand">
                {from}
              </Box>
              <path className="fig-axis" d={`M164 ${y + 15}H326`} />
              <Box x={330} y={y} w={300} h={30} mark="amber">
                {to}
              </Box>
            </g>
          )
        })}
        <Pen
          x={176}
          y={82}
          text="client keys"
          d="M266 78C284 80 302 84 322 90"
          turn={-3}
        />
      </svg>
    </Figure>
  )
}

/** How a model name finds a provider, and what happens when it does not. */
export function ModelRoute() {
  return (
    <Figure
      bleed
      title="The proxy routes a request by its model name"
      caption="The alias in this drawing is the one from the upstream sample config."
    >
      <svg
        viewBox="0 0 640 200"
        role="img"
        aria-label="Top row: a request for the model g5 matches a model alias for gpt-5, the name is in the merged model list, and the request goes to the Codex login. Bottom row: a name that is not in the list gets the error unknown provider for model."
      >
        <Box x={10} y={36} w={120} mark="sand">
          model: g5
        </Box>
        <Arrow d="M134 56H160" />
        <Box x={166} y={36} w={140} mark="amber">
          alias: g5 is gpt-5
        </Box>
        <Arrow d="M310 56H336" />
        <Box x={342} y={36} w={140} mark="sand" strong>
          merged model list
        </Box>
        <Arrow d="M486 56H512" />
        <Box x={518} y={36} w={112} mark="amber" strong>
          Codex login
        </Box>
        <Box x={10} y={116} w={190} mark="sand">
          a name that is not in the list
        </Box>
        <Arrow d="M204 136H336" />
        <Box x={342} y={116} w={288} mark="rose" strong>
          unknown provider for model
        </Box>
        <Pen
          x={96}
          y={192}
          text="check it with /v1/models"
          d="M292 174C314 152 326 112 340 82"
          turn={-2}
        />
      </svg>
    </Figure>
  )
}

const steps = ['COPY go.mod go.sum', 'RUN go mod download', 'COPY . .', 'RUN go build']

/** Which Dockerfile steps run again after each kind of change. */
export function LayerCache() {
  return (
    <Figure
      bleed
      title="Which steps run again"
      legend={[
        { label: 'from the layer cache', mark: 'lilac' },
        { label: 'runs again', mark: 'amber' },
      ]}
    >
      <svg
        viewBox="0 0 640 220"
        role="img"
        aria-label="Two columns of four Dockerfile steps. After an edit to a Go file, the two module steps come from the cache and the build starts again at COPY dot dot. After a change to go.mod, all four steps run again."
      >
        <text className="fig-strong" x="10" y="20">
          you edit a .go file
        </text>
        <text className="fig-strong" x="380" y="20">
          you change go.mod
        </text>
        {steps.map((step, index) => {
          const y = 34 + index * 42
          return (
            <g key={step}>
              <Box x={10} y={y} w={250} h={30} mark={index < 2 ? 'lilac' : 'amber'}>
                {step}
              </Box>
              <Box x={380} y={y} w={250} h={30} mark="amber">
                {step}
              </Box>
            </g>
          )
        })}
        <Pen
          x={272}
          y={98}
          text="starts here"
          d="M306 106C304 118 290 128 268 132"
        />
      </svg>
    </Figure>
  )
}

const images = ['scratch', 'distroless/static', 'alpine']
const needs: Array<[string, Array<boolean>]> = [
  ['CA certificates', [false, true, true]],
  ['Timezone data', [false, true, false]],
  ['Shell', [false, false, true]],
  ['Package manager', [false, false, true]],
]

/** What each final image contains. */
export function FinalImages() {
  return (
    <Figure
      title="What each final image contains"
      legend={[{ label: 'present', mark: 'lilac' }]}
      caption="The distroless :debug tag adds a busybox shell."
    >
      <svg
        viewBox="0 0 640 230"
        role="img"
        aria-label="A grid of three images and four items. scratch has none of them. distroless static has CA certificates and timezone data. alpine has CA certificates, a shell and a package manager, but no timezone data."
      >
        {images.map((image, column) => (
          <text
            key={image}
            className="fig-strong"
            x={280 + column * 140}
            y="52"
            textAnchor="middle"
          >
            {image}
          </text>
        ))}
        {needs.map(([need, has], row) => (
          <g key={need}>
            <text x="10" y={92 + row * 38}>
              {need}
            </text>
            <path className="fig-axis" d={`M10 ${104 + row * 38}H630`} />
            {has.map((yes, column) =>
              yes ? (
                <rect
                  key={column}
                  x={268 + column * 140}
                  y={74 + row * 38}
                  width="24"
                  height="24"
                  filter="url(#pp-marker)"
                  style={{ fill: MARKS.lilac }}
                />
              ) : (
                <rect
                  key={column}
                  x={269 + column * 140}
                  y={75 + row * 38}
                  width="22"
                  height="22"
                  style={{ fill: 'none', stroke: 'var(--rule)' }}
                />
              ),
            )}
          </g>
        ))}
        <Pen
          x={452}
          y={22}
          text="my default"
          d="M448 18C438 20 430 26 424 36"
          turn={-3}
        />
      </svg>
    </Figure>
  )
}

const sizes: Array<{ name: string; bytes: number; mark: MarkName }> = [
  { name: 'bigint', bytes: 8, mark: 'sand' },
  { name: 'uuid', bytes: 16, mark: 'blue' },
  { name: 'text', bytes: 37, mark: 'rose' },
]

/** One square per byte for the three ways to store an ID. */
export function KeyBytes() {
  return (
    <Figure
      bleed
      title="Bytes per value, one square per byte"
      caption="The text form is 36 characters and a 1-byte header."
    >
      <svg
        viewBox="0 0 640 170"
        role="img"
        aria-label="Three rows of squares, one square per byte. A bigint takes 8 bytes, a uuid takes 16 bytes, and the same UUID stored as text takes 37 bytes."
      >
        {sizes.map((size, row) => {
          const y = 30 + row * 46
          return (
            <g key={size.name}>
              <text className="fig-strong" x="10" y={y + 13}>
                {size.name}
              </text>
              {Array.from({ length: size.bytes }, (_, index) => (
                <rect
                  key={index}
                  x={70 + index * 14}
                  y={y}
                  width="11"
                  height="18"
                  filter="url(#pp-marker)"
                  style={{ fill: MARKS[size.mark] }}
                />
              ))}
              <text className="fig-num" x={78 + size.bytes * 14} y={y + 15}>
                {size.bytes}
              </text>
            </g>
          )
        })}
        <Pen
          x={372}
          y={84}
          text="more than twice"
          d="M500 92C516 98 528 106 534 118"
        />
      </svg>
    </Figure>
  )
}

/** When the client gets its first bytes while the upstream is silent for 45 s. */
export function FirstByte() {
  const x = (seconds: number) => 150 + seconds * 10
  return (
    <Figure
      bleed
      title="What the client receives while the upstream is silent for 45 s"
      legend={[
        { label: 'nothing, not even a status line', mark: 'sand' },
        { label: 'headers or a keep-alive line', mark: 'blue' },
        { label: 'first token', mark: 'lilac' },
      ]}
      caption="CLIProxyAPI v8.0.79 with a mock upstream. The times are the same on the chat, messages and responses routes."
    >
      <svg
        viewBox="0 0 640 196"
        role="img"
        aria-label="Two rows on a time axis from 0 to 45 seconds. With the default config the client receives nothing until the first token at 45 seconds. With send-keepalive-before-ft the status line and headers arrive at 15 seconds, and a keep-alive line arrives at 15, 30 and 45 seconds."
      >
        <text className="fig-strong" x="10" y="50">
          default
        </text>
        <text className="fig-strong" x="10" y="114">
          keep-alive on
        </text>
        <Box x={x(0)} y={30} w={446} h={32} mark="sand" />
        <Box x={x(45)} y={30} w={30} h={32} mark="lilac" />
        <Box x={x(0)} y={94} w={146} h={32} mark="sand" />
        <Box x={x(15)} y={94} w={12} h={32} mark="blue" />
        <Box x={x(30)} y={94} w={12} h={32} mark="blue" />
        <Box x={x(45) - 16} y={94} w={12} h={32} mark="blue" />
        <Box x={x(45)} y={94} w={30} h={32} mark="lilac" />
        <path className="fig-axis" d={`M${x(0)} 146H${x(45) + 30}`} />
        {[0, 15, 30, 45].map((seconds) => (
          <g key={seconds}>
            <path className="fig-axis" d={`M${x(seconds)} 142V150`} />
            <text className="fig-num" x={x(seconds)} y={166} textAnchor="middle">
              {seconds} s
            </text>
          </g>
        ))}
        <Pen
          x={332}
          y={84}
          text="200 and headers at 15 s"
          d="M330 86C318 88 310 92 306 100"
        />
      </svg>
    </Figure>
  )
}
