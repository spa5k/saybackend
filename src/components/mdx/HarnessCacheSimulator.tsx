import { useState } from 'react'
import {
  FigChip,
  InteractiveFigure,
  Reveal,
  T,
  fig,
  accentTint,
} from './editorialFigure'
import { ClaudeIcon, CodexIcon, OpencodeIcon, PiIcon } from './harnessIcons'

type HarnessId = 'claude' | 'codex' | 'pi' | 'opencode'
type ReqLabel = 'read' | 'write' | 'compact'
type Req = { total: number; cached: number; label: ReqLabel; note?: string }

const MAX_UNITS = 8
const WINDOW = 9
const U = 14 // pixels per turn-unit
const BASE_Y = 246 // rail baseline
const X0 = 84 // first slot
const PITCH = 64
const BAR_W = 40

/** Deterministic jitter, same family as the lieflat rnd(i, k). */
const rnd = (i: number, k: number) =>
  Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000

const HARNESS_INFO: Record<HarnessId, { label: string; intro: string }> = {
  claude: {
    label: 'Claude Code',
    intro:
      'Claude Code orders each request so rarely-changing content comes first — run a session and watch which requests keep the prefix.',
  },
  codex: {
    label: 'Codex',
    intro:
      'Codex does no harness-level caching — the provider caches the full rendered context automatically, and the session shape decides the hit rate.',
  },
  pi: {
    label: 'pi',
    intro:
      'pi compacts: when the estimate crosses window − 16,384, the context is rebuilt as system + summary + kept messages.',
  },
  opencode: {
    label: 'opencode v2',
    intro:
      'opencode v2 warms the provider cache during idle pauses and checkpoints the context when it fills.',
  },
}

const HARNESS_IDS: HarnessId[] = ['claude', 'codex', 'pi', 'opencode']

const HARNESS_ICON: Record<
  HarnessId,
  (props: { size?: number }) => React.JSX.Element
> = {
  claude: ClaudeIcon,
  codex: CodexIcon,
  pi: PiIcon,
  opencode: OpencodeIcon,
}

type SimState = {
  harness: HarnessId
  warming: boolean
  contextSize: number
  cachedPrefix: number
  reqs: Req[]
}

function Badge({ cx, y, label }: { cx: number; y: number; label: ReqLabel }) {
  // Solid, high-contrast pills: read = cache blue, write = compute amber,
  // compact = the rebuild event in brand brick, hollow + dashed.
  const styles =
    label === 'read'
      ? {
          fill: fig.accent,
          stroke: fig.accent,
          color: fig.paper,
          dash: undefined,
        }
      : label === 'write'
        ? {
            fill: fig.data2,
            stroke: fig.data2,
            color: fig.ink,
            dash: undefined,
          }
        : {
            fill: 'rgba(157,58,50,.12)',
            stroke: fig.brick,
            color: fig.brick,
            dash: '3 2',
          }
  const w = label === 'compact' ? 50 : 36
  return (
    <g>
      <rect
        x={cx - w / 2}
        y={y}
        width={w}
        height={16}
        rx={8}
        fill={styles.fill}
        stroke={styles.stroke}
        strokeWidth={1.5}
        strokeDasharray={styles.dash}
      />
      <text
        x={cx}
        y={y + 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9.5}
        fontWeight={700}
        fill={styles.color}
        style={{ fontFamily: 'var(--font-mono, monospace)' }}
      >
        {label}
      </text>
    </g>
  )
}

/** Pure drawing of the simulator; exported so any state can be rendered. */
export function SimCanvas({ harness, cachedPrefix, reqs }: SimState) {
  const shown = reqs.slice(-WINDOW)
  const firstIndex = reqs.length - shown.length
  const newest = reqs.length

  return (
    <Reveal>
      <svg
        viewBox="0 0 720 340"
        role="img"
        aria-label="Interactive simulator: send turns and harness actions to see which requests hit the prompt cache"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        {/* Cached-prefix meter */}
        <T x={84} y={24} size={10.5} weight={700} color={fig.ink}>
          cached prefix
        </T>
        <T
          x={636}
          y={24}
          size={10}
          weight={600}
          mono
          color={cachedPrefix > 0 ? fig.accent : fig.muted}
          anchor="end"
        >
          {`${cachedPrefix} / ${MAX_UNITS} · ${cachedPrefix > 0 ? 'warm' : 'cold'}`}
        </T>
        <rect
          x={84}
          y={32}
          width={552}
          height={14}
          rx={2}
          fill="none"
          stroke={fig.lineStrong}
          strokeWidth={1}
        />
        {cachedPrefix > 0 && (
          <rect
            x={85}
            y={33}
            width={550 * (cachedPrefix / MAX_UNITS)}
            height={12}
            rx={1}
            fill={accentTint(0.3)}
          />
        )}
        {Array.from({ length: MAX_UNITS - 1 }, (_, k) => (
          <line
            key={k}
            x1={85 + (550 * (k + 1)) / MAX_UNITS}
            y1={34}
            x2={85 + (550 * (k + 1)) / MAX_UNITS}
            y2={44}
            stroke={fig.grid}
            strokeWidth={1}
          />
        ))}
        {(harness === 'pi' || harness === 'opencode') && (
          <g>
            <line
              x1={636}
              y1={26}
              x2={636}
              y2={52}
              stroke={fig.accent}
              strokeWidth={1}
              strokeDasharray="2 2"
            />
            <T x={636} y={64} size={9} mono color={fig.muted} anchor="middle">
              {harness === 'pi' ? 'auto-compact' : 'auto-checkpoint'}
            </T>
          </g>
        )}

        {/* Rail gridlines + unit axis */}
        {Array.from({ length: MAX_UNITS }, (_, k) => {
          const y = BASE_Y - (k + 1) * U
          return (
            <g key={k}>
              <line
                x1={64}
                y1={y}
                x2={656}
                y2={y}
                stroke={fig.grid}
                strokeWidth={1}
                strokeDasharray="1 5"
                className="lf-fade"
                style={{ animationDelay: `${k * 0.02}s` }}
              />
              {(k + 1) % 2 === 0 && (
                <T
                  x={56}
                  y={y + 3}
                  size={9}
                  mono
                  color={fig.faint}
                  anchor="end"
                  className="lf-fade"
                  style={{ animationDelay: `${k * 0.02}s` }}
                >
                  {k + 1}
                </T>
              )}
            </g>
          )
        })}

        {/* Request rail */}
        <line
          x1={64}
          y1={BASE_Y}
          x2={656}
          y2={BASE_Y}
          stroke={fig.lineStrong}
          strokeWidth={1}
        />
        {shown.length === 0 && (
          <T x={360} y={170} size={11} color={fig.faint} anchor="middle">
            press ‘next turn’ to send the first request
          </T>
        )}
        {shown.map((req, i) => {
          const x = X0 + i * PITCH
          const cx = x + BAR_W / 2
          const turn = firstIndex + i + 1
          const top = BASE_Y - req.total * U
          const isNewest = turn === newest
          return (
            <g key={turn}>
              {/*
              F1 rung bar: one rung = one turn-unit, each bar countable.
              Cached rungs sit at the base in deep hero blue; computed rungs
              above them in light blue. A dot marks every fifth rung.
            */}
              {Array.from({ length: req.total }, (_, k) => {
                const isCached = k < req.cached
                const y = BASE_Y - k * U
                const w = BAR_W - 4 + rnd(k + 1, turn + 2) * 3
                return (
                  <line
                    key={k}
                    x1={cx - w / 2}
                    y1={y}
                    x2={cx + w / 2}
                    y2={y}
                    stroke={isCached ? fig.accent : fig.data2}
                    strokeWidth={2}
                    opacity={0.9 + rnd(k + 3, turn + 5) * 0.1}
                    className="lf-fade"
                    style={{ animationDelay: `${i * 0.08 + k * 0.012}s` }}
                  />
                )
              })}
              {Array.from({ length: req.total }, (_, k) =>
                k % 5 === 4 ? (
                  <circle
                    key={`d${k}`}
                    cx={cx + BAR_W / 2 + 5}
                    cy={BASE_Y - k * U}
                    r={0.9}
                    fill={fig.faintdata}
                    className="lf-fade"
                    style={{ animationDelay: `${i * 0.08 + k * 0.012}s` }}
                  />
                ) : null,
              )}
              <Badge cx={cx} y={top - 20} label={req.label} />
              {isNewest && (
                <T
                  x={cx}
                  y={top - 36}
                  size={12}
                  weight={800}
                  color={fig.accent}
                  anchor="middle"
                  halo
                  className="lf-fade"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {req.total}
                </T>
              )}
              <T
                x={cx}
                y={BASE_Y + 16}
                size={10}
                weight={isNewest ? 600 : 400}
                mono
                color={isNewest ? fig.accent : fig.faint}
                anchor="middle"
              >
                {`t${turn}`}
              </T>
              {isNewest && (
                <line
                  x1={cx - 9}
                  y1={BASE_Y + 20}
                  x2={cx + 9}
                  y2={BASE_Y + 20}
                  stroke={fig.accent}
                  strokeWidth={1.5}
                />
              )}
              {req.note && (
                <T
                  x={cx}
                  y={BASE_Y + 32}
                  size={9.5}
                  color={fig.muted}
                  anchor="middle"
                >
                  {req.note}
                </T>
              )}
            </g>
          )
        })}

        {/* Legend */}
        <g>
          <rect
            x={84}
            y={306}
            width={16}
            height={10}
            rx={2}
            fill={fig.accent}
          />
          <T x={108} y={315} size={11} color={fig.muted}>
            cache read — ~0.1× input
          </T>
          <rect
            x={310}
            y={306}
            width={16}
            height={10}
            rx={2}
            fill={fig.data2}
          />
          <T x={334} y={315} size={11} color={fig.muted}>
            computed / written — 1× to 1.25×
          </T>
        </g>
      </svg>
    </Reveal>
  )
}

export default function HarnessCacheSimulator() {
  const [harness, setHarness] = useState<HarnessId>('claude')
  const [warming, setWarming] = useState(true)
  const [contextSize, setContextSize] = useState(1)
  const [cachedPrefix, setCachedPrefix] = useState(0)
  const [reqs, setReqs] = useState<Req[]>([])
  const [verdict, setVerdict] = useState(HARNESS_INFO.claude.intro)

  function request(
    req: Req,
    opts: {
      contextSize: number
      cachedPrefix: number
      verdict: string
    },
  ) {
    setReqs((rs) => [...rs, req].slice(-WINDOW))
    setContextSize(opts.contextSize)
    setCachedPrefix(opts.cachedPrefix)
    setVerdict(opts.verdict)
  }

  function act(actionId: string) {
    const capped = (n: number) => Math.min(n, MAX_UNITS)

    if (actionId === 'next') {
      // pi / opencode auto-compact when the context is full
      if (
        (harness === 'pi' || harness === 'opencode') &&
        contextSize >= MAX_UNITS
      ) {
        const isPi = harness === 'pi'
        request(
          {
            total: contextSize,
            cached: Math.min(cachedPrefix, contextSize),
            label: 'compact',
            note: isPi ? 'auto' : 'checkpoint',
          },
          {
            contextSize: 3,
            cachedPrefix: 2,
            verdict: isPi
              ? 'The estimate crossed window − 16,384 — pi auto-compacted: the summary replaces older messages (the compaction call skips cache writes), while the system prompt and project context still hit. The conversation cache restarts.'
              : 'The context filled — opencode compacted into a checkpoint; later requests rebuild from checkpoint plus tail, and the cache restarts there.',
          },
        )
        return
      }
      const total = capped(contextSize + 1)
      const cached = Math.min(cachedPrefix, contextSize)
      request(
        { total, cached, label: cached > 0 ? 'read' : 'write' },
        {
          contextSize: total,
          cachedPrefix: capped(cached + 1),
          verdict:
            cached > 0
              ? `Cache hit — ${cached} of ${total} turn-units served at ~0.1× of the input rate; only the new tail is computed.`
              : `Cache miss — the full request (${total} units) is computed and written at 1.25×.`,
        },
      )
      return
    }

    if (
      actionId === 'model' ||
      actionId === 'effort' ||
      actionId === 'fast' ||
      actionId === 'tool'
    ) {
      const verdicts: Record<string, [string, string]> = {
        model: [
          'model switch',
          'The model is part of the cache key — the identical prompt is a brand-new prefix on the other model, so the whole request recomputes.',
        ],
        effort: [
          'effort',
          'Effort level is part of the cache key for the same model — a new prefix, a full recompute.',
        ],
        fast: [
          'fast mode',
          'Fast mode adds a request header that is also part of the key — the first request with it re-reads the whole conversation.',
        ],
        tool: [
          'deny a tool',
          'Tool definitions live in the system prompt — the set changed, and everything behind it recomputes.',
        ],
      }
      request(
        {
          total: contextSize,
          cached: 0,
          label: 'write',
          note: verdicts[actionId][0],
        },
        { contextSize, cachedPrefix: 1, verdict: verdicts[actionId][1] },
      )
      return
    }

    if (actionId === 'md') {
      const total = capped(contextSize + 1)
      const cached = Math.min(cachedPrefix, contextSize)
      request(
        {
          total,
          cached,
          label: cached > 0 ? 'read' : 'write',
          note: 'CLAUDE.md',
        },
        {
          contextSize: total,
          cachedPrefix: capped(cached + 1),
          verdict:
            'No invalidation — the edit is not part of the prompt until the next clear, compact, or restart. The prefix stays cached.',
        },
      )
      return
    }

    if (actionId === 'compact') {
      if (harness === 'pi') {
        request(
          {
            total: contextSize,
            cached: Math.min(cachedPrefix, contextSize),
            label: 'compact',
            note: 'compact',
          },
          {
            contextSize: 3,
            cachedPrefix: 2,
            verdict:
              'pi rebuilds the request as system + summary + kept messages. The compaction call reads the warm prefix but skips cache writes — only the system prompt and project context keep their cached entry; the conversation cache restarts.',
          },
        )
      } else {
        request(
          {
            total: contextSize,
            cached: Math.min(cachedPrefix, contextSize),
            label: 'compact',
            note: 'compact',
          },
          {
            contextSize: 3,
            cachedPrefix: 2,
            verdict:
              'The summarization request reuses the warm cache; the summary then replaces the history — system and project context keep their cached prefix.',
          },
        )
      }
      return
    }

    if (actionId === 'rewind') {
      const size = Math.max(2, contextSize - 2)
      const cached = Math.min(cachedPrefix, size - 1)
      request(
        { total: size, cached, label: 'read', note: 'rewind' },
        {
          contextSize: size,
          cachedPrefix: cached,
          verdict:
            'Rewinding truncates to a prefix that is already cached — it reads the older entry instead of recomputing.',
        },
      )
      return
    }

    if (actionId === 'ttl') {
      const total = capped(contextSize + 1)
      request(
        {
          total,
          cached: 0,
          label: 'write',
          note: harness === 'claude' ? 'idle — TTL' : 'pause 45 min',
        },
        {
          contextSize: total,
          cachedPrefix: 1,
          verdict:
            harness === 'claude'
              ? 'Idle past the TTL (1 h on a subscription, 5 min otherwise) — the cached prefix expired and the full input is recomputed.'
              : 'A cached prefix stays eligible for roughly 30 minutes — idle past that, the full context is recomputed.',
        },
      )
      return
    }

    if (actionId === 'pause') {
      const total = capped(contextSize + 1)
      if (warming) {
        const cached = Math.min(cachedPrefix, contextSize)
        request(
          {
            total,
            cached,
            label: cached > 0 ? 'read' : 'write',
            note: 'pause 45 min',
          },
          {
            contextSize: total,
            cachedPrefix: capped(cached + 1),
            verdict:
              'Keep-alive requests every four idle minutes hold the provider cache across the pause — the next turn reads it back.',
          },
        )
      } else {
        request(
          { total, cached: 0, label: 'write', note: 'pause 45 min' },
          {
            contextSize: total,
            cachedPrefix: 1,
            verdict:
              'Without warming, a 45-minute pause outlives the ≈30-minute window — the next turn recomputes the full context.',
          },
        )
      }
      return
    }

    if (actionId === 'pause10') {
      const total = capped(contextSize + 1)
      const cached = Math.min(cachedPrefix, contextSize)
      request(
        {
          total,
          cached,
          label: cached > 0 ? 'read' : 'write',
          note: 'pause 10 min',
        },
        {
          contextSize: total,
          cachedPrefix: capped(cached + 1),
          verdict:
            'Ten minutes sits well inside the ≈30-minute window — the cache is still warm and the next turn reads it back.',
        },
      )
      return
    }

    if (actionId === 'newsess') {
      request(
        {
          total: 1,
          cached: 0,
          label: 'write',
          note: harness === 'claude' ? 'clear' : 'new session',
        },
        {
          contextSize: 1,
          cachedPrefix: 1,
          verdict:
            harness === 'claude'
              ? 'Clearing starts a fresh conversation — the first request writes a brand-new prefix, system prompt and project context included.'
              : 'A new session starts a fresh conversation — the first request writes a brand-new prefix.',
        },
      )
      return
    }

    if (actionId === 'burst') {
      const total = capped(contextSize + 1)
      request(
        { total, cached: 0, label: 'write', note: 'burst >15/m' },
        {
          contextSize: total,
          cachedPrefix: 1,
          verdict:
            'Above ~15 requests per minute, traffic can overflow to a machine that lacks the entry — the prompt cache key steers routing but does not guarantee a hit.',
        },
      )
    }
  }

  function switchHarness(h: HarnessId) {
    setHarness(h)
    setContextSize(1)
    setCachedPrefix(0)
    setReqs([])
    setWarming(true)
    setVerdict(HARNESS_INFO[h].intro)
  }

  function reset() {
    switchHarness(harness)
  }

  return (
    <InteractiveFigure
      title="The harness cache, simulated"
      hint="pick a harness — every button sends the next request"
      controls={
        <>
          <div className="fig-controls__row" role="group" aria-label="Harness">
            {HARNESS_IDS.map((h) => {
              const Icon = HARNESS_ICON[h]
              return (
                <FigChip
                  key={h}
                  active={harness === h}
                  onClick={() => switchHarness(h)}
                >
                  <Icon />
                  {HARNESS_INFO[h].label}
                </FigChip>
              )
            })}
          </div>
          <span className="fig-hint">run the session</span>
          <div
            className="fig-controls__row"
            role="group"
            aria-label="Run the session"
          >
            <FigChip onClick={() => act('next')}>+ next turn</FigChip>
            {harness === 'claude' && (
              <>
                <FigChip onClick={() => act('compact')}>compact</FigChip>
                <FigChip onClick={() => act('rewind')}>rewind</FigChip>
              </>
            )}
            {harness === 'pi' && (
              <FigChip onClick={() => act('compact')}>compact now</FigChip>
            )}
            {(harness === 'codex' || harness === 'opencode') && (
              <FigChip onClick={() => act('pause10')}>pause 10 min</FigChip>
            )}
            {harness === 'opencode' && (
              <FigChip active={warming} onClick={() => setWarming(!warming)}>
                warming
              </FigChip>
            )}
            <FigChip onClick={reset}>reset</FigChip>
          </div>
          <span className="fig-hint">…or break the cache</span>
          <div
            className="fig-controls__row"
            role="group"
            aria-label="Break the cache"
          >
            {harness === 'claude' && (
              <>
                <FigChip onClick={() => act('model')}>switch model</FigChip>
                <FigChip onClick={() => act('effort')}>change effort</FigChip>
                <FigChip onClick={() => act('fast')}>fast mode</FigChip>
                <FigChip onClick={() => act('tool')}>deny a tool</FigChip>
                <FigChip onClick={() => act('md')}>edit CLAUDE.md</FigChip>
                <FigChip onClick={() => act('newsess')}>clear session</FigChip>
                <FigChip onClick={() => act('ttl')}>idle past TTL</FigChip>
              </>
            )}
            {harness === 'codex' && (
              <>
                <FigChip onClick={() => act('ttl')}>pause 45 min</FigChip>
                <FigChip onClick={() => act('burst')}>
                  burst &gt; 15 req/min
                </FigChip>
                <FigChip onClick={() => act('newsess')}>new session</FigChip>
              </>
            )}
            {harness === 'pi' && (
              <FigChip onClick={() => act('newsess')}>new session</FigChip>
            )}
            {harness === 'opencode' && (
              <>
                <FigChip onClick={() => act('pause')}>pause 45 min</FigChip>
                <FigChip onClick={() => act('newsess')}>new session</FigChip>
              </>
            )}
          </div>
        </>
      }
      verdict={verdict}
      caption="One session, four harnesses: every button sends the next request. Blue is served from cache; gray is computed and written."
    >
      <SimCanvas
        harness={harness}
        warming={warming}
        contextSize={contextSize}
        cachedPrefix={cachedPrefix}
        reqs={reqs}
      />
    </InteractiveFigure>
  )
}
