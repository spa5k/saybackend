import type { ReactNode } from 'react'

import { Figure, HandNote, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

/*
 * One vocabulary for the four Solid posts:
 *   sand   what exists already: a SolidStart piece, a committed value, the browser
 *   lilac  Solid 2.0: its packages, a new value, an optimistic guess
 *   blue   the server, and a request that reaches it
 *   amber  pending: a node that waits, a check on the path
 *   rose   dropped or rewritten
 */

const SMALL = { fontSize: 11 }
const TINY = { fontSize: 10 }

/** A marker box with a label in its middle. */
function Box({
  x,
  y,
  w,
  h = 30,
  mark,
  children,
  strong = false,
  align = 'middle',
}: {
  x: number
  y: number
  w: number
  h?: number
  mark: MarkName
  children?: ReactNode
  strong?: boolean
  align?: 'middle' | 'start'
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
          x={align === 'start' ? x + 8 : x + w / 2}
          y={y + h / 2 + 4}
          textAnchor={align}
          style={TINY}
        >
          {children}
        </text>
      ) : null}
    </g>
  )
}

/** An empty outline: a boundary, or a node that did not run. */
function Outline({
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

/** One message between the browser and the server, with its label above. */
function Trip({
  x1,
  x2,
  y,
  y2,
  label,
  strong = false,
}: {
  x1: number
  x2: number
  y: number
  y2?: number
  label: string
  strong?: boolean
}) {
  const end = y2 ?? y
  const forward = x2 > x1
  return (
    <g>
      <Arrow
        d={`M${x1} ${y}L${forward ? x2 - 4 : x2 + 4} ${end}`}
        dashed={!forward}
      />
      <text
        className={strong ? 'fig-strong' : undefined}
        x={(x1 + x2) / 2}
        y={(y + end) / 2 - 6}
        textAnchor="middle"
        style={TINY}
      >
        {label}
      </text>
    </g>
  )
}

/** The browser and the server as two vertical life lines. */
function Lifelines({
  x1,
  x2,
  y,
  h,
}: {
  x1: number
  x2: number
  y: number
  h: number
}) {
  return (
    <g>
      <text x={x1} y={y - 8} textAnchor="middle" style={TINY}>
        browser
      </text>
      <text x={x2} y={y - 8} textAnchor="middle" style={TINY}>
        server
      </text>
      <rect
        x={x1 - 5}
        y={y}
        width="10"
        height={h}
        filter="url(#pp-marker)"
        style={{ fill: MARKS.sand }}
      />
      <rect
        x={x2 - 5}
        y={y}
        width="10"
        height={h}
        filter="url(#pp-marker)"
        style={{ fill: MARKS.blue }}
      />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Post 1: async inside the reactive graph                             */
/* ------------------------------------------------------------------ */

/** An optimistic guess as a lane above the committed value. */
export function OptimisticAction() {
  const at = (ms: number) => 120 + ms * 8
  return (
    <Figure
      bleed
      title="One optimistic action, when the save rejects and when it succeeds"
      legend={[
        { label: 'committed value', mark: 'sand' },
        { label: 'guess, in a lane', mark: 'lilac' },
        { label: 'from the server', mark: 'blue' },
      ]}
    >
      <svg
        viewBox="0 0 640 262"
        role="img"
        aria-label="An optimistic write shows 5 in a lane above the committed value 0. When the save rejects, the lane is dropped and the screen shows 0 again. On success, refresh reads 7 from the server and replaces the guess in the same frame."
      >
        <text className="fig-strong" x="10" y="52">
          save rejects
        </text>
        <text x={at(3)} y="20" style={TINY}>
          setCount(5), then yield api.save(5)
        </text>
        <Box x={at(3)} y={30} w={at(53) - at(3)} h={22} mark="lilac">
          guess: 5
        </Box>
        <text x={at(3) + 8} y="45" style={TINY}>
          lane
        </text>
        <rect
          x={at(53) - 3}
          y={26}
          width="6"
          height="30"
          filter="url(#pp-marker)"
          style={{ fill: MARKS.rose }}
        />
        <text x={at(53) + 8} y="45" style={TINY}>
          lane dropped
        </text>
        <Box x={at(0)} y={56} w={500} h={22} mark="sand">
          committed: 0
        </Box>

        <text x="10" y="106" style={TINY}>
          screen
        </text>
        <Box x={at(0)} y={92} w={at(3) - at(0)} h={20} mark="sand">
          0
        </Box>
        <Box x={at(3)} y={92} w={at(53) - at(3)} h={20} mark="lilac">
          5
        </Box>
        <Box x={at(53)} y={92} w={620 - at(53)} h={20} mark="sand">
          0
        </Box>

        <path className="fig-axis" d={`M${at(0)} 126H620`} />
        {[1, 3, 53].map((ms) => (
          <g key={ms}>
            <path className="fig-axis" d={`M${at(ms)} 122V130`} />
            <text
              x={at(ms)}
              y="144"
              textAnchor={ms === 1 ? 'end' : 'start'}
              style={TINY}
            >
              {ms} ms
            </text>
          </g>
        ))}
        <text x={at(53)} y="158" style={TINY}>
          rejects
        </text>

        <text className="fig-strong" x="10" y="204">
          save succeeds
        </text>
        <Box x={at(3)} y={188} w={240} h={22} mark="lilac">
          guess: 7
        </Box>
        <Box x={at(3) + 240} y={188} w={236} h={22} mark="blue">
          7, from refresh(count)
        </Box>
        <HandNote
          x={at(3) + 110}
          y={240}
          text="guess replaced by truth in one frame"
          rotate={-2}
        />
      </svg>
    </Figure>
  )
}

/** One widget row: the old answer on screen until `at`, the new one after. */
function ScreenRow({
  y,
  label,
  switchAt,
  x,
}: {
  y: number
  label: string
  switchAt: number
  x: (ms: number) => number
}) {
  return (
    <g>
      <text x="10" y={y + 15} style={SMALL}>
        {label}
      </text>
      <Box x={x(0)} y={y} w={x(switchAt) - x(0)} h={22} mark="sand">
        {switchAt > 40 ? 'period 1' : ''}
      </Box>
      <Box x={x(switchAt)} y={y} w={x(220) - x(switchAt)} h={22} mark="lilac">
        period 2
      </Box>
    </g>
  )
}

export function DeferredTimeline() {
  const x = (ms: number) => 150 + ms * 2.15
  return (
    <Figure
      bleed
      title="One write, two widgets: when each shows the new period"
      legend={[
        { label: 'old answer on screen', mark: 'sand' },
        { label: 'new answer on screen', mark: 'lilac' },
      ]}
      caption="A fast source of 20 ms and a slow source of 200 ms read the same signal. Times are from the write, measured with Solid 2.0.3 in Node."
    >
      <svg
        viewBox="0 0 640 250"
        role="img"
        aria-label="With createMemo for the slow source, both widgets keep the old period until 202 ms and switch together. With createDeferred, the fast widget switches at 23 ms and the slow one at 202 ms."
      >
        <text className="fig-strong" x="10" y="22">
          slow source is createMemo
        </text>
        <ScreenRow y={32} label="fast widget" switchAt={202} x={x} />
        <ScreenRow y={60} label="slow widget" switchAt={202} x={x} />

        <text className="fig-strong" x="10" y="122">
          slow source is createDeferred
        </text>
        <ScreenRow y={132} label="fast widget" switchAt={23} x={x} />
        <ScreenRow y={160} label="slow widget" switchAt={202} x={x} />

        <path className="fig-axis" d={`M${x(0)} 200H${x(220)}`} />
        {[0, 23, 202].map((ms) => (
          <g key={ms}>
            <path className="fig-axis" d={`M${x(ms)} 196V204`} />
            <text x={x(ms)} y="218" textAnchor="middle" style={TINY}>
              {ms === 0 ? 'write' : `${ms} ms`}
            </text>
          </g>
        ))}
        <HandNote
          x={x(40)}
          y={242}
          text="the fast widget stops waiting"
          rotate={-2}
        />
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Posts 2 and 3: where the pieces of SolidStart went                  */
/* ------------------------------------------------------------------ */

type MovesProps = {
  title: string
  caption?: ReactNode
  aria: string
  leftTitle: string
  rightTitle: string
  /** A SolidStart piece and the index of the box that takes it. */
  left: Array<{ label: string; to: number; gone?: boolean }>
  right: Array<{ label: string; sub?: string }>
  leftWidth: number
  note?: { text: string; row: number }
  foot?: string
}

/** Pieces of SolidStart on the left, their Solid 2.0 homes on the right. */
function Moves(props: MovesProps) {
  const top = 34
  const rowH = 24
  const gap = 6
  const bodyH = props.left.length * (rowH + gap) - gap
  const rightX = props.leftWidth + 70
  const rightW = 630 - rightX
  const paired = props.right.length === props.left.length
  const boxH = paired
    ? rowH
    : (bodyH - (props.right.length - 1) * 10) / props.right.length
  const rightY = (index: number) =>
    paired ? top + index * (rowH + gap) : top + index * (boxH + 10)
  const height = top + bodyH + (props.foot ? 34 : 12)
  return (
    <Figure
      bleed
      title={props.title}
      caption={props.caption}
      legend={[
        { label: 'SolidStart', mark: 'sand' },
        { label: 'Solid 2.0', mark: 'lilac' },
      ]}
    >
      <svg viewBox={`0 0 640 ${height}`} role="img" aria-label={props.aria}>
        <text className="fig-strong" x="10" y="20">
          {props.leftTitle}
        </text>
        <text className="fig-strong" x={rightX} y="20">
          {props.rightTitle}
        </text>
        {props.left.map((row, index) => {
          const y = top + index * (rowH + gap)
          const targetY = rightY(row.to) + boxH / 2
          const startX = 10 + props.leftWidth + 4
          const fromY = y + rowH / 2
          return (
            <g key={row.label}>
              <Box
                x={10}
                y={y}
                w={props.leftWidth}
                h={rowH}
                mark="sand"
                align="start"
              >
                {row.label}
              </Box>
              <Arrow
                d={`M${startX} ${fromY}C${startX + 30} ${fromY} ${rightX - 34} ${targetY} ${rightX - 6} ${targetY}`}
              />
            </g>
          )
        })}
        {props.right.map((box, index) => {
          const y = rightY(index)
          return (
            <g key={box.label}>
              <rect
                x={rightX}
                y={y}
                width={rightW}
                height={boxH}
                filter="url(#pp-marker)"
                style={{ fill: MARKS.lilac }}
              />
              <text
                className={box.sub ? 'fig-strong' : undefined}
                x={rightX + 8}
                y={box.sub ? y + boxH / 2 - 3 : y + boxH / 2 + 4}
                style={TINY}
              >
                {box.label}
              </text>
              {box.sub ? (
                <text x={rightX + 8} y={y + boxH / 2 + 12} style={TINY}>
                  {box.sub}
                </text>
              ) : null}
            </g>
          )
        })}
        {props.note ? (
          <HandNote
            x={10 + props.leftWidth + 22}
            y={top + props.note.row * (rowH + gap) + 2}
            text={props.note.text}
            rotate={-4}
          />
        ) : null}
        {props.foot ? (
          <text x={rightX} y={top + bodyH + 24} style={TINY}>
            {props.foot}
          </text>
        ) : null}
      </svg>
    </Figure>
  )
}

/** Post 2: each import of the old app and its Solid 2.0 replacement. */
export function PackageMoves() {
  return (
    <Moves
      title="Where each SolidStart piece lives in Solid 2.0"
      aria="Each SolidStart piece and its Solid 2.0 replacement: the Vite plugin's start mode replaces SolidStart and Nitro, filesystem-routing replaces FileRoutes, @solidjs/web takes solid-js/web and the HTTP helpers."
      leftTitle="SolidStart app"
      rightTitle="Solid 2.0"
      leftWidth={232}
      left={[
        { label: '@solidjs/start/config, solidStart()', to: 0 },
        { label: 'nitro/vite', to: 1 },
        { label: 'entry-server.tsx + entry-client.tsx', to: 2 },
        { label: '@solidjs/start/router, FileRoutes', to: 3 },
        { label: '@solidjs/start/middleware', to: 4 },
        { label: '@solidjs/start, HttpStatusCode', to: 5 },
        { label: '"use server" runtime', to: 6 },
        { label: 'API routes, GET exports', to: 7 },
        { label: 'solid-js/web', to: 8 },
        { label: 'solid-js/store', to: 9 },
      ]}
      right={[
        { label: '@solidjs/vite-plugin, solid({ start, ssr: true })' },
        { label: 'start.nodeServer: dist/server/node.js' },
        { label: 'src/Document.tsx, entries are generated' },
        { label: 'filesystem-routing/vite + @solidjs/router/fs' },
        { label: 'StartMiddleware, from @solidjs/vite-plugin' },
        { label: 'httpStatus(), from @solidjs/web' },
        { label: 'serverFunctions + @solidjs/web/server-functions' },
        { label: 'createAPIHandler, from filesystem-routing/api' },
        { label: '@solidjs/web' },
        { label: 'solid-js' },
      ]}
      note={{ text: 'gone', row: 1 }}
    />
  )
}

/** Post 3: the same move, grouped by the package that takes each piece. */
export function SolidStartPiecesMoved() {
  return (
    <Moves
      title="Where the pieces of SolidStart went"
      aria="In Solid 2.0, server functions, status and header helpers and clientOnly moved into @solidjs/web; entries, serving, SSR and typed env moved into Start mode in @solidjs/vite-plugin; file routing moved into the separate filesystem-routing package. SolidStart 2 keeps all of them for Solid 1.x."
      leftTitle="SolidStart"
      rightTitle="Solid 2.0"
      leftWidth={250}
      left={[
        { label: '"use server" server functions', to: 0 },
        { label: 'serving: entries, dev server, SSR, middleware', to: 1 },
        { label: 'file-system routing', to: 2 },
        { label: 'HttpStatusCode and HttpHeader', to: 0 },
        { label: 'clientOnly', to: 0 },
        { label: 'typed env', to: 1 },
      ]}
      right={[
        {
          label: '@solidjs/web (core)',
          sub: 'server-functions, httpStatus(), httpHeader(), clientOnly',
        },
        {
          label: '@solidjs/vite-plugin, Start mode',
          sub: 'serving layer, typed env',
        },
        { label: 'filesystem-routing 0.5.0', sub: 'router-neutral' },
      ]}
      foot="SolidStart 2.2.3 keeps all of them, for Solid 1.x"
    />
  )
}

/** Post 2: one middleware chain in front of pages, API routes and functions. */
export function StartModeRequest() {
  return (
    <Figure
      bleed
      title="One request through the migrated app"
      legend={[
        { label: 'server entry', mark: 'sand' },
        { label: 'API handler', mark: 'amber' },
        { label: 'page render', mark: 'lilac' },
        { label: 'API route, server function', mark: 'blue' },
      ]}
    >
      <svg
        viewBox="0 0 640 262"
        role="img"
        aria-label="In start mode one middleware chain fronts pages, API routes and server functions; createAPIHandler must be in that chain for GET exports to answer."
      >
        <Box x={10} y={98} w={120} h={40} mark="sand">
          dist/server/node.js
        </Box>
        <text x="10" y="154" style={TINY}>
          static files: dist/client,
        </text>
        <text x="10" y="168" style={TINY}>
          .br or .gz by Accept-Encoding
        </text>
        <Arrow d="M134 118H166" />

        <Outline x={172} y={62} w={176} h={112} />
        <text x="180" y="78" style={TINY}>
          handleRequest: middleware chain
        </text>
        <Box x={182} y={88} w={156} h={30} mark="sand">
          timing
        </Box>
        <Box x={182} y={130} w={156} h={30} mark="amber" strong>
          createAPIHandler(routes)
        </Box>
        <HandNote x={170} y={22} text={'forget this and\nAPI routes 404'} rotate={-3} />
        <path className="ink-stroke" markerEnd="url(#pp-ink-arrow)" d="M166 30C146 70 146 126 176 144" />

        <Arrow d="M340 140H366V38H396" />
        <Box x={402} y={22} w={170} h={30} mark="blue">
          routes/api/health.ts GET
        </Box>
        <text x="402" y="68" style={TINY}>
          /api/health: JSON
        </text>

        <Arrow d="M350 112H396" />
        <text x="372" y="104" textAnchor="middle" style={TINY}>
          next()
        </text>
        <Box x={402} y={92} w={170} h={40} mark="lilac">
          page render
        </Box>
        <text x="402" y="148" style={TINY}>
          {'Document › App › Router › Loading'}
        </text>
        <text className="fig-strong" x="402" y="164" style={TINY}>
          shell at 9.1 ms, stats boundary at 412 ms
        </text>

        <text x="10" y="222" style={TINY}>
          {'form POST /_server/addTodo-…'}
        </text>
        <Arrow d="M168 218H230V178" />
        <Arrow d="M300 176V218H396" />
        <Box x={402} y={203} w={120} h={30} mark="blue">
          server function
        </Box>
        <text className="fig-strong" x="530" y="222" style={TINY}>
          302 to /todos/4
        </text>
      </svg>
    </Figure>
  )
}

/** Post 2: the 29 problems, by the place where each one showed. */
export function WhereErrorsSurface() {
  const unit = 19
  const blocks: Array<{
    label: string
    count: number
    mark: MarkName
    labelY: number
  }> = [
    { label: 'npm install', count: 1, mark: 'rose', labelY: 86 },
    { label: 'vite build, client', count: 18, mark: 'rose', labelY: 86 },
    { label: 'vite build, server', count: 2, mark: 'rose', labelY: 86 },
    { label: 'production server', count: 1, mark: 'amber', labelY: 106 },
    {
      label: 'vite dev and browser console',
      count: 4,
      mark: 'amber',
      labelY: 126,
    },
    { label: 'tsc', count: 3, mark: 'blue', labelY: 86 },
  ]
  let cursor = 10
  const placed = blocks.map((block) => {
    const x = cursor
    const w = block.count * unit
    cursor += w + 4
    return { ...block, x, w }
  })
  return (
    <Figure
      bleed
      title="Where the 29 problems appeared"
      legend={[
        { label: 'stopped the install or the build', mark: 'rose' },
        { label: 'showed only when the app ran', mark: 'amber' },
        { label: 'type error', mark: 'blue' },
      ]}
    >
      <svg
        viewBox="0 0 640 196"
        role="img"
        aria-label="Of 29 problems, 21 stopped the install or the build, 3 were type errors, and 5 showed up only when the app ran."
      >
        {placed.map((block, index) => {
          const middle = block.x + block.w / 2
          const anchor = index === 0 ? 'start' : index === 2 ? 'end' : 'middle'
          const labelX =
            index === 0 ? block.x : index === 2 ? block.x + block.w : middle
          return (
            <g key={block.label}>
              <rect
                x={block.x}
                y={36}
                width={block.w}
                height={32}
                filter="url(#pp-marker)"
                style={{ fill: MARKS[block.mark] }}
              />
              <text className="fig-num" x={middle} y="28" textAnchor="middle">
                {block.count}
              </text>
              {block.labelY > 86 ? (
                <path
                  className="fig-axis"
                  d={`M${middle} 72V${block.labelY - 12}`}
                />
              ) : null}
              <text
                x={labelX}
                y={block.labelY}
                textAnchor={anchor}
                style={TINY}
              >
                {block.label}
              </text>
            </g>
          )
        })}
        <text className="fig-strong" x="630" y="57" textAnchor="end">
          29
        </text>
        <HandNote
          x={150}
          y={140}
          text={'build passed,\nAPI answered 404'}
          rotate={-3}
        />
        <path
          className="ink-stroke"
          markerEnd="url(#pp-ink-arrow)"
          d="M270 138C320 138 370 124 384 110"
        />
        <HandNote
          x={470}
          y={160}
          text={'build passed,\ndev failed'}
          rotate={-3}
        />
      </svg>
    </Figure>
  )
}

/** Post 3: what each path keeps, and what it rewrites. */
export function ThreePathsKeepRewrite() {
  const heads = [
    'route files',
    'use server',
    'components',
    'entries, config',
    'data reads',
    'Solid version',
  ]
  const rows: Array<{ label: string; cells: Array<[boolean, string?]> }> = [
    {
      label: 'Stay on SolidStart 2',
      cells: [[true], [true], [true], [true], [true], [true]],
    },
    {
      label: 'Start mode',
      cells: [[true], [true], [false], [false], [false], [false, '1.x to 2.0']],
    },
    {
      label: 'TanStack Start (stable)',
      cells: [
        [false, 'createFileRoute'],
        [false, 'createServerFn'],
        [true],
        [false],
        [false, 'loaders'],
        [true, 'stays 1.x'],
      ],
    },
  ]
  return (
    <Figure
      bleed
      title="One SolidStart 2 app, three paths"
      legend={[
        { label: 'keeps it as it is', mark: 'sand' },
        { label: 'rewrites it', mark: 'rose' },
      ]}
    >
      <svg
        viewBox="0 0 640 196"
        role="img"
        aria-label="Staying keeps all six parts. Start mode keeps route files and use server functions but rewrites components, entries, data reads and the Solid version. TanStack Start keeps components and Solid 1.x but rewrites routes, server functions, entries and data reads."
      >
        {heads.map((head, index) => (
          <text
            key={head}
            x={196 + index * 80}
            y="20"
            textAnchor="middle"
            style={TINY}
          >
            {head}
          </text>
        ))}
        {rows.map((row, rowIndex) => {
          const y = 32 + rowIndex * 42
          return (
            <g key={row.label}>
              <text
                className="fig-strong"
                x="10"
                y={y + 21}
                style={{ fontSize: 11 }}
              >
                {row.label}
              </text>
              {row.cells.map(([keep, text], index) => (
                <g key={heads[index]}>
                  <rect
                    x={158 + index * 80}
                    y={y}
                    width={76}
                    height={34}
                    filter="url(#pp-marker)"
                    style={{ fill: keep ? MARKS.sand : MARKS.rose }}
                  />
                  {text ? (
                    <text
                      x={196 + index * 80}
                      y={y + 21}
                      textAnchor="middle"
                      style={{ fontSize: 9.5 }}
                    >
                      {text}
                    </text>
                  ) : null}
                </g>
              ))}
            </g>
          )
        })}
        <HandNote x={500} y={178} text="2.0 flavour still RC" rotate={-2} />
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Post 4: the same app, built twice                                   */
/* ------------------------------------------------------------------ */

/** One "Add" submit: one request against two. */
export function MutationRoundTrips() {
  return (
    <Figure
      bleed
      title={'One "Add" submit'}
      legend={[
        { label: 'browser', mark: 'sand' },
        { label: 'server', mark: 'blue' },
      ]}
    >
      <svg
        viewBox="0 0 640 250"
        role="img"
        aria-label="Adding a note costs one request in Solid Start mode, where the action response carries the refreshed list, and two requests in TanStack Start, a POST and then a GET for the loader."
      >
        <text x="320" y="16" textAnchor="middle" style={TINY}>
          optimistic row shown at once, from createOptimisticStore
        </text>

        <text className="fig-strong" x="10" y="42">
          Solid Start mode
        </text>
        <Lifelines x1={30} x2={290} y={70} h={120} />
        <Trip x1={38} x2={282} y={100} label="POST /_server/data/addNote" />
        <Trip
          x1={282}
          x2={38}
          y={150}
          label="result + fresh notes list (single flight)"
          strong
        />
        <Box x={10} y={206} w={110} h={30} mark="blue" strong>
          1 request
        </Box>

        <path className="fig-axis" strokeDasharray="2 6" d="M320 30V244" />

        <text className="fig-strong" x="340" y="42">
          TanStack Start
        </text>
        <Lifelines x1={360} x2={620} y={70} h={120} />
        <Trip x1={368} x2={612} y={92} label="POST /_serverFn/data/<hash>" />
        <Trip x1={612} x2={368} y={118} label="new note" />
        <Trip
          x1={368}
          x2={612}
          y={154}
          label="GET /_serverFn/data/<hash>, loader: getNotes"
        />
        <Trip x1={612} x2={368} y={180} label="notes list" />
        <Box x={340} y={206} w={110} h={30} mark="sand" strong>
          2 requests
        </Box>
      </svg>
    </Figure>
  )
}

/** One navigation from /notes to /notes/3: when each read starts. */
export function NavigationPath() {
  return (
    <Figure
      bleed
      title="One navigation, from /notes to /notes/3"
      caption="Time runs from top to bottom. Each framework fetches one route chunk and two server function reads."
      legend={[
        { label: 'reads start together', mark: 'blue' },
        { label: 'the second read waits for this one', mark: 'sand' },
      ]}
    >
      <svg
        viewBox="0 0 640 292"
        role="img"
        aria-label="Both frameworks fetch one route chunk and two server function reads for the navigation; Solid starts both reads at once from the route preload, TanStack starts the comments read after the awaited note read in its loader."
      >
        <text className="fig-strong" x="10" y="20">
          Solid Start mode
        </text>
        <text x="10" y="38" style={TINY}>
          {'click <a href=/notes/3>, router matches /notes/:id'}
        </text>
        <rect
          x={22}
          y={74}
          width={276}
          height={74}
          filter="url(#pp-marker)"
          style={{ fill: MARKS.blue }}
          opacity="0.35"
        />
        <Lifelines x1={30} x2={290} y={66} h={150} />
        <Trip x1={38} x2={282} y={94} label="_id_-….js (0.7 KB)" />
        <Trip x1={38} x2={282} y={116} label="getNote" />
        <Trip x1={38} x2={282} y={138} label="getComments" />
        <text x="46" y="176" style={TINY}>
          {'note renders, <Loading> shows fallback'}
        </text>
        <text x="46" y="206" style={TINY}>
          comments arrive after 200 ms, boundary fills
        </text>

        <path className="fig-axis" strokeDasharray="2 6" d="M320 8V286" />

        <text className="fig-strong" x="340" y="20">
          TanStack Start
        </text>
        <text x="340" y="38" style={TINY}>
          {'click <Link to=/notes/$id>, router runs the loader'}
        </text>
        <rect
          x={352}
          y={74}
          width={276}
          height={30}
          filter="url(#pp-marker)"
          style={{ fill: MARKS.sand }}
          opacity="0.5"
        />
        <rect x={352} y={118} width={276} height={50} filter="url(#pp-marker)" style={{ fill: MARKS.blue }} opacity="0.35" />
        <Lifelines x1={360} x2={620} y={66} h={190} />
        <Trip x1={368} x2={612} y={94} label="getNote, awaited" />
        <Trip x1={368} x2={612} y={136} label="notes._id-….js" />
        <Trip x1={368} x2={612} y={158} label="getComments" />
        <text x="376" y="200" style={TINY}>
          {'note renders, <Await> in <Loading> shows fallback'}
        </text>
        <text x="376" y="230" style={TINY}>
          comments arrive after 200 ms
        </text>
      </svg>
    </Figure>
  )
}
