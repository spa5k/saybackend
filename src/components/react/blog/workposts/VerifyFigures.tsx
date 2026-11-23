import { Figure, HandNote, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

import {
  Box,
  Edge,
  LABEL,
  MONO,
  Node,
  SMALL,
  Status,
  StepControls,
  TINY,
  useLoop,
  useSteps,
} from './motion'

/*
 * Figures for the verification post.
 *   blue   an agent
 *   sand   shared state: the shared database, the claims directory
 *   lilac  a record that is being written
 *   sage   passed, or the part that wins
 *   amber  could not check, incomplete
 *   rose   refused, failed, or the hosted database
 */

/* ------------------------------------------------------------------ */
/* Two agents race for one port                                        */
/* ------------------------------------------------------------------ */

const PORT_STEPS = [
  'Both agents hash their checkout to port 3101.',
  'Each writes its owner record, pid and start time, into a draft.',
  'Both rename the draft onto claims/3101. One rename wins.',
  'The loser gets "exists" and probes the next port.',
  'Later, agent A exits. Its claim is abandoned and can be taken.',
]

const PORTS = [3100, 3101, 3102, 3103]
const portY = (index: number) => 58 + index * 40

export function PortClaim() {
  const { ref, step } = useLoop(PORT_STEPS.length, 2000, 1.6)
  const drafts = step >= 1 && step <= 2
  const aWon = step >= 2
  const bWon = step >= 3
  const aGone = step >= 4

  const claimMark = (port: number): MarkName | null => {
    if (port === 3101 && aWon) return aGone ? 'amber' : 'sage'
    if (port === 3102 && bWon) return 'sage'
    return null
  }

  return (
    <Figure
      title="A port claim is a directory rename, so only one agent wins"
      legend={[
        { label: 'agent', mark: 'blue' },
        { label: 'owner record', mark: 'lilac' },
        { label: 'claimed', mark: 'sage' },
        { label: 'abandoned', mark: 'amber' },
      ]}
      caption="Ports come from a range of 800, 3100 to 3899. The claims live in the Git common directory, so every worktree sees them."
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 248"
        role="img"
        aria-label="Two agents prefer port 3101. Each writes an owner record with its process ID and start time into a draft directory, then renames it onto claims/3101. The rename is atomic, so agent A wins and agent B gets an exists error and takes 3102. When agent A exits, its claim is abandoned and another agent can take it."
      >
        <Node x={24} y={52} w={110} mark="blue" title="Agent A" ring={step === 2} />
        <Node
          x={24}
          y={142}
          w={110}
          mark="blue"
          title="Agent B"
          ring={step === 3}
        />
        <g opacity={aGone ? 0.3 : 1}>
          <text x="79" y="112" textAnchor="middle" style={TINY}>
            {aGone ? 'exited' : 'pid 4121'}
          </text>
        </g>

        <text className="fig-strong" x="200" y="34" style={LABEL}>
          drafts
        </text>
        <g opacity={drafts ? 1 : 0.12}>
          <Box x={190} y={60} w={130} h={30} mark="lilac" />
          <text x="200" y="80" style={MONO}>
            A: pid, start
          </text>
          <Box x={190} y={150} w={130} h={30} mark="lilac" />
          <text x="200" y="170" style={MONO}>
            B: pid, start
          </text>
        </g>

        <Edge d="M134 74H186" live={step === 1} arrow />
        <Edge d="M134 164H186" live={step === 1} arrow />
        <Edge
          d={`M320 75C370 75 380 ${portY(1) + 14} 420 ${portY(1) + 14}`}
          live={step === 2}
          arrow
        />
        <Edge
          d={`M320 165C370 165 380 ${portY(step >= 3 ? 2 : 1) + 14} 420 ${portY(step >= 3 ? 2 : 1) + 14}`}
          live={step === 2 || step === 3}
          arrow
        />

        <text className="fig-strong" x="430" y="34" style={LABEL}>
          claims/
        </text>
        {PORTS.map((port, index) => {
          const mark = claimMark(port)
          return (
            <g key={port}>
              <rect
                x="426"
                y={portY(index)}
                width="190"
                height="28"
                rx="3"
                style={{ fill: 'none', stroke: 'var(--line)' }}
              />
              {mark ? (
                <Box x={426} y={portY(index)} w={190} h={28} mark={mark} />
              ) : null}
              <text x="438" y={portY(index) + 19} style={MONO}>
                {port}
              </text>
              <text x="604" y={portY(index) + 19} textAnchor="end" style={SMALL}>
                {port === 3101 && aWon
                  ? aGone
                    ? 'abandoned'
                    : 'agent A'
                  : port === 3102 && bWon
                    ? 'agent B'
                    : ''}
              </text>
            </g>
          )
        })}
        {step === 3 ? (
          <text x="350" y="214" style={{ ...SMALL, fill: MARKS.rose }}>
            B: rename onto 3101 → exists
          </text>
        ) : null}

        <Status y={240}>{PORT_STEPS[step]}</Status>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* The database URL that passed the "local only" guard                 */
/* ------------------------------------------------------------------ */

type Token = { text: string; part: 'user' | 'hosted' | 'local' | 'path' }

const URL_TOKENS: Array<Token> = [
  { text: 'postgres://user:pass@', part: 'user' },
  { text: 'db.hosted.example:6543,', part: 'hosted' },
  { text: '@localhost', part: 'local' },
  { text: '/postgres', part: 'path' },
]

const CHAR = 7
const tokenW = (token: Token) => token.text.length * CHAR + 14

const GUARD_STEPS = [
  {
    reader: 'The guard reads it with new URL()',
    pick: 'local' as const,
    result: 'host = localhost, so the guard allows it',
    mark: 'sage' as MarkName,
  },
  {
    reader: 'The driver cuts at the first @, then splits on commas',
    pick: 'hosted' as const,
    result: 'the first host is the hosted database',
    mark: 'rose' as MarkName,
  },
  {
    reader: 'The fix: the guard reads the hosts the driver will use',
    pick: 'hosted' as const,
    result: 'not localhost or 127.x, so it is refused',
    mark: 'amber' as MarkName,
  },
]

export function GuardBypass() {
  const { ref, step } = useLoop(GUARD_STEPS.length, 2600, 1.4)
  const frame = GUARD_STEPS[step] ?? GUARD_STEPS[0]
  let x = 24

  return (
    <Figure
      title="One URL, two parsers, two different hosts"
      legend={[
        { label: 'host the guard checked', mark: 'sage' },
        { label: 'host the driver used', mark: 'rose' },
        { label: 'refused by the fix', mark: 'amber' },
      ]}
      caption="The host name is made up. The shape of the URL is the one an independent review found."
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 176"
        role="img"
        aria-label="A database URL with a hosted host before a comma and localhost after a second at sign. The guard parsed it with new URL and saw localhost, so it allowed it. The Postgres driver cuts at the first at sign and splits on commas, so it connected to the hosted database. The fix makes the guard read the same hosts the driver uses."
      >
        {URL_TOKENS.map((token) => {
          const w = tokenW(token)
          const left = x
          x += w + 4
          const on = token.part === frame.pick
          return (
            <g key={token.text}>
              {on ? (
                <Box x={left} y={30} w={w} h={30} mark={frame.mark} />
              ) : (
                <rect
                  x={left}
                  y={30}
                  width={w}
                  height={30}
                  rx="3"
                  style={{ fill: 'none', stroke: 'var(--line)' }}
                />
              )}
              <text x={left + 7} y={50} style={MONO}>
                {token.text}
              </text>
            </g>
          )
        })}

        <text className="fig-strong" x="24" y="100" style={LABEL}>
          {step + 1}. {frame.reader}
        </text>
        <text x="24" y="124" style={SMALL}>
          → {frame.result}
        </text>
        <path className="fig-axis" d="M24 144H616" />
        <text x="24" y="164" style={TINY}>
          The same bug was already in the older helper that creates test
          accounts.
        </text>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* The trial: ten pull requests in two waves                           */
/* ------------------------------------------------------------------ */

type TrialTile = {
  model: string
  result: 'passed' | 'no-check' | 'defect'
  note: string
}

const WAVE_ONE: Array<TrialTile> = [
  { model: 'Opus 5.5', result: 'passed', note: 'passed' },
  { model: 'Opus 5.5', result: 'passed', note: 'route 404, 0 rows' },
  { model: 'Opus 5.5', result: 'passed', note: 'cross-site 403' },
  { model: 'Opus 5.5', result: 'passed', note: 'passed' },
  { model: 'Opus 5.5', result: 'passed', note: 'hash rehashed' },
]
const WAVE_TWO: Array<TrialTile> = [
  { model: 'composer-2.5', result: 'passed', note: 'passed' },
  { model: 'grok-4.7', result: 'passed', note: 'passed' },
  { model: 'composer-2.5', result: 'no-check', note: 'migration' },
  { model: 'grok-4.7', result: 'defect', note: 'schema defect' },
  { model: 'composer-2.5', result: 'passed', note: 'passed' },
]

const TRIAL_STEPS = ['Wave one', 'Wave two', 'The migrations', 'After']

const RESULT_MARK: Record<TrialTile['result'], MarkName> = {
  passed: 'sage',
  'no-check': 'amber',
  defect: 'rose',
}

const TILE_W = 104
const tileX = (index: number) => 40 + index * (TILE_W + 10)

function Cylinder({
  cx,
  y,
  w,
  h,
  mark,
  opacity = 1,
}: {
  cx: number
  y: number
  w: number
  h: number
  mark: MarkName
  opacity?: number
}) {
  const rx = w / 2
  const ry = Math.max(h * 0.14, 3)
  return (
    <g opacity={opacity}>
      <path
        d={`M${cx - rx} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 0 ${cx + rx} ${y + h - ry}V${y + ry}`}
        filter="url(#pp-marker)"
        style={{ fill: MARKS[mark] }}
      />
      <ellipse
        cx={cx}
        cy={y + ry}
        rx={rx}
        ry={ry}
        filter="url(#pp-marker)"
        style={{ fill: MARKS[mark], stroke: 'var(--ink)', strokeWidth: 0.8 }}
      />
    </g>
  )
}

function Tile({
  x,
  y,
  tile,
  shown,
  ring,
}: {
  x: number
  y: number
  tile: TrialTile
  shown: boolean
  ring: boolean
}) {
  return (
    <g opacity={shown ? 1 : 0.1}>
      <Node
        x={x}
        y={y}
        w={TILE_W}
        h={46}
        mark={RESULT_MARK[tile.result]}
        title={tile.note}
        value={tile.model}
        ring={ring}
      />
    </g>
  )
}

export function TrialWaves() {
  const { ref, step, go, replay } = useSteps(TRIAL_STEPS.length, 2100)
  const after = step >= 3

  return (
    <Figure
      bleed
      title="Ten pull requests, ten agents: 8 passed, 1 could not check, 1 found a defect"
      legend={[
        { label: 'passed', mark: 'sage' },
        { label: 'could not check the main claim', mark: 'amber' },
        { label: 'found a defect', mark: 'rose' },
        { label: 'database', mark: 'sand' },
      ]}
      caption={
        <StepControls
          labels={TRIAL_STEPS}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 330"
        role="img"
        aria-label="Wave one: five agents on one model verified five pull requests on one shared local database, each with its own account, and all five passed. Wave two: five agents on two other models; three passed, one could not check its main claim because the pull request had a migration that the shared database could not run, and one found a real schema defect. After the trial, each pull request gets its own database."
      >
        <Cylinder
          cx={320}
          y={12}
          w={150}
          h={46}
          mark="sand"
          opacity={after ? 0.25 : 1}
        />
        <text
          className="fig-strong"
          x="320"
          y="44"
          textAnchor="middle"
          style={SMALL}
        >
          one shared database
        </text>

        {[...WAVE_ONE, ...WAVE_TWO].map((_, index) => {
          const row = index < 5 ? 0 : 1
          const col = index % 5
          const live =
            !after && ((row === 0 && step === 0) || (row === 1 && step === 1))
          return (
            <Edge
              key={index}
              d={`M320 60L${tileX(col) + TILE_W / 2} ${row === 0 ? 96 : 186}`}
              live={live}
            />
          )
        })}

        <text x="40" y="90" style={TINY}>
          wave one, one model
        </text>
        {WAVE_ONE.map((tile, index) => (
          <Tile
            key={index}
            x={tileX(index)}
            y={98}
            tile={tile}
            shown={step >= 0}
            ring={false}
          />
        ))}
        <text x="40" y="180" style={TINY}>
          wave two, two other models
        </text>
        {WAVE_TWO.map((tile, index) => (
          <Tile
            key={index}
            x={tileX(index)}
            y={188}
            tile={tile}
            shown={step >= 1}
            ring={step === 2 && tile.result !== 'passed'}
          />
        ))}

        {[...WAVE_ONE, ...WAVE_TWO].map((_, index) => {
          const row = index < 5 ? 0 : 1
          const col = index % 5
          return (
            <Cylinder
              key={index}
              cx={tileX(col) + TILE_W + 1}
              y={row === 0 ? 132 : 222}
              w={16}
              h={18}
              mark="sand"
              opacity={after ? 1 : 0}
            />
          )
        })}

        <Status y={274}>
          {step === 0
            ? 'Five agents, one shared database, one account each. All five passed.'
            : step === 1
              ? 'Three passed. One could not check its claim. One found a real defect.'
              : step === 2
                ? 'Both had a migration. Agents were not allowed to migrate the shared database.'
                : 'So the tools now start one database for each pull request.'}
        </Status>
        <text x="320" y="300" textAnchor="middle" style={SMALL}>
          {after
            ? '4 containers, about 500 MB, about 52 seconds from zero'
            : 'No collision on a port, an account or a cookie'}
        </text>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* The recorder: five checks, five verdicts                            */
/* ------------------------------------------------------------------ */

type Verdict = 'refused' | 'incomplete' | 'failed' | 'passed'

const VERDICTS: Array<{ id: Verdict; mark: MarkName }> = [
  { id: 'refused', mark: 'rose' },
  { id: 'incomplete', mark: 'amber' },
  { id: 'failed', mark: 'rose' },
  { id: 'passed', mark: 'sage' },
]

const CASES: Array<{
  label: string
  lines: Array<string>
  verdict: Verdict
  why: string
}> = [
  {
    label: 'No assertion',
    lines: ['capture -- curl /api/rules', 'level: user', 'exit 0'],
    verdict: 'incomplete',
    why: 'The server answered. Nobody said what the answer should be.',
  },
  {
    label: 'Empty pattern',
    lines: ['capture -- curl /api/rules', '--expect-output ""', 'exit 0'],
    verdict: 'refused',
    why: 'A pattern that matches empty output cannot fail.',
  },
  {
    label: 'Match-all',
    lines: ['capture -- curl /api/rules', '--expect-output ".*"', 'exit 0'],
    verdict: 'refused',
    why: 'Same thing: .* matches empty text.',
  },
  {
    label: 'Quiet retry',
    lines: [
      'earlier: "Integration suite" failed',
      'capture --name "Integration suite" -- echo ok',
      'exit 0',
    ],
    verdict: 'refused',
    why: 'A different command cannot replace a failure without a reason.',
  },
  {
    label: 'A real check',
    lines: [
      'capture -- curl /api/rules',
      '--expect-output "\\"enabled\\":true"',
      'oracle: row read after a reload',
    ],
    verdict: 'passed',
    why: 'An assertion that can fail, and a second source that agrees.',
  },
]

export function EvidenceGate() {
  const { ref, step, go, replay } = useSteps(CASES.length, 2300)
  const item = CASES[step] ?? CASES[CASES.length - 1]

  return (
    <Figure
      title="What the recorder does with five kinds of check"
      legend={[
        { label: 'refused or failed', mark: 'rose' },
        { label: 'incomplete', mark: 'amber' },
        { label: 'passed', mark: 'sage' },
      ]}
      caption={
        <StepControls
          labels={CASES.map((entry) => entry.label)}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 210"
        role="img"
        aria-label="Five checks go into the evidence recorder. A check with no assertion is recorded as incomplete. An empty pattern and a match-all pattern are refused. A different command that replaces a failed check without a reason is refused. A check with an assertion that can fail and an oracle is recorded as passed."
      >
        <rect
          x="24"
          y="24"
          width="340"
          height="104"
          rx="4"
          style={{ fill: 'none', stroke: 'var(--line)' }}
        />
        {item.lines.map((line, index) => (
          <text key={line} x="36" y={52 + index * 26} style={MONO}>
            {line}
          </text>
        ))}

        <Edge d="M366 76H418" live arrow />
        <text x="392" y="64" textAnchor="middle" style={TINY}>
          record
        </text>

        {VERDICTS.map((verdict, index) => {
          const on = verdict.id === item.verdict
          const y = 24 + index * 27
          return (
            <g key={verdict.id}>
              {on ? (
                <Box x={428} y={y} w={188} h={22} mark={verdict.mark} />
              ) : (
                <rect
                  x="428"
                  y={y}
                  width="188"
                  height="22"
                  rx="3"
                  style={{ fill: 'none', stroke: 'var(--line)' }}
                />
              )}
              <text
                className={on ? 'fig-strong' : undefined}
                x="440"
                y={y + 15}
                style={{ ...SMALL, opacity: on ? 1 : 0.55 }}
              >
                {verdict.id}
              </text>
            </g>
          )
        })}

        <path className="fig-axis" d="M24 150H616" />
        <Status y={180}>{item.why}</Status>
        {step === 0 ? (
          <HandNote x={500} y={200} text="all five wave-one agents hit this" rotate={-2} />
        ) : null}
      </svg>
    </Figure>
  )
}
