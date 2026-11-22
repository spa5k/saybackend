import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Figure, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

import './async-graph.css'

/*
 * Figures for "Async inside the reactive graph". Each one shows the code on
 * top and the graph below. The line that runs now has a marker under it, and
 * each node carries the colour of the line that makes it.
 *   sand   a signal
 *   lilac  a memo
 *   sage   an effect, and the screen
 *   amber  a queued write, or a pending read
 *   rose   an error
 *   blue   the server
 */

const TINY = { fontSize: 10 }
const SMALL = { fontSize: 11 }
const LABEL = { fontSize: 12 }
const MONO = { fontSize: 11.5, fontFamily: 'var(--font-mono)' }

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/* ------------------------------------------------------------------ */
/* Drawing parts                                                       */
/* ------------------------------------------------------------------ */

type CodeLine = {
  text: string
  /** The node kind this line makes: a small square in that colour. */
  kind?: MarkName
  /** A comment that shows only when the line is active. */
  note?: string
}

const LINE_HEIGHT = 21

/** Source code drawn in the figure. Active lines get a marker under them. */
function CodePanel({
  x,
  y,
  w,
  lines,
  active,
  mark = 'amber',
}: {
  x: number
  y: number
  w: number
  lines: Array<CodeLine>
  active: Array<number>
  mark?: MarkName
}) {
  const h = lines.length * LINE_HEIGHT + 16
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" style={{ fill: 'var(--wash)' }} />
      {lines.map((line, index) => {
        const top = y + 8 + index * LINE_HEIGHT
        const on = active.includes(index)
        return (
          <g key={`${index}-${line.text}`}>
            <rect
              x={x + 30}
              y={top}
              width={w - 40}
              height={LINE_HEIGHT - 2}
              filter="url(#pp-marker)"
              style={{ fill: MARKS[mark] }}
              opacity={on ? 0.9 : 0}
            />
            {line.kind ? (
              <rect
                x={x + 10}
                y={top + 5}
                width="10"
                height="10"
                filter="url(#pp-marker)"
                style={{ fill: MARKS[line.kind] }}
              />
            ) : null}
            <text
              className={on ? 'fig-strong' : undefined}
              x={x + 38}
              y={top + 14}
              style={MONO}
              xmlSpace="preserve"
            >
              {line.text}
              {on && line.note ? `  // ${line.note}` : ''}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/** A marker box with a title and an optional second line. */
function Node({
  x,
  y,
  w,
  h = 44,
  mark,
  title,
  value,
  ring = false,
}: {
  x: number
  y: number
  w: number
  h?: number
  mark: MarkName
  title: string
  value?: ReactNode
  ring?: boolean
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
      <rect
        className={ring ? 'sa-ring is-on' : 'sa-ring'}
        x={x - 4}
        y={y - 4}
        width={w + 8}
        height={h + 8}
        rx="6"
      />
      <text
        className="fig-strong"
        x={x + w / 2}
        y={value === undefined ? y + h / 2 + 4 : y + h / 2 - 3}
        textAnchor="middle"
        style={LABEL}
      >
        {title}
      </text>
      {value === undefined ? null : (
        <text
          x={x + w / 2}
          y={y + h / 2 + 12}
          textAnchor="middle"
          style={SMALL}
        >
          {value}
        </text>
      )}
    </g>
  )
}

function Edge({ d, live = false }: { d: string; live?: boolean }) {
  return <path className={live ? 'sa-edge is-live' : 'sa-edge'} d={d} />
}

function Outline({
  x,
  y,
  w,
  h,
  dashed = true,
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
      rx="6"
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

/** The one sentence under a figure that says what happens now. */
function Status({ y, children }: { y: number; children: ReactNode }) {
  return (
    <text
      className="fig-strong"
      x="320"
      y={y}
      textAnchor="middle"
      style={{ fontSize: 13 }}
    >
      {children}
    </text>
  )
}

/* ------------------------------------------------------------------ */
/* Step player: plays once when the figure scrolls into view           */
/* ------------------------------------------------------------------ */

function useSteps(count: number, ms: number) {
  const ref = useRef<SVGSVGElement>(null)
  // The server renders the last step, so a reader without JavaScript sees the result.
  const [step, setStep] = useState(count - 1)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || reducedMotion()) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setStep(0)
        setPlaying(true)
      },
      { threshold: 0.5 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => {
      if (step >= count - 1) setPlaying(false)
      else setStep(step + 1)
    }, ms)
    return () => window.clearTimeout(timer)
  }, [playing, step, count, ms])

  return {
    ref,
    step,
    go: (next: number) => {
      setPlaying(false)
      setStep(next)
    },
    replay: () => {
      setStep(0)
      setPlaying(!reducedMotion())
    },
  }
}

function StepControls({
  labels,
  step,
  go,
  replay,
}: {
  labels: Array<string>
  step: number
  go: (next: number) => void
  replay: () => void
}) {
  return (
    <span className="paper-widget sa-controls">
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          className={index === step ? 'is-active' : undefined}
          aria-pressed={index === step}
          onClick={() => go(index)}
        >
          {index + 1}. {label}
        </button>
      ))}
      <button type="button" onClick={replay}>
        Replay
      </button>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* 1. The graph: signal, memo, effect (interactive)                    */
/* ------------------------------------------------------------------ */

type Phase = 'idle' | 'queued' | 'memo' | 'effect'

/** Four lines of code, and the graph they make. The reader writes a signal. */
export function GraphPlayground() {
  const [price, setPrice] = useState(10)
  const [qty, setQty] = useState(3)
  const [staged, setStaged] = useState<{ price?: number; qty?: number }>({})
  const [total, setTotal] = useState(30)
  const [screen, setScreen] = useState(30)
  const [memoRuns, setMemoRuns] = useState(1)
  const [effectRuns, setEffectRuns] = useState(1)
  const [phase, setPhase] = useState<Phase>('idle')
  const [ran, setRan] = useState('// press a button below')
  const timers = useRef<Array<number>>([])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const write = (next: { price?: number; qty?: number }) => {
    const wait = reducedMotion() ? 0 : 900
    const nextPrice = next.price ?? price
    const nextQty = next.qty ?? qty
    const calls = [
      next.price === undefined ? '' : `setPrice(${nextPrice});`,
      next.qty === undefined ? '' : `setQty(${nextQty});`,
    ]
    setRan(calls.filter(Boolean).join(' '))
    setStaged(next)
    setPhase('queued')
    timers.current = [
      window.setTimeout(() => {
        setPrice(nextPrice)
        setQty(nextQty)
        setStaged({})
        setTotal(nextPrice * nextQty)
        setMemoRuns((runs) => runs + 1)
        setPhase('memo')
      }, wait),
      window.setTimeout(() => {
        setScreen(nextPrice * nextQty)
        setEffectRuns((runs) => runs + 1)
        setPhase('effect')
      }, wait * 2),
      window.setTimeout(() => setPhase('idle'), wait * 3),
    ]
  }

  const reset = () => {
    timers.current.forEach(window.clearTimeout)
    setPrice(10)
    setQty(3)
    setStaged({})
    setTotal(30)
    setScreen(30)
    setMemoRuns(1)
    setEffectRuns(1)
    setPhase('idle')
    setRan('// press a button below')
  }

  const busy = phase !== 'idle'
  const lines: Array<CodeLine> = [
    { text: 'const [price, setPrice] = createSignal(10);', kind: 'sand' },
    { text: 'const [qty, setQty] = createSignal(3);', kind: 'sand' },
    {
      text: 'const total = createMemo(() => price() * qty());',
      kind: 'lilac',
      note: 'runs',
    },
    {
      text: 'createEffect(() => total(), v => render(v));',
      kind: 'sage',
      note: 'runs',
    },
    { text: '' },
    { text: ran, note: 'queued' },
  ]
  const active =
    phase === 'queued' ? [5] : phase === 'memo' ? [2] : phase === 'effect' ? [3] : []
  const signalValue = (now: number, next?: number) =>
    next === undefined ? String(now) : `${now}, next: ${next}`

  return (
    <Figure
      bleed
      title="Four lines of code make this graph. Press a button to write a signal."
      legend={[
        { label: 'signal', mark: 'sand' },
        { label: 'memo', mark: 'lilac' },
        { label: 'effect', mark: 'sage' },
        { label: 'running now', mark: 'amber' },
      ]}
      caption={
        <span className="paper-widget sa-controls">
          <button
            type="button"
            disabled={busy}
            onClick={() => write({ price: price + 1 })}
          >
            setPrice({price + 1})
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => write({ qty: qty + 1 })}
          >
            setQty({qty + 1})
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => write({ price: price + 1, qty: qty + 1 })}
          >
            both, in one tick
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </span>
      }
    >
      <svg
        className="sa-fig"
        viewBox="0 0 640 380"
        role="img"
        aria-label={`Code: two signals, price and qty, one memo total that multiplies them, and one effect that renders total. The graph shows price ${price} and qty ${qty} feeding total ${total}, which feeds the screen, ${screen}. The memo ran ${memoRuns} times and the effect ran ${effectRuns} times. A write is queued first, then one flush runs the memo and then the effect, also when both signals change in one tick.`}
      >
        <CodePanel x={10} y={6} w={620} lines={lines} active={active} />

        <Edge d="M160 206C210 206 210 248 250 248" live={phase === 'memo'} />
        <Edge d="M160 296C210 296 210 264 250 264" live={phase === 'memo'} />
        <Edge d="M390 256H480" live={phase === 'effect'} />

        <Node
          x={20}
          y={184}
          w={140}
          mark={staged.price === undefined ? 'sand' : 'amber'}
          title="price"
          value={signalValue(price, staged.price)}
        />
        <Node
          x={20}
          y={274}
          w={140}
          mark={staged.qty === undefined ? 'sand' : 'amber'}
          title="qty"
          value={signalValue(qty, staged.qty)}
        />
        <Node
          x={250}
          y={230}
          w={140}
          h={52}
          mark="lilac"
          title="total"
          value={`price × qty = ${total}`}
          ring={phase === 'memo'}
        />
        <Node
          x={480}
          y={230}
          w={140}
          h={52}
          mark="sage"
          title="render(v)"
          value={`screen shows ${screen}`}
          ring={phase === 'effect'}
        />
        <text x="320" y="306" textAnchor="middle" style={SMALL}>
          memo ran {memoRuns} {memoRuns === 1 ? 'time' : 'times'}
        </text>
        <text x="550" y="306" textAnchor="middle" style={SMALL}>
          effect ran {effectRuns} {effectRuns === 1 ? 'time' : 'times'}
        </text>

        <Status y={356}>
          {phase === 'queued'
            ? 'The write is queued. price() still returns the old value.'
            : phase === 'memo'
              ? 'The flush starts. The memo runs one time.'
              : phase === 'effect'
                ? 'Then the effect runs and the screen changes.'
                : 'Each signal is a row. The memo is a view. The effect acts.'}
        </Status>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* 2. Writes are queued, then flushed in height order (animated)        */
/* ------------------------------------------------------------------ */

const QUEUE_STEPS = [
  'setPrice(12)',
  'setQty(4)',
  'read price()',
  'net and tax',
  'total',
  'effect',
]

function Badge({
  x,
  y,
  n,
  on,
}: {
  x: number
  y: number
  n: number
  on: boolean
}) {
  return (
    <g opacity={on ? 1 : 0}>
      <circle className="fig-axis" cx={x} cy={y} r="9" />
      <text
        className="fig-strong"
        x={x}
        y={y + 4}
        textAnchor="middle"
        style={TINY}
      >
        {n}
      </text>
    </g>
  )
}

/** Two writes in one tick wait in one microtask; the flush runs memos by height. */
export function WriteQueue() {
  const { ref, step, go, replay } = useSteps(QUEUE_STEPS.length, 1700)
  const queuedPrice = step < 3
  const queuedQty = step >= 1 && step < 3
  const flushed = step >= 3
  const lines: Array<CodeLine> = [
    { text: 'const net = createMemo(() => price() * qty());', kind: 'lilac' },
    {
      text: 'const tax = createMemo(() => price() * qty() * 0.2);',
      kind: 'lilac',
    },
    { text: 'const total = createMemo(() => net() + tax());', kind: 'lilac' },
    { text: 'createEffect(() => total(), v => render(v));', kind: 'sage' },
    { text: '' },
    { text: 'setPrice(12);', note: 'queued' },
    { text: 'setQty(4);', note: 'same queue' },
    { text: 'console.log(price());', note: '10, the old value' },
  ]
  const active = [[5], [6], [7], [0, 1], [2], [3]][step] ?? []
  const net = flushed ? 48 : 30
  const tax = flushed ? 9.6 : 6
  const total = step >= 4 ? 57.6 : 36

  return (
    <Figure
      bleed
      title="Writes wait in a queue. One flush runs the graph from the bottom up."
      legend={[
        { label: 'signal', mark: 'sand' },
        { label: 'queued write', mark: 'amber' },
        { label: 'memo', mark: 'lilac' },
        { label: 'effect', mark: 'sage' },
      ]}
      caption={
        <StepControls
          labels={QUEUE_STEPS}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="sa-fig"
        viewBox="0 0 640 470"
        role="img"
        aria-label="Code: memos net and tax read price and qty, memo total adds net and tax, and an effect renders total. setPrice(12) and setQty(4) go into one microtask queue, and a read of price still returns 10. Then one flush runs net and tax first, then total one time with both new inputs, and the effect last."
      >
        <CodePanel x={10} y={6} w={620} lines={lines} active={active} />

        <text x="245" y="214" textAnchor="middle" style={TINY}>
          level 0
        </text>
        <text x="390" y="214" textAnchor="middle" style={TINY}>
          level 1
        </text>
        <text x="540" y="214" textAnchor="middle" style={TINY}>
          level 2
        </text>

        <Outline x={14} y={262} w={150} h={52} />
        <text x="89" y="332" textAnchor="middle" style={TINY}>
          microtask queue
        </text>
        <rect
          x={24}
          y={272}
          width={130}
          height={32}
          filter="url(#pp-marker)"
          style={{ fill: MARKS.amber }}
          opacity={flushed ? 0 : 1}
        />
        <text
          x="89"
          y="292"
          textAnchor="middle"
          style={SMALL}
          opacity={flushed ? 0 : 1}
        >
          {step === 0 ? 'flush (1 write)' : 'flush (2 writes)'}
        </text>
        <text
          x="89"
          y="292"
          textAnchor="middle"
          style={SMALL}
          opacity={flushed ? 1 : 0}
        >
          empty: it ran
        </text>

        <Edge d="M290 248H345" live={step === 3} />
        <Edge d="M290 248L345 326" live={step === 3} />
        <Edge d="M290 326L345 248" live={step === 3} />
        <Edge d="M290 326H345" live={step === 3} />
        <Edge d="M435 248L495 284" live={step === 4} />
        <Edge d="M435 326L495 292" live={step === 4} />
        <Edge d="M540 310V364" live={step === 5} />

        <Node
          x={200}
          y={226}
          w={90}
          mark={queuedPrice ? 'amber' : 'sand'}
          title="price"
          value={queuedPrice ? '10 (next 12)' : '12'}
        />
        <Node
          x={200}
          y={304}
          w={90}
          mark={queuedQty ? 'amber' : 'sand'}
          title="qty"
          value={queuedQty ? '3 (next 4)' : flushed ? '4' : '3'}
        />
        <Node
          x={345}
          y={226}
          w={90}
          mark="lilac"
          title="net"
          value={String(net)}
          ring={step === 3}
        />
        <Node
          x={345}
          y={304}
          w={90}
          mark="lilac"
          title="tax"
          value={String(tax)}
          ring={step === 3}
        />
        <Node
          x={495}
          y={266}
          w={90}
          mark="lilac"
          title="total"
          value={String(total)}
          ring={step === 4}
        />
        <Badge x={435} y={226} n={1} on={step >= 3} />
        <Badge x={435} y={304} n={2} on={step >= 3} />
        <Badge x={585} y={266} n={3} on={step >= 4} />
        <Node
          x={485}
          y={366}
          w={110}
          h={40}
          mark="sage"
          title={`screen: ${step >= 5 ? 57.6 : 36}`}
          ring={step === 5}
        />

        <Status y={448}>
          {step === 0
            ? 'setPrice does not change price. It queues one flush.'
            : step === 1
              ? 'setQty joins the same queue. There is still one flush.'
              : step === 2
                ? 'A read before the flush gets the old value: 10.'
                : step === 3
                  ? 'The flush runs the lowest memos first: net, then tax.'
                  : step === 4
                    ? 'total runs one time, with both new inputs.'
                    : 'The effect runs last. The screen changes one time.'}
        </Status>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* 3. A pending node (animated)                                        */
/* ------------------------------------------------------------------ */

const PENDING_STEPS = ['first answer', 'setId(2)', 'waiting', 'answer lands']

/** An async memo and a Loading boundary, from the write to the answer. */
export function PendingNode() {
  const { ref, step, go, replay } = useSteps(PENDING_STEPS.length, 1800)
  const pending = step === 1 || step === 2
  const landed = step === 3
  const lines: Array<CodeLine> = [
    { text: 'const [id, setId] = createSignal(1);', kind: 'sand' },
    { text: 'const user = createMemo(async () => {', kind: 'lilac' },
    { text: '  const userId = id();', note: 'read before the await' },
    {
      text: '  const res = await fetch(`/api/users/${userId}`);',
      note: 'in flight',
    },
    { text: '  return res.json();', note: 'Grace' },
    { text: '});' },
    { text: '<Loading fallback={<Spinner />}>', kind: 'sage' },
    { text: '  <p>{user().name}</p>', note: 'throws NotReadyError' },
    { text: '</Loading>' },
    { text: 'setId(2);', note: 'queued' },
  ]
  const active = [[7], [9], [3, 7], [4]][step] ?? []

  return (
    <Figure
      bleed
      title="A pending node: the memo waits, the screen keeps the old frame"
      legend={[
        { label: 'signal', mark: 'sand' },
        { label: 'pending', mark: 'amber' },
        { label: 'memo, new value', mark: 'lilac' },
        { label: 'screen', mark: 'sage' },
        { label: 'server', mark: 'blue' },
      ]}
      caption={
        <StepControls
          labels={PENDING_STEPS}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="sa-fig"
        viewBox="0 0 640 500"
        role="img"
        aria-label="Code: a signal id, an async memo user that fetches the user, and a paragraph inside a Loading boundary that reads user. After setId(2), user is pending and a fetch is in flight. The read in the paragraph throws NotReadyError, and Loading keeps the old frame, so the screen still shows Ada. When the answer lands, one flush shows Grace."
      >
        <CodePanel
          x={10}
          y={6}
          w={620}
          lines={lines}
          active={active}
          mark={step === 3 ? 'lilac' : 'amber'}
        />

        <Edge d="M140 278H200" live={step === 1} />
        <Node
          x={20}
          y={256}
          w={120}
          mark="sand"
          title="id"
          value={step === 0 ? '1' : '2'}
        />
        <Node
          x={200}
          y={256}
          w={150}
          mark={pending ? 'amber' : 'lilac'}
          title="user"
          value={pending ? 'pending' : landed ? 'Grace' : 'Ada'}
          ring={pending}
        />

        <rect
          x={530}
          y={246}
          width={90}
          height={180}
          filter="url(#pp-marker)"
          style={{ fill: MARKS.blue }}
          opacity={0.75}
        />
        <text
          className="fig-strong"
          x="575"
          y="266"
          textAnchor="middle"
          style={SMALL}
        >
          server
        </text>
        <g opacity={pending ? 1 : 0}>
          <Arrow d="M350 270H524" />
          <text x="437" y="262" textAnchor="middle" style={TINY}>
            GET /api/users/2
          </text>
        </g>
        <g opacity={landed ? 1 : 0}>
          <Arrow d="M524 290H356" dashed />
          <text x="437" y="306" textAnchor="middle" style={TINY}>
            {'{ name: "Grace" }'}
          </text>
        </g>

        <Edge d="M275 300V352" live={landed} />
        <g opacity={pending ? 1 : 0}>
          <text x="284" y="322" style={TINY}>
            the read throws NotReadyError
          </text>
          <text x="284" y="336" style={TINY}>
            {'<Loading> catches it'}
          </text>
        </g>

        <Outline x={170} y={352} w={210} h={84} />
        <text x="275" y="452" textAnchor="middle" style={TINY}>
          {'<Loading>'}
        </text>
        <Node
          x={200}
          y={368}
          w={150}
          h={52}
          mark="sage"
          title="<p>"
          value={`screen: ${landed ? 'Grace' : 'Ada'}`}
          ring={landed}
        />

        <Status y={484}>
          {step === 0
            ? 'The first answer is on screen: Ada.'
            : step === 1
              ? 'setId(2) makes user run again. It returns a promise: user is pending.'
              : step === 2
                ? 'The fetch is in flight. The screen keeps Ada, not a spinner.'
                : 'The answer lands. One flush shows Grace.'}
        </Status>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* 4. Boundaries catch pending and errors (stepped)                     */
/* ------------------------------------------------------------------ */

const BOUNDARY_STEPS = ['pending read', 'error', 'no <Errored>']

/** A pending read stops at <Loading>. An error passes it and stops at <Errored>. */
export function BoundaryCatch() {
  const { ref, step, go, replay } = useSteps(BOUNDARY_STEPS.length, 2200)
  const halted = step === 2
  const lines: Array<CodeLine> = [
    halted
      ? { text: '// no <Errored> above this tree' }
      : { text: '<Errored fallback={<p>Something broke</p>}>', kind: 'sand' },
    { text: '  <Loading fallback={<Spinner />}>', kind: 'sand' },
    { text: '    <Profile />', note: 'reads user: pending' },
    { text: '    <Feed />', note: 'reads posts: error' },
    { text: '  </Loading>' },
    halted ? { text: '' } : { text: '</Errored>' },
  ]
  const active = [[1, 2], [0, 3], [3]][step] ?? []

  return (
    <Figure
      bleed
      title="Each boundary catches one kind of throw"
      legend={[
        { label: 'boundary', mark: 'sand' },
        { label: 'pending', mark: 'amber' },
        { label: 'error', mark: 'rose' },
      ]}
      caption={
        <StepControls
          labels={BOUNDARY_STEPS}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="sa-fig"
        viewBox="0 0 640 430"
        role="img"
        aria-label="Code: an Errored boundary wraps a Loading boundary, which wraps Profile and Feed. A pending read in Profile goes up and stops at Loading, which shows its fallback on the first load and keeps the old frame later. An error in Feed goes up through Loading and stops at Errored, which shows the error fallback. With no Errored above, an error halts the reactive system."
      >
        <CodePanel
          x={10}
          y={6}
          w={620}
          lines={lines}
          active={active}
          mark={step === 0 ? 'amber' : 'rose'}
        />

        <g opacity={halted ? 0 : 1}>
          <Outline x={14} y={160} w={400} h={232} dashed={false} />
          <text className="fig-strong" x="26" y="180" style={SMALL}>
            {'<Errored>'}
          </text>
        </g>
        <Outline x={34} y={210} w={360} h={164} />
        <text className="fig-strong" x="46" y="230" style={SMALL}>
          {'<Loading>'}
        </text>

        <Node
          x={70}
          y={314}
          w={130}
          h={40}
          mark={step === 0 ? 'amber' : 'sand'}
          title="<Profile>"
        />
        <Node
          x={240}
          y={314}
          w={130}
          h={40}
          mark={step === 0 ? 'sand' : 'rose'}
          title="<Feed>"
        />

        <g opacity={step === 0 ? 1 : 0}>
          <Arrow d="M135 308V218" />
          <text x="143" y="270" style={TINY}>
            NotReadyError
          </text>
          <text className="fig-strong" x="143" y="256" style={SMALL}>
            stops here
          </text>
        </g>
        <g opacity={step === 1 ? 1 : 0}>
          <Arrow d="M305 308V168" />
          <text x="313" y="270" style={TINY}>
            error
          </text>
          <text x="313" y="224" style={TINY}>
            passes {'<Loading>'}
          </text>
          <text className="fig-strong" x="313" y="190" style={SMALL}>
            stops here
          </text>
        </g>
        <g opacity={halted ? 1 : 0}>
          <Arrow d="M305 308V176" />
          <text x="313" y="270" style={TINY}>
            error
          </text>
          <text className="fig-strong" x="313" y="190" style={SMALL}>
            nothing catches it
          </text>
        </g>

        <rect
          x={436}
          y={170}
          width={190}
          height={130}
          filter="url(#pp-marker)"
          style={{
            fill: halted ? MARKS.rose : step === 1 ? MARKS.rose : MARKS.amber,
          }}
          opacity={0.85}
        />
        <text className="fig-strong" x="446" y="194" style={SMALL}>
          {step === 0
            ? 'Loading shows'
            : step === 1
              ? 'Errored shows'
              : 'REACTIVITY_HALTED'}
        </text>
        {(step === 0
          ? ['first load: the spinner', 'later: the old frame,', 'held until data lands']
          : step === 1
            ? ['"Something broke"', 'The rest of the app', 'still updates.']
            : ['No more updates run,', 'also for signals that', 'have no relation to Feed.']
        ).map((line, index) => (
          <text key={line} x="446" y={216 + index * 16} style={TINY}>
            {line}
          </text>
        ))}

        <Status y={418}>
          {step === 0
            ? 'A pending read is not an error. <Loading> catches it.'
            : step === 1
              ? 'An error goes past <Loading>. <Errored> catches it.'
              : 'Without <Errored>, one error stops the whole app.'}
        </Status>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* 5. Height order (stepped)                                          */
/* ------------------------------------------------------------------ */

const HEIGHT_STEPS = ['write', 'height 0', 'height 1', 'height 2', 'height 3']

/** A chain and a diamond, flushed one height at a time. */
export function HeightOrder() {
  const { ref, step, go, replay } = useSteps(HEIGHT_STEPS.length, 1500)
  const queued = step === 0

  return (
    <Figure
      bleed
      title="Height order: the flush runs the heap level by level"
      legend={[
        { label: 'signal', mark: 'sand' },
        { label: 'queued write', mark: 'amber' },
        { label: 'memo', mark: 'lilac' },
      ]}
      card={{
        title: 'The rule',
        body: 'height = 1 + the tallest memo a node reads',
      }}
      caption={
        <StepControls
          labels={HEIGHT_STEPS}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="sa-fig"
        viewBox="0 0 640 440"
        role="img"
        aria-label="Two graphs side by side. Left, a chain: the signal price at height 0, memo net at height 1, memo tax at height 2, memo total at height 3, with an edge from net straight to total that skips a level. Right, a diamond: the signal query at height 0, memos list and sorted both at height 1, memo summary at height 2 reading both. After one write, the flush commits the signals at height 0, runs net, list and sorted at height 1, then tax and summary at height 2, then total at height 3. Each memo runs one time."
      >
        <text x="40" y="140" textAnchor="end" style={TINY}>
          height 3
        </text>
        <text x="40" y="212" textAnchor="end" style={TINY}>
          height 2
        </text>
        <text x="40" y="284" textAnchor="end" style={TINY}>
          height 1
        </text>
        <text x="40" y="356" textAnchor="end" style={TINY}>
          height 0
        </text>

        <Outline x={46} y={96} w={270} h={300} />
        <text x={181} y={90} textAnchor="middle" style={TINY}>
          chain: each hop adds one
        </text>
        <Outline x={330} y={96} w={270} h={300} />
        <text x={465} y={90} textAnchor="middle" style={TINY}>
          diamond: two memos, one height
        </text>

        {/* Chain */}
        <Edge d="M170 330V302" live={step >= 2} />
        <Edge d="M170 258V230" live={step >= 3} />
        <Edge d="M170 186V158" live={step >= 4} />
        <Edge
          d="M230 280C282 262 282 178 230 160"
          live={step >= 4}
        />
        <Node
          x={110}
          y={330}
          w={120}
          mark={queued ? 'amber' : 'sand'}
          title="price"
          value={queued ? '10 (next 12)' : '12'}
          ring={step === 1}
        />
        <Node
          x={110}
          y={258}
          w={120}
          mark="lilac"
          title="net"
          value={step >= 2 ? '36' : '30'}
          ring={step === 2}
        />
        <Node
          x={110}
          y={186}
          w={120}
          mark="lilac"
          title="tax"
          value={step >= 3 ? '7.2' : '6'}
          ring={step === 3}
        />
        <Node
          x={110}
          y={114}
          w={120}
          mark="lilac"
          title="total"
          value={step >= 4 ? '43.2' : '36'}
          ring={step === 4}
        />
        <text x={236} y={222} style={TINY}>
          net feeds total too
        </text>

        {/* Diamond */}
        <Edge d="M465 330L405 302" live={step >= 2} />
        <Edge d="M465 330L525 302" live={step >= 2} />
        <Edge d="M405 258L445 230" live={step >= 3} />
        <Edge d="M525 258L485 230" live={step >= 3} />
        <Node
          x={405}
          y={330}
          w={120}
          mark={queued ? 'amber' : 'sand'}
          title="query"
          value={queued ? 'next "ab"' : '"ab"'}
          ring={step === 1}
        />
        <Node
          x={345}
          y={258}
          w={110}
          mark="lilac"
          title="list"
          value={step >= 2 ? '2 rows' : '3 rows'}
          ring={step === 2}
        />
        <Node
          x={470}
          y={258}
          w={110}
          mark="lilac"
          title="sorted"
          value={step >= 2 ? '"ab"' : '"abc"'}
          ring={step === 2}
        />
        <Node
          x={410}
          y={186}
          w={110}
          mark="lilac"
          title="summary"
          value="runs once"
          ring={step === 3}
        />

        <Status y={424}>
          {queued
            ? 'One write. The heap holds the dirty memos, sorted by height.'
            : step === 1
              ? 'Height 0: the signals commit. No memo has run yet.'
              : step === 2
                ? 'Height 1: net, list and sorted run. Same height, any order.'
                : step === 3
                  ? 'Height 2: tax and summary run one time, all inputs fresh.'
                  : 'Height 3: total runs last, after net and tax.'}
        </Status>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* 6. Superseded flights: dropped, or aborted (animated)               */
/* ------------------------------------------------------------------ */

const FLIGHT_STEPS = [
  'first query',
  'four keystrokes',
  'stale answers land',
  'last answer lands',
]
/** The time on the clock at each step, in ms. */
const FLIGHT_NOW = [55, 95, 133, 150]
/** One query, then four keystrokes 10 ms apart. Each fetch takes 50 ms. */
const FLIGHTS = [
  { query: '"s"', start: 0 },
  { query: '"so"', start: 60 },
  { query: '"sol"', start: 70 },
  { query: '"soli"', start: 80 },
  { query: '"solid"', start: 90 },
]
const FETCH_MS = 50
const flightX = (ms: number) => 110 + (ms * 500) / 150

/** One lane: five fetches on a clock, and the renders they cause. */
function FlightLane({
  y,
  abort,
  now,
}: {
  y: number
  abort: boolean
  now: number
}) {
  const flights = FLIGHTS.map((flight, index) => {
    const end = flight.start + FETCH_MS
    const kept = index === 0 || index === FLIGHTS.length - 1
    const abortAt = abort && !kept ? FLIGHTS[index + 1]?.start : undefined
    const stop = abortAt ?? end
    return {
      ...flight,
      end,
      kept,
      abortAt,
      stop,
      started: now >= flight.start,
      done: now >= stop,
    }
  })
  const finished = flights.filter((f) => f.done && f.abortAt === undefined)
  const dropped = finished.filter((f) => !f.kept).length
  const aborted = flights.filter((f) => f.done && f.abortAt !== undefined).length
  const renders = flights.filter((f) => f.kept && f.done)

  return (
    <g>
      <Outline x={14} y={y} w={612} h={180} />
      <text className="fig-strong" x="26" y={y + 18} style={LABEL}>
        {abort ? 'with onCleanup(() => ac.abort())' : 'without onCleanup'}
      </text>
      <text x="614" y={y + 18} textAnchor="end" style={SMALL}>
        {abort
          ? `${finished.length} finished · ${aborted} aborted · ${renders.length} renders`
          : `${finished.length} finished · ${dropped} dropped · ${renders.length} renders`}
      </text>

      {flights.map((flight, index) => {
        const top = y + 28 + index * 22
        const barEnd = Math.min(now, flight.stop)
        const fill = !flight.done
          ? MARKS.amber
          : flight.abortAt === undefined
            ? MARKS.blue
            : MARKS.rose
        return (
          <g key={flight.query}>
            <text x="100" y={top + 12} textAnchor="end" style={MONO}>
              {flight.query}
            </text>
            <rect
              x={flightX(flight.start)}
              y={top}
              width={Math.max(flightX(barEnd) - flightX(flight.start), 2)}
              height={16}
              filter="url(#pp-marker)"
              style={{ fill }}
              opacity={flight.started ? 1 : 0}
            />
            {flight.abortAt === undefined ? (
              <g opacity={flight.done ? 1 : 0}>
                {flight.kept ? null : (
                  <rect
                    x={flightX(flight.end) + 3}
                    y={top + 3}
                    width={9}
                    height={10}
                    filter="url(#pp-marker)"
                    style={{ fill: MARKS.rose }}
                  />
                )}
                <text
                  x={flightX(flight.end) + (flight.kept ? 6 : 16)}
                  y={top + 12}
                  style={TINY}
                >
                  {flight.kept ? 'kept' : 'dropped'}
                </text>
              </g>
            ) : (
              <g opacity={flight.done ? 1 : 0}>
                <Outline
                  x={flightX(flight.abortAt)}
                  y={top}
                  w={flightX(flight.end) - flightX(flight.abortAt)}
                  h={16}
                />
                <text
                  x={(flightX(flight.abortAt) + flightX(flight.end)) / 2}
                  y={top + 12}
                  textAnchor="middle"
                  style={TINY}
                >
                  aborted
                </text>
              </g>
            )}
          </g>
        )
      })}

      <text x="100" y={y + 156} textAnchor="end" style={TINY}>
        renders
      </text>
      {flights
        .filter((flight) => flight.kept)
        .map((flight, index) => (
          <g key={flight.query} opacity={flight.done ? 1 : 0}>
            <rect
              x={flightX(flight.end) - 8}
              y={y + 144}
              width={16}
              height={16}
              filter="url(#pp-marker)"
              style={{ fill: MARKS.sage }}
            />
            <text
              className="fig-strong"
              x={flightX(flight.end)}
              y={y + 156}
              textAnchor="middle"
              style={TINY}
            >
              {index + 1}
            </text>
          </g>
        ))}
    </g>
  )
}

/** A typeahead: five fetches, two answers on screen, with and without abort. */
export function SupersededFlights() {
  const { ref, step, go, replay } = useSteps(FLIGHT_STEPS.length, 1900)
  const now = FLIGHT_NOW[step] ?? 150

  return (
    <Figure
      bleed
      title="Superseded flights: the screen is the same, the server work is not"
      legend={[
        { label: 'in flight', mark: 'amber' },
        { label: 'server finished', mark: 'blue' },
        { label: 'aborted or dropped', mark: 'rose' },
        { label: 'render', mark: 'sage' },
      ]}
      caption={
        <StepControls
          labels={FLIGHT_STEPS}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="sa-fig"
        viewBox="0 0 640 456"
        role="img"
        aria-label="Two timelines of the same typeahead. One query, s, starts at 0 ms, then four keystrokes start fetches at 60, 70, 80 and 90 ms. Each fetch takes 50 ms. Without onCleanup, all five fetches run to the end on the server, and Solid drops the three middle answers when they land. With onCleanup and an AbortController, each new run aborts the fetch before it, so three fetches stop after 10 ms and two finish. In both timelines the render effect runs two times: at 50 ms for s and at 140 ms for solid."
      >
        <text x={flightX(0)} y="24" textAnchor="middle" style={TINY}>
          0 ms
        </text>
        <text x={flightX(50)} y="24" textAnchor="middle" style={TINY}>
          50
        </text>
        <text x={flightX(100)} y="24" textAnchor="middle" style={TINY}>
          100
        </text>
        <text x={flightX(150)} y="24" textAnchor="middle" style={TINY}>
          150 ms
        </text>

        <FlightLane y={36} abort={false} now={now} />
        <FlightLane y={232} abort now={now} />

        <Status y={440}>
          {step === 0
            ? 'The first query lands at 50 ms. Both versions render it.'
            : step === 1
              ? 'Four keystrokes, 10 ms apart. With onCleanup, each run aborts the last fetch.'
              : step === 2
                ? 'Without onCleanup, three stale answers land. Solid drops them.'
                : 'The last answer lands. Both render it: two effect runs each.'}
        </Status>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* 7. Landing batching: 1,001 runs against one frame (animated)        */
/* ------------------------------------------------------------------ */

const LANDING_STEPS = ['empty state', 'first answers', 'most answers', 'all landed']
/** The time on the clock at each step, in ms. */
const LANDING_NOW = [0, 22, 26.5, 29.5]
/** Twelve landings drawn for 1,000 sources, each on a 20 to 29 ms timer. */
const LANDINGS = [
  20.2, 20.9, 21.5, 22.3, 23.1, 23.8, 24.6, 25.4, 26.2, 27.1, 28.0, 28.9,
]
const SOURCES = 1000
const landX = (ms: number) => 150 + (ms - 19.5) * 28

/** 1,000 async sources and one effect that adds them: 1.9 against 2.0. */
export function LandingBatch() {
  const { ref, step, go, replay } = useSteps(LANDING_STEPS.length, 1900)
  const now = LANDING_NOW[step] ?? 29.5
  const landed = LANDINGS.filter((ms) => ms <= now)
  const newest = landed[landed.length - 1]
  const committed = landed.length === LANDINGS.length
  const oldRuns = 1 + Math.round((landed.length / LANDINGS.length) * SOURCES)
  const heldEnd = landX(Math.min(Math.max(now, 19.5), LANDINGS[LANDINGS.length - 1] ?? 29))
  const blockH = (108 * oldRuns) / (SOURCES + 1)

  return (
    <Figure
      bleed
      title="Landing batching: 1,000 answers, one frame"
      legend={[
        { label: 'answer lands', mark: 'blue' },
        { label: 'effect run, 1.9', mark: 'sand' },
        { label: 'held change', mark: 'amber' },
        { label: 'effect run, 2.0', mark: 'sage' },
      ]}
      caption={
        <StepControls
          labels={LANDING_STEPS}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="sa-fig"
        viewBox="0 0 640 436"
        role="img"
        aria-label="Two lanes on one clock. 1,000 async sources each land at 20 to 29 ms; twelve landings are drawn. In Solid 1.9, with createResource and createEffect, the effect runs one time for the empty state and one time for each resource that lands, 1,001 runs on the first load. In Solid 2.0, with async memos and a render effect, the change is held while the answers land, and the screen keeps its frame. After the last answer, one frame commits and the effect runs one time."
      >
        <text x="100" y="26" textAnchor="middle" style={TINY}>
          0 ms
        </text>
        <text x={landX(20)} y="26" textAnchor="middle" style={TINY}>
          20
        </text>
        <text x={landX(25)} y="26" textAnchor="middle" style={TINY}>
          25
        </text>
        <text x={landX(29)} y="26" textAnchor="middle" style={TINY}>
          29 ms
        </text>
        <text x="540" y="26" textAnchor="middle" style={TINY}>
          effect runs
        </text>

        {/* Solid 1.9 */}
        <Outline x={14} y={36} w={612} h={170} />
        <text className="fig-strong" x="26" y="54" style={LABEL}>
          Solid 1.9: createResource + createEffect
        </text>
        <text x="24" y="77" style={TINY}>
          answers
        </text>
        <text x="24" y="111" style={TINY}>
          effect
        </text>
        <rect
          x={96}
          y={92}
          width={8}
          height={30}
          filter="url(#pp-marker)"
          style={{ fill: MARKS.sand }}
        />
        <text x="100" y="138" textAnchor="middle" style={TINY}>
          empty
        </text>
        {LANDINGS.map((ms) => {
          const on = ms <= now
          return (
            <g key={ms} opacity={on ? 1 : 0}>
              <rect
                x={landX(ms) - 3}
                y={66}
                width={6}
                height={14}
                filter="url(#pp-marker)"
                style={{ fill: MARKS.blue }}
              />
              <Edge d={`M${landX(ms)} 80V92`} live={ms === newest} />
              <rect
                x={landX(ms) - 4}
                y={92}
                width={8}
                height={30}
                filter="url(#pp-marker)"
                style={{ fill: MARKS.sand }}
              />
            </g>
          )
        })}
        <text x="150" y="160" style={TINY}>
          each tick stands for about 83 sources
        </text>
        <rect
          x={470}
          y={176 - blockH}
          width={140}
          height={blockH}
          filter="url(#pp-marker)"
          style={{ fill: MARKS.sand }}
        />
        <text
          className="fig-strong"
          x="540"
          y="194"
          textAnchor="middle"
          style={LABEL}
        >
          {oldRuns.toLocaleString('en-US')}
        </text>

        {/* Solid 2.0 */}
        <Outline x={14} y={222} w={612} h={170} />
        <text className="fig-strong" x="26" y="240" style={LABEL}>
          Solid 2.0: async memos + render effect
        </text>
        <text x="24" y="263" style={TINY}>
          answers
        </text>
        <text x="24" y="297" style={TINY}>
          screen
        </text>
        <rect
          x={96}
          y={278}
          width={Math.max(heldEnd - 96, 8)}
          height={30}
          filter="url(#pp-marker)"
          style={{ fill: MARKS.amber }}
          opacity={committed ? 0.45 : 1}
        />
        <text x="104" y="297" style={TINY} opacity={step >= 2 ? 1 : 0}>
          held: the screen keeps its frame
        </text>
        {LANDINGS.map((ms) => (
          <g key={ms} opacity={ms <= now ? 1 : 0}>
            <rect
              x={landX(ms) - 3}
              y={252}
              width={6}
              height={14}
              filter="url(#pp-marker)"
              style={{ fill: MARKS.blue }}
            />
            <Edge d={`M${landX(ms)} 266V278`} live={ms === newest} />
          </g>
        ))}
        <g opacity={committed ? 1 : 0}>
          <rect
            x={418}
            y={278}
            width={14}
            height={30}
            filter="url(#pp-marker)"
            style={{ fill: MARKS.sage }}
          />
          <rect
            className="sa-ring is-on"
            x={414}
            y={274}
            width={22}
            height={38}
            rx="6"
          />
          <text x="425" y="326" textAnchor="middle" style={TINY}>
            one frame
          </text>
        </g>
        <text x="150" y="346" style={TINY}>
          the effect waits for the answers it reads, then runs
        </text>
        <rect
          x={526}
          y={334}
          width={28}
          height={28}
          filter="url(#pp-marker)"
          style={{ fill: MARKS.sage }}
          opacity={committed ? 1 : 0}
        />
        <text
          className="fig-strong"
          x="540"
          y="380"
          textAnchor="middle"
          style={LABEL}
        >
          {committed ? '1' : '0'}
        </text>

        <Status y={420}>
          {step === 0
            ? 'First load. 1.9 runs the effect for the empty state. 2.0 holds.'
            : step === 1
              ? 'Answers land. 1.9 runs the effect again for each one.'
              : step === 2
                ? '1.9 runs keep stacking up. 2.0 still shows its old frame.'
                : 'The last answer lands. 2.0 commits one frame: 1 run, not 1,001.'}
        </Status>
      </svg>
    </Figure>
  )
}
