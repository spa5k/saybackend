import { Figure, GraphPaper, HandNote, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'
import type { ReactNode } from 'react'

const WIDTH = 640
const STAGES = ['SQL text', 'Parser', 'Analyzer', 'Planner', 'Executor', 'Results']
const STAGE_W = 88
const STAGE_GAP = 16
const STAGE_Y = 30
const STAGE_H = 34
const STEP_W = 214
const STEP_H = 26

type Verdict = 'flawed' | 'abandoned' | 'slow' | 'correct' | 'neutral'

const VERDICT_MARK: Record<Verdict, MarkName> = {
  flawed: 'rose',
  abandoned: 'rose',
  slow: 'amber',
  correct: 'sage',
  neutral: 'lilac',
}

const stageX = (index: number) => 14 + index * (STAGE_W + STAGE_GAP)

type Hook = {
  /** The pipeline stage that the hook runs after. */
  at: 'Analyzer' | 'Executor'
  name: string
  /** What the code in the hook does, in order. */
  steps: Array<string>
  verdict?: Verdict
  /** One line under the steps. */
  result?: string
}

type PipelineProps = {
  title: string
  hooks: Array<Hook>
  /** A handwritten note above one pipeline stage. */
  note?: { at: string; text: string }
  caption?: ReactNode
  bleed?: boolean
}

/**
 * The Postgres query pipeline in one row, with the work that a hook does
 * drawn under the stage where the hook runs.
 */
export function QueryPipeline({
  title,
  hooks,
  note,
  caption,
  bleed,
}: PipelineProps) {
  const most = Math.max(...hooks.map((hook) => hook.steps.length))
  const stepsTop = 118
  const height = stepsTop + most * (STEP_H + 8) + 26
  const hooked = new Map(hooks.map((hook) => [hook.at, hook]))

  return (
    <Figure title={title} caption={caption} bleed={bleed}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={`${title}. The pipeline is ${STAGES.join(', ')}. ${hooks
          .map(
            (hook) =>
              `${hook.name} runs at the ${hook.at} stage: ${hook.steps.join(', then ')}.${
                hook.result ? ` ${hook.result}.` : ''
              }`,
          )
          .join(' ')}`}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        <g filter="url(#pp-marker)">
          {STAGES.map((stage, index) => {
            const hook = hooked.get(stage as Hook['at'])
            return (
              <rect
                key={stage}
                x={stageX(index)}
                y={STAGE_Y}
                width={STAGE_W}
                height={STAGE_H}
                style={{
                  fill: hook
                    ? MARKS[VERDICT_MARK[hook.verdict ?? 'neutral']]
                    : 'var(--m-sand)',
                }}
              />
            )
          })}
        </g>
        {STAGES.map((stage, index) => (
          <g key={stage}>
            <text
              x={stageX(index) + STAGE_W / 2}
              y={STAGE_Y + 21}
              textAnchor="middle"
              style={{ fill: 'var(--ink)' }}
            >
              {stage}
            </text>
            {index > 0 ? (
              <path
                className="flow-edge"
                markerEnd="url(#pp-arrow)"
                d={`M${stageX(index) - STAGE_GAP + 2} ${STAGE_Y + STAGE_H / 2}H${stageX(index) - 2}`}
              />
            ) : null}
          </g>
        ))}
        {hooks.map((hook) => {
          const index = STAGES.indexOf(hook.at)
          const center = stageX(index) + STAGE_W / 2
          const left = Math.min(
            Math.max(center - STEP_W / 2, 8),
            WIDTH - STEP_W - 8,
          )
          const mark = MARKS[VERDICT_MARK[hook.verdict ?? 'neutral']]
          return (
            <g key={hook.name}>
              <path
                className="fig-axis"
                strokeDasharray="3 3"
                d={`M${center} ${STAGE_Y + STAGE_H + 2}V${stepsTop - 22}`}
              />
              <text
                className="fig-strong"
                x={left + STEP_W / 2}
                y={stepsTop - 8}
                textAnchor="middle"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
              >
                {hook.name}
              </text>
              {hook.steps.map((step, stepIndex) => {
                const y = stepsTop + stepIndex * (STEP_H + 8)
                return (
                  <g key={step}>
                    <rect
                      className="flow-node"
                      data-tone
                      x={left}
                      y={y}
                      width={STEP_W}
                      height={STEP_H}
                      rx="5"
                      style={{ '--tone': mark } as React.CSSProperties}
                    />
                    <text
                      className="flow-label"
                      x={left + STEP_W / 2}
                      y={y + 17}
                      textAnchor="middle"
                      style={{ fontSize: 11 }}
                    >
                      {step}
                    </text>
                    {stepIndex > 0 ? (
                      <path
                        className="flow-edge"
                        d={`M${left + STEP_W / 2} ${y - 8}V${y}`}
                      />
                    ) : null}
                  </g>
                )
              })}
              {hook.result ? (
                <text
                  className="fig-strong"
                  x={left + STEP_W / 2}
                  y={stepsTop + hook.steps.length * (STEP_H + 8) + 10}
                  textAnchor="middle"
                >
                  {hook.result}
                </text>
              ) : null}
            </g>
          )
        })}
        {note ? (
          <HandNote
            x={stageX(STAGES.indexOf(note.at)) + 4}
            y={18}
            text={note.text}
            rotate={-2}
          />
        ) : null}
      </svg>
    </Figure>
  )
}

const ATTEMPTS: Array<{
  stage: string
  approach: string
  hook: string
  at: number
  verdict: Verdict
  word: string
}> = [
  { stage: 'Stage 0', approach: 'String matching', hook: 'ExecutorRun_hook', at: 4, verdict: 'flawed', word: 'Flawed' },
  { stage: 'Stage 1', approach: 'tree-sitter', hook: 'ExecutorRun_hook', at: 4, verdict: 'abandoned', word: 'Abandoned' },
  { stage: 'Stage 2', approach: 'sqlparser crate', hook: 'ExecutorRun_hook', at: 4, verdict: 'flawed', word: 'Flawed' },
  { stage: 'Stage 3', approach: 'pg_parse_query (C)', hook: 'ExecutorRun_hook', at: 4, verdict: 'slow', word: 'Correct, but slow' },
  { stage: 'Stage 4', approach: 'Query tree (jointree→quals)', hook: 'post_parse_analyze_hook', at: 2, verdict: 'correct', word: 'Correct' },
]

/** The five attempts on one page: where each one hooks in, and the result. */
export function AttemptLadder() {
  const row = 40
  const top = 40
  const height = top + ATTEMPTS.length * row + 6
  const cell = 26
  const gridX = 250
  return (
    <Figure
      title="Five attempts, one correct answer"
      caption="Each small row is the pipeline: SQL text, Parser, Analyzer, Planner, Executor, Results. The filled square is where the attempt hooks in."
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={ATTEMPTS.map(
          (attempt) =>
            `${attempt.stage}, ${attempt.approach}: hooks at the ${STAGES[attempt.at]} stage with ${attempt.hook}. ${attempt.word}.`,
        ).join(' ')}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        {['SQL', 'Parse', 'Analyze', 'Plan', 'Execute', 'Result'].map(
          (name, index) => (
            <text
              key={name}
              x={gridX + index * cell + cell / 2 - 2}
              y={top - 14}
              textAnchor="middle"
              style={{ fontSize: 8.5 }}
            >
              {name}
            </text>
          ),
        )}
        {ATTEMPTS.map((attempt, index) => {
          const y = top + index * row
          return (
            <g key={attempt.stage}>
              <text className="fig-strong" x={gridX - 16} y={y + 10} textAnchor="end">
                {attempt.stage}
              </text>
              <text x={gridX - 16} y={y + 24} textAnchor="end" style={{ fontSize: 11 }}>
                {attempt.approach}
              </text>
              <g filter="url(#pp-marker)">
                {STAGES.map((stage, stageIndex) => (
                  <rect
                    key={stage}
                    x={gridX + stageIndex * cell}
                    y={y + 2}
                    width={cell - 5}
                    height={cell - 5}
                    opacity={stageIndex === attempt.at ? 1 : 0.6}
                    style={{
                      fill:
                        stageIndex === attempt.at
                          ? MARKS[VERDICT_MARK[attempt.verdict]]
                          : 'var(--m-sand)',
                    }}
                  />
                ))}
              </g>
              <text className="fig-strong" x={gridX + 6 * cell + 14} y={y + 10}>
                {attempt.word}
              </text>
              <text
                x={gridX + 6 * cell + 14}
                y={y + 24}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}
              >
                {attempt.hook}
              </text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

const OUTCOMES: Array<{
  mode: string
  withWhere: [string, MarkName]
  withoutWhere: [string, MarkName]
}> = [
  { mode: 'off', withWhere: ['Pass', 'sage'], withoutWhere: ['Pass', 'sage'] },
  { mode: 'warn', withWhere: ['Pass', 'sage'], withoutWhere: ['WARNING, then pass', 'amber'] },
  { mode: 'on', withWhere: ['Pass', 'sage'], withoutWhere: ['BLOCK', 'rose'] },
]

/** What the hook decides, for each mode and for a statement with or without WHERE. */
export function ModeGrid() {
  const colX = [196, 406]
  const cellW = 196
  const top = 44
  const row = 44
  const height = top + OUTCOMES.length * row + 34
  return (
    <Figure
      title="What pg_strict does with an UPDATE or a DELETE"
      caption="UPDATE and DELETE each have their own mode setting. All other statements pass."
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label="A statement with a WHERE clause passes in every mode. A statement without a WHERE clause passes when the mode is off, gets a warning and then passes when the mode is warn, and is blocked when the mode is on."
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        <text className="fig-strong" x={colX[0] + cellW / 2} y={top - 14} textAnchor="middle">
          Has a WHERE clause
        </text>
        <text className="fig-strong" x={colX[1] + cellW / 2} y={top - 14} textAnchor="middle">
          No WHERE clause
        </text>
        {OUTCOMES.map((outcome, index) => {
          const y = top + index * row
          return (
            <g key={outcome.mode}>
              <text x={colX[0] - 16} y={y + 22} textAnchor="end">
                mode ={' '}
                <tspan className="fig-strong" style={{ fontFamily: 'var(--font-mono)' }}>
                  {outcome.mode}
                </tspan>
              </text>
              <g filter="url(#pp-marker)">
                {[outcome.withWhere, outcome.withoutWhere].map((cell, cellIndex) => (
                  <rect
                    key={cellIndex}
                    x={colX[cellIndex]}
                    y={y}
                    width={cellW}
                    height={row - 10}
                    style={{ fill: MARKS[cell[1]] }}
                  />
                ))}
              </g>
              {[outcome.withWhere, outcome.withoutWhere].map((cell, cellIndex) => (
                <text
                  key={cellIndex}
                  x={colX[cellIndex] + cellW / 2}
                  y={y + 21}
                  textAnchor="middle"
                  style={{ fill: 'var(--ink)' }}
                >
                  {cell[0]}
                </text>
              ))}
            </g>
          )
        })}
        <HandNote
          x={colX[1] + 18}
          y={top + OUTCOMES.length * row + 16}
          text="the only cell that stops a query"
          rotate={-2}
        />
      </svg>
    </Figure>
  )
}

function Box({
  x,
  y,
  w,
  label,
  mark,
  mono = false,
}: {
  x: number
  y: number
  w: number
  label: string
  mark: MarkName
  mono?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height="34"
        filter="url(#pp-marker)"
        style={{ fill: MARKS[mark] }}
      />
      <text
        x={x + w / 2}
        y={y + 21}
        textAnchor="middle"
        style={{
          fill: 'var(--ink)',
          fontFamily: mono ? 'var(--font-mono)' : undefined,
          fontSize: mono ? 10.5 : 11.5,
        }}
      >
        {label}
      </text>
    </g>
  )
}

function Edge({ d, label, at }: { d: string; label?: string; at?: [number, number] }) {
  return (
    <g>
      <path className="flow-edge" d={d} markerEnd="url(#pp-arrow)" />
      {label && at ? (
        <text className="flow-edge-label" x={at[0]} y={at[1]} textAnchor="middle">
          {label}
        </text>
      ) : null}
    </g>
  )
}

/** The parts of the extension, and how Postgres core reaches them. */
export function ExtensionMap() {
  return (
    <Figure
      title="How the parts of pg_strict connect"
      legend={[
        { label: 'Postgres core', mark: 'sand' },
        { label: 'The hook', mark: 'lilac' },
        { label: 'Settings', mark: 'amber' },
        { label: 'Analyzer logic', mark: 'blue' },
      ]}
    >
      <svg
        viewBox={`0 0 ${WIDTH} 286`}
        role="img"
        aria-label="In Postgres core, the parser feeds the analyzer. The analyzer calls the post_parse_analyze_hook of pg_strict. At load, _PG_init registers the hook and defines the GUC settings. The hook reads the settings and runs the analyzer logic, which reads the query tree that the analyzer built."
      >
        <GraphPaper width={WIDTH} height={286} bleed={30} />
        <text x="14" y="50">
          Postgres core
        </text>
        <text x="14" y="160">
          pg_strict
        </text>
        <path className="fig-axis" strokeDasharray="3 4" d="M14 100H626" />
        <Edge d="M318 47H366" />
        <Edge d="M424 66C424 96 330 106 322 134" label="calls" at={[384, 96]} />
        <Edge d="M196 153H228" label="registers" at={[212, 128]} />
        <Edge d="M150 172C150 226 190 238 228 238" label="defines" at={[160, 222]} />
        <Edge d="M320 172V218" label="reads" at={[344, 198]} />
        <Edge d="M414 153H452" label="runs" at={[433, 128]} />
        <Edge d="M540 134C546 100 520 78 484 60" label="reads the query tree" at={[560, 96]} />
        <Box x={220} y={30} w={96} label="Parser" mark="sand" />
        <Box x={370} y={30} w={110} label="Analyzer" mark="sand" />
        <Box x={104} y={136} w={90} label="_PG_init" mark="sand" mono />
        <Box x={230} y={136} w={182} label="post_parse_analyze_hook" mark="lilac" mono />
        <Box x={456} y={136} w={150} label="Analyzer logic" mark="blue" />
        <Box x={230} y={220} w={182} label="GUC settings" mark="amber" />
        <HandNote x={448} y={236} text={'no second parse:\nit reads what Postgres built'} rotate={-2} />
      </svg>
    </Figure>
  )
}
