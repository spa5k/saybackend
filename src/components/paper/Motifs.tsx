import { MARKS } from './Figure'
import type { MarkName } from './Figure'
import type { CSSProperties, ReactNode } from 'react'

export type MotifName =
  | 'lanes'
  | 'blocks'
  | 'pipeline'
  | 'bits'
  | 'bands'
  | 'squares'
  | 'chain'
  | 'layers'
  | 'bars'
  | 'ranks'
  | 'day'
  | 'repack'
  | 'folder'
  | 'route'
  | 'merge'
  | 'split'
  | 'quorum'
  | 'shrink'
  | 'stream'
  | 'orbit'
  | 'pulse'
  | 'sandbox'
  | 'window'
  | 'order'
  | 'ratchet'
  | 'tiers'
  | 'kept'
  | 'minutes'
  | 'store'
  | 'graph'

export type PaperName = 'grid' | 'dots' | 'ruled' | 'plus' | 'iso' | 'blueprint'

/** The paper that suits each drawing, when a page does not choose one. */
export const PAPER_OF: Record<MotifName, PaperName> = {
  lanes: 'dots',
  blocks: 'dots',
  pipeline: 'blueprint',
  bits: 'plus',
  bands: 'ruled',
  squares: 'plus',
  chain: 'dots',
  layers: 'iso',
  bars: 'plus',
  ranks: 'ruled',
  day: 'dots',
  repack: 'plus',
  folder: 'dots',
  route: 'dots',
  merge: 'dots',
  split: 'dots',
  quorum: 'plus',
  shrink: 'plus',
  stream: 'ruled',
  orbit: 'plus',
  pulse: 'ruled',
  sandbox: 'plus',
  window: 'ruled',
  order: 'dots',
  ratchet: 'plus',
  tiers: 'ruled',
  kept: 'dots',
  minutes: 'plus',
  store: 'plus',
  graph: 'dots',
}

export type MotifSpec = {
  name: MotifName
  /** The kind of paper behind the drawing. */
  paper?: PaperName
  /** Words for the motifs that show text: chain, pipeline, bands. */
  labels?: Array<string>
  /** Index of the highlighted item, for pipeline. The variant, for sandbox, store
   * and graph. */
  accent?: number
}

const L = MARKS.lilac
const B = MARKS.blue
const S = MARKS.sand
const A = MARKS.amber
const R = MARKS.rose
const G = MARKS.sage

// A fixed sequence, so the server and the browser draw the same picture.
function sequence(seed: number) {
  let state = seed
  return () => {
    state = (state * 16807) % 2147483647
    return state / 2147483647
  }
}

const delay = (seconds: number) =>
  ({ animationDelay: `${seconds.toFixed(2)}s` }) as CSSProperties

function Pop({
  x,
  y,
  w,
  h,
  fill,
  opacity,
}: {
  x: number
  y: number
  w: number
  h: number
  fill: string
  opacity?: number
}) {
  return (
    <rect x={x} y={y} width={w} height={h} opacity={opacity} style={{ fill }} />
  )
}

function Label({
  x,
  y,
  children,
  mono = false,
  size = 17,
}: {
  x: number
  y: number
  children: ReactNode
  mono?: boolean
  size?: number
}) {
  return (
    <text
      className={mono ? 'motif-text motif-mono' : 'motif-text'}
      x={x}
      y={y}
      textAnchor={mono ? 'start' : 'middle'}
      fontSize={size}
    >
      {children}
    </text>
  )
}

/**
 * The large drawings behind page titles. Each one is drawn in a 1240 x 400
 * box, with the busy part on the right so the title has room on the left.
 */
export function Motif({ name, labels, accent }: Omit<MotifSpec, 'paper'>) {
  switch (name) {
    case 'lanes': {
      const lanes: Array<[string, number, number]> = [
        [R, 50, 150],
        [A, 80, 180],
        [L, 110, 150],
        [B, 140, 210],
        [G, 170, 180],
        [R, 200, 210],
        [A, 230, 150],
      ]
      return (
        <g filter="url(#pp-line)">
          {lanes.map(([color, from, to], index) => (
            <path
              key={index}
              className="motif-lane"
              pathLength="1"
              style={{
                stroke: color.replace('--m-', '--l-'),
                ...delay(index * 0.1),
              }}
              d={`M-20 ${from}H${400 + index * 34}C${540 + index * 34} ${from} ${580 + index * 30} ${to} ${720 + index * 30} ${to}H1260`}
            />
          ))}
        </g>
      )
    }
    case 'blocks': {
      const rows = [
        [A, A, A],
        [L, L, L, A],
        [L, L, L, L, A],
        [L, L, L, L, L, A],
      ]
      return (
        <g filter="url(#pp-marker)">
          {rows.map((row, y) =>
            row.map((color, x) => (
              <Pop
                key={`${y}-${x}`}
                x={724 + x * 86}
                y={40 + y * 62}
                w={76}
                h={46}
                fill={color}
              />
            )),
          )}
        </g>
      )
    }
    case 'squares': {
      const next = sequence(5)
      const colors = [L, B, S, A]
      const cells: Array<ReactNode> = []
      for (let y = 0; y < 15; y += 1) {
        for (let x = 0; x < 44; x += 1) {
          const keep = next() <= 0.06 + (x / 44) * 0.32
          // Leave the lower left clear for the title.
          if (!keep || (x < 24 && y > 2)) continue
          cells.push(
            <Pop
              key={`${x}-${y}`}
              x={x * 28 + 2}
              y={y * 28 + 2}
              w={24}
              h={24}
              fill={colors[Math.floor(next() * next() * 4)]}
            />,
          )
        }
      }
      return <g filter="url(#pp-marker)">{cells}</g>
    }
    case 'pipeline': {
      const stages = labels ?? [
        'SQL text',
        'Parser',
        'Analyzer',
        'Planner',
        'Executor',
        'Results',
      ]
      const hooked = accent ?? 2
      return (
        <g>
          <g filter="url(#pp-marker)">
            {stages.map((stage, index) => (
              <Pop
                key={stage}
                x={624 + index * 102}
                y={60}
                w={92}
                h={64}
                fill={index === hooked ? G : S}
              />
            ))}
          </g>
          {stages.map((stage, index) => (
            <Label key={stage} x={670 + index * 102} y={97} size={13}>
              {stage}
            </Label>
          ))}
          <path
            className="fig-axis"
            strokeDasharray="4 4"
            d={`M${670 + hooked * 102} 128V176`}
          />
          <text
            className="motif-hand"
            x={682 + hooked * 102}
            y={170}
            transform={`rotate(-3 ${682 + hooked * 102} 170)`}
          >
            the hook goes here
          </text>
        </g>
      )
    }
    case 'bits': {
      const parts: Array<[number, number, string]> = [
        [0, 440, B],
        [444, 36, R],
        [484, 110, G],
        [598, 18, A],
        [620, 560, L],
      ]
      return (
        <g>
          <g filter="url(#pp-marker)">
            {parts.map(([x, w, color]) => (
              <Pop key={x} x={30 + x} y={70} w={w} h={84} fill={color} />
            ))}
          </g>
          <Label x={30} y={196} mono size={24}>
            TTTTTTTT-TTTT-7RRR-VARR-RRRRRRRRRRRR
          </Label>
        </g>
      )
    }
    case 'bands': {
      const lines = labels ?? [
        'Effective text segmentation acts as a',
        'cognitive aid for language models.',
      ]
      const marks = [
        [L, B],
        [A, G],
      ]
      return (
        <g>
          {lines.map((line, index) => (
            <Label key={line} x={736} y={90 + index * 90} mono size={22}>
              {line}
            </Label>
          ))}
          <g filter="url(#pp-marker)">
            {lines.map((line, index) => {
              const width = line.length * 13.2
              const pair = marks[index % 2]
              return (
                <g key={line}>
                  <Pop
                    x={736}
                    y={104 + index * 90}
                    w={width * 0.56}
                    h={12}
                    fill={pair[0]}
                  />
                  <Pop
                    x={736 + width * 0.5}
                    y={119 + index * 90}
                    w={width * 0.5}
                    h={12}
                    fill={pair[1]}
                  />
                </g>
              )
            })}
          </g>
        </g>
      )
    }
    case 'chain': {
      const steps = labels ?? ['one', 'two', 'three']
      const colors = [S, A, L, B, G]
      const width = Math.min(210, 560 / steps.length - 36)
      const left = 1180 - steps.length * (width + 36)
      return (
        <g>
          <g filter="url(#pp-marker)">
            {steps.map((step, index) => (
              <Pop
                key={step}
                x={left + index * (width + 36)}
                y={84}
                w={width}
                h={70}
                fill={colors[index % colors.length]}
              />
            ))}
          </g>
          {steps.map((step, index) => (
            <g key={step}>
              <Label x={left + index * (width + 36) + width / 2} y={125}>
                {step}
              </Label>
              {index > 0 ? (
                <path
                  className="flow-edge"
                  markerEnd="url(#pp-arrow)"
                  d={`M${left + index * (width + 36) - 30} 119H${left + index * (width + 36) - 5}`}
                />
              ) : null}
            </g>
          ))}
        </g>
      )
    }
    case 'sandbox': {
      // Code mode. A program in a box, and the calls that leave it. The
      // variant changes the one thing its post is about.
      const variant = accent ?? 0
      const line = (d: string, width = 6, stroke: string = S) => (
        <path d={d} style={{ fill: 'none', stroke, strokeWidth: width }} />
      )
      const box = (x: number, y: number, w: number, h: number, o = 1) => (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          opacity={o}
          style={{ fill: 'none', stroke: S, strokeWidth: 8 }}
        />
      )
      if (variant === 4) {
        // Five sandboxes, from the farthest wall to the closest.
        const fills = [S, L, B, A, G]
        return (
          <g filter="url(#pp-marker)">
            {fills.map((fill, index) => {
              const x = 650 + index * 118
              const pad = 34 - index * 7
              return (
                <g key={index}>
                  {box(x, 60, 96, 180)}
                  <Pop
                    x={x + pad}
                    y={60 + pad}
                    w={96 - pad * 2}
                    h={180 - pad * 2}
                    fill={fill}
                  />
                </g>
              )
            })}
          </g>
        )
      }
      const tools =
        variant === 3
          ? Array.from({ length: 12 }, (_, index) => ({
              x: 1010 + (index % 3) * 74,
              y: 62 + Math.floor(index / 3) * 46,
              w: 62,
            }))
          : [0, 1, 2, 3, 4].map((index) => ({
              x: 1090,
              y: 44 + index * 44,
              w: 130,
            }))
      return (
        <g filter="url(#pp-marker)">
          {variant === 1 && box(640, 30, 290, 240, 0.55)}
          {box(664, 54, 242, 192)}
          {variant === 3 && <Pop x={664} y={24} w={104} h={26} fill={B} />}
          <Pop x={694} y={88} w={150} h={20} fill={L} />
          <Pop x={694} y={122} w={110} h={20} fill={L} />
          <Pop x={694} y={156} w={176} h={20} fill={L} />
          <Pop x={694} y={190} w={84} h={20} fill={L} />
          {variant === 3
            ? line('M910 150H1000', 12)
            : tools.map((tool, index) => (
                <g key={index}>
                  {line(
                    `M910 150C1000 150 990 ${tool.y + 16} 1086 ${tool.y + 16}`,
                  )}
                </g>
              ))}
          {tools.map((tool, index) => (
            <Pop
              key={index}
              x={tool.x}
              y={tool.y}
              w={tool.w}
              h={32}
              fill={S}
              opacity={variant === 2 && index === 3 ? 0.4 : 1}
            />
          ))}
          {variant === 2 &&
            tools.map((tool, index) => (
              <Pop
                key={index}
                x={1040}
                y={tool.y + 4}
                w={24}
                h={24}
                fill={index === 3 ? R : A}
              />
            ))}
        </g>
      )
    }
    case 'window':
      // The token history. Only the window at the end is copied.
      return (
        <g filter="url(#pp-marker)">
          {Array.from({ length: 13 }, (_, index) => (
            <Pop
              key={index}
              x={650 + index * 44}
              y={126}
              w={36}
              h={48}
              fill={index > 9 ? B : S}
              opacity={index > 9 ? 1 : 0.6}
            />
          ))}
          <rect
            x={1080}
            y={110}
            width={142}
            height={80}
            style={{ fill: 'none', stroke: B, strokeWidth: 8 }}
          />
        </g>
      )
    case 'order':
      // A queue in order. One entry leaves from the middle.
      return (
        <g filter="url(#pp-marker)">
          {[0, 1, 2, 3, 4, 5, 6].map((index) =>
            index === 4 ? (
              <Pop
                key={index}
                x={650 + index * 82}
                y={70}
                w={70}
                h={56}
                fill={A}
              />
            ) : (
              <Pop
                key={index}
                x={650 + index * 82}
                y={164}
                w={70}
                h={56}
                fill={S}
              />
            ),
          )}
          <Pop x={650} y={240} w={562} h={8} fill={S} opacity={0.6} />
        </g>
      )
    case 'ratchet':
      // The count goes down in steps and cannot go back up.
      return (
        <g filter="url(#pp-marker)">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Pop
              key={index}
              x={660 + index * 92}
              y={50 + index * 30}
              w={84}
              h={210 - index * 30}
              fill={index === 5 ? R : S}
            />
          ))}
        </g>
      )
    case 'tiers':
      // Four levels of proof. Each one needs more and proves more.
      return (
        <g filter="url(#pp-marker)">
          {[0, 1, 2, 3].map((index) => (
            <Pop
              key={index}
              x={660}
              y={50 + index * 56}
              w={200 + index * 116}
              h={42}
              fill={index === 3 ? G : S}
            />
          ))}
        </g>
      )
    case 'kept':
      // Three review agents. One stayed.
      return (
        <g filter="url(#pp-marker)">
          <Pop x={660} y={70} w={210} h={30} fill={S} opacity={0.6} />
          <Pop x={660} y={135} w={560} h={30} fill={A} />
          <Pop x={660} y={200} w={340} h={30} fill={S} opacity={0.6} />
        </g>
      )
    case 'store': {
      // Rust on a laptop. Where the build output is kept, and how much of it.
      const variant = accent ?? 0
      const line = (d: string, width = 6, stroke: string = S) => (
        <path d={d} style={{ fill: 'none', stroke, strokeWidth: width }} />
      )
      const box = (x: number, y: number, w: number, h: number, o = 1) => (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          opacity={o}
          style={{ fill: 'none', stroke: S, strokeWidth: 8 }}
        />
      )
      if (variant === 1)
        // Five worktrees, one store. Each keeps a thin layer of its own.
        return (
          <g filter="url(#pp-marker)">
            {[0, 1, 2, 3, 4].map((index) => (
              <g key={index}>
                {line(
                  `M800 ${62 + index * 46}C920 ${62 + index * 46} 920 150 1030 150`,
                )}
                <Pop x={660} y={46 + index * 46} w={120} h={32} fill={S} />
                <Pop x={660} y={46 + index * 46} w={18} h={32} fill={L} />
              </g>
            ))}
            <Pop x={1040} y={84} w={170} h={132} fill={B} />
          </g>
        )
      if (variant === 2)
        // One donor checkout. The worktrees share its blocks.
        return (
          <g filter="url(#pp-marker)">
            <Pop x={660} y={60} w={150} h={120} fill={B} />
            <Pop x={660} y={198} w={150} h={44} fill={S} opacity={0.5} />
            {[0, 1, 2, 3, 4].map((index) => (
              <g key={index}>
                {line(
                  `M814 120C900 120 900 ${62 + index * 46} 980 ${62 + index * 46}`,
                  4,
                )}
                {box(990, 46 + index * 46, 220, 32, 0.8)}
                <Pop
                  x={1000 + index * 34}
                  y={54 + index * 46}
                  w={26}
                  h={16}
                  fill={A}
                />
              </g>
            ))}
          </g>
        )
      if (variant === 3) {
        // Edit, front end, codegen, link, run. The link step shrinks.
        const before = [70, 130, 150, 150, 60]
        const after = [70, 130, 150, 34, 60]
        const row = (widths: Array<number>, y: number, live: boolean) => {
          let x = 650
          return widths.map((width, index) => {
            const at = x
            x += width + 10
            return (
              <Pop
                key={index}
                x={at}
                y={y}
                w={width}
                h={52}
                fill={live && index === 3 ? A : S}
                opacity={live ? 1 : 0.55}
              />
            )
          })
        }
        return (
          <g filter="url(#pp-marker)">
            {row(before, 70, false)}
            {row(after, 170, true)}
          </g>
        )
      }
      if (variant === 4)
        // The cache stays on the build machine. Only the binary ships.
        return (
          <g filter="url(#pp-marker)">
            {box(660, 50, 300, 200)}
            {[0, 1, 2, 3].map((index) => (
              <Pop
                key={index}
                x={684}
                y={74 + index * 42}
                w={[220, 252, 180, 236][index]}
                h={26}
                fill={S}
              />
            ))}
            {line('M966 150H1076', 6)}
            {box(1086, 96, 108, 108)}
            <Pop x={1120} y={130} w={40} h={40} fill={G} />
          </g>
        )
      // One dependency, stored twice: inside the archive and beside it.
      return (
        <g filter="url(#pp-marker)">
          {box(660, 56, 250, 188)}
          {[0, 1, 2, 3].map((index) => (
            <g key={index}>
              <Pop
                x={684}
                y={80 + index * 40}
                w={[190, 150, 202, 126][index]}
                h={24}
                fill={S}
              />
              <Pop
                x={970}
                y={80 + index * 40}
                w={[190, 150, 202, 126][index]}
                h={24}
                fill={R}
              />
            </g>
          ))}
        </g>
      )
    }
    case 'graph': {
      // Solid and TanStack Start. Pieces of an app and the paths between
      // them.
      const variant = accent ?? 0
      const line = (d: string, width = 6, stroke: string = S) => (
        <path d={d} style={{ fill: 'none', stroke, strokeWidth: width }} />
      )
      if (variant === 1)
        // Each old piece and the piece that replaces it.
        return (
          <g filter="url(#pp-marker)">
            {[0, 1, 2, 3].map((index) => (
              <g key={index}>
                <Pop
                  x={660}
                  y={52 + index * 54}
                  w={[190, 150, 210, 130][index]}
                  h={32}
                  fill={S}
                  opacity={0.6}
                />
                {line(`M890 ${68 + index * 54}H990`, 5)}
                <Pop
                  x={1000}
                  y={52 + index * 54}
                  w={[170, 210, 140, 190][index]}
                  h={32}
                  fill={B}
                />
              </g>
            ))}
          </g>
        )
      if (variant === 2)
        // One framework, three ways on.
        return (
          <g filter="url(#pp-marker)">
            <Pop x={660} y={116} w={170} h={68} fill={S} />
            {[L, B, G].map((fill, index) => (
              <g key={index}>
                {line(
                  `M834 150C930 150 930 ${76 + index * 74} 1030 ${76 + index * 74}`,
                )}
                <Pop x={1040} y={54 + index * 74} w={170} h={44} fill={fill} />
              </g>
            ))}
          </g>
        )
      if (variant === 3)
        // The build in order. The file list is made before the prerender.
        return (
          <g filter="url(#pp-marker)">
            <Pop x={650} y={126} w={150} h={48} fill={S} />
            <Pop x={810} y={126} w={130} h={48} fill={S} />
            <Pop x={950} y={126} w={70} h={48} fill={A} />
            <Pop x={1030} y={126} w={190} h={48} fill={B} />
            <Pop x={981} y={60} w={8} h={180} fill={A} />
            <Pop x={650} y={196} w={570} h={6} fill={S} opacity={0.6} />
          </g>
        )
      if (variant === 4)
        // One source file becomes a client stub and a server module.
        return (
          <g filter="url(#pp-marker)">
            <Pop x={660} y={70} w={190} h={160} fill={S} />
            {line('M854 150C910 150 910 86 968 86', 5)}
            {line('M854 150C910 150 910 204 968 204', 5)}
            <Pop x={978} y={64} w={110} h={44} fill={L} />
            <Pop x={978} y={168} w={232} h={72} fill={B} />
            {line('M1033 112V164', 8, A)}
          </g>
        )
      if (variant === 5)
        // The same click. Two reads at once, or one after the other.
        return (
          <g filter="url(#pp-marker)">
            <Pop x={660} y={62} w={34} h={34} fill={A} />
            <Pop x={730} y={52} w={230} h={22} fill={L} />
            <Pop x={730} y={84} w={230} h={22} fill={L} />
            <Pop x={660} y={190} w={34} h={34} fill={A} />
            <Pop x={730} y={180} w={230} h={22} fill={B} />
            <Pop x={970} y={212} w={230} h={22} fill={B} />
            <Pop x={650} y={140} w={570} h={6} fill={S} opacity={0.6} />
          </g>
        )
      if (variant === 6)
        // The Worker writes its own files. A request meets the files first.
        return (
          <g filter="url(#pp-marker)">
            <Pop x={660} y={106} w={150} h={88} fill={B} />
            {line('M814 150H880', 5)}
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Pop
                key={index}
                x={890 + (index % 3) * 52}
                y={92 + Math.floor(index / 3) * 64}
                w={40}
                h={52}
                fill={S}
              />
            ))}
            {line('M1220 150H1056', 10, A)}
          </g>
        )
      // A pending node. Its readers keep the old value until it lands.
      return (
        <g filter="url(#pp-marker)">
          {line('M740 150H860')}
          <Pop x={670} y={122} w={66} h={56} fill={S} />
          <Pop x={870} y={122} w={66} h={56} fill={A} />
          {[0, 1, 2].map((index) => (
            <g key={index}>
              {line(
                `M940 150C1010 150 1010 ${76 + index * 74} 1080 ${76 + index * 74}`,
                5,
              )}
              <Pop x={1090} y={54 + index * 74} w={110} h={44} fill={L} />
            </g>
          ))}
        </g>
      )
    }
    case 'minutes':
      // Short jobs inside the whole minutes they are billed for.
      return (
        <g filter="url(#pp-marker)">
          {[
            [1, 0.15],
            [1, 0.24],
            [2, 0.62],
            [3, 0.8],
          ].map(([billed, used], index) => (
            <g key={index}>
              {Array.from({ length: billed }, (_, minute) => (
                <Pop
                  key={minute}
                  x={660 + minute * 186}
                  y={48 + index * 56}
                  w={178}
                  h={40}
                  fill={S}
                />
              ))}
              <Pop
                x={660}
                y={48 + index * 56}
                w={Math.round(billed * 186 * used)}
                h={40}
                fill={B}
              />
            </g>
          ))}
        </g>
      )
    case 'repack': {
      // A table with holes on the left, the same rows packed on the right.
      const next = sequence(19)
      return (
        <g filter="url(#pp-marker)">
          {Array.from({ length: 25 }, (_, index) => {
            const full = next() > 0.48
            return (
              <Pop
                key={index}
                x={660 + (index % 5) * 44}
                y={40 + Math.floor(index / 5) * 42}
                w={36}
                h={32}
                fill={full ? B : S}
                opacity={full ? 1 : 0.75}
              />
            )
          })}
          {Array.from({ length: 15 }, (_, index) => (
            <Pop
              key={index}
              x={980 + (index % 5) * 44}
              y={40 + Math.floor(index / 5) * 42}
              w={36}
              h={32}
              fill={B}
            />
          ))}
        </g>
      )
    }
    case 'folder':
      // The standalone folder, and the two folders the build leaves out.
      return (
        <g filter="url(#pp-marker)">
          <Pop x={680} y={56} w={320} h={52} fill={G} />
          <Pop x={680} y={120} w={150} h={52} fill={G} />
          <Pop x={842} y={120} w={158} h={52} fill={G} />
          <Pop x={680} y={184} w={320} h={52} fill={G} />
          <Pop x={1060} y={88} w={150} h={52} fill={S} />
          <Pop x={1060} y={152} w={150} h={52} fill={S} />
        </g>
      )
    case 'route':
      // Two clients join at the proxy. The request stops at the fault.
      return (
        <g filter="url(#pp-marker)">
          <path
            d="M650 66C800 66 790 150 900 150"
            style={{ fill: 'none', stroke: S, strokeWidth: 18 }}
          />
          <path
            d="M650 234C800 234 790 150 900 150"
            style={{ fill: 'none', stroke: S, strokeWidth: 18 }}
          />
          <Pop x={890} y={136} w={170} h={28} fill={A} />
          <Pop x={1080} y={120} w={28} h={60} fill={R} />
          <Pop x={1128} y={136} w={100} h={28} fill={S} opacity={0.45} />
        </g>
      )
    case 'merge':
      // Many clients join at the proxy, then one line goes on.
      return (
        <g filter="url(#pp-marker)">
          {[0, 1, 2, 3, 4].map((index) => (
            <path
              key={index}
              d={`M650 ${50 + index * 50}C800 ${50 + index * 50} 800 150 900 150`}
              style={{ fill: 'none', stroke: S, strokeWidth: 10 }}
            />
          ))}
          <Pop x={894} y={136} w={150} h={28} fill={A} />
          <Pop x={1060} y={136} w={160} h={28} fill={L} />
        </g>
      )
    case 'split':
      // One line comes in and goes to one of two subscriptions.
      return (
        <g filter="url(#pp-marker)">
          <Pop x={650} y={136} w={220} h={28} fill={S} />
          <path
            d="M862 150C960 150 950 80 1046 80"
            style={{ fill: 'none', stroke: A, strokeWidth: 18 }}
          />
          <path
            d="M862 150C960 150 950 220 1046 220"
            style={{ fill: 'none', stroke: L, strokeWidth: 18 }}
          />
          <Pop x={1040} y={66} w={176} h={28} fill={A} />
          <Pop x={1040} y={206} w={176} h={28} fill={L} />
        </g>
      )
    case 'quorum':
      // Three brokers, and one of them leads.
      return (
        <g filter="url(#pp-marker)">
          <path
            d="M830 90H1050L940 230Z"
            style={{ fill: 'none', stroke: S, strokeWidth: 8 }}
          />
          <circle cx="830" cy="90" r="40" style={{ fill: S }} />
          <circle cx="1050" cy="90" r="40" style={{ fill: S }} />
          <circle cx="940" cy="230" r="40" style={{ fill: A }} />
        </g>
      )
    case 'shrink':
      // A full install next to the standalone folder.
      return (
        <g filter="url(#pp-marker)">
          <Pop x={690} y={40} w={220} h={220} fill={S} />
          <Pop x={960} y={164} w={96} h={96} fill={G} />
        </g>
      )
    case 'stream':
      // The server sends pieces across the boundary to the client.
      return (
        <g filter="url(#pp-marker)">
          <Pop x={660} y={70} w={150} h={160} fill={S} />
          <Pop
            x={846}
            y={40}
            w={8}
            h={220}
            fill="var(--ink-soft)"
            opacity={0.5}
          />
          {[0, 1, 2, 3, 4].map((index) => (
            <Pop
              key={index}
              x={886 + index * 68}
              y={136}
              w={50}
              h={28}
              fill={G}
              opacity={1 - index * 0.17}
            />
          ))}
        </g>
      )
    case 'orbit':
      // Workers round a control plane.
      return (
        <g filter="url(#pp-marker)">
          <Pop x={908} y={118} w={64} h={64} fill={L} />
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const angle = (index / 6) * Math.PI * 2 + 0.5
            return (
              <Pop
                key={index}
                x={Math.round(920 + Math.cos(angle) * 200)}
                y={Math.round(130 + Math.sin(angle) * 100)}
                w={40}
                h={40}
                fill={S}
              />
            )
          })}
        </g>
      )
    case 'pulse':
      // A health check trace.
      return (
        <g filter="url(#pp-marker)">
          <path
            d="M650 160H800L840 70L890 240L930 120L960 160H1220"
            style={{
              fill: 'none',
              stroke: G,
              strokeWidth: 12,
              strokeLinejoin: 'round',
            }}
          />
        </g>
      )
    case 'layers':
      return (
        <g filter="url(#pp-marker)">
          {Array.from({ length: 6 }, (_, index) => (
            <Pop
              key={index}
              x={660}
              y={40 + index * 34}
              w={240}
              h={26}
              fill={S}
            />
          ))}
          <Pop x={960} y={210} w={220} h={26} fill={L} />
        </g>
      )
    case 'bars':
      return (
        <g filter="url(#pp-marker)">
          <Pop x={700} y={60} w={110} h={200} fill={S} />
          <Pop x={826} y={256} w={110} h={4} fill={L} />
          <Pop x={990} y={110} w={110} h={150} fill={S} />
          <Pop x={1116} y={256} w={110} h={4} fill={L} />
        </g>
      )
    case 'ranks': {
      const widths: Array<[number, MarkName]> = [
        [560, 'lilac'],
        [265, 'lilac'],
        [209, 'amber'],
        [177, 'lilac'],
        [142, 'amber'],
        [134, 'amber'],
        [69, 'amber'],
        [46, 'amber'],
      ]
      return (
        <g filter="url(#pp-marker)">
          {widths.map(([width, mark], index) => (
            <Pop
              key={index}
              x={640}
              y={36 + index * 30}
              w={width}
              h={20}
              fill={MARKS[mark]}
            />
          ))}
        </g>
      )
    }
    case 'day':
      return (
        <g filter="url(#pp-marker)">
          {Array.from({ length: 14 }, (_, index) => (
            <Pop
              key={index}
              x={600 + index * 44}
              y={110}
              w={36}
              h={36}
              fill={index < 8 ? A : 'var(--ink-soft)'}
            />
          ))}
        </g>
      )
  }
}

/** A small version of a motif, for one row of a post list. */
export function MiniMotif({ name }: { name: MotifName }) {
  const shapes: Record<
    MotifName,
    Array<[number, number, number, number, string]>
  > = {
    blocks: [0, 1, 2, 3].map((x) => [x * 38, 6, 32, 22, x === 3 ? A : L]),
    ranks: [150, 90, 62, 36].map((w, y) => [0, y * 9, w, 6, y < 2 ? L : A]),
    bars: [
      [30, 0, 36, 34, S],
      [76, 31, 36, 3, L],
    ],
    chain: [S, A, L, B].map((c, x) => [x * 38, 8, 30, 18, c]),
    pipeline: [S, S, G, S, S, S].map((c, x) => [x * 25, 7, 20, 20, c]),
    bits: [
      [0, 6, 52, 22, B],
      [54, 6, 5, 22, R],
      [61, 6, 14, 22, G],
      [77, 6, 3, 22, A],
      [82, 6, 68, 22, L],
    ],
    lanes: [
      [0, 4, 150, 5, R],
      [0, 14, 110, 5, A],
      [0, 24, 150, 5, L],
    ],
    bands: [
      [0, 6, 90, 8, L],
      [70, 18, 80, 8, B],
    ],
    squares: [0, 1, 2, 3, 4, 5].map((x) => [x * 25, 7, 20, 20, x % 3 ? S : L]),
    layers: [
      [0, 2, 60, 7, S],
      [0, 12, 60, 7, S],
      [0, 22, 60, 7, S],
      [84, 22, 60, 7, L],
    ],
    repack: [
      [0, 5, 14, 10, B],
      [18, 5, 14, 10, S],
      [36, 5, 14, 10, B],
      [0, 19, 14, 10, S],
      [18, 19, 14, 10, B],
      [36, 19, 14, 10, B],
      [96, 5, 14, 10, B],
      [114, 5, 14, 10, B],
      [132, 5, 14, 10, B],
      [96, 19, 14, 10, B],
    ],
    folder: [
      [0, 3, 70, 8, G],
      [0, 13, 70, 8, G],
      [0, 23, 70, 8, G],
      [92, 8, 44, 8, S],
      [92, 18, 44, 8, S],
    ],
    route: [
      [0, 5, 56, 5, S],
      [0, 24, 56, 5, S],
      [60, 14, 44, 7, A],
      [110, 9, 8, 17, R],
      [124, 14, 26, 7, S],
    ],
    merge: [
      [0, 2, 50, 3, S],
      [0, 9, 50, 3, S],
      [0, 16, 50, 3, S],
      [0, 23, 50, 3, S],
      [0, 30, 50, 3, S],
      [56, 13, 44, 8, A],
      [104, 13, 44, 8, L],
    ],
    split: [
      [0, 13, 56, 8, S],
      [70, 4, 70, 8, A],
      [70, 22, 70, 8, L],
    ],
    quorum: [
      [20, 2, 16, 16, S],
      [80, 2, 16, 16, S],
      [50, 18, 16, 16, A],
    ],
    shrink: [
      [20, 0, 34, 34, S],
      [66, 20, 14, 14, G],
    ],
    stream: [
      [0, 4, 36, 26, S],
      [44, 0, 3, 34, S],
      [56, 13, 16, 8, G],
      [78, 13, 16, 8, G],
      [100, 13, 16, 8, G],
      [122, 13, 16, 8, G],
    ],
    orbit: [
      [64, 9, 16, 16, L],
      [20, 4, 10, 10, S],
      [20, 20, 10, 10, S],
      [112, 4, 10, 10, S],
      [112, 20, 10, 10, S],
      [40, 12, 10, 10, S],
      [94, 12, 10, 10, S],
    ],
    pulse: [
      [0, 15, 40, 4, G],
      [44, 4, 6, 26, G],
      [56, 10, 6, 20, G],
      [68, 15, 82, 4, G],
    ],
    sandbox: [
      [0, 2, 64, 30, S],
      [8, 8, 40, 5, L],
      [8, 16, 28, 5, L],
      [8, 24, 46, 5, L],
      [70, 15, 30, 4, S],
      [106, 2, 44, 8, S],
      [106, 13, 44, 8, S],
      [106, 24, 44, 8, S],
    ],
    window: [0, 1, 2, 3, 4, 5, 6].map((x) => [
      x * 22,
      7,
      18,
      20,
      x > 4 ? B : S,
    ]),
    order: [0, 1, 2, 3, 4, 5].map((x) => [
      x * 25,
      x === 3 ? 0 : 14,
      20,
      18,
      x === 3 ? A : S,
    ]),
    ratchet: [0, 1, 2, 3, 4].map((x) => [
      x * 30,
      x * 5,
      26,
      34 - x * 5,
      x === 4 ? R : S,
    ]),
    tiers: [0, 1, 2, 3].map((y) => [0, y * 9, 60 + y * 30, 6, y === 3 ? G : S]),
    kept: [
      [0, 3, 56, 7, S],
      [0, 14, 150, 7, A],
      [0, 25, 90, 7, S],
    ],
    minutes: [
      [0, 3, 72, 12, S],
      [0, 3, 14, 12, B],
      [0, 20, 72, 12, S],
      [76, 20, 72, 12, S],
      [0, 20, 92, 12, B],
    ],
    store: [
      [0, 2, 60, 30, S],
      [6, 8, 40, 5, B],
      [6, 16, 30, 5, B],
      [6, 24, 44, 5, B],
      [72, 4, 34, 6, S],
      [72, 14, 34, 6, S],
      [72, 24, 34, 6, S],
      [116, 12, 14, 10, G],
    ],
    graph: [
      [0, 12, 22, 12, S],
      [28, 16, 20, 4, S],
      [54, 10, 22, 16, A],
      [82, 16, 20, 4, S],
      [108, 2, 40, 8, L],
      [108, 13, 40, 8, L],
      [108, 24, 40, 8, L],
    ],
    day: [0, 1, 2, 3, 4, 5].map((x) => [
      x * 25,
      7,
      20,
      20,
      x < 3 ? A : 'var(--ink-soft)',
    ]),
  }
  return (
    <svg className="mini-motif" viewBox="0 0 150 34" aria-hidden="true">
      <g filter="url(#pp-marker)">
        {shapes[name].map(([x, y, w, h, fill], index) => (
          <rect key={index} x={x} y={y} width={w} height={h} style={{ fill }} />
        ))}
      </g>
    </svg>
  )
}
