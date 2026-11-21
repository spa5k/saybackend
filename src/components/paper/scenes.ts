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

/* REPACK: rows with holes on the right, packed rows on the left. The dashed
   line is how far the rewrite has gone. */
const repack: Scene = (t, p) => {
  const cut = at(p, t, 0.45, 0.3, 0.4)
  const shapes: Array<Shape> = []
  for (let i = 0; i < 5; i += 1) {
    const y = 30 + i * 35
    let holes = ''
    for (let slot = Math.ceil((cut + 14) / 50); slot < 20; slot += 1)
      if (noise(i, slot) > 0.42) holes += seg(slot * 50 + 4, y, slot * 50 + 44)
    shapes.push({ k: 'bar', c: 'blue', d: cut > 6 ? seg(0, y, cut - 6) : NONE })
    shapes.push({ k: 'line', d: holes || NONE })
  }
  shapes.push({ k: 'dash', d: rise(cut, 8, 192) })
  return shapes
}

/* One build goes to one of three ways to run it. The pointer picks the way. */
const adapt: Scene = (t, p) => {
  const pick = Math.min(2, Math.floor((p ?? (t * 0.25) % 1) * 3))
  const way = (i: number): [Point, Point, Point, Point] => [
    [340, 100],
    [520, 100],
    [560, 40 + i * 60],
    [760, 40 + i * 60],
  ]
  const tail = (i: number) => `${cubic(...way(i))}H${W}`
  return [
    { k: 'line', d: seg(0, 100, 340) },
    { k: 'far', d: tail(0) },
    { k: 'far', d: tail(1) },
    { k: 'far', d: tail(2) },
    { k: 'mark', c: 'sage', d: tail(pick) },
    { k: 'run', c: 'lilac', d: tail(pick) },
    { k: 'node', d: dot(340, 100) },
  ]
}

/* Two clients reach the proxy. The request goes on until the fault, and the
   pointer moves the fault. */
const fault: Scene = (t, p) => {
  const x = Math.max(430, at(p, t, 0.68, 0.14, 0.5))
  return [
    { k: 'line', d: cubic([0, 50], [180, 50], [200, 100], [340, 100]) },
    { k: 'line', d: cubic([0, 150], [180, 150], [200, 100], [340, 100]) },
    { k: 'mark', c: 'amber', d: seg(340, 100, x - 16) },
    { k: 'run', c: 'lilac', d: seg(340, 100, x - 16) },
    { k: 'dash', d: seg(x + 16, 100, W) },
    {
      k: 'bold',
      d: `M${n(x - 14)} 93L${n(x + 14)} 107M${n(x + 14)} 93L${n(x - 14)} 107`,
    },
    { k: 'node', d: dot(340, 100) },
  ]
}

/* Dockerfile lines, top to bottom. Lines above the change come from the
   cache, and the lines below it build again. The pointer picks the line. */
const cache: Scene = (t, p) => {
  const changed = Math.min(5, Math.floor((p ?? (t * 0.12 + 0.5) % 1) * 6))
  const shapes: Array<Shape> = []
  for (let i = 0; i < 6; i += 1) {
    const y = 25 + i * 30
    const length = 300 + noise(i, 3) * 560
    const hit = i < changed
    shapes.push({ k: 'far', d: seg(0, y, length) })
    shapes.push({ k: 'bar', c: 'lilac', d: hit ? seg(0, y, length) : NONE })
    shapes.push({ k: 'run', c: 'amber', d: hit ? NONE : seg(0, y, length) })
  }
  shapes.push({ k: 'bold', d: `M0 ${10 + changed * 30}H${W}` })
  return shapes
}

/* Index pages in a row. Random keys land on any page. Ordered keys fill the
   row from the left, and the pointer moves the newest key. */
const edge: Scene = (t, p) => {
  const pages = (y: number, from: number, to: number) => {
    let d = ''
    for (let i = from; i < to; i += 1) d += seg(i * 62.5 + 5, y, i * 62.5 + 57)
    return d || NONE
  }
  const random = Math.floor(noise(Math.floor(t * 2.5)) * 16)
  const head = Math.max(
    1,
    Math.min(16, Math.ceil((p ?? (t * 0.08 + 0.6) % 1) * 16)),
  )
  return [
    { k: 'far', d: pages(60, 0, 16) },
    { k: 'bar', c: 'rose', d: pages(60, random, random + 1) },
    { k: 'far', d: pages(140, 0, 16) },
    { k: 'bar', c: 'blue', d: pages(140, 0, head) },
    { k: 'node', d: dot(head * 62.5 - 5, 140) },
  ]
}

/* Code mode: a program on the left, a wall, and the calls that leave through
   it. Each post in the series changes one thing: how many walls, where the
   checks are, where the calls fan out, how far the wall is. */
const sandbox =
  (kind: 'plain' | 'nested' | 'gates' | 'exit' | 'far'): Scene =>
  (t, p) => {
    const wall = kind === 'far' ? Math.max(260, at(p, t, 0.5, 0.2, 0.4)) : 500
    const fan = kind === 'exit' ? 760 : wall
    const pick = Math.min(4, Math.floor((p ?? (t * 0.3) % 1) * 5))
    const call = (i: number) =>
      `${cubic([fan, 100], [fan + 90, 100], [fan + 70, 28 + i * 36], [fan + 170, 28 + i * 36])}H${W}`
    const shapes: Array<Shape> = [
      { k: 'bar', c: 'lilac', d: seg(40, 76, wall - 190) },
      { k: 'bar', c: 'lilac', d: seg(40, 100, wall - 120) },
      { k: 'bar', c: 'lilac', d: seg(40, 124, wall - 230) },
      { k: 'line', d: seg(wall - 100, 100, fan) },
    ]
    for (let i = 0; i < 5; i += 1) shapes.push({ k: 'far', d: call(i) })
    shapes.push({ k: 'run', c: 'amber', d: call(pick) })
    let gates = ''
    for (let i = 0; i < 5; i += 1) gates += dot(fan + 200, 28 + i * 36)
    shapes.push({ k: 'node', d: kind === 'gates' ? gates : NONE })
    shapes.push({
      k: 'dash',
      d: kind === 'nested' ? rise(wall - 50, 30, 170) : NONE,
    })
    shapes.push({ k: 'bold', d: rise(wall, 14, 186) })
    return shapes
  }

/* Token history as ticks. Only the window at the end is copied on a step,
   and the pointer moves the end of the output. */
const windowed: Scene = (t, p) => {
  const end = Math.max(160, at(p, t, 0.7, 0.25, 0.4))
  const from = Math.max(0, end - 120)
  let ticks = ''
  for (let x = 10; x < end; x += 24) ticks += `M${x} 88V112`
  return [
    { k: 'far', d: seg(0, 100, W) },
    { k: 'line', d: ticks || NONE },
    { k: 'bar', c: 'blue', d: seg(from, 100, end) },
    { k: 'bold', d: `M${n(from)} 70V130M${n(end)} 70V130` },
    { k: 'dash', d: seg(0, 150, from) },
    { k: 'node', d: dot(end, 100) },
  ]
}

/* A queue in insertion order. One entry leaves from the middle and nothing
   else moves. The pointer picks the entry. */
const ordered: Scene = (t, p) => {
  const pick = Math.min(11, Math.floor((p ?? (t * 0.15) % 1) * 12))
  let rest = ''
  for (let i = 0; i < 12; i += 1)
    if (i !== pick) rest += seg(i * 82 + 14, 120, i * 82 + 78)
  const x = pick * 82 + 14
  return [
    { k: 'line', d: rest },
    { k: 'bar', c: 'amber', d: seg(x, 56, x + 64) },
    { k: 'dash', d: `M${x + 32} 72V112` },
    { k: 'far', d: seg(0, 160, W) },
  ]
}

/* The ratchet: a count that goes down in steps, and a ceiling that follows
   it. The pointer moves the present. */
const ratchet: Scene = (t, p) => {
  const now = at(p, t, 0.6, 0.3, 0.35)
  const level = (x: number) => 40 + Math.floor(x / 125) * 18
  let steps = `M0 ${level(0)}`
  for (let x = 125; x <= now; x += 125) steps += `H${x}V${level(x)}`
  steps += `H${n(now)}`
  return [
    { k: 'far', d: seg(0, 184, W) },
    { k: 'mark', c: 'rose', d: steps },
    { k: 'line', d: steps },
    { k: 'dash', d: seg(now, level(now), W) },
    { k: 'node', d: dot(now, level(now)) },
  ]
}

/* Four levels of proof, each longer than the one before. The pointer picks
   how far a run goes. */
const tiers: Scene = (t, p) => {
  const reach = Math.min(3, Math.floor((p ?? (t * 0.2) % 1) * 4))
  const shapes: Array<Shape> = []
  for (let i = 0; i < 4; i += 1) {
    const y = 40 + i * 40
    const length = 280 + i * 220
    shapes.push({ k: 'far', d: seg(0, y, length) })
    shapes.push({
      k: 'bar',
      c: 'sage',
      d: i <= reach ? seg(0, y, length) : NONE,
    })
  }
  shapes.push({ k: 'node', d: dot(280 + reach * 220, 40 + reach * 40) })
  return shapes
}

/* Three review agents start. Two stop, and one goes on. The pointer moves
   the present. */
const kept: Scene = (t, p) => {
  const now = Math.max(120, at(p, t, 0.75, 0.2, 0.4))
  const stops = [360, W, 620]
  const shapes: Array<Shape> = []
  for (let i = 0; i < 3; i += 1) {
    const y = 50 + i * 50
    const end = Math.min(now, stops[i])
    shapes.push({ k: i === 1 ? 'mark' : 'line', c: 'amber', d: seg(0, y, end) })
    shapes.push({
      k: 'dash',
      d: now > stops[i] ? seg(stops[i] + 16, y, now) : NONE,
    })
  }
  shapes.push({ k: 'node', d: dot(now, 100) })
  return shapes
}

/* Jobs on a ruler of whole minutes. Each job is billed to the next mark,
   and the pointer changes how long the jobs run. */
const minutes: Scene = (t, p) => {
  const scale = 0.5 + (p ?? 0.5 + 0.4 * Math.sin(t * 0.4)) * 1.2
  let marks = ''
  for (let x = 0; x <= W; x += 125) marks += rise(x, 20, 180)
  const shapes: Array<Shape> = [{ k: 'far', d: marks }]
  for (let i = 0; i < 4; i += 1) {
    const y = 46 + i * 36
    const length = Math.min(960, (90 + noise(i, 7) * 420) * scale)
    const billed = Math.ceil(length / 125) * 125
    shapes.push({ k: 'bar', c: 'sand', d: seg(0, y, billed) })
    shapes.push({ k: 'run', c: 'blue', d: seg(0, y, length) })
  }
  return shapes
}

/* Rust on a laptop: where the build output is kept. Each post in the series
   draws its own store, and the pointer changes how much of it there is. */
const store =
  (kind: 'twice' | 'shared' | 'clones' | 'loop' | 'ship'): Scene =>
  (t, p) => {
    const u = p ?? 0.5 + 0.4 * Math.sin(t * 0.4)
    if (kind === 'twice') {
      // The same object files, in the archive and beside it.
      const gap = 380 + u * 260
      const shapes: Array<Shape> = [
        { k: 'bold', d: 'M20 30H330V170H20Z' },
        { k: 'dash', d: rise(gap - 24, 30, 170) },
      ]
      for (let i = 0; i < 4; i += 1) {
        const y = 52 + i * 32
        const length = 150 + noise(i, 3) * 130
        shapes.push({ k: 'bar', c: 'sand', d: seg(40, y, 40 + length) })
        shapes.push({ k: 'bar', c: 'rose', d: seg(gap, y, gap + length) })
      }
      return shapes
    }
    if (kind === 'shared' || kind === 'clones') {
      // Worktrees and one store. The pointer picks the worktree that builds.
      const hub: Point = kind === 'shared' ? [760, 100] : [200, 100]
      const count = kind === 'shared' ? 5 : 8
      const pick = Math.min(count - 1, Math.floor(u * count))
      const shapes: Array<Shape> = []
      let own = ''
      for (let i = 0; i < count; i += 1) {
        const y = 20 + (i * 160) / (count - 1)
        const path =
          kind === 'shared'
            ? `${seg(0, y, 300)}${cubic([300, y], [520, y], [560, 100], hub).replace('M', 'L')}`
            : `${cubic(hub, [420, 100], [460, y], [640, y])}H${W}`
        shapes.push({ k: i === pick ? 'run' : 'far', c: 'blue', d: path })
        own +=
          kind === 'shared'
            ? seg(0, y, 44)
            : seg(700 + noise(i, 5) * 220, y, 740 + noise(i, 5) * 220)
      }
      shapes.push({
        k: 'bar',
        c: kind === 'shared' ? 'lilac' : 'amber',
        d: own,
      })
      shapes.push({
        k: 'bold',
        d:
          kind === 'shared'
            ? 'M760 40H980V160H760Z'
            : `${seg(20, 100, 200)}M20 70V130`,
      })
      return shapes
    }
    if (kind === 'loop') {
      // Edit, front end, codegen, link, run. The pointer shrinks the link.
      const widths = [110, 210, 240, 40 + (1 - u) * 240, 90]
      const shapes: Array<Shape> = [{ k: 'far', d: seg(0, 150, W) }]
      let x = 10
      widths.forEach((width, i) => {
        shapes.push({
          k: i === 3 ? 'run' : 'bar',
          c: i === 3 ? 'amber' : 'sand',
          d: seg(x, 100, x + width),
        })
        x += width + 16
      })
      shapes.push({ k: 'node', d: dot(x - 16, 100) })
      return shapes
    }
    // The cache stays. One small binary crosses into the image.
    const binary = 520 + u * 330
    const shapes: Array<Shape> = [
      { k: 'bold', d: 'M20 24H470V176H20Z' },
      { k: 'bold', d: 'M800 60H960V140H800Z' },
      { k: 'dash', d: seg(480, 100, 790) },
      { k: 'run', c: 'sage', d: seg(binary, 100, binary + 40) },
    ]
    for (let i = 0; i < 4; i += 1)
      shapes.push({
        k: 'bar',
        c: 'sand',
        d: seg(44, 48 + i * 34, 220 + noise(i, 9) * 220),
      })
    return shapes
  }

/* Solid and TanStack Start: the pieces of an app and the paths between
   them. Each post draws one path, and the pointer moves along it. */
const graph =
  (
    kind: 'pending' | 'moves' | 'three' | 'order' | 'cut' | 'reads' | 'files',
  ): Scene =>
  (t, p) => {
    const u = p ?? 0.5 + 0.45 * Math.sin(t * 0.4)
    if (kind === 'pending') {
      // The promise travels to the node. The readers wait with a dashed
      // line and get the value when it lands.
      const landed = u > 0.62
      const shapes: Array<Shape> = [
        { k: 'line', d: seg(0, 100, 420) },
        { k: 'run', c: 'amber', d: seg(40, 100, Math.min(420, 40 + u * 610)) },
        { k: 'bold', d: 'M420 76V124' },
      ]
      for (let i = 0; i < 3; i += 1) {
        const path = `${cubic([420, 100], [560, 100], [600, 40 + i * 60], [760, 40 + i * 60])}H${W}`
        shapes.push({ k: 'dash', d: landed ? NONE : path })
        shapes.push({ k: 'bar', c: 'lilac', d: landed ? path : NONE })
      }
      shapes.push({ k: 'node', d: dot(420, 100) })
      return shapes
    }
    if (kind === 'moves') {
      // Old pieces on the left, new on the right. The pointer moves them.
      const done = Math.floor(u * 5)
      const shapes: Array<Shape> = []
      for (let i = 0; i < 4; i += 1) {
        const y = 34 + i * 44
        const length = 180 + noise(i, 2) * 120
        shapes.push({ k: 'far', d: seg(0, y, length) })
        shapes.push({ k: 'dash', d: seg(length + 20, y, 620) })
        shapes.push({
          k: 'bar',
          c: 'blue',
          d: i < done ? seg(640, y, 640 + length) : NONE,
        })
      }
      return shapes
    }
    if (kind === 'three') {
      // One line in, three ways out. The pointer picks one.
      const pick = Math.min(2, Math.floor(u * 3))
      const shapes: Array<Shape> = [
        { k: 'mark', c: 'sand', d: seg(0, 100, 380) },
      ]
      for (let i = 0; i < 3; i += 1) {
        const path = `${cubic([380, 100], [540, 100], [560, 36 + i * 64], [720, 36 + i * 64])}H${W}`
        shapes.push({ k: 'far', d: path })
        shapes.push({
          k: 'run',
          c: (['lilac', 'blue', 'sage'] as const)[i],
          d: i === pick ? path : NONE,
        })
      }
      shapes.push({ k: 'node', d: dot(380, 100) })
      return shapes
    }
    if (kind === 'order') {
      // The build as a line of steps. The file list is closed at the mark,
      // and the prerender writes its pages after it.
      const now = u * W
      return [
        { k: 'far', d: seg(0, 100, W) },
        { k: 'bar', c: 'sand', d: seg(0, 100, Math.min(now, 600)) },
        { k: 'bold', d: rise(600, 40, 160) },
        {
          k: 'bar',
          c: 'blue',
          d: now > 640 ? seg(640, 100, now) : NONE,
        },
        { k: 'dash', d: now > 640 ? seg(640, 140, now) : NONE },
        { k: 'node', d: dot(now, 100) },
      ]
    }
    if (kind === 'cut') {
      // The stub on the client, the module on the server, and one request
      // that crosses the wire.
      const head = 180 + u * 640
      return [
        { k: 'bar', c: 'lilac', d: seg(40, 70, 300) },
        { k: 'bar', c: 'blue', d: seg(700, 70, 960) },
        { k: 'bar', c: 'blue', d: seg(700, 100, 900) },
        { k: 'bar', c: 'blue', d: seg(700, 130, 940) },
        { k: 'bold', d: rise(500, 14, 186) },
        { k: 'dash', d: seg(180, 160, 820) },
        { k: 'run', c: 'amber', d: seg(180, 160, head) },
        { k: 'node', d: dot(head, 160) },
      ]
    }
    if (kind === 'reads') {
      // Two reads after one click. Above they start together, below one
      // waits for the other. The pointer is the clock.
      const now = 80 + u * 880
      const span = 380
      const part = (from: number) =>
        now > from ? seg(from, 0, Math.min(now, from + span)) : NONE
      const on = (d: string, y: number) => d.replace(' 0H', ` ${y}H`)
      return [
        { k: 'far', d: seg(0, 100, W) },
        { k: 'bar', c: 'lilac', d: on(part(80), 40) },
        { k: 'bar', c: 'lilac', d: on(part(80), 68) },
        { k: 'bar', c: 'blue', d: on(part(80), 132) },
        { k: 'bar', c: 'blue', d: on(part(80 + span + 20), 160) },
        { k: 'bold', d: rise(80, 24, 176) },
        { k: 'dash', d: rise(now, 14, 186) },
      ]
    }
    // The Worker writes its files, then a request from the right meets a
    // file before it meets the Worker.
    const written = Math.min(8, Math.floor(u * 9))
    let files = ''
    for (let i = 0; i < written; i += 1) files += rise(360 + i * 44, 64, 136)
    const stop = written > 0 ? 360 + (written - 1) * 44 + 16 : 230
    return [
      { k: 'bold', d: 'M40 56H220V144H40Z' },
      { k: 'dash', d: seg(230, 100, 350) },
      { k: 'bar', c: 'sand', d: files || NONE },
      { k: 'run', c: 'amber', d: seg(stop, 100, W) },
      { k: 'node', d: dot(stop, 100) },
    ]
  }

const scenes: Partial<Record<string, Scene>> = {
  'rust-target-directory-disk-space': store('twice'),
  'rust-build-cache-worktrees-mbx': store('shared'),
  'git-twig-copy-on-write-worktrees': store('clones'),
  'faster-rust-dev-builds': store('loop'),
  'dockerize-rust-service': store('ship'),
  'solid-2-async-reactive-graph': graph('pending'),
  'migrate-solidstart-to-solid-2': graph('moves'),
  'solidstart-maintenance-what-to-use': graph('three'),
  'self-host-tanstack-start-docker': graph('order'),
  'tanstack-start-server-functions-wire': graph('cut'),
  'solid-start-mode-vs-tanstack-start-solid': graph('reads'),
  'blog-on-tanstack-start-cloudflare-workers': graph('files'),
  'code-mode-explained': sandbox('plain'),
  'code-mode-pi': sandbox('nested'),
  'code-mode-claude-code': sandbox('gates'),
  'code-mode-opencode': sandbox('exit'),
  'code-mode-compared': sandbox('far'),
  'vllm-fallback-detokenizer-cpu': windowed,
  'nvidia-dynamo-code-audit': ordered,
  'lint-ratchet-ai-written-code': ratchet,
  'coding-agent-verification-skill': tiers,
  'pr-review-agents-what-stuck': kept,
  'faster-cheaper-ci': minutes,
  'postgresql-19-backend-engineers': repack,
  'self-host-nextjs-16-standalone-adapter': adapt,
  'cliproxyapi-setup-fixes-homebrew-codex-claude-code': fault,
  'golang-dockerfile-best-practices': cache,
  'uuidv7-postgres-uuidv7-vs-uuid-generate-v7': edge,
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
  '2024-aug-nextjs-electron-server-components': stream,
  '2024-jun-golang-dockerfile-optimized': stairs,
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
