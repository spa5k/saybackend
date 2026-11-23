import { Figure, HandNote, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'
import { LineFigure } from '@/components/paper/LineFigure'

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
 * Figures for the CI post.
 *   blue   time a job really runs
 *   sand   rounding: billed time nobody used
 *   lilac  test runs
 *   amber  the merge policy workflow
 *   sage   a path that works, or saved
 *   rose   a failure, or a blocked path
 */

/* ------------------------------------------------------------------ */
/* Billed minutes: five jobs against five steps                        */
/* ------------------------------------------------------------------ */

const MINUTE_W = 96
const JOBS = [10, 10, 10, 10, 10]

function MinuteRow({
  y,
  seconds,
  label,
  showBill,
}: {
  y: number
  seconds: number
  label: string
  showBill: boolean
}) {
  const used = (seconds / 60) * MINUTE_W
  const billed = Math.max(Math.ceil(seconds / 60), 1)
  return (
    <g>
      <text x="24" y={y + 15} style={SMALL}>
        {label}
      </text>
      <rect
        x="150"
        y={y}
        width={billed * MINUTE_W}
        height="20"
        style={{ fill: 'none', stroke: 'var(--line)' }}
      />
      <Box
        x={150}
        y={y}
        w={billed * MINUTE_W}
        h={20}
        mark="sand"
        opacity={showBill ? 0.9 : 0}
      />
      <Box x={150} y={y} w={used} h={20} mark="blue" />
      <text x={160 + billed * MINUTE_W} y={y + 15} style={SMALL}>
        {seconds} s{showBill ? ` → ${billed} min` : ''}
      </text>
    </g>
  )
}

export function MinuteMeter() {
  const { ref, step } = useLoop(3, 1500, 2.5)
  const billFive = step >= 1
  const billOne = step >= 2

  return (
    <Figure
      title="Five jobs of 10 seconds bill 5 minutes. One job with five steps bills 1."
      legend={[
        { label: 'time the job runs', mark: 'blue' },
        { label: 'rounded up, billed anyway', mark: 'sand' },
      ]}
      caption="GitHub rounds each job on a hosted runner up to the next whole minute. Runner start time is left out here."
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 262"
        role="img"
        aria-label="Five jobs of 10 seconds each. Each job is rounded up to one minute, so they bill 5 minutes for 50 seconds of work. The same five commands as steps of one job run 50 seconds and bill 1 minute."
      >
        <text className="fig-strong" x="24" y="24" style={LABEL}>
          Five small jobs
        </text>
        {JOBS.map((seconds, index) => (
          <MinuteRow
            key={index}
            y={36 + index * 24}
            seconds={seconds}
            label={`job ${index + 1}`}
            showBill={billFive}
          />
        ))}
        <text className="fig-num" x="616" y="96" textAnchor="end" style={LABEL}>
          {billFive ? '5 min' : ''}
        </text>

        <path className="fig-axis" d="M24 166H616" strokeDasharray="3 4" />

        <text className="fig-strong" x="24" y="192" style={LABEL}>
          The same five commands as steps of one job
        </text>
        <MinuteRow y={204} seconds={50} label="one job" showBill={billOne} />
        <text className="fig-num" x="616" y="219" textAnchor="end" style={LABEL}>
          {billOne ? '1 min' : ''}
        </text>
        <Status y={254}>50 seconds of work either way</Status>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* The median wait over five months                                    */
/* ------------------------------------------------------------------ */

/** Days after 8 June 2026, and the median test wait on PRs in seconds. */
const WAIT: Array<[number, number]> = [
  [0, 569],
  [28, 258],
  [119, 458],
  [133, 220],
  [140, 257],
  [147, 267],
  [154, 261.5],
  [161, 255],
]

const MONTH_TICKS: Record<number, string> = {
  0: '8 Jun',
  28: '6 Jul',
  119: '5 Oct',
  133: '19 Oct',
  161: '16 Nov',
}

export function WaitTrend() {
  return (
    <LineFigure
      title="Median test run on a pull request, by work week"
      description="The median test run on a pull request was 569 seconds in the week of 8 June, 258 in early July, back to 458 in early October, 220 in the week of 19 October, then 255 to 267 seconds every week through 19 November."
      series={[
        {
          name: 'median wait',
          mark: 'lilac',
          points: WAIT,
          endLabel: '255 s',
        },
      ]}
      xTicks={[0, 28, 119, 133, 161]}
      yTicks={[0, 200, 400, 600]}
      xFormat={(value) => MONTH_TICKS[value] ?? ''}
      yFormat={(value) => `${value} s`}
      notes={[
        { x: 28, y: 258, text: 'path-scoped gating', dx: 8, dy: 30 },
        { x: 133, y: 220, text: 'October work', dx: -40, dy: 40 },
      ]}
      caption="Successful first attempts of the test workflow on pull requests, Monday to Friday, 222 to 569 runs a week. I measured no weeks between July and October; the line only joins the points. The last point is Monday to Thursday, before the label change."
    />
  )
}

/* ------------------------------------------------------------------ */
/* Runs per week, by workflow                                          */
/* ------------------------------------------------------------------ */

type WeekRow = {
  week: string
  policy: number
  tests: number
  lint: number
  login: number
  total: number
}

const WEEKS: Array<WeekRow> = [
  { week: '23–29 Oct', policy: 264, tests: 961, lint: 958, login: 408, total: 5566 },
  { week: '30 Oct–5 Nov', policy: 3864, tests: 605, lint: 605, login: 679, total: 10461 },
  { week: '6–12 Nov', policy: 247, tests: 583, lint: 583, login: 157, total: 6235 },
  { week: '13–19 Nov', policy: 0, tests: 750, lint: 717, login: 155, total: 7598 },
]

const SEGMENTS: Array<{ key: keyof Omit<WeekRow, 'week' | 'total'> | 'other'; mark: MarkName }> = [
  { key: 'policy', mark: 'amber' },
  { key: 'tests', mark: 'lilac' },
  { key: 'lint', mark: 'blue' },
  { key: 'login', mark: 'rose' },
  { key: 'other', mark: 'sand' },
]

const RUN_SCALE = 420 / 10500

export function WeeklyRuns() {
  const { ref, step } = useSteps(WEEKS.length + 1, 600)

  return (
    <Figure
      bleed
      title="Workflow runs per week, by workflow"
      legend={[
        { label: 'merge policy', mark: 'amber' },
        { label: 'tests on PRs', mark: 'lilac' },
        { label: 'lint on PRs', mark: 'blue' },
        { label: 'preview login comment', mark: 'rose' },
        { label: 'everything else', mark: 'sand' },
      ]}
      caption="Weeks from Friday to Thursday, UTC. Every run counts, also runs whose jobs all skipped and cost nothing."
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 230"
        role="img"
        aria-label="Workflow runs per week. 23 to 29 October: 5,566. 30 October to 5 November: 10,461, of which 3,864 are the merge policy workflow. 6 to 12 November: 6,235. 13 to 19 November: 7,598, with no merge policy runs. Test runs on pull requests went from 605 to 750 in the same time."
      >
        {WEEKS.map((row, index) => {
          const y = 18 + index * 46
          const shown = index < step || step === WEEKS.length
          const other = row.total - row.policy - row.tests - row.lint - row.login
          let x = 120
          return (
            <g key={row.week} opacity={shown ? 1 : 0.08}>
              <text x="24" y={y + 19} style={SMALL}>
                {row.week}
              </text>
              {SEGMENTS.map((segment) => {
                const value = segment.key === 'other' ? other : row[segment.key]
                const w = value * RUN_SCALE
                const left = x
                x += w
                return value > 0 ? (
                  <Box
                    key={segment.key}
                    x={left}
                    y={y}
                    w={w}
                    h={28}
                    mark={segment.mark}
                  />
                ) : null
              })}
              <text className="fig-num" x={x + 8} y={y + 19} style={LABEL}>
                {row.total.toLocaleString('en-US')}
              </text>
            </g>
          )
        })}
        <g opacity={step >= 2 ? 1 : 0}>
          <HandNote
            x={420}
            y={214}
            text="a workflow one week old"
            arrowTo={[200, 98]}
          />
        </g>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* The run-tests label                                                 */
/* ------------------------------------------------------------------ */

const LABEL_STEPS = ['Push', 'Classify', 'No label', 'Add the label', 'Rerun']

type Job = { name: string; time: string; x: number; y: number }

const SUITES: Array<Job> = [
  { name: 'Unit', time: '5m01s', x: 330, y: 150 },
  { name: 'Integration ×2', time: '4m36s, 5m11s', x: 470, y: 150 },
]

export function LabelRerun() {
  const { ref, step, go, replay } = useSteps(LABEL_STEPS.length, 1800)
  const labelled = step >= 3
  const rerun = step >= 4
  const suitesMark: MarkName = rerun ? 'lilac' : 'sand'

  return (
    <Figure
      bleed
      title="Since 20 November, the suites on a pull request run only with a label"
      legend={[
        { label: 'always runs', mark: 'blue' },
        { label: 'skipped', mark: 'sand' },
        { label: 'runs with the label', mark: 'lilac' },
      ]}
      caption={
        <StepControls
          labels={LABEL_STEPS}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 262"
        role="img"
        aria-label="A push to a pull request starts the test workflow. A small classify job reads the labels. With no run-tests label, the suites skip, and only the gate and the lint job with the type checks run. When someone adds the label, a second workflow cancels and reruns the same run, and attempt 2 runs the unit and integration suites."
      >
        <Node x={24} y={30} w={100} mark="blue" title="push" ring={step === 0} />
        <Edge d="M124 52H170" live={step === 0 || step === 1} arrow />
        <Node
          x={174}
          y={30}
          w={130}
          mark="blue"
          title="Classify"
          value="13 s, reads labels"
          ring={step === 1}
        />
        <Edge d="M304 52C330 52 330 70 330 82" live={step >= 2} arrow />

        <Node
          x={330}
          y={60}
          w={130}
          mark="blue"
          title="Gate"
          value="45 s"
        />
        <Node
          x={470}
          y={60}
          w={146}
          mark="blue"
          title="Lint + type checks"
          value="6m32s"
        />
        {SUITES.map((job) => (
          <g key={job.name}>
            <Node
              x={job.x}
              y={job.y}
              w={job.x === 330 ? 130 : 146}
              mark={step >= 2 ? suitesMark : 'sand'}
              title={job.name}
              value={rerun ? job.time : 'skipped'}
              ring={rerun}
            />
          </g>
        ))}
        <text x="330" y="140" style={TINY}>
          suites
        </text>

        <g opacity={labelled ? 1 : 0}>
          <rect
            x="24"
            y="150"
            width="140"
            height="28"
            rx="14"
            style={{ fill: MARKS.lilac }}
            filter="url(#pp-marker)"
          />
          <text x="94" y="169" textAnchor="middle" style={MONO}>
            run-tests
          </text>
          <Edge d="M164 164H200" live={step === 3} arrow />
          <text x="206" y="160" style={SMALL}>
            cancel + rerun
          </text>
          <text x="206" y="176" style={SMALL}>
            → attempt 2
          </text>
        </g>

        <path className="fig-axis" d="M24 222H616" />
        <Status y={248}>
          {step === 0
            ? 'A push to a pull request into develop.'
            : step === 1
              ? 'The classify job runs on a 1-vCPU runner and reads the labels live.'
              : step === 2
                ? 'No label: the suites skip. Lint and type checks still run.'
                : step === 3
                  ? 'Someone adds run-tests. A second workflow cancels the run.'
                  : 'Attempt 2 runs the suites on the same commit.'}
        </Status>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* The back-merge, and where it got stuck                              */
/* ------------------------------------------------------------------ */

const BACK_STEPS = [
  'Clean merge',
  'Conflict',
  'Fix it on the PR?',
  'Merge it?',
  'The fix, still open',
]

export function BackMergeStuck() {
  const { ref, step, go, replay } = useSteps(BACK_STEPS.length, 2000)
  const conflict = step >= 1
  const fix = step >= 4

  const note: Array<[string, string]> = [
    [
      'A push to prod. The workflow merges prod into develop and pushes',
      'as the CI bot. Bot pushes skip the test suites.',
    ],
    [
      'A hotfix published a package version on prod, and develop had',
      'published its own. Both November back-merges conflicted.',
    ],
    [
      'The PR the workflow opens has prod as its head.',
      'A fix pushed there would go into prod.',
    ],
    [
      'develop allows squash only, and a back-merge needs a merge commit:',
      '"Merge commits are not allowed on this repository."',
    ],
    [
      'The proposed fix resolves release fields only, opens the PR from a',
      'bot branch, and lands it with a fast-forward. Not merged yet.',
    ],
  ]
  const [noteOne, noteTwo] = note[step] ?? note[0]

  return (
    <Figure
      bleed
      title="A back-merge without a pull request, and the two that got stuck"
      legend={[
        { label: 'branch', mark: 'blue' },
        { label: 'works', mark: 'sage' },
        { label: 'blocked', mark: 'rose' },
        { label: 'proposed', mark: 'amber' },
      ]}
      caption={
        <StepControls
          labels={BACK_STEPS}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 264"
        role="img"
        aria-label="A push to prod triggers a workflow that merges prod into develop. A clean merge is pushed by the CI bot. In November, both back-merges after hotfixes conflicted on package versions and changelogs. The pull request for the conflict had prod as its head, so it could not be fixed there, and develop allows only squash merges, so it could not be merged as a merge commit. The fix, which resolves only release fields and opens the pull request from a bot branch, is still open."
      >
        <Node x={24} y={30} w={100} mark="blue" title="prod" value="push" />
        <Edge d="M124 52H176" live={step === 0} arrow />
        <Node
          x={180}
          y={30}
          w={150}
          mark={conflict ? 'rose' : 'sage'}
          title={conflict ? 'conflict' : 'merge, push as bot'}
          value={conflict ? 'package.json, CHANGELOG' : 'no PR, no approval'}
          ring={step === 0 || step === 1}
        />
        <g opacity={conflict ? 0.2 : 1}>
          <Edge d="M330 52H382" live={step === 0} arrow />
        </g>
        <Node x={386} y={30} w={110} mark="blue" title="develop" />

        <g opacity={conflict ? 1 : 0.1}>
          <Edge d="M255 76V112" live={step === 1} arrow />
          <Node
            x={180}
            y={116}
            w={150}
            mark="amber"
            title="PR: prod → develop"
            value="head is prod"
          />
          <Box x={346} y={116} w={270} h={44} mark="rose" opacity={step === 2 ? 0.9 : 0.25} />
          <text x="356" y="134" style={SMALL}>
            push a fix to the head?
          </text>
          <text x="356" y="150" style={SMALL}>
            it would land in prod
          </text>
          <Box x={346} y={168} w={270} h={44} mark="rose" opacity={step === 3 ? 0.9 : 0.25} />
          <text x="356" y="186" style={SMALL}>
            merge commit?
          </text>
          <text x="356" y="202" style={MONO}>
            not allowed: squash only
          </text>
        </g>

        <g opacity={fix ? 1 : 0}>
          <Box x={24} y={116} w={140} h={96} mark="amber" />
          <text className="fig-strong" x="34" y="138" style={SMALL}>
            proposed fix
          </text>
          <text x="34" y="156" style={TINY}>
            resolve release fields
          </text>
          <text x="34" y="172" style={TINY}>
            PR from a bot branch
          </text>
          <text x="34" y="188" style={TINY}>
            land by fast-forward
          </text>
          <text x="34" y="204" style={TINY}>
            open on 23 Nov
          </text>
        </g>

        <Status y={236}>{noteOne}</Status>
        <Status y={254}>{noteTwo}</Status>
      </svg>
    </Figure>
  )
}
