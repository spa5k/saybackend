import type { MarkName } from './Figure'

/**
 * One line drawing per post, used at the top and at the foot of its page.
 * A scene draws the mechanism of its post with lines only, in a 1000 x 200
 * box that stretches to fit. It takes the time in seconds and the pointer
 * position (0 to 1 across the drawing, or null when nobody points at it).
 * Each call must return the same number of shapes in the same order.
 */
export type ShapeKind =
  'line' | 'far' | 'bold' | 'dash' | 'mark' | 'bar' | 'dot' | 'node' | 'run'

export type Shape = { d: string; k: ShapeKind; c?: MarkName }
export type Scene = (time: number, pointer: number | null) => Array<Shape>

const W = 1000
const PI = Math.PI
const n = (value: number) => Math.round(value * 10) / 10
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const seg = (x0: number, y: number, x1: number) => `M${n(x0)} ${y}H${n(x1)}`
const rise = (x: number, y0 = 10, y1 = 190) => `M${n(x)} ${y0}V${y1}`
const dot = (x: number, y: number) => `M${n(x)} ${n(y)}h0`
const NONE = 'M-60 0h0'

/** The pointer when present, or a slow swing round `mid`. */
const at = (
  pointer: number | null,
  time: number,
  mid: number,
  swing: number,
  speed: number,
) => (pointer ?? mid + swing * Math.sin(time * speed)) * W

function curve(y: (x: number) => number, x0 = 0, x1 = W, step = 10) {
  let d = ''
  for (let x = x0; x <= x1; x += step) d += `${d ? 'L' : 'M'}${x} ${n(y(x))}`
  return d
}

type Point = [number, number]
function bezier(a: Point, b: Point, c: Point, e: Point, u: number): Point {
  const v = 1 - u
  return [
    v * v * v * a[0] +
      3 * v * v * u * b[0] +
      3 * v * u * u * c[0] +
      u ** 3 * e[0],
    v * v * v * a[1] +
      3 * v * v * u * b[1] +
      3 * v * u * u * c[1] +
      u ** 3 * e[1],
  ]
}
const cubic = (a: Point, b: Point, c: Point, e: Point) =>
  `M${a[0]} ${a[1]}C${n(b[0])} ${n(b[1])} ${n(c[0])} ${n(c[1])} ${n(e[0])} ${n(e[1])}`

/** A fixed pseudo-random number from 0 to 1. */
const noise = (a: number, b = 0) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* Straight lines turn into hand-drawn lines. */
const rough: Scene = (t, p) => {
  const split = at(p, t, 0.4, 0.25, 0.5)
  return [0, 1, 2, 3, 4, 5].map((i) => ({
    k: i === 2 ? 'mark' : 'line',
    c: 'lilac',
    d: curve((x) => {
      const k = clamp((x - split) / 140)
      return (
        30 +
        i * 28 +
        k *
          (Math.sin(x * 0.045 + i * 2 + t) * 4 +
            Math.sin(x * 0.015 + i + t * 0.6) * 6)
      )
    }),
  }))
}

/* Jobs run in lanes to the finish line. */
const lanes: Scene = (t, p) => {
  const speed = 1 + (p ?? 0) * 3
  const colours: Array<MarkName> = ['lilac', 'blue', 'amber', 'sage']
  const lengths = [180, 280, 130, 230]
  const shapes: Array<Shape> = []
  for (let i = 0; i < 4; i += 1) {
    const y = 35 + i * 43
    const head = (t * speed * (110 + i * 35) + i * 260) % (940 + lengths[i])
    const from = Math.max(0, head - lengths[i])
    const to = Math.min(940, head)
    shapes.push({ k: 'far', d: seg(0, y, 940) })
    shapes.push({
      k: 'bar',
      c: colours[i],
      d: to > from ? seg(from, y, to) : NONE,
    })
  }
  shapes.push({ k: 'bold', d: rise(940, 14, 186) })
  return shapes
}

/* Each turn sends the same prefix again. The dashed line is the breakpoint. */
const prefix: Scene = (t, p) => {
  const cut = at(p, t, 0.3, 0.2, 0.6)
  const shapes: Array<Shape> = []
  for (let i = 0; i < 5; i += 1) {
    const length = 260 + i * 150
    const y = 30 + i * 35
    const cached = Math.min(length, Math.max(0, cut))
    shapes.push({
      k: 'bar',
      c: 'amber',
      d: cached > 4 ? seg(0, y, cached) : NONE,
    })
    shapes.push({
      k: 'line',
      d: cached < length ? seg(cached + 12, y, length) : NONE,
    })
  }
  shapes.push({ k: 'dash', d: rise(cut, 8, 192) })
  return shapes
}

/* Messy lines go through a gate and come out straight. */
const gate: Scene = (t, p) => {
  const g = at(p, t, 0.5, 0.15, 0.5)
  const shapes: Array<Shape> = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
    k: i === 3 ? 'mark' : 'line',
    c: 'rose',
    d: curve((x) => {
      const k = clamp((g - x) / 130)
      return (
        25 +
        i * 25 +
        k *
          (Math.sin(x * 0.03 + i * 1.7 - t * 2) * 10 +
            Math.sin(x * 0.08 + i - t * 3) * 5)
      )
    }),
  }))
  shapes.push({ k: 'bold', d: rise(g, 8, 192) })
  return shapes
}

/* Two paths between the same two points: the detour and the direct line. */
const detour: Scene = (t, p) => {
  const amount = 1 - (p ?? 0)
  const y = (x: number) => {
    const u = (x - 60) / 880
    return 100 + amount * Math.sin(u * PI * 5) * 74 * Math.sin(u * PI)
  }
  const slow = 60 + ((t * 0.05) % 1) * 880
  const fast = 60 + ((t * 0.9) % 1.3) * 880
  return [
    { k: 'far', d: curve(y, 60, 940) },
    { k: 'mark', c: 'lilac', d: seg(60, 100, 940) },
    { k: 'node', d: dot(60, 100) },
    { k: 'node', d: dot(940, 100) },
    { k: 'dot', c: 'sand', d: dot(slow, y(slow)) },
    { k: 'dot', c: 'lilac', d: fast <= 940 ? dot(fast, 100) : NONE },
  ]
}

/* Many clients join at the proxy, then one line goes on through the chain. */
const merge: Scene = (t, p) => {
  const x = at(p, t, 0.5, 0.1, 0.4)
  const shapes: Array<Shape> = [0, 1, 2, 3, 4].map((i) => ({
    k: 'line',
    d: cubic(
      [0, 20 + i * 40],
      [x * 0.5, 20 + i * 40],
      [x * 0.6, 100],
      [x, 100],
    ),
  }))
  const step = (W - x) / 3
  shapes.push({ k: 'mark', c: 'amber', d: seg(x, 100, W) })
  shapes.push({ k: 'run', c: 'blue', d: seg(x, 100, W) })
  shapes.push({ k: 'node', d: dot(x, 100) })
  shapes.push({ k: 'node', d: dot(x + step, 100) })
  shapes.push({ k: 'node', d: dot(x + step * 2, 100) })
  return shapes
}

/* One line comes in, the proxy sends it to one of two subscriptions. */
const split: Scene = (t, p) => {
  const x = at(p, t, 0.42, 0.1, 0.4)
  const up: [Point, Point, Point, Point] = [
    [x, 100],
    [x + 150, 100],
    [x + 200, 45],
    [W, 45],
  ]
  const down: [Point, Point, Point, Point] = [
    [x, 100],
    [x + 150, 100],
    [x + 200, 155],
    [W, 155],
  ]
  return [
    { k: 'line', d: seg(0, 100, x) },
    { k: 'mark', c: 'amber', d: cubic(...up) },
    { k: 'mark', c: 'blue', d: cubic(...down) },
    { k: 'node', d: dot(x, 100) },
    { k: 'dot', c: 'amber', d: dot(...bezier(...up, (t * 0.35) % 1)) },
    { k: 'dot', c: 'blue', d: dot(...bezier(...down, (t * 0.35 + 0.5) % 1)) },
  ]
}

/* The sun crosses the day. Behind it the line is light, ahead of it dark. */
const day: Scene = (t, p) => {
  const u = p ?? (t * 0.05) % 1
  const x = u * W
  return [
    { k: 'far', d: curve((px) => 150 - 115 * Math.sin((px / W) * PI)) },
    { k: 'bar', c: 'amber', d: x > 4 ? seg(0, 150, x) : NONE },
    { k: 'bold', d: seg(x, 150, W) },
    { k: 'dot', c: 'amber', d: dot(x, 150 - 115 * Math.sin(u * PI)) },
  ]
}

/* Six log lines become one wide event with four groups of fields. */
const braid: Scene = (t, p) => {
  const x = at(p, t, 0.5, 0.12, 0.4)
  const shapes: Array<Shape> = [0, 1, 2, 3, 4, 5].map((i) => ({
    k: 'dash',
    d: cubic(
      [0, 25 + i * 30],
      [x * 0.55, 25 + i * 30],
      [x * 0.7, 100],
      [x, 100],
    ),
  }))
  const part = (W - x) / 4
  const colours: Array<MarkName> = ['blue', 'lilac', 'sage', 'amber']
  colours.forEach((c, i) =>
    shapes.push({
      k: 'bar',
      c,
      d: seg(x + part * i + 5, 100, x + part * (i + 1) - 5),
    }),
  )
  return shapes
}

/* One document, cut three ways. The pointer sets the chunk size. */
const chunks: Scene = (t, p) => {
  const size = 70 + (p ?? 0.35 + 0.2 * Math.sin(t * 0.5)) * 230
  let fixed = ''
  for (let x = 0; x < W; x += size)
    fixed += seg(x, 80, Math.min(W, x + size - 14))
  let even = ''
  let odd = ''
  for (let x = 0, i = 0; x < W; x += size * 0.75, i += 1) {
    const piece = seg(x, i % 2 ? 131 : 121, Math.min(W, x + size))
    if (i % 2) odd += piece
    else even += piece
  }
  let uneven = ''
  for (let x = 0, i = 0; x < W; i += 1) {
    const length = size * (0.5 + noise(i))
    uneven += seg(x, 172, Math.min(W, x + length - 14))
    x += length
  }
  return [
    { k: 'line', d: seg(0, 32, W) },
    { k: 'mark', c: 'amber', d: fixed },
    { k: 'mark', c: 'lilac', d: even },
    { k: 'mark', c: 'blue', d: odd || NONE },
    { k: 'mark', c: 'sage', d: uneven },
  ]
}

/* Three brokers carry messages. One of them is the leader at a time. */
const quorum: Scene = (t, p) => {
  const leader =
    p === null ? Math.floor(t / 2.5) % 3 : Math.min(2, Math.floor(p * 3))
  const shapes: Array<Shape> = [
    { k: 'bar', c: 'lilac', d: seg(0, 50 + leader * 50, W) },
  ]
  for (let i = 0; i < 3; i += 1) {
    const y = 50 + i * 50
    shapes.push({ k: 'line', d: seg(0, y, W) })
    shapes.push({
      k: 'run',
      c: i === leader ? 'amber' : 'sand',
      d: seg(0, y, W),
    })
  }
  return shapes
}

/* The build traces many files. Only the needed ones go to the server. */
const shrink: Scene = (t, p) => {
  const cut = at(p, t, 0.45, 0.12, 0.4)
  return [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
    const y = 20 + i * 20
    if (i !== 3 && i !== 5) {
      return {
        k: 'far' as const,
        d: seg(0, y, Math.max(8, cut - Math.abs(i - 4) * 28)),
      }
    }
    const end = i === 3 ? 85 : 115
    return {
      k: 'mark' as const,
      c: 'sage' as const,
      d: `M0 ${y}H${n(cut)}C${n(cut + 90)} ${y} ${n(cut + 90)} ${end} ${n(cut + 180)} ${end}H${W + 200}`,
    }
  })
}

/* A health check trace. The pointer adds a beat. */
const pulse: Scene = (t, p) => {
  const beat = (x: number) => {
    const phase = (((x - t * 160) % 260) + 260) % 260
    if (phase < 12) return (-62 * phase) / 12
    if (phase < 22) return -62 + (92 * (phase - 12)) / 10
    if (phase < 34) return 30 - (30 * (phase - 22)) / 12
    return 0
  }
  const extra = (x: number) =>
    p === null ? 0 : -52 * Math.exp(-(((x - p * W) / 16) ** 2))
  return [
    { k: 'far', d: seg(0, 40, W) },
    { k: 'far', d: seg(0, 160, W) },
    {
      k: 'mark',
      c: 'sage',
      d: curve((x) => 100 + beat(x) + extra(x), 0, W, 4),
    },
  ]
}

/* The server renders, then streams across the boundary to the client. */
const stream: Scene = (t, p) => {
  const x = at(p, t, 0.5, 0.1, 0.4)
  const path = `M0 70H${n(x - 70)}C${n(x)} 70 ${n(x)} 130 ${n(x + 70)} 130H${W}`
  return [
    { k: 'far', d: path },
    { k: 'mark', c: 'lilac', d: seg(0, 70, x - 70) },
    { k: 'mark', c: 'blue', d: seg(x + 70, 130, W) },
    { k: 'run', c: 'amber', d: path },
    { k: 'dash', d: rise(x, 10, 190) },
  ]
}

/* The build stage has many layers. Only the binary goes past the line. */
const stairs: Scene = (t, p) => {
  const line = at(p, t, 0.55, 0.12, 0.4)
  const shapes: Array<Shape> = [0, 1, 2, 3, 4, 5].map((i) => ({
    k: 'bar',
    c: 'sand',
    d: seg(0, 25 + i * 25, Math.max(8, line - 20 - i * 46)),
  }))
  shapes.push({ k: 'bar', c: 'lilac', d: seg(0, 175, W) })
  shapes.push({ k: 'dash', d: rise(line, 8, 192) })
  return shapes
}

/* A control plane in the middle, workers round it. */
const orbit: Scene = (t, p) => {
  const turn = p === null ? t * 0.25 : p * PI * 2
  const spots: Array<Point> = [0, 1, 2, 3, 4].map((i) => {
    const angle = turn + (i * PI * 2) / 5
    return [500 + Math.cos(angle) * 400, 100 + Math.sin(angle) * 74]
  })
  let ring = ''
  for (let i = 0; i <= 48; i += 1) {
    const angle = (i / 48) * PI * 2
    ring += `${i ? 'L' : 'M'}${n(500 + Math.cos(angle) * 400)} ${n(100 + Math.sin(angle) * 74)}`
  }
  return [
    { k: 'dash', d: ring },
    ...spots.map(([x, y]) => ({
      k: 'far' as const,
      d: `M500 100L${n(x)} ${n(y)}`,
    })),
    ...spots.map(([x, y]) => ({
      k: 'dot' as const,
      c: 'blue' as const,
      d: dot(x, y),
    })),
    { k: 'node', d: dot(500, 100) },
  ]
}

/* Three pieces of state above, the same three in one URL below. */
const url: Scene = (t, p) => {
  const lengths = [0, 1, 2].map(
    (i) =>
      110 +
      150 *
        (i === 0 && p !== null ? p : 0.5 + 0.5 * Math.sin(t * 0.7 + i * 2.1)),
  )
  const colours: Array<MarkName> = ['lilac', 'sage', 'amber']
  const shapes: Array<Shape> = [{ k: 'line', d: seg(0, 165, 120) }]
  let x = 136
  lengths.forEach((length, i) => {
    shapes.push({ k: 'bar', c: colours[i], d: seg(0, 35 + i * 35, length) })
    shapes.push({ k: 'bar', c: colours[i], d: seg(x, 165, x + length) })
    x += length + 16
  })
  return shapes
}

/* The time bits sort. The random bits do not. */
const bits: Scene = (t, p) => {
  const edge = p ?? 0.45 + 0.1 * Math.sin(t * 0.4)
  const count = 50
  let sorted = ''
  let random = ''
  for (let i = 0; i < count; i += 1) {
    const x = 10 + i * 20
    const u = i / count
    if (u < edge) sorted += `M${x} 188V${n(168 - (u / edge) * 150)}`
    else random += `M${x} 188V${n(168 - noise(i, Math.floor(t * 3)) * 150)}`
  }
  return [
    { k: 'mark', c: 'blue', d: sorted || NONE },
    { k: 'line', d: random || NONE },
    { k: 'dash', d: rise(edge * W + 1, 6, 194) },
  ]
}

/* Queries reach the hook. The ones without a WHERE stop there. */
const hook: Scene = (t, p) => {
  const g = at(p, t, 0.55, 0.12, 0.4)
  const shapes: Array<Shape> = []
  for (let i = 0; i < 6; i += 1) {
    const y = 30 + i * 28
    const blocked = i === 1 || i === 4
    shapes.push(
      blocked
        ? { k: 'mark', c: 'rose', d: seg(0, y, Math.max(8, g - 14)) }
        : { k: 'line', d: seg(0, y, W) },
    )
    shapes.push({
      k: 'run',
      c: blocked ? 'rose' : 'blue',
      d: seg(0, y, blocked ? Math.max(8, g - 14) : W),
    })
  }
  shapes.push({ k: 'bold', d: rise(g, 8, 192) })
  return shapes
}

/* A year of months, and a line that starts in one of them. */
const start: Scene = (t, p) => {
  const head = (p ?? (t * 0.1) % 1) * W
  let ticks = ''
  for (let i = 0; i < 12; i += 1) ticks += `M${40 + i * 84} 92V108`
  return [
    { k: 'dash', d: seg(0, 100, W) },
    { k: 'far', d: ticks },
    {
      k: 'mark',
      c: 'lilac',
      d:
        head > 462
          ? curve((x) => 100 + Math.sin(x * 0.04 + t) * 3, 460, head, 6)
          : NONE,
    },
    { k: 'node', d: dot(460, 100) },
  ]
}

/* The line makes one turn and comes out in a new colour. */
const turn: Scene = (t, p) => {
  const x = at(p, t, 0.4, 0.15, 0.4)
  const r = 110
  const loop = `M${n(x)} 140C${n(x + r)} 140 ${n(x + r)} 40 ${n(x)} 40C${n(x - r)} 40 ${n(x - r)} 140 ${n(x)} 140`
  return [
    { k: 'line', d: seg(0, 140, x) },
    { k: 'line', d: loop },
    { k: 'mark', c: 'amber', d: seg(x, 140, W) },
    { k: 'run', c: 'lilac', d: seg(x, 140, W) },
  ]
}

/** The scene of each post, by its public slug. */
/* About: one line rises through four places. The marked part is the path so
   far, and the pointer moves its end. */
export const career: Scene = (t, p) => {
  const y = (x: number) =>
    160 - 110 * (x / W) ** 1.3 + Math.sin(x * 0.012 + t * 0.7) * 7
  const head = Math.round(at(p, t, 0.55, 0.4, 0.35) / 10) * 10
  return [
    { k: 'far', d: curve(y) },
    { k: 'mark', c: 'lilac', d: curve(y, 0, Math.max(10, head)) },
    { k: 'run', c: 'amber', d: curve(y) },
    ...[90, 350, 620, 900].map((x): Shape => ({ k: 'node', d: dot(x, y(x)) })),
  ]
}

/* Work with me: two lines meet and go on as one. The pointer moves the
   point where they meet. */
export const meet: Scene = (t, p) => {
  const x = at(p, t, 0.45, 0.12, 0.4)
  const sway = Math.sin(t * 0.8) * 8
  return [
    {
      k: 'line',
      c: 'lilac',
      d: cubic([0, 40 + sway], [x * 0.5, 40 + sway], [x * 0.6, 100], [x, 100]),
    },
    {
      k: 'line',
      c: 'blue',
      d: cubic(
        [0, 160 - sway],
        [x * 0.5, 160 - sway],
        [x * 0.6, 100],
        [x, 100],
      ),
    },
    { k: 'mark', c: 'amber', d: seg(x, 100, W) },
    { k: 'run', c: 'lilac', d: seg(x, 100, W) },
    { k: 'node', d: dot(x, 100) },
  ]
}

const scenes: Partial<Record<string, Scene>> = {
  'saybackend-redesign-paper-marker-pen': rough,
  'faster-github-actions-same-runners': lanes,
  'prompt-caching-agent-harnesses': prefix,
  'lint-ai-generated-code': gate,
  'happycontext-go-performance': detour,
  'codex-subscription-claude-code-conductor': merge,
  'cliproxyapi-factory-droid-byok': split,
  'happymode-macos-appearance-scheduler': day,
  'happycontext-wide-logging-golang': braid,
  '2025-feb-text-chunking-rag-systems': chunks,
  '2025-jan-kafka-docker-kraft-mode': quorum,
  '2024-sep-nextjs-deploy-any-server': shrink,
  '09-nextjs-self-hosted-production': pulse,
  '2024-aug-nextjs-electron-server-components': stream,
  '2024-jun-golang-dockerfile-optimized': stairs,
  '08-kubernetes-cluster-journey': orbit,
  '2023-dec-zustand-url-state-sharing': url,
  'uuidv7-postgres-comparison': bits,
  'recreating-planetscale-pg-strict-in-rust': hook,
  '2024-jun-saybackend-changelog': start,
  '2026-jan-saybackend-changelog': turn,
}

export function sceneOf(slug: string | undefined): Scene | undefined {
  return slug ? scenes[slug] : undefined
}

/** The post slug in a path such as `/blog/my-post/`. */
export function slugOfPath(pathname: string) {
  return /^\/blog\/([^/]+)\/?$/.exec(pathname)?.[1]
}
