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
 * Figures for the PR review post.
 *   blue   a push, or a pull request
 *   lilac  a review run
 *   amber  a request label
 *   sage   confirmed, posted
 *   rose   rejected, or stopped by a limit
 *   sand   held back, not posted
 */

/* ------------------------------------------------------------------ */
/* Review runs for ten pull requests, in three periods                 */
/* ------------------------------------------------------------------ */

const PERIODS: Array<{ label: string; perPr: number; note: string }> = [
  { label: 'April: every push', perPr: 8.4, note: '1,922 runs, 228 PRs' },
  { label: 'August: quieter prompt', perPr: 3.7, note: '1,162 runs, 313 PRs' },
  { label: 'Oct–Nov: on request', perPr: 0.54, note: '285 runs, 527 PRs' },
]

/** Spread `total` runs over ten pull requests, as evenly as possible. */
function spread(total: number) {
  const runs = Math.round(total)
  return Array.from(
    { length: 10 },
    (_, index) => Math.floor(runs / 10) + (index < runs % 10 ? 1 : 0),
  )
}

export function RunsPerPr() {
  const { ref, step } = useSteps(PERIODS.length + 1, 900)

  return (
    <Figure
      bleed
      title="Review runs for ten pull requests, at each period's rate"
      legend={[
        { label: 'pull request', mark: 'blue' },
        { label: 'one review run', mark: 'lilac' },
      ]}
      caption="Successful runs of the review workflow, divided by pull requests opened in the same period. Ten pull requests are drawn at that rate."
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 296"
        role="img"
        aria-label="Ten pull requests drawn for each period, with one dot for each review run. April, a review on every push: 84 runs, 8.4 for each pull request. August, with a quieter prompt: 37 runs. 23 October to 22 November, on request: about 5 runs for ten pull requests, 0.54 each."
      >
        {PERIODS.map((period, row) => {
          const y = 24 + row * 92
          const runs = spread(period.perPr * 10)
          const shown = row < step || step === PERIODS.length
          return (
            <g key={period.label} opacity={shown ? 1 : 0.1}>
              <text className="fig-strong" x="24" y={y} style={LABEL}>
                {period.label}
              </text>
              <text x="616" y={y} textAnchor="end" style={SMALL}>
                {period.note} · {period.perPr} each
              </text>
              {runs.map((count, index) => {
                const x = 30 + index * 59
                return (
                  <g key={index}>
                    <Box x={x} y={y + 52} w={44} h={14} mark="blue" />
                    {Array.from({ length: count }, (_, dot) => (
                      <circle
                        key={dot}
                        cx={x + 6 + (dot % 4) * 11}
                        cy={y + 44 - Math.floor(dot / 4) * 11}
                        r={4.2}
                        filter="url(#pp-marker)"
                        style={{ fill: MARKS.lilac }}
                      />
                    ))}
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* One pull request, eight pushes, two schedules                       */
/* ------------------------------------------------------------------ */

const PUSHES = 8
const PUSH_X = (index: number) => 150 + index * 56

export function PushVsLabel() {
  const { ref, step } = useLoop(PUSHES + 3, 650, 3)
  const pushed = Math.min(step + 1, PUSHES)
  const labelAt = 5
  const labelled = step >= labelAt
  const consumed = step >= labelAt + 1

  return (
    <Figure
      title="Eight pushes: eight reviews on every push, one on request"
      legend={[
        { label: 'push', mark: 'blue' },
        { label: 'review run', mark: 'lilac' },
        { label: 'request label', mark: 'amber' },
      ]}
      caption="One pull request, drawn. The label is removed when the review starts, so a request made during a review is not lost."
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 214"
        role="img"
        aria-label="One pull request with eight pushes. With a review on every push, each push starts a review run, eight in total, and the later ones mostly repeat the earlier ones. With a review on request, nothing runs until someone adds the label after the sixth push; the label is consumed at the start and one review runs."
      >
        {Array.from({ length: PUSHES }, (_, index) => (
          <g key={index} opacity={index < pushed ? 1 : 0.12}>
            <Box x={PUSH_X(index) - 6} y={98} w={12} h={18} mark="blue" />
          </g>
        ))}
        <path className="fig-axis" d="M140 107H600" />
        <text x="24" y="111" style={SMALL}>
          pushes
        </text>

        <text className="fig-strong" x="24" y="40" style={SMALL}>
          every push
        </text>
        {Array.from({ length: PUSHES }, (_, index) => (
          <g key={index} opacity={index < pushed ? 1 : 0}>
            <Edge d={`M${PUSH_X(index)} 96V62`} live={index === pushed - 1} />
            <Box x={PUSH_X(index) - 18} y={30} w={36} h={28} mark="lilac" />
          </g>
        ))}
        <text className="fig-num" x="616" y="50" textAnchor="end" style={LABEL}>
          {pushed}
        </text>

        <text className="fig-strong" x="24" y="166" style={SMALL}>
          on request
        </text>
        <g opacity={labelled ? 1 : 0}>
          <rect
            x={PUSH_X(labelAt) - 34}
            y={124}
            width={68}
            height={18}
            rx={9}
            opacity={consumed ? 0.25 : 1}
            filter="url(#pp-marker)"
            style={{ fill: MARKS.amber }}
          />
          <text
            x={PUSH_X(labelAt)}
            y={137}
            textAnchor="middle"
            style={{ ...MONO, fontSize: 10 }}
          >
            {consumed ? 'consumed' : 'label'}
          </text>
        </g>
        <g opacity={consumed ? 1 : 0}>
          <Edge d={`M${PUSH_X(labelAt)} 144V152`} live={step === labelAt + 1} />
          <Box x={PUSH_X(labelAt) - 18} y={152} w={36} h={28} mark="lilac" />
        </g>
        <text className="fig-num" x="616" y="172" textAnchor="end" style={LABEL}>
          {consumed ? 1 : 0}
        </text>
        <Status y={206}>
          {pushed < PUSHES
            ? `Push ${pushed}`
            : 'Same pull request: 8 reviews against 1'}
        </Status>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* The model changed under us                                          */
/* ------------------------------------------------------------------ */

const MIN_X0 = 160
const MIN_X1 = 610
const MIN_MAX = 45
const mx = (minutes: number) => MIN_X0 + (minutes / MIN_MAX) * (MIN_X1 - MIN_X0)

export function ModelStall() {
  const { ref, step } = useSteps(3, 1100)

  return (
    <Figure
      title="A new default model, a 10-minute limit, and reviews that never posted"
      legend={[
        { label: 'review time', mark: 'lilac' },
        { label: 'stopped by the limit', mark: 'rose' },
      ]}
      caption="Typical review times in April and after the default model changed in late July. The share that finished fell from 96.4% to 27.8% from one day to the next, by a teammate's count."
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 196"
        role="img"
        aria-label="In April a review took about three and a half minutes, under the 10-minute job limit, and 96.4% of reviews finished. After the default model changed, reviews took 17 to 45 minutes, so most were stopped at 10 minutes before they posted anything, and 27.8% finished."
      >
        {[0, 10, 20, 30, 40].map((minutes) => (
          <text
            key={minutes}
            x={mx(minutes)}
            y="24"
            textAnchor="middle"
            style={TINY}
          >
            {minutes} min
          </text>
        ))}
        <path
          className="fig-axis"
          strokeDasharray="4 4"
          d={`M${mx(10)} 32V150`}
        />

        <text x="24" y="66" style={SMALL}>
          April
        </text>
        <Box x={mx(0)} y={50} w={mx(3.5) - mx(0)} h={24} mark="lilac" />
        <text className="fig-num" x="510" y="67" textAnchor="end" style={LABEL}>
          96.4% finished
        </text>

        <g opacity={step >= 1 ? 1 : 0}>
          <text x="24" y="116" style={SMALL}>
            after the change
          </text>
          <Box x={mx(0)} y={100} w={mx(10) - mx(0)} h={24} mark="lilac" />
          <Box
            x={mx(10)}
            y={100}
            w={mx(step >= 2 ? 45 : 17) - mx(10)}
            h={24}
            mark="rose"
            opacity={0.55}
          />
          <text x={mx(17)} y={142} textAnchor="middle" style={TINY}>
            17
          </text>
          <text x={mx(45)} y={142} textAnchor="end" style={TINY}>
            45 min
          </text>
        </g>
        <g opacity={step >= 2 ? 1 : 0}>
          <text className="fig-num" x="510" y="117" textAnchor="end" style={LABEL}>
            27.8% finished
          </text>
          <HandNote
            x={mx(10) + 8}
            y={180}
            text="the job stops here, before it posts"
            arrowTo={[mx(10) + 2, 128]}
          />
        </g>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Reviewer, validator, and what gets posted                           */
/* ------------------------------------------------------------------ */

type Candidate = {
  name: string
  verdict: 'safe-fix' | 'no-safe-fix' | 'rejected' | 'unverified'
}

const CANDIDATES: Array<Candidate> = [
  { name: 'stale cache key', verdict: 'safe-fix' },
  { name: 'missing tenant filter', verdict: 'no-safe-fix' },
  { name: 'unused import', verdict: 'rejected' },
  { name: 'race on retry', verdict: 'unverified' },
  { name: 'N+1 in list', verdict: 'safe-fix' },
]

const VERDICT_TEXT: Record<Candidate['verdict'], string> = {
  'safe-fix': 'confirmed, safe fix',
  'no-safe-fix': 'confirmed, no safe fix',
  rejected: 'rejected',
  unverified: 'unverified',
}

const VERDICT_MARK: Record<Candidate['verdict'], MarkName> = {
  'safe-fix': 'sage',
  'no-safe-fix': 'sage',
  rejected: 'rose',
  unverified: 'sand',
}

const FLOW_STEPS = ['Find', 'One batch', 'Judge', 'Post']

export function ValidatorFlow() {
  const { ref, step, go, replay } = useSteps(FLOW_STEPS.length, 1900)
  const judged = step >= 2
  const posted = step >= 3

  return (
    <Figure
      bleed
      title="Five candidates, one validator call, three posted"
      legend={[
        { label: 'candidate', mark: 'lilac' },
        { label: 'confirmed', mark: 'sage' },
        { label: 'rejected', mark: 'rose' },
        { label: 'unverified, held back', mark: 'sand' },
      ]}
      caption={
        <StepControls
          labels={FLOW_STEPS}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 316"
        role="img"
        aria-label="The reviewer collects five candidate findings with a concrete failure and a proposed fix for each. It calls the validator once with the whole batch. The validator, with read-only tools and 20 turns, returns confirmed with a safe fix, confirmed with no safe fix, rejected, or unverified for each. Only the two confirmed kinds are posted: at most three inline comments and one summary comment."
      >
        <Node
          x={24}
          y={24}
          w={120}
          mark="blue"
          title="reviewer"
          value="read-only tools"
          ring={step === 0}
        />
        {CANDIDATES.map((candidate, index) => {
          const y = 96 + index * 38
          const mark: MarkName = judged
            ? VERDICT_MARK[candidate.verdict]
            : 'lilac'
          const kept = candidate.verdict === 'safe-fix' || candidate.verdict === 'no-safe-fix'
          return (
            <g key={candidate.name} opacity={posted && !kept ? 0.35 : 1}>
              <Box x={24} y={y} w={180} h={28} mark={mark} />
              <text x="34" y={y + 18} style={SMALL}>
                {candidate.name}
              </text>
              <text
                x="214"
                y={y + 18}
                style={{ ...TINY, opacity: judged ? 1 : 0 }}
              >
                {VERDICT_TEXT[candidate.verdict]}
              </text>
            </g>
          )
        })}

        <Edge d="M330 150H382" live={step === 1} arrow />
        <Node
          x={386}
          y={128}
          w={120}
          mark="blue"
          title="validator"
          value="1 call, 20 turns"
          ring={step === 1 || step === 2}
        />

        <g opacity={posted ? 1 : 0}>
          <Edge d="M446 176V206" live={step === 3} arrow />
          <Box x={386} y={210} w={230} h={30} mark="sage" />
          <text x="396" y="229" style={SMALL}>
            inline comments, 3 at most
          </text>
          <Box x={386} y={246} w={230} h={30} mark="sage" />
          <text x="396" y="265" style={SMALL}>
            one summary, updated in place
          </text>
        </g>

        <Status y={306}>
          {step === 0
            ? 'Each candidate has a trigger, a failure a user can see, and a fix.'
            : step === 1
              ? 'The whole batch goes to the validator in one call. No retries.'
              : step === 2
                ? 'The bug and its fix are judged separately.'
                : 'Only confirmed findings are posted. A gap is reported as incomplete.'}
        </Status>
      </svg>
    </Figure>
  )
}
