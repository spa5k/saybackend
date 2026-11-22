import type { ReactNode } from 'react'

import { Figure, HandNote, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

/*
 * One vocabulary for the three TanStack Start posts:
 *   sand box    what the build or the client brings
 *   blue box    files and plain server parts
 *   lilac box   the subject of the figure
 *   rose tick   a request or a step that stops
 *   ink outline a container: an image, a bundle, an element
 */

const SMALL = { fontSize: 11 }
const TINY = { fontSize: 10 }

function Box({
  x,
  y,
  w,
  h = 30,
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
          style={SMALL}
        >
          {children}
        </text>
      ) : null}
    </g>
  )
}

function Wall({
  x,
  y,
  w,
  h,
  dashed = false,
}: {
  x: number
  y: number
  w: number
  h: number
  dashed?: boolean
}) {
  return (
    <rect
      className="fig-axis"
      x={x}
      y={y}
      width={w}
      height={h}
      rx="5"
      strokeDasharray={dashed ? '5 5' : undefined}
    />
  )
}

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

function Stop({ x, y }: { x: number; y: number }) {
  return (
    <rect
      x={x - 3}
      y={y - 9}
      width="6"
      height="18"
      filter="url(#pp-marker)"
      style={{ fill: MARKS.rose }}
    />
  )
}

type Band = { label: string; mark: MarkName }
type BandRow = {
  path: string
  /** Index of the band that answers. -1: stopped before the first band. */
  stop: number
  result: string
  strong?: boolean
}

/** Requests as lines that cross layers and end at the layer that answers. */
function Bands({
  bands,
  rows,
  aria,
}: {
  bands: Array<Band>
  rows: Array<BandRow>
  aria: string
}) {
  const top = 34
  const rowGap = 30
  const height = top + rows.length * rowGap + 14
  const bandX = (index: number) => 196 + index * 86
  return (
    <svg viewBox={`0 0 640 ${height}`} role="img" aria-label={aria}>
      {bands.map((band, index) => (
        <g key={band.label}>
          <rect
            x={bandX(index)}
            y={top - 8}
            width="40"
            height={rows.length * rowGap + 6}
            filter="url(#pp-marker)"
            style={{ fill: MARKS[band.mark] }}
          />
          <text
            className="fig-strong"
            x={bandX(index) + 20}
            y="16"
            textAnchor="middle"
            style={SMALL}
          >
            {band.label}
          </text>
        </g>
      ))}
      {rows.map((row, index) => {
        const y = top + 10 + index * rowGap
        const end = row.stop < 0 ? bandX(0) - 14 : bandX(row.stop) + 20
        return (
          <g key={row.path}>
            <text x="6" y={y + 4} style={SMALL}>
              {row.path}
            </text>
            <path
              className="ink-stroke"
              strokeDasharray={row.stop < 0 ? '5 5' : undefined}
              d={`M150 ${y}H${end}`}
            />
            {row.stop < 0 ? (
              <Stop x={end + 3} y={y} />
            ) : (
              <circle cx={end} cy={y} r="4" style={{ fill: 'var(--pen)' }} />
            )}
            <text
              className={row.strong ? 'fig-strong' : undefined}
              x={bandX(bands.length - 1) + 54}
              y={y + 4}
              style={SMALL}
            >
              {row.result}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Self-host post: what the runtime image holds. */
export function StartImageContents() {
  return (
    <Figure
      title="What goes into the image"
      legend={[
        { label: 'build stage', mark: 'sand' },
        { label: 'base image', mark: 'blue' },
        { label: '.output', mark: 'lilac' },
      ]}
    >
      <svg
        viewBox="0 0 640 236"
        role="img"
        aria-label="The build stage holds 120 MB of node_modules; only the 2.4 MB .output folder, with the server bundled into 19 files and 8 public files, is copied onto the base image, and the runtime image has no node_modules."
      >
        <text className="fig-strong" x="10" y="18">
          build stage
        </text>
        <Box x={10} y={30} w={190} h={120} mark="sand">
          node_modules
        </Box>
        <text x="105" y="112" textAnchor="middle" style={SMALL}>
          120 MB, 7,006 files
        </text>
        <Box x={10} y={156} w={90} h={24} mark="sand">
          src
        </Box>
        <Box x={106} y={156} w={94} h={24} mark="lilac">
          .output
        </Box>
        <text x="10" y="200" style={SMALL}>
          vite build
        </text>

        <Arrow d="M204 168C290 168 300 43 392 43" />
        <text x="298" y="92" textAnchor="middle" style={TINY}>
          COPY --from=build
        </text>
        <text x="298" y="106" textAnchor="middle" style={TINY}>
          /app/.output
        </text>

        <text className="fig-strong" x="400" y="18">
          runtime image
        </text>
        <Box x={400} y={30} w={230} h={26} mark="lilac" strong>
          .output 2.4 MB
        </Box>
        <Box x={400} y={60} w={230} h={120} mark="blue">
          node:26.13.1-slim 289.1 MB
        </Box>
        <text x="400" y="200" style={SMALL}>
          server 19 files, public 8 files
        </text>
        <text x="400" y="222" style={SMALL}>
          node_modules
        </text>
        <path className="ink-stroke" d="M396 218H484" />
        <HandNote x={500} y={222} text="nothing to install" rotate={-3} />
      </svg>
    </Figure>
  )
}

/** Self-host post: Nitro seals its file list before Start prerenders. */
export function PrerenderBuildOrder() {
  const steps = [
    'client build',
    'SSR build',
    'public + manifest',
    'Nitro prerender',
    'server bundle',
    'Start prerender',
  ]
  const x = (index: number) => 10 + index * 105
  return (
    <Figure
      bleed
      title="The order of steps in vite build"
      legend={[
        { label: 'served from the file', mark: 'blue' },
        { label: 'written, not served', mark: 'sand' },
      ]}
    >
      <svg
        viewBox="0 0 640 226"
        role="img"
        aria-label="Nitro writes its static file manifest before Start's prerender step runs, so pages prerendered by Nitro are served from the file and pages prerendered by Start are rendered again on each request."
      >
        <Wall x={x(2)} y={10} w={300} h={44} />
        <text className="fig-strong" x={x(2) + 150} y="37" textAnchor="middle">
          Nitro static file manifest
        </text>
        <path className="fig-axis" strokeDasharray="2 6" d="M529 4V150" />
        <text x="535" y="14" style={TINY}>
          sealed
        </text>

        {steps.map((step, index) => (
          <g key={step}>
            <rect
              x={x(index)}
              y="120"
              width="99"
              height="22"
              filter="url(#pp-marker)"
              style={{
                fill: MARKS[index === 3 ? 'blue' : 'sand'],
              }}
            />
            <text x={x(index) + 50} y="160" textAnchor="middle" style={TINY}>
              {step}
            </text>
          </g>
        ))}

        <Arrow d={`M${x(3) + 50} 116V58`} />
        <Arrow dashed d={`M${x(5) + 50} 116V76`} />
        <Stop x={x(5) + 50} y={64} />

        <text className="fig-strong" x={x(3) + 50} y="186" textAnchor="middle">
          47,424 req/s
        </text>
        <text x={x(3) + 50} y="204" textAnchor="middle" style={SMALL}>
          served from the file
        </text>
        <text className="fig-strong" x={x(5) + 44} y="186" textAnchor="middle">
          10,750 req/s
        </text>
        <text x={x(5) + 44} y="204" textAnchor="middle" style={SMALL}>
          on disk, SSR again
        </text>
      </svg>
    </Figure>
  )
}

/** Self-host post: which layer in the container answers a request. */
export function StartRequestPath() {
  return (
    <Figure
      bleed
      title="The request path in the container"
      caption="srvx listens on 0.0.0.0:3000 when HOST is unset. The h3 static handler answers only the files in the build-time manifest. A server function request passes a CSRF check on Sec-Fetch-Site, Origin and Referer."
      legend={[
        { label: 'srvx', mark: 'sand' },
        { label: 'h3 static handler', mark: 'blue' },
        { label: 'TanStack Start handler', mark: 'lilac' },
        { label: 'stopped', mark: 'rose' },
      ]}
    >
      <Bands
        aria="A request enters srvx, which listens on all interfaces when HOST is unset; the h3 static handler serves files listed in the build-time manifest, and every other request goes to the TanStack Start handler for server routes, server functions and SSR."
        bands={[
          { label: 'srvx', mark: 'sand' },
          { label: 'static', mark: 'blue' },
          { label: 'Start', mark: 'lilac' },
        ]}
        rows={[
          {
            path: 'HOST=localhost',
            stop: -1,
            result: '[::1] only, curl (56) reset',
          },
          {
            path: '/assets/*.js, *.css',
            stop: 1,
            result: 'max-age=31536000, immutable',
          },
          {
            path: '/photo.png',
            stop: 1,
            result: 'ETag, no Cache-Control',
          },
          {
            path: '/static/index.html',
            stop: 1,
            result: 'Nitro prerender',
          },
          {
            path: '/api/hello',
            stop: 2,
            result: 'server route, 41,011 req/s',
          },
          { path: '/_serverFn/<id>', stop: 2, result: 'CSRF check' },
          {
            path: '/dynamic',
            stop: 2,
            result: 'SSR, 10,157 req/s',
            strong: true,
          },
        ]}
      />
    </Figure>
  )
}

/** Server functions post: one source file becomes a stub and a module. */
export function CompileSplit() {
  return (
    <Figure
      bleed
      title="One source file, two bundles"
      caption="id = sha256('src/fns.ts--saveUser_createServerFn_handler')"
      legend={[
        { label: 'builder chain', mark: 'sand' },
        { label: 'validator, server only', mark: 'lilac' },
        { label: 'handler', mark: 'blue' },
      ]}
    >
      <svg
        viewBox="0 0 640 250"
        role="img"
        aria-label="The compiler turns one source file into a client stub that holds only the function id and a server module that holds the validator and the handler; the id is a SHA-256 hash of the file path and the variable name."
      >
        <text className="fig-strong" x="10" y="72">
          src/fns.ts
        </text>
        <Wall x={10} y={80} w={236} h={112} />
        <Box x={18} y={88} w={220} mark="sand">
          {"createServerFn({ method: 'POST' })"}
        </Box>
        <Box x={18} y={122} w={220} mark="lilac">
          .validator(User)
        </Box>
        <Box x={18} y={156} w={220} mark="blue">
          .handler(async ...)
        </Box>

        <Arrow d="M250 110C300 110 310 62 364 62" />
        <Arrow d="M250 164C300 164 310 190 364 190" />

        <text className="fig-strong" x="372" y="16">
          client bundle
        </text>
        <Wall x={372} y={24} w={258} h={78} />
        <Box x={380} y={32} w={96} h={26} mark="sand" />
        <rect
          className="fig-axis"
          x="482"
          y="32"
          width="140"
          height="26"
          strokeDasharray="3 4"
        />
        <text x="552" y="49" textAnchor="middle" style={SMALL}>
          .validator(User)
        </text>
        <path className="ink-stroke" d="M500 45H604" />
        <Box x={380} y={66} w={242} h={28} mark="blue">
          {"createClientRpc('4579f64c…e073')"}
        </Box>
        <text className="fig-strong" x="630" y="120" textAnchor="end">
          98 B per function, 45 B gzip
        </text>

        <text className="fig-strong" x="372" y="146">
          server bundle
        </text>
        <Wall x={372} y={154} w={258} h={72} />
        <Box x={380} y={162} w={96} h={26} mark="sand" />
        <Box x={482} y={162} w={140} h={26} mark="lilac">
          .validator(User)
        </Box>
        <Box x={380} y={192} w={242} h={26} mark="blue">
          .handler(async ...)
        </Box>
        <text x="630" y="244" textAnchor="end" style={SMALL}>
          {"createServerRpc({ id, name: 'saveUser' })"}
        </text>
      </svg>
    </Figure>
  )
}

/** Server functions post: one POST and the places where it can end. */
export function ServerFnRequestPath() {
  const stations: Array<{ label: string; mark: MarkName }> = [
    { label: 'CSRF check', mark: 'sand' },
    { label: 'request mw', mark: 'sand' },
    { label: 'global fn mw', mark: 'sand' },
    { label: 'auth .server()', mark: 'sand' },
    { label: 'validator', mark: 'lilac' },
    { label: 'handler', mark: 'blue' },
  ]
  const x = (index: number) => 62 + index * 88
  return (
    <Figure
      bleed
      title="One POST to /_serverFn/<id>"
      caption="The CSRF check rejects browsers from other origins, not curl. A wrong method gets 405 with Allow: POST before the payload is read."
      legend={[
        { label: 'middleware', mark: 'sand' },
        { label: 'validator', mark: 'lilac' },
        { label: 'handler', mark: 'blue' },
        { label: 'exit', mark: 'rose' },
      ]}
    >
      <svg
        viewBox="0 0 640 196"
        role="img"
        aria-label="A server-function request passes the CSRF check, the request middleware, the global and per-function middleware, then the validator and the handler; a CSRF failure is 403, a wrong method is 405, and a validator or handler error comes back as HTTP 200 with an error envelope."
      >
        <text x="6" y="80" style={SMALL}>
          POST
        </text>
        <Arrow d="M36 76H58" />
        {stations.map((station, index) => (
          <Box
            key={station.label}
            x={x(index)}
            y={58}
            w={82}
            h={36}
            mark={station.mark}
            strong={index === 4}
          >
            {station.label}
          </Box>
        ))}
        <Arrow d={`M${x(5) + 84} 76H${x(5) + 104}`} />
        <text x="610" y="50" textAnchor="middle" style={TINY}>
          {'{ result }'}
        </text>

        <HandNote
          x={x(3) - 30}
          y={30}
          text="the client can send context here"
          rotate={-2}
        />

        <Arrow d={`M${x(0) + 30} 98V132`} />
        <Stop x={x(0) + 30} y={146} />
        <text x={x(0) + 40} y="150" style={SMALL}>
          403 Forbidden
        </text>
        <Arrow d={`M${x(1) + 62} 98V160`} />
        <Stop x={x(1) + 62} y={174} />
        <text x={x(1) + 72} y="178" style={SMALL}>
          405, Allow: POST
        </text>
        <Arrow d={`M${x(4) + 41} 98V132`} />
        <Arrow d={`M${x(5) + 41} 98V132`} />
        <text
          className="fig-strong"
          x={x(4) + 85}
          y="150"
          textAnchor="middle"
          style={SMALL}
        >
          {'200 with { error }'}
        </text>
      </svg>
    </Figure>
  )
}

function ContextPanel({
  x,
  title,
  covered,
  result,
}: {
  x: number
  title: string
  covered: boolean
  result: string
}) {
  return (
    <g>
      <text className="fig-strong" x={x} y="18">
        {title}
      </text>
      <text x={x} y="42" style={SMALL}>
        handler
      </text>
      <text className="fig-strong" x={x + 300} y="42" textAnchor="end">
        {result}
      </text>
      <path className="fig-axis" d={`M${x} 50H${x + 300}`} />

      {covered ? (
        <Box x={x + 130} y={66} w={170} h={34} mark="lilac" strong>
          user: null
        </Box>
      ) : null}
      <Wall x={x} y={66} w={300} h={34} dashed />
      <text x={x + 8} y="87" style={TINY}>
        server context
      </text>

      <Box x={x} y={118} w={124} h={34} mark="sand">
        {"tz: 'Europe/Berlin'"}
      </Box>
      <Box x={x + 130} y={118} w={170} h={34} mark="rose">
        {"user: { role: 'admin' }"}
      </Box>
      <text x={x} y="172" style={TINY}>
        client payload context
      </text>

      {covered ? (
        <>
          <Arrow dashed d={`M${x + 215} 116V104`} />
        </>
      ) : (
        <Arrow d={`M${x + 215} 116V54`} />
      )}
    </g>
  )
}

/** Server functions post: server context covers client context, key by key. */
export function ContextMerge() {
  return (
    <Figure
      bleed
      title="Client context first, server context on top"
      legend={[
        { label: 'sent by the client', mark: 'sand' },
        { label: 'forged with curl', mark: 'rose' },
        { label: 'set by server middleware', mark: 'lilac' },
      ]}
    >
      <svg
        viewBox="0 0 640 196"
        role="img"
        aria-label="The server merges client-sent context first and server middleware context on top, so a key the server middleware does not set is taken from the client; setting the key to null on every request blocks the forged value."
      >
        <ContextPanel
          x={6}
          title="No cookie"
          covered={false}
          result="report sent to mallory"
        />
        <ContextPanel
          x={334}
          title="Always set user"
          covered
          result="forbidden"
        />
        <HandNote x={170} y={186} text="sent by curl" rotate={-3} />
      </svg>
    </Figure>
  )
}

/** Blog post: the Worker renders its own static files at build time. */
export function BuildPipeline() {
  return (
    <Figure
      bleed
      title="The build, and what answers a request"
      caption="At build time the Worker runs in workerd. A crawler sends 47 requests and writes 40 HTML files, rss.xml, llms.txt and two sitemaps into dist/client."
      legend={[
        { label: 'source and index', mark: 'sand' },
        { label: 'Vite builds', mark: 'blue' },
        { label: 'prerender', mark: 'lilac' },
      ]}
    >
      <svg
        viewBox="0 0 640 220"
        role="img"
        aria-label="MDX and routes go through a Vite client build and a Vite server build; the server build is the Worker; at build time the Worker runs in workerd and renders 40 HTML pages into the client folder; Pagefind indexes that folder; on Cloudflare the files answer first and the Worker answers the rest."
      >
        <Box x={6} y={76} w={86} h={56} mark="sand">
          MDX + routes
        </Box>
        <Arrow d="M96 92C108 92 108 52 120 52" />
        <Arrow d="M96 116C108 116 108 156 120 156" />

        <Box x={124} y={34} w={118} h={36} mark="blue">
          client build 4.75 s
        </Box>
        <text x="183" y="24" textAnchor="middle" style={TINY}>
          dist/client
        </text>
        <Box x={124} y={138} w={118} h={36} mark="blue">
          ssr build 1.52 s
        </Box>
        <text x="183" y="190" textAnchor="middle" style={TINY}>
          = the Worker
        </text>

        <Arrow d="M246 156C262 156 262 118 278 118" />
        <Box x={282} y={86} w={110} h={48} mark="lilac" strong>
          prerender 1.72 s
        </Box>
        <Arrow d="M300 82C300 60 276 52 248 52" />
        <text x="318" y="66" style={TINY}>
          40 HTML files
        </text>

        <Arrow d="M396 110H414" />
        <Box x={418} y={92} w={78} h={36} mark="sand">
          Pagefind
        </Box>
        <text x="457" y="144" textAnchor="middle" style={TINY}>
          0.28 s
        </text>

        <Arrow d="M500 110H516" />
        <text className="fig-strong" x="577" y="56" textAnchor="middle">
          Cloudflare
        </text>
        <Wall x={520} y={64} w={114} h={92} />
        <Box x={528} y={72} w={98} h={34} mark="blue">
          static files
        </Box>
        <Box x={528} y={114} w={98} h={34} mark="lilac">
          Worker
        </Box>
        <text x="577" y="172" textAnchor="middle" style={TINY}>
          639 KiB gzip
        </text>
        <HandNote x={520} y={200} text="files answer first" rotate={-3} />
      </svg>
    </Figure>
  )
}

/** Blog post: which layer answers four real requests. */
export function BlogRequestPath() {
  return (
    <Figure
      bleed
      title="Three layers, four requests"
      caption="Times are local. In production, Redirect Rules turn the 307 into a 301."
      legend={[
        { label: 'Redirect Rules', mark: 'sand' },
        { label: 'static files', mark: 'blue' },
        { label: 'Worker', mark: 'lilac' },
      ]}
    >
      <Bands
        aria="Requests pass Cloudflare Redirect Rules, then static files, then the Worker; prerendered pages are answered as files in about 3 ms locally, Markdown and redirects reach the Worker in about 4 ms."
        bands={[
          { label: 'rules', mark: 'sand' },
          { label: 'files', mark: 'blue' },
          { label: 'Worker', mark: 'lilac' },
        ]}
        rows={[
          {
            path: '/blog/<slug>/',
            stop: 1,
            result: '200, 3.0 ms',
            strong: true,
          },
          {
            path: '/blog/<slug>',
            stop: 1,
            result: '307 to /blog/<slug>/',
          },
          {
            path: '/blog/<slug>.md',
            stop: 2,
            result: '200, 4.2 ms, on request',
          },
          {
            path: '/tags/kafka/',
            stop: 2,
            result: '301 to /topics/kafka-streaming/',
          },
        ]}
      />
    </Figure>
  )
}

function BodyStrip({
  y,
  title,
  inline,
  found,
}: {
  y: number
  title: string
  inline: boolean
  found: string
}) {
  return (
    <g>
      <text className="fig-strong" x="6" y={y}>
        {title}
      </text>
      <Box x={6} y={y + 14} w={70} h={44} mark="sand">
        header
      </Box>
      <Wall x={84} y={y + 10} w={inline ? 300 : 150} h={52} />
      <text x="92" y={y + 78} style={TINY}>
        div data-pagefind-body
      </text>
      {inline ? (
        <Box x={92} y={y + 18} w={284} h={36} mark="lilac">
          the post text
        </Box>
      ) : (
        <>
          <rect
            className="fig-axis"
            x="92"
            y={y + 22}
            width="28"
            height="28"
            strokeDasharray="3 4"
          />
          <text x="128" y={y + 40} style={TINY}>
            template B:0
          </text>
          <Box x={244} y={y + 18} w={170} h={36} mark="lilac">
            div hidden S:0: the post text
          </Box>
          <Box x={422} y={y + 18} w={62} h={36} mark="sand">
            $RC script
          </Box>
          <Arrow d={`M452 ${y + 14}C400 ${y - 22} 170 ${y - 22} 110 ${y + 18}`} />
        </>
      )}
      <text className="fig-strong" x="634" y={y + 40} textAnchor="end">
        {found}
      </text>
    </g>
  )
}

/** Blog post: where the post text is when Pagefind reads the HTML. */
export function StreamedBody() {
  return (
    <Figure
      bleed
      title="Where the post text is when Pagefind reads the page"
      caption="Pagefind reads only the outlined element. In the streamed page a browser script moves the text into it."
      legend={[{ label: 'the post text', mark: 'lilac' }]}
    >
      <svg
        viewBox="0 0 640 230"
        role="img"
        aria-label="In the current build the post text is outside the element Pagefind indexes and only a browser script moves it in, so the index is empty; with the body loaded before rendering, the text is inside that element and all 18 posts are indexed."
      >
        <BodyStrip y={34} title="Streamed (now)" inline={false} found="0 words" />
        <HandNote x={500} y={36} text="browser only" rotate={-2} />
        <BodyStrip
          y={148}
          title="Inline (fixed)"
          inline
          found="18 posts, 4,156 words"
        />
      </svg>
    </Figure>
  )
}

/** Blog post: Pagefind read the rendered page; the new index reads the Markdown. */
export function SearchIndexPath() {
  const before = 46
  const now = 146
  return (
    <Figure
      bleed
      title="Where the search index gets the post text"
      caption="Pagefind read the HTML after React rendered it. The new index reads the same Markdown as the .md copy of each post, so a change in rendering cannot empty it."
      legend={[
        { label: 'the post text', mark: 'lilac' },
        { label: 'a build step', mark: 'blue' },
      ]}
    >
      <svg
        viewBox="0 0 640 250"
        role="img"
        aria-label="Before: the MDX file goes through the React render to streamed HTML, and Pagefind found 0 of 18 posts there. Now: the MDX file becomes portable Markdown, is cut at each heading, and goes into a MiniSearch index of 46 posts and 677 parts; all 640 heading anchors match ids in the pages."
      >
        <text x="20" y={before - 14} style={TINY}>
          Pagefind (before)
        </text>
        <Box x={20} y={before} w={90} mark="sand">
          index.mdx
        </Box>
        <Arrow d={`M114 ${before + 15} H136`} />
        <Box x={140} y={before} w={110} mark="sand">
          React render
        </Box>
        <Arrow d={`M254 ${before + 15} H276`} />
        <Wall x={280} y={before - 4} w={110} h={38} dashed />
        <text x={335} y={before + 19} textAnchor="middle" style={SMALL}>
          streamed HTML
        </text>
        <Arrow d={`M394 ${before + 15} H416`} />
        <Box x={420} y={before} w={90} mark="blue">
          Pagefind
        </Box>
        <Stop x={526} y={before + 15} />
        <text x={538} y={before + 19} style={SMALL} className="fig-strong">
          0 of 18 posts
        </text>

        <text x="20" y={now - 14} style={TINY}>
          MiniSearch (now)
        </text>
        <Box x={20} y={now} w={90} mark="sand">
          index.mdx
        </Box>
        <Arrow d={`M114 ${now + 15} H136`} />
        <Box x={140} y={now} w={110} mark="blue">
          Markdown copy
        </Box>
        <Arrow d={`M254 ${now + 15} H276`} />
        <Box x={280} y={now} w={110} mark="lilac" strong>
          one part per heading
        </Box>
        <Arrow d={`M394 ${now + 15} H416`} />
        <Box x={420} y={now} w={90} mark="lilac">
          MiniSearch
        </Box>
        <text x={526} y={now + 12} style={SMALL} className="fig-strong">
          46 posts
        </text>
        <text x={526} y={now + 27} style={SMALL}>
          677 parts
        </text>

        <Arrow d={`M335 ${now + 34} V${now + 62}`} dashed />
        <text x={335} y={now + 78} textAnchor="middle" style={SMALL}>
          heading anchors: 640 of 640 in the page
        </text>
        <HandNote x={430} y={now + 62} text="no React in the path" rotate={-3} />
      </svg>
    </Figure>
  )
}
