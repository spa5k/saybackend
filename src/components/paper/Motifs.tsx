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
}

export type MotifSpec = {
  name: MotifName
  /** The kind of paper behind the drawing. */
  paper?: PaperName
  /** Words for the motifs that show text: chain, pipeline, bands. */
  labels?: Array<string>
  /** Index of the highlighted item, for pipeline. */
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
              style={{ stroke: color, ...delay(index * 0.1) }}
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
