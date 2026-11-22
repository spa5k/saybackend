import type { ReactNode } from 'react'

import { Figure, HandNote, MARKS } from '@/components/paper/Figure'
import type { LegendItem, MarkName } from '@/components/paper/Figure'

const WIDTH = 640
const LINE = 15
const MONO = { fontFamily: 'var(--font-mono)', fontSize: 11 } as const
const RULE = { stroke: 'var(--rule)', fill: 'none' } as const
const SOFT = { stroke: 'var(--ink-soft)', fill: 'none' } as const

/** Break a sentence into lines of at most `max` characters. */
function wrap(text: string, max: number) {
  const lines: Array<string> = []
  let line = ''
  for (const word of text.split(' ')) {
    if (line && line.length + word.length + 1 > max) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines
}

function Lines({
  x,
  y,
  lines,
  strong = false,
  anchor,
}: {
  x: number
  y: number
  lines: Array<string>
  strong?: boolean
  anchor?: 'start' | 'middle' | 'end'
}) {
  return (
    <text className={strong ? 'fig-strong' : undefined} textAnchor={anchor}>
      {lines.map((line, index) => (
        <tspan key={index} x={x} y={y + index * LINE}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

function Mark({
  x,
  y,
  w,
  h,
  mark,
}: {
  x: number
  y: number
  w: number
  h: number
  mark: MarkName
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      filter="url(#pp-marker)"
      style={{ fill: MARKS[mark] }}
    />
  )
}

/** An empty place: something that is skipped, blanked or removed. */
function Empty({
  x,
  y,
  w,
  h,
}: {
  x: number
  y: number
  w: number
  h: number
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx="2"
      strokeDasharray="4 3"
      opacity="0.7"
      style={SOFT}
    />
  )
}

type Entry = {
  when: string
  title: string
  text: string
  tone?: 'side' | 'removed'
}

/** Dated changes on one line, oldest first. */
function Dated({
  title,
  entries,
  alt,
  legend,
}: {
  title: string
  entries: Array<Entry>
  alt: string
  legend?: Array<LegendItem>
}) {
  const dateEnd = 124
  const rail = 144
  const textX = 166
  let y = 14
  const rows = entries.map((entry) => {
    const lines = wrap(entry.text, 74)
    const top = y
    y += 22 + lines.length * LINE + 14
    return { entry, lines, top }
  })
  const height = y
  const last = rows[rows.length - 1]
  return (
    <Figure title={title} legend={legend}>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={alt}>
        <path className="fig-axis" d={`M${rail} 22V${last.top + 10}`} />
        {rows.map(({ entry, lines, top }) => (
          <g key={entry.when}>
            <text
              className="fig-strong"
              x={dateEnd}
              y={top + 12}
              textAnchor="end"
            >
              {entry.when}
            </text>
            <Mark
              x={rail - 7}
              y={top + 1}
              w={14}
              h={14}
              mark={
                entry.tone === 'removed'
                  ? 'rose'
                  : entry.tone === 'side'
                    ? 'sand'
                    : 'lilac'
              }
            />
            <text
              className="fig-strong"
              x={textX}
              y={top + 12}
              style={{ fontSize: 13 }}
            >
              {entry.title}
            </text>
            <Lines x={textX} y={top + 30} lines={lines} />
          </g>
        ))}
      </svg>
    </Figure>
  )
}

type GlyphRow = {
  label: string
  text: string
  /** Height of the small drawing. */
  h: number
  glyph: (y: number) => ReactNode
  mono?: boolean
}

/** Steps in order. Each has a small drawing of what happens in it. */
function GlyphSteps({
  title,
  heading,
  rows,
  note,
  alt,
  legend,
}: {
  title: string
  heading?: string
  rows: Array<GlyphRow>
  note?: string
  alt: string
  legend?: Array<LegendItem>
}) {
  const textX = 156
  let y = heading ? 34 : 12
  const placed = rows.map((row) => {
    const lines = wrap(row.text, 76)
    const top = y
    y += Math.max(20 + lines.length * LINE, row.h) + 20
    return { row, lines, top }
  })
  const noteLines = note ? wrap(note, 100) : []
  const height = y + (note ? noteLines.length * LINE + 6 : 0)
  return (
    <Figure title={title} legend={legend}>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={alt}>
        {heading ? (
          <text className="fig-strong" x="8" y="16">
            {heading}
          </text>
        ) : null}
        {placed.map(({ row, lines, top }, index) => (
          <g key={row.label}>
            {index > 0 ? (
              <path style={RULE} d={`M8 ${top - 10}H${WIDTH - 8}`} />
            ) : null}
            {row.glyph(top)}
            <text
              className="fig-strong"
              x={textX}
              y={top + 12}
              style={{ fontSize: 13 }}
            >
              {row.label}
            </text>
            <Lines x={textX} y={top + 30} lines={lines} />
          </g>
        ))}
        {note ? <Lines x={8} y={y + 8} lines={noteLines} /> : null}
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Review agents                                                       */
/* ------------------------------------------------------------------ */

export function ReviewTimeline() {
  return (
    <Dated
      title="Eight months of review automation"
      legend={[
        { label: 'a change to the review', mark: 'lilac' },
        { label: 'a side event', mark: 'sand' },
        { label: 'a removal', mark: 'rose' },
      ]}
      alt="A timeline with nine entries from April to November 2026. April: the review runs on every push and posts one comment that it updates. May: project rules go into the prompt. June: the prompt gets shorter and quieter, and a label asks for another pass. July: the model is pinned after reviews became slow. 12 September: a custom multi-agent reviewer is added. 1 October: a third reviewer is added as a comparison. 3 October: the custom reviewer and the third reviewer are disabled. 8 October: the coding agent must review its own change before it verifies it. 23 October: the remaining reviewer runs only on request, with a validator."
      entries={[
        {
          when: 'April 2026',
          title: 'A review on every push',
          text: 'The Claude Code review action. One comment for each pull request, updated in place.',
        },
        {
          when: 'May 2026',
          title: 'Project rules in the prompt',
          text: 'Ten checks in priority order, and read tools so that the reviewer can look beyond the diff.',
        },
        {
          when: 'June 2026',
          title: 'Shorter and quieter',
          text: 'Prefer silence over a low-confidence comment. Three inline comments at most. A label asks for another pass.',
        },
        {
          when: 'July 2026',
          title: 'The model is pinned',
          text: 'The default model had changed, and reviews ran past their time limit.',
          tone: 'side',
        },
        {
          when: '12 September 2026',
          title: 'A custom multi-agent reviewer',
          text: 'A parent reviewer, specialists, and a verifier for each candidate blocker.',
        },
        {
          when: '1 October 2026',
          title: 'A third reviewer, as a comparison',
          text: 'An open-source review CLI. Its pilot did not complete.',
          tone: 'side',
        },
        {
          when: '3 October 2026',
          title: 'Two of the three are disabled',
          text: 'The custom reviewer and the comparison tool.',
          tone: 'removed',
        },
        {
          when: '8 October 2026',
          title: "Review moves into the agent's own loop",
          text: 'The agent that writes a change reviews it before it verifies it.',
        },
        {
          when: '23 October 2026',
          title: 'On request, with a validator',
          text: 'A label starts the review. A second agent checks the findings before they are posted.',
        },
      ]}
    />
  )
}

/** The diff as a sheet, with the findings that a reader took from it. */
function DiffSheet({ y, mark }: { y: number; mark: MarkName }) {
  return (
    <g>
      <Mark x={8} y={y} w={44} h={30} mark={mark} />
      <text x={30} y={y + 19} textAnchor="middle" style={{ fontSize: 11 }}>
        diff
      </text>
      {[0, 1, 2].map((index) => (
        <Mark
          key={index}
          x={68 + index * 20}
          y={y + 8}
          w={14}
          h={14}
          mark={mark}
        />
      ))}
    </g>
  )
}

export function ReviewerValidatorFlow() {
  return (
    <GlyphSteps
      title="The reviewer and its validator"
      heading="One review, on request"
      legend={[
        { label: 'the reviewer', mark: 'sand' },
        { label: 'the validator', mark: 'lilac' },
      ]}
      note="The one-call rule and the publication rule are instructions in the prompt. No step in the pipeline enforces them."
      alt="A flow with five steps. One: a person adds a label to a pull request that is not a draft. Two: the reviewer traces the real callers and checks whether each proposed fix is safe. Three: one validator with fresh context checks the whole batch of findings, with read-only tools and a limit of 20 turns. Four: the validator judges the bug and the proposed fix separately. Five: the reviewer posts a summary and at most three inline comments."
      rows={[
        {
          label: 'A label is added',
          text: 'The pull request must be open and not a draft. The workflow removes the label at once. A push does not start a review.',
          h: 26,
          glyph: (y) => (
            <g>
              <Mark x={8} y={y + 2} w={60} h={20} mark="amber" />
              <text
                x={38}
                y={y + 16}
                textAnchor="middle"
                style={{ fontSize: 11 }}
              >
                label
              </text>
            </g>
          ),
        },
        {
          label: 'The reviewer works',
          text: 'One session with read-only tools. It traces the real callers and checks each proposed fix against a valid existing state.',
          h: 32,
          glyph: (y) => <DiffSheet y={y} mark="sand" />,
        },
        {
          label: 'One validator, fresh context',
          text: 'It gets the whole batch in one call. It can read and search the code, and it stops after 20 turns.',
          h: 32,
          glyph: (y) => (
            <g>
              <DiffSheet y={y} mark="lilac" />
              <Empty x={62} y={y + 2} w={66} h={26} />
            </g>
          ),
        },
        {
          label: 'Bug and fix are judged separately',
          text: 'A confirmed bug stays visible when its proposed fix is unsafe. The reviewer then asks for a fix from a person and supplies no code.',
          h: 36,
          glyph: (y) => (
            <g>
              {[0, 1, 2].map((index) => (
                <g key={index}>
                  <Mark
                    x={8 + index * 42}
                    y={y + 2}
                    w={15}
                    h={15}
                    mark="lilac"
                  />
                  {index === 2 ? (
                    <Empty x={25 + index * 42} y={y + 2} w={15} h={15} />
                  ) : (
                    <Mark
                      x={25 + index * 42}
                      y={y + 2}
                      w={15}
                      h={15}
                      mark="lilac"
                    />
                  )}
                </g>
              ))}
              <text x={8} y={y + 32} style={{ fontSize: 11 }}>
                bug
              </text>
              <text x={30} y={y + 32} style={{ fontSize: 11 }}>
                fix
              </text>
            </g>
          ),
        },
        {
          label: 'Post',
          text: 'One summary comment, and at most three inline comments for blockers where the exact line matters.',
          h: 34,
          glyph: (y) => (
            <g>
              <Mark x={8} y={y + 2} w={96} h={12} mark="sand" />
              {[0, 1, 2].map((index) => (
                <Mark
                  key={index}
                  x={8 + index * 16}
                  y={y + 20}
                  w={11}
                  h={11}
                  mark="sand"
                />
              ))}
            </g>
          ),
        },
      ]}
    />
  )
}

/* ------------------------------------------------------------------ */
/* CI                                                                  */
/* ------------------------------------------------------------------ */

export function MinuteRounding() {
  const x0 = 176
  const minute = 140
  const jobs = [
    {
      name: 'Test report job',
      real: 9,
      billed: 60,
      label: '9 s real, 1 minute billed',
    },
    {
      name: 'Verification tool tests job',
      real: 14,
      billed: 60,
      label: '14 s real, 1 minute billed',
    },
    {
      name: 'Merge policy sweep',
      real: 74,
      billed: 120,
      label: '74 s real, 2 minutes billed',
    },
  ]
  const bottom = 26 + jobs.length * 48
  return (
    <Figure
      title="Real duration and billed minutes for three jobs"
      legend={[
        { label: 'Real duration', mark: 'lilac' },
        { label: 'Billed time', mark: 'sand', shape: 'dashed' },
      ]}
      caption="The billed minutes follow from the rounding rule."
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${bottom + 44}`}
        role="img"
        aria-label="Three jobs with their real duration and their billed minutes. The test report job ran for 9 seconds and is billed 1 minute. The verification tool tests job ran for 14 seconds and is billed 1 minute. The merge policy sweep ran for 74 seconds and is billed 2 minutes."
      >
        {[0, 1, 2].map((tick) => (
          <g key={tick}>
            <path
              className="fig-axis"
              strokeDasharray={tick === 0 ? undefined : '3 4'}
              d={`M${x0 + tick * minute} 12V${bottom}`}
            />
            <text
              x={x0 + tick * minute}
              y={bottom + 16}
              textAnchor="middle"
            >
              {tick === 0 ? '0' : `${tick} min`}
            </text>
          </g>
        ))}
        <text x={x0 + minute} y={bottom + 36} textAnchor="middle">
          Job duration
        </text>
        {jobs.map((job, index) => {
          const y = 22 + index * 48
          return (
            <g key={job.name}>
              <text x={x0 - 12} y={y + 18} textAnchor="end">
                {job.name}
              </text>
              <rect
                x={x0}
                y={y}
                width={(job.billed / 60) * minute}
                height={28}
                strokeDasharray="5 4"
                style={SOFT}
              />
              <Mark
                x={x0}
                y={y + 8}
                w={(job.real / 60) * minute}
                h={12}
                mark="lilac"
              />
              <text
                className="fig-strong"
                x={x0 + 2 * minute + 12}
                y={y + 18}
              >
                {job.label}
              </text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

type FlowStep = { label: string; text: string; mark?: MarkName }

function StepColumn({
  x,
  y,
  heading,
  steps,
  note,
}: {
  x: number
  y: number
  heading: string
  steps: Array<FlowStep>
  note?: string
}) {
  let top = y + 24
  const placed = steps.map((step) => {
    const label = wrap(step.label, 42)
    const lines = wrap(step.text, 44)
    const at = top
    top += (label.length + lines.length) * LINE + 14
    return { step, label, lines, at }
  })
  return (
    <g>
      <text className="fig-strong" x={x} y={y + 6} style={{ fontSize: 14 }}>
        {heading}
      </text>
      {placed.map(({ step, label, lines, at }) => (
        <g key={step.label}>
          {step.mark ? (
            <Mark x={x} y={at - 1} w={12} h={12} mark={step.mark} />
          ) : (
            <rect x={x + 1} y={at} width={10} height={10} style={SOFT} />
          )}
          <Lines x={x + 22} y={at + 10} lines={label} strong />
          <Lines x={x + 22} y={at + 10 + label.length * LINE} lines={lines} />
        </g>
      ))}
      {note ? <Lines x={x} y={top + 12} lines={wrap(note, 48)} /> : null}
    </g>
  )
}

export function BackMergeFlow() {
  const x0 = 76
  const hour = 548
  const at = (minutes: number) => x0 + (minutes / 60) * hour
  const runs = [4, 17, 23, 36, 44, 57]
  return (
    <Figure
      title="Back-merges before and after"
      legend={[
        { label: 'sweep, every 10 minutes', mark: 'rose' },
        { label: 'policy job after a CI run', mark: 'amber' },
        { label: 'back-merge workflow', mark: 'lilac' },
      ]}
      caption="The strip is a sketch of one hour. The sweep interval and its 2 billed minutes are real. The other positions are not measured."
    >
      <svg
        viewBox={`0 0 ${WIDTH} 420`}
        role="img"
        aria-label="Two flows. Before: a merge policy job ran after every CI run on every pull request, a sweep every 10 minutes read the status of all open pull requests, the policy routed each pull request, and about 8 back-merges a month were merged. After: when the production branch changes, one workflow merges it into the development branch with a merge commit and pushes it as the CI bot. Only a conflict opens a pull request for a person."
      >
        <text className="fig-strong" x="8" y="30">
          Before
        </text>
        <text className="fig-strong" x="8" y="70">
          After
        </text>
        <path className="fig-axis" d={`M${x0} 38H${x0 + hour}`} />
        <path className="fig-axis" d={`M${x0} 78H${x0 + hour}`} />
        {[0, 10, 20, 30, 40, 50].map((minutes) => (
          <Mark
            key={minutes}
            x={at(minutes)}
            y={18}
            w={(2 / 60) * hour}
            h={20}
            mark="rose"
          />
        ))}
        {runs.map((minutes) => (
          <Mark
            key={minutes}
            x={at(minutes)}
            y={24}
            w={(1 / 60) * hour}
            h={14}
            mark="amber"
          />
        ))}
        <Mark x={at(33)} y={58} w={(1 / 60) * hour} h={20} mark="lilac" />
        <text x={at(33) + 18} y={72}>
          the production branch changes
        </text>
        <text x={x0} y={96}>
          0
        </text>
        <text x={x0 + hour} y={96} textAnchor="end">
          1 hour
        </text>
        <path style={RULE} d={`M8 112H${WIDTH - 8}`} />
        <StepColumn
          x={8}
          y={134}
          heading="Before"
          steps={[
            {
              label: 'Every CI run on every pull request ends',
              text: 'A merge policy job starts. It is billed at least 1 minute.',
              mark: 'amber',
            },
            {
              label: 'Every 10 minutes',
              text: 'A sweep reads the status of all open pull requests. 74 seconds for 81 of them: 2 billed minutes.',
              mark: 'rose',
            },
            {
              label: 'Route',
              text: 'Squash for a feature. A merge commit by the CI bot for a back-merge.',
            },
            { label: 'Merge', text: 'About 8 back-merges a month.' },
          ]}
        />
        <StepColumn
          x={332}
          y={134}
          heading="After"
          steps={[
            {
              label: 'The production branch changes',
              text: 'This is the only trigger.',
              mark: 'lilac',
            },
            {
              label: 'Merge and push',
              text: 'One workflow merges it into the development branch with a merge commit and pushes it as the CI bot.',
              mark: 'lilac',
            },
            {
              label: 'Only on a conflict',
              text: 'It opens a back-merge pull request for a person.',
            },
          ]}
          note="A back-merge with no conflict now lands without a pull request. Its code was already reviewed on the way into the production branch."
        />
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Lint ratchet                                                        */
/* ------------------------------------------------------------------ */

export function RatchetSteps() {
  return (
    <Dated
      title="Three steps in six months"
      alt="A timeline with three entries. May 2026: the repository moved from ESLint to Oxlint. August 2026: the first rules of our own, 61 rules as errors and 64 as warnings. November 2026: nine more rules and a ratchet that records 26,332 violations."
      entries={[
        {
          when: 'May 2026',
          title: 'A faster linter',
          text: 'From ESLint to Oxlint. A linter that runs in seconds can run on every commit.',
        },
        {
          when: 'August 2026',
          title: 'The first rules of our own',
          text: '15 first-party rules and 15 from a public ruleset. 61 rules are errors and 64 are warnings.',
        },
        {
          when: '17 November 2026',
          title: 'The ratchet',
          text: 'Nine more rules. A recorded count for each rule in each file, and CI fails when a count goes up.',
        },
      ]}
    />
  )
}

const RATCHET_INPUTS: Array<{ label: string; text: string; mark: MarkName }> =
  [
    {
      label: 'Allowed counts on the main branch',
      text: 'The record that everyone shares.',
      mark: 'sand',
    },
    {
      label: 'Allowed counts in the pull request',
      text: 'The record that the pull request proposes.',
      mark: 'amber',
    },
    {
      label: 'Count now',
      text: 'What the lint run finds in the code.',
      mark: 'lilac',
    },
  ]

/** Bar heights for main, pull request and now, in units of 6 px. */
const RATCHET_RESULTS: Array<{
  bars: [number, number, number]
  when: string
  verdict: string
  detail?: string
}> = [
  {
    bars: [4, 4, 4],
    when: 'No count is above its allowed value, and the record is current',
    verdict: 'Pass',
  },
  {
    bars: [4, 4, 5],
    when: 'A count is above its allowed value',
    verdict: 'Fail',
    detail: 'The message has the form: allowed 12, found 13.',
  },
  {
    bars: [0, 0, 1],
    when: 'A new file has a violation',
    verdict: 'Fail',
    detail: 'A new file starts with an allowed count of zero.',
  },
  {
    bars: [4, 4, 3],
    when: 'A count fell, and the record still has the old value',
    verdict: 'Fail',
    detail: 'Run the update command and commit the lower record.',
  },
  {
    bars: [4, 5, 5],
    when: 'The pull request allows more than the main branch does',
    verdict: 'Refused',
    detail: 'A pull request cannot raise a count by an edit of the JSON.',
  },
]

export function RatchetOutcomes() {
  const top = 136
  const row = 58
  const height = top + RATCHET_RESULTS.length * row
  return (
    <Figure
      title="What the ratchet decides"
      caption="The bar heights are a sketch of each case."
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label="A diagram with three inputs and five results. The inputs are the allowed counts on the main branch, the allowed counts in the pull request, and the count from the lint run. The check passes when no count is above its allowed value and the recorded counts are current. It fails when a count rose, when a new file has a violation, when a count fell and the record was not updated, and when the pull request allows more than the main branch does."
      >
        <text className="fig-strong" x="8" y="16" style={{ fontSize: 13 }}>
          Three inputs
        </text>
        {RATCHET_INPUTS.map((input, index) => {
          const x = 8 + index * 212
          return (
            <g key={input.label}>
              <Mark x={x} y={30} w={12} h={12} mark={input.mark} />
              <Lines
                x={x + 20}
                y={40}
                lines={wrap(input.label, 28)}
                strong
              />
              <Lines
                x={x + 20}
                y={40 + wrap(input.label, 28).length * LINE}
                lines={wrap(input.text, 30)}
              />
            </g>
          )
        })}
        <text className="fig-strong" x="8" y={top - 10} style={{ fontSize: 13 }}>
          Five results
        </text>
        {RATCHET_RESULTS.map((result, index) => {
          const y = top + index * row
          const base = y + 44
          return (
            <g key={result.when}>
              <path style={RULE} d={`M8 ${y + 6}H${WIDTH - 8}`} />
              <path style={RULE} d={`M8 ${base}H66`} />
              {result.bars.map((units, bar) =>
                units > 0 ? (
                  <Mark
                    key={bar}
                    x={12 + bar * 18}
                    y={base - units * 6}
                    w={14}
                    h={units * 6}
                    mark={RATCHET_INPUTS[bar].mark}
                  />
                ) : null,
              )}
              <text className="fig-strong" x={84} y={y + 28}>
                {result.when}
              </text>
              {result.detail ? (
                <text x={84} y={y + 45}>
                  {result.detail}
                </text>
              ) : null}
              <Mark
                x={554}
                y={y + 16}
                w={78}
                h={26}
                mark={result.verdict === 'Pass' ? 'sage' : 'rose'}
              />
              <text
                className="fig-strong"
                x={593}
                y={y + 33}
                textAnchor="middle"
              >
                {result.verdict}
              </text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

function CodePanel({
  y,
  heading,
  directive,
  tag,
  note,
}: {
  y: number
  heading: string
  directive: string | null
  tag: string
  note: ReactNode
}) {
  const line = (index: number) => y + 22 + index * 26
  return (
    <g>
      <text className="fig-strong" x="8" y={y + 10} style={{ fontSize: 13 }}>
        {heading}
      </text>
      {directive ? (
        <Mark x={8} y={line(0)} w={420} h={22} mark="rose" />
      ) : (
        <Empty x={8} y={line(0)} w={420} h={22} />
      )}
      <text x={16} y={line(0) + 15} style={MONO}>
        {directive ?? '/* (directive blanked) */'}
      </text>
      <text x={16} y={line(1) + 15} style={MONO}>
        const a = useCallback(…)
      </text>
      <text x={16} y={line(2) + 15} style={{ ...MONO, opacity: 0.65 }}>
        … 11 more, already in the baseline
      </text>
      <Mark x={8} y={line(3)} w={420} h={22} mark="lilac" />
      <text x={16} y={line(3) + 15} style={MONO}>
        const added = useCallback(…)
      </text>
      {[1, 3].map((index) => (
        <text
          key={index}
          className="fig-strong"
          x={444}
          y={line(index) + 15}
        >
          {tag}
        </text>
      ))}
      <text x="8" y={line(4) + 14}>
        {note}
      </text>
    </g>
  )
}

export function HiddenViolation() {
  return (
    <Figure
      title="A violation under an existing directive"
      legend={[
        { label: 'the directive', mark: 'rose' },
        { label: 'the new line', mark: 'lilac' },
      ]}
      caption="The code is illustrative. The failure message is from the real check."
    >
      <svg
        viewBox={`0 0 ${WIDTH} 336`}
        role="img"
        aria-label="Two panels with the same four lines of code. In the normal run, a whole-file disable directive silences a rule, so a newly added useCallback line is not reported and the count does not change. In hidden mode, the script blanks the directive and lints again. All the lines are reported and the check fails with allowed 12, found 13."
      >
        <CodePanel
          y={6}
          heading="Normal run"
          directive="/* oxlint-disable no-memo-under-react-compiler */"
          tag="hidden"
          note={
            <>
              <tspan x="8">
                The directive silences the rule for the rest of the file.
              </tspan>
              <tspan x="8" dy={LINE}>
                The new line is not reported, so the count does not change.
              </tspan>
            </>
          }
        />
        <path style={RULE} d={`M8 174H${WIDTH - 8}`} />
        <CodePanel
          y={190}
          heading="Hidden mode"
          directive={null}
          tag="reported"
          note={
            <>
              The script blanks the directive and lints again. The result:{' '}
              <tspan style={MONO}>allowed 12, found 13</tspan>.
            </>
          }
        />
      </svg>
    </Figure>
  )
}

export function TotalChange() {
  const zero = 320
  return (
    <Figure title="Change in the total">
      <svg
        viewBox={`0 0 ${WIDTH} 150`}
        role="img"
        aria-label="The total of recorded violations grew by 181 in the 28 hours before the merge and fell by 197 in the 57 hours after it."
      >
        <path className="fig-axis" d={`M${zero} 8V128`} />
        <text x={zero} y={144} textAnchor="middle">
          0
        </text>
        <Mark x={zero} y={22} w={181} h={26} mark="rose" />
        <text className="fig-num" x={zero + 191} y={41}>
          +181
        </text>
        <text x={zero - 12} y={40} textAnchor="end">
          The 28 hours before the merge
        </text>
        <path
          className="fig-axis"
          strokeDasharray="3 4"
          d={`M60 68H${WIDTH - 60}`}
        />
        <text className="fig-strong" x={WIDTH - 60} y={62} textAnchor="end">
          the merge
        </text>
        <Mark x={zero - 197} y={88} w={197} h={26} mark="lilac" />
        <text className="fig-num" x={zero - 207} y={107} textAnchor="end">
          −197
        </text>
        <text x={zero + 12} y={106}>
          The 57 hours after the merge
        </text>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Verification skill                                                  */
/* ------------------------------------------------------------------ */

export function VerificationWeeks() {
  return (
    <Dated
      title="Seven weeks on one skill"
      alt="A timeline with seven entries from 3 October to 18 November 2026. 3 October: the first version, from a generated base. 8 October: review and verification become automatic after each change. 23 October: stricter commands and a test policy. 27 October: cheaper runs. 7 November: a maintenance pass finds drift. 16 November: an audit of recorded runs, then an app and a database for each agent. 18 November: a lighter daily development stack."
      entries={[
        {
          when: '3 October 2026',
          title: 'The first version, from a generated base',
          text: 'Launch, health check, drive, evidence, cleanup. Recipes for three product areas.',
        },
        {
          when: '8 October 2026',
          title: 'Automatic after each change',
          text: 'Every task ends with review, then verification. The agent starts both.',
        },
        {
          when: '23 October 2026',
          title: 'Stricter commands',
          text: 'Unknown options are rejected. Destructive steps have dry runs. New tests need approval.',
        },
        {
          when: '27 October 2026',
          title: 'Cheaper runs',
          text: 'Verification at checkpoints, reuse of proof that still applies, one account for each preview.',
        },
        {
          when: '7 November 2026',
          title: 'A maintenance pass',
          text: 'The feature recipes are checked against the source and the live app. The drift is fixed.',
          tone: 'side',
        },
        {
          when: '16 November 2026',
          title: 'An audit, then parallel tools',
          text: '30 of 160 recorded runs had a user-level check. Each agent gets its own app and database.',
        },
        {
          when: '18 November 2026',
          title: 'A lighter daily stack',
          text: 'The development stack goes from 14.1 GB to 2.4 GB.',
        },
      ]}
    />
  )
}

function Trio({
  y,
  mark,
  empty = [],
}: {
  y: number
  mark: MarkName
  empty?: Array<number>
}) {
  return (
    <g>
      {[0, 1, 2].map((index) =>
        empty.includes(index) ? (
          <Empty key={index} x={8 + index * 30} y={y + 2} w={22} h={22} />
        ) : (
          <Mark
            key={index}
            x={8 + index * 30}
            y={y + 2}
            w={22}
            h={22}
            mark={mark}
          />
        ),
      )}
    </g>
  )
}

/** The feature areas that this sketch marks as touched by the diff. */
const TOUCHED = [17, 18, 44]

export function VerificationRun() {
  return (
    <GlyphSteps
      title="One verification run"
      heading="From a diff to a report"
      alt="A flow with seven steps. One: the diff. Two: the feature map finds the features that the diff touches. Three: the planner prints the tier, the checks, and the commands. Four: the run starts a web instance, a database, and an account for this checkout. Five: the checks run against that instance. Six: the evidence recorder stores each check with its result. Seven: teardown removes everything and lists what remains."
      rows={[
        {
          label: 'Diff',
          text: 'The change that the agent must prove.',
          h: 30,
          glyph: (y) => (
            <g>
              <Mark x={8} y={y + 2} w={74} h={11} mark="sage" />
              <Mark x={8} y={y + 17} w={48} h={11} mark="rose" />
            </g>
          ),
        },
        {
          label: 'Feature map',
          text: '65 feature areas, each with its source paths, entry points, and test suites.',
          h: 46,
          glyph: (y) => (
            <g>
              {Array.from({ length: 65 }, (_, index) => (
                <Mark
                  key={index}
                  x={8 + (index % 13) * 9}
                  y={y + 1 + Math.floor(index / 13) * 9}
                  w={7}
                  h={7}
                  mark={TOUCHED.includes(index) ? 'lilac' : 'sand'}
                />
              ))}
            </g>
          ),
        },
        {
          label: 'Plan',
          text: 'The features, the tier, the checks, and the full command sequence.',
          h: 34,
          glyph: (y) => (
            <g>
              {[86, 60, 100].map((width, index) => (
                <Mark
                  key={index}
                  x={8}
                  y={y + 1 + index * 11}
                  w={width}
                  h={7}
                  mark="sand"
                />
              ))}
            </g>
          ),
        },
        {
          label: 'Instance, database, account',
          text: 'One of each for this checkout. Nothing is shared with another agent.',
          h: 28,
          glyph: (y) => <Trio y={y} mark="lilac" />,
        },
        {
          label: 'Checks',
          text: 'Each check has an action, an expected result, and a separate source that confirms it.',
          h: 28,
          glyph: (y) => (
            <g>
              {[0, 1, 2].map((index) => (
                <g key={index}>
                  <Mark
                    x={8 + index * 38}
                    y={y + 2}
                    w={14}
                    h={22}
                    mark="sand"
                  />
                  <Mark
                    x={24 + index * 38}
                    y={y + 2}
                    w={14}
                    h={22}
                    mark="amber"
                  />
                </g>
              ))}
            </g>
          ),
        },
        {
          label: 'Evidence',
          text: 'The recorder stores each check. It refuses a record that claims more than the check proved.',
          h: 28,
          glyph: (y) => <Trio y={y} mark="lilac" empty={[2]} />,
        },
        {
          label: 'Teardown',
          text: 'Everything that the run started is removed. A leftover gives exit code 1.',
          h: 28,
          glyph: (y) => <Trio y={y} mark="sand" empty={[0, 1, 2]} />,
        },
      ]}
    />
  )
}

const TIERS = [
  {
    name: 'commands',
    needs: 'Commands and existing tests in the checkout. No app runs.',
    proves: 'What a command or an existing test can show.',
  },
  {
    name: 'local',
    needs: "This checkout's own web instance.",
    proves: 'A claim in the real app that needs no public address.',
  },
  {
    name: 'local-tunnel',
    needs: 'The full local stack with a public tunnel.',
    proves: 'A claim that an outside service must reach.',
  },
  {
    name: 'preview',
    needs: 'A matching hosted preview.',
    proves: 'A claim that the local stack cannot run.',
  },
]

export function VerificationTiers() {
  const row = 58
  const top = 34
  return (
    <Figure title="Four tiers, lowest first">
      <svg
        viewBox={`0 0 ${WIDTH} ${top + TIERS.length * row}`}
        role="img"
        aria-label="A ladder of four tiers. Tier one, commands: needs no running app, and proves what commands and existing tests can show. Tier two, local: needs this checkout's own web instance, and proves a claim in the real app that needs no public address. Tier three, local-tunnel: needs the full local stack with a public tunnel, and proves a claim that an outside service must reach. Tier four, preview: needs a matching hosted preview, and proves a claim that the local stack cannot run."
      >
        <text className="fig-strong" x="184" y="16">
          Needs
        </text>
        <text className="fig-strong" x="416" y="16">
          Can prove
        </text>
        {TIERS.map((tier, index) => {
          const y = top + index * row
          return (
            <g key={tier.name}>
              <path style={RULE} d={`M8 ${y - 6}H${WIDTH - 8}`} />
              <Mark
                x={8}
                y={y + 4}
                w={70 + index * 30}
                h={30}
                mark={index === 0 ? 'sand' : 'lilac'}
              />
              <text x={16} y={y + 23} style={MONO}>
                {tier.name}
              </text>
              <Lines x={184} y={y + 16} lines={wrap(tier.needs, 34)} />
              <Lines x={416} y={y + 16} lines={wrap(tier.proves, 34)} />
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

const VERDICT_INPUTS = [
  {
    label: 'The check record',
    text: 'Action, expected result, observed result, oracle, and evidence.',
  },
  {
    label: 'The run record',
    text: 'All checks of the run, with each earlier attempt.',
  },
  {
    label: 'The teardown record',
    text: 'What the run removed and what remains.',
  },
]

const VERDICT_RULES: Array<{
  when: string
  verdict: string
  mark: MarkName
  detail?: string
}> = [
  {
    when: 'The action and its separate result agree',
    verdict: 'Passed',
    mark: 'sage',
  },
  {
    when: 'The action ran and did not meet the expected result',
    verdict: 'Failed',
    mark: 'rose',
  },
  {
    when: 'A required prerequisite prevented the check',
    verdict: 'Blocked',
    mark: 'sand',
  },
  {
    when: 'A check through the web instance has no assertion',
    verdict: 'Incomplete',
    mark: 'sand',
  },
  {
    when: 'The pattern of an assertion is empty or matches everything',
    verdict: 'Refused',
    mark: 'rose',
  },
  {
    when: 'A retry with a different command replaces a failed check, with no stated reason',
    verdict: 'Refused',
    mark: 'rose',
  },
  {
    when: 'The run has no recorded teardown',
    verdict: 'Incomplete',
    mark: 'sand',
    detail: 'The report publisher refuses the run.',
  },
  {
    when: 'A report claims full coverage and has gaps',
    verdict: 'Incomplete',
    mark: 'sand',
  },
]

export function EvidenceVerdicts() {
  const top = 128
  const row = 42
  return (
    <Figure title="Four verdicts and the rule for each">
      <svg
        viewBox={`0 0 ${WIDTH} ${top + VERDICT_RULES.length * row + 4}`}
        role="img"
        aria-label="A diagram with three inputs and eight rules. The inputs are the check record, the run record, and the teardown record. A check whose action and separate result agree is passed. A check that ran and did not meet the expected result is failed. A check that a missing prerequisite prevented is blocked. A check through the web instance with no assertion is incomplete. A record with an empty or match-all pattern is refused. A retry with a different command and no stated reason does not replace a failed check. A run with no recorded teardown is incomplete and cannot be published. A full report with gaps stays incomplete."
      >
        <text className="fig-strong" x="8" y="16" style={{ fontSize: 13 }}>
          What the recorder reads
        </text>
        {VERDICT_INPUTS.map((input, index) => {
          const x = 8 + index * 212
          return (
            <g key={input.label}>
              <Mark x={x} y={28} w={22} h={28} mark="amber" />
              <text className="fig-strong" x={x + 32} y={40}>
                {input.label}
              </text>
              <Lines x={x + 32} y={56} lines={wrap(input.text, 28)} />
            </g>
          )
        })}
        <text className="fig-strong" x="8" y={top - 8} style={{ fontSize: 13 }}>
          The rules
        </text>
        {VERDICT_RULES.map((rule, index) => {
          const y = top + index * row
          return (
            <g key={rule.when}>
              <path style={RULE} d={`M8 ${y}H${WIDTH - 8}`} />
              <text x={8} y={y + (rule.detail ? 18 : 25)}>
                {rule.when}
              </text>
              {rule.detail ? (
                <text x={8} y={y + 34} style={{ opacity: 0.75 }}>
                  {rule.detail}
                </text>
              ) : null}
              <Mark x={536} y={y + 8} w={96} h={26} mark={rule.mark} />
              <text
                className="fig-strong"
                x={584}
                y={y + 25}
                textAnchor="middle"
              >
                {rule.verdict}
              </text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* vLLM and Dynamo                                                     */
/* ------------------------------------------------------------------ */

const TOKENS = ['p', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9']

function TokenRow({ y, from }: { y: number; from: number }) {
  const cell = 50
  return (
    <g>
      {TOKENS.map((token, index) => (
        <g key={token}>
          {index >= from ? (
            <Mark x={8 + index * 56} y={y} w={cell} h={34} mark="lilac" />
          ) : (
            <Empty x={8 + index * 56} y={y} w={cell} h={34} />
          )}
          <text
            x={8 + index * 56 + cell / 2}
            y={y + 21}
            textAnchor="middle"
            style={{ ...MONO, opacity: index >= from ? 1 : 0.6 }}
          >
            {token}
          </text>
        </g>
      ))}
      <Mark x={8 + 10 * 56} y={y} w={cell} h={34} mark="blue" />
      <text x={8 + 10 * 56 + cell / 2} y={y + 21} textAnchor="middle" style={MONO}>
        new
      </text>
    </g>
  )
}

export function TokenWindow() {
  return (
    <Figure
      bleed
      title="What one decode step copies"
      legend={[
        { label: 'copied', mark: 'lilac' },
        { label: 'the new token', mark: 'blue' },
        { label: 'not copied', mark: 'sand', shape: 'dashed' },
      ]}
      caption="The history holds a prompt tail (p) and the output tokens so far. The two offsets select a short span at the end."
    >
      <svg
        viewBox={`0 0 ${WIDTH} 212`}
        role="img"
        aria-label="Before the fix, one decode step copies all ten history entries, p and t1 to t9, and adds the new token. After the fix, it copies only t7, t8 and t9 and adds the new token. p and t1 to t6 are not copied."
      >
        <text className="fig-strong" x="8" y="16">
          Before · one decode step
        </text>
        <TokenRow y={26} from={0} />
        <text x="8" y="80">
          Every token string in the history is copied. Only the last few are
          read.
        </text>
        <text className="fig-strong" x="8" y="126">
          After · one decode step
        </text>
        <TokenRow y={136} from={7} />
        <text x="8" y="190">
          The copy starts at the first index that the slices can read.
        </text>
        <HandNote
          x={446}
          y={200}
          text="window_start"
          rotate={-2}
          arrowToFrom="left"
          arrowTo={[404, 176]}
        />
      </svg>
    </Figure>
  )
}

export function PrefillOrder() {
  const ids = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6']
  const cell = 92
  const x = (index: number) => 8 + index * 104
  return (
    <Figure
      bleed
      title="Removing a request that is not the oldest"
      caption="The request ID already leads to the load state in the hash map. The order key is stored beside it."
    >
      <svg
        viewBox={`0 0 ${WIDTH} 262`}
        role="img"
        aria-label="Before: to remove r4 from a VecDeque that holds r1 to r6, retain compares every queued ID with r4. After: the hash map entry for r4 holds its load and its order key 3, and the BTreeMap removes key 3 directly, with no scan."
      >
        <text className="fig-strong" x="8" y="16">
          Before · <tspan style={MONO}>{'VecDeque<RequestId>'}</tspan>
        </text>
        {ids.map((id, index) => (
          <g key={id}>
            <Mark x={x(index)} y={40} w={cell} h={34} mark="sand" />
            {id === 'r4' ? (
              <path
                className="ink-stroke"
                d={`M${x(index) + 14} 60L${x(index) + cell - 14} 54`}
              />
            ) : null}
            <text
              x={x(index) + cell / 2}
              y={61}
              textAnchor="middle"
              style={MONO}
            >
              {id}
            </text>
          </g>
        ))}
        <path
          className="ink-stroke"
          markerEnd="url(#pp-ink-arrow)"
          d={`M${x(0) + 10} 32C${x(1)} 24 ${x(4)} 24 ${x(5) + cell - 10} 32`}
        />
        <text x="8" y="96">
          To remove r4, <tspan style={MONO}>retain</tspan> compares every
          queued ID with it.
        </text>
        <text className="fig-strong" x="8" y="140">
          After · <tspan style={MONO}>{'BTreeMap<u64, RequestId>'}</tspan>
        </text>
        <text x="8" y="164" style={MONO}>
          prefills[r4] → load, order 3
        </text>
        {ids.map((id, index) => (
          <g key={id}>
            {id === 'r4' ? (
              <g>
                <Mark x={x(index)} y={186} w={cell} h={34} mark="lilac" />
                <path
                  className="ink-stroke"
                  d={`M${x(index) + 10} 206L${x(index) + cell - 10} 200`}
                />
              </g>
            ) : (
              <Empty x={x(index)} y={186} w={cell} h={34} />
            )}
            <text
              x={x(index) + cell / 2}
              y={207}
              textAnchor="middle"
              style={{ ...MONO, opacity: id === 'r4' ? 1 : 0.6 }}
            >
              {`${index}: ${id}`}
            </text>
          </g>
        ))}
        <path
          className="ink-stroke"
          markerEnd="url(#pp-ink-arrow)"
          d={`M214 168C${x(3) - 20} 166 ${x(3) + 20} 168 ${x(3) + cell / 2} 182`}
        />
        <text x="8" y="244">
          The stored order key finds the entry in O(log N) steps. There is no
          scan.
        </text>
      </svg>
    </Figure>
  )
}
