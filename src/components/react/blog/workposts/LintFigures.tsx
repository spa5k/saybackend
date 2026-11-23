import { Figure, HandNote, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

import {
  Box,
  Edge,
  LABEL,
  MONO,
  SMALL,
  Status,
  StepControls,
  TINY,
  useLoop,
  useSteps,
} from './motion'

/*
 * Figures for the lint baseline post.
 *   sand   the record (the baseline file)
 *   blue   the merge base, what develop allows
 *   lilac  what lint finds now
 *   rose   a failure, or a directive that hides code
 *   sage   a check that holds, or a fall
 *   amber  a fall that is not locked in yet
 */

/* ------------------------------------------------------------------ */
/* The ratchet: one file, one rule, five pull requests                 */
/* ------------------------------------------------------------------ */

type RatchetFrame = {
  pr: string
  base: number
  record: number
  found: number
  verdict: string
  mark: MarkName
}

const RATCHET: Array<RatchetFrame> = [
  {
    pr: 'A pull request that does not touch the file',
    base: 3,
    record: 3,
    found: 3,
    verdict: 'Counts held. Nothing to do.',
    mark: 'sage',
  },
  {
    pr: 'A pull request adds one more as cast',
    base: 3,
    record: 3,
    found: 4,
    verdict: '✗ allowed 3, found 4. The build fails.',
    mark: 'rose',
  },
  {
    pr: 'A pull request removes two casts',
    base: 3,
    record: 3,
    found: 1,
    verdict: '↓ allowed 3, found 1. Run --update.',
    mark: 'amber',
  },
  {
    pr: 'The update lowers the record in the same pull request',
    base: 3,
    record: 1,
    found: 1,
    verdict: 'The record follows the count down.',
    mark: 'sage',
  },
  {
    pr: 'Later, a pull request edits the record from 1 to 2',
    base: 1,
    record: 2,
    found: 2,
    verdict: '✗ baseline says 2, merge base says 1.',
    mark: 'rose',
  },
]

const STACK_FLOOR = 178
const UNIT_H = 22

function Stack({
  x,
  count,
  mark,
  over = 0,
  label,
}: {
  x: number
  count: number
  mark: MarkName
  over?: number
  label: string
}) {
  return (
    <g>
      {[0, 1, 2, 3].map((index) => {
        const on = index < count
        const extra = on && index >= count - over
        return (
          <rect
            key={index}
            x={x}
            y={STACK_FLOOR - (index + 1) * UNIT_H + 3}
            width={84}
            height={UNIT_H - 6}
            opacity={on ? 1 : 0}
            filter="url(#pp-marker)"
            style={{ fill: MARKS[extra ? 'rose' : mark] }}
          />
        )
      })}
      <path className="fig-axis" d={`M${x - 8} ${STACK_FLOOR}H${x + 92}`} />
      <text x={x + 42} y={STACK_FLOOR + 18} textAnchor="middle" style={SMALL}>
        {label}
      </text>
      <text
        className="fig-num"
        x={x + 42}
        y={STACK_FLOOR - count * UNIT_H - 6}
        textAnchor="middle"
        style={LABEL}
      >
        {count}
      </text>
    </g>
  )
}

export function RatchetLoop() {
  const { ref, step } = useLoop(RATCHET.length, 2200, 1.5)
  const frame = RATCHET[step] ?? RATCHET[RATCHET.length - 1]
  const over = Math.max(frame.found - frame.record, 0)
  const forged = Math.max(frame.record - frame.base, 0)

  return (
    <Figure
      title="One file, one rule, five pull requests"
      legend={[
        { label: 'merge base', mark: 'blue' },
        { label: 'record in the pull request', mark: 'sand' },
        { label: 'found by lint', mark: 'lilac' },
        { label: 'over the limit', mark: 'rose' },
      ]}
      caption="The path and the counts are made up. The messages are the shape of the real output."
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 262"
        role="img"
        aria-label="One file with three type assertions in the record. A pull request that does not touch it holds. One that adds a fourth fails with allowed 3, found 4. One that removes two is asked to run the update, and the update lowers the record to 1. A later pull request that edits the record from 1 to 2 fails, because the merge base says 1."
      >
        <text x="24" y="28" style={MONO}>
          src/features/billing/invoice.ts · no-type-assertion
        </text>
        <text className="fig-strong" x="24" y="52" style={LABEL}>
          {step + 1}. {frame.pr}
        </text>

        <Stack x={120} count={frame.base} mark="blue" label="merge base" />
        <Stack
          x={278}
          count={frame.record}
          mark="sand"
          over={forged}
          label="record"
        />
        <Stack
          x={436}
          count={frame.found}
          mark="lilac"
          over={over}
          label="found"
        />

        <Box x={60} y={216} w={520} h={30} mark={frame.mark} opacity={0.9} />
        <text
          className="fig-strong"
          x="320"
          y="236"
          textAnchor="middle"
          style={MONO}
        >
          {frame.verdict}
        </text>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Hidden mode: a violation under an old directive                     */
/* ------------------------------------------------------------------ */

const HIDDEN_STEPS = [
  'Add a line',
  'Normal run',
  'Blank the directive',
  'Lint again',
]

const CODE_X = 24
const CODE_W = 392
const codeLine = (index: number) => 40 + index * 28

export function HiddenMode() {
  const { ref, step, go, replay } = useSteps(HIDDEN_STEPS.length, 1700)
  const added = step >= 0
  const blanked = step >= 2
  const reported = step >= 3
  const lines = [
    blanked
      ? '/*                                              */'
      : '/* oxlint-disable no-memo-under-react-compiler */',
    'const a = useCallback(…)',
    '… 11 more, already counted as hidden',
    'const onDrop = useCallback(…)',
  ]

  const found = step === 1 ? '0' : reported ? '13' : '–'
  const result =
    step === 0
      ? 'The new line sits under a directive from last year.'
      : step === 1
        ? 'Lint reports nothing. The normal check passes.'
        : step === 2
          ? 'Same file, same offsets. The directive is spaces now.'
          : '✗ allowed 12, found 13'

  return (
    <Figure
      title="Hidden mode finds the 13th useCallback"
      legend={[
        { label: 'the directive', mark: 'rose' },
        { label: 'the new line', mark: 'lilac' },
        { label: 'reported in hidden mode', mark: 'amber' },
      ]}
      caption={
        <StepControls
          labels={HIDDEN_STEPS}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 214"
        role="img"
        aria-label="A file with a rest-of-file disable directive and twelve useCallback calls that are already counted as hidden violations. A thirteenth is added. The normal run reports nothing. Hidden mode replaces the directive with spaces, lints again, and the check fails with allowed 12, found 13."
      >
        <text className="fig-strong" x={CODE_X} y="22" style={LABEL}>
          use-file-upload.ts
        </text>
        {lines.map((text, index) => {
          const isDirective = index === 0
          const isNew = index === 3
          const fill: MarkName | null = isDirective
            ? 'rose'
            : isNew
              ? 'lilac'
              : null
          return (
            <g key={index} opacity={isNew && !added ? 0 : 1}>
              {fill ? (
                <Box
                  x={CODE_X}
                  y={codeLine(index) - 17}
                  w={CODE_W}
                  h={24}
                  mark={fill}
                  opacity={isDirective && blanked ? 0.25 : 1}
                />
              ) : null}
              {reported && index > 0 ? (
                <rect
                  x={CODE_X - 10}
                  y={codeLine(index) - 15}
                  width={5}
                  height={20}
                  filter="url(#pp-marker)"
                  style={{ fill: MARKS.amber }}
                />
              ) : null}
              <text
                x={CODE_X + 10}
                y={codeLine(index)}
                style={{ ...MONO, opacity: index === 2 ? 0.7 : 1, whiteSpace: 'pre' }}
              >
                {text}
              </text>
            </g>
          )
        })}

        <Edge d="M424 82H468" live={step === 1 || step === 3} arrow />
        <text x="484" y="56" style={SMALL}>
          record
        </text>
        <text className="fig-num" x="484" y="82" style={{ fontSize: 22 }}>
          12
        </text>
        <text x="560" y="56" style={SMALL}>
          found
        </text>
        <text
          className="fig-num"
          x="560"
          y="82"
          style={{ fontSize: 22, fill: reported ? MARKS.rose : undefined }}
        >
          {found}
        </text>
        <text x="484" y="108" style={TINY}>
          {blanked ? 'directive blanked' : 'directive active'}
        </text>

        <path className="fig-axis" d="M24 160H616" />
        <Status y={190}>{result}</Status>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* The total since the merge, commit by commit                        */
/* ------------------------------------------------------------------ */

/** First-parent changes to the record on develop: [day of November, "HH:MM" IST, total]. */
const SERIES: Array<[number, string, number]> = [
  [17, '14:31', 26332],
  [17, '16:34', 26323],
  [17, '22:43', 26322],
  [18, '01:50', 26309],
  [18, '13:40', 26300],
  [18, '14:05', 26281],
  [18, '14:31', 26264],
  [18, '18:27', 26248],
  [18, '20:54', 26240],
  [19, '00:21', 26236],
  [19, '00:21', 26228],
  [19, '02:06', 26226],
  [19, '18:32', 26192],
  [19, '18:32', 26183],
  [19, '18:37', 26168],
  [19, '19:07', 26153],
  [19, '20:20', 26141],
  [19, '23:04', 26140],
  [19, '23:17', 26135],
  [20, '01:27', 26132],
  [20, '01:42', 26131],
  [20, '02:22', 26129],
  [20, '02:59', 26097],
  [20, '06:59', 26095],
  [20, '20:14', 26089],
  [20, '20:21', 26040],
  [20, '22:18', 26017],
  [20, '22:19', 26016],
  [20, '23:03', 26015],
  [21, '00:32', 26012],
  [21, '13:27', 26010],
  [21, '13:54', 26003],
  [21, '14:17', 25895],
  [21, '16:43', 25893],
  [21, '17:27', 25852],
  [21, '17:38', 25800],
  [21, '17:52', 25799],
  [21, '20:01', 25797],
  [21, '22:45', 25793],
  [22, '06:01', 25789],
  [22, '23:23', 25787],
]

const hoursOf = (day: number, time: string) => {
  const [h, m] = time.split(':').map(Number)
  return (day - 17) * 24 + (h ?? 0) + (m ?? 0) / 60 - (14 + 31 / 60)
}

const POINTS = SERIES.map(([day, time, total]) => ({
  hours: hoursOf(day, time),
  total,
}))

const T_X0 = 70
const T_X1 = 610
const T_HOURS = 140
const T_Y0 = 40
const T_Y1 = 230
const T_MIN = 25750
const T_MAX = 26350
const tx = (hours: number) => T_X0 + (hours / T_HOURS) * (T_X1 - T_X0)
const ty = (total: number) =>
  T_Y0 + ((T_MAX - total) / (T_MAX - T_MIN)) * (T_Y1 - T_Y0)

/** Index of the last change on each day, plus the merge: the frames. */
const DAY_ENDS = [0, 2, 8, 18, 28, 38, 40]

export function TotalSeries() {
  const { ref, step } = useSteps(DAY_ENDS.length, 650)
  const upto = DAY_ENDS[step] ?? SERIES.length - 1
  const shown = POINTS.slice(0, upto + 1)
  const last = shown[shown.length - 1] ?? POINTS[0]

  let d = ''
  shown.forEach((point, index) => {
    const x = tx(point.hours)
    const y = ty(point.total)
    if (index === 0) d = `M${x} ${y}`
    else d += `H${x}V${y}`
  })
  if (step === DAY_ENDS.length - 1) d += `H${tx(T_HOURS - 4)}`

  const dayTicks = [18, 19, 20, 21, 22, 23].map((day) => ({
    day,
    x: tx(hoursOf(day, '00:00')),
  }))
  const sso = POINTS[32]
  const at57 = POINTS[18]

  return (
    <Figure
      bleed
      title="Recorded violations on develop, one step per change"
      legend={[{ label: 'total in the record', mark: 'lilac' }]}
      caption="41 first-parent changes from the merge to 23 November 2026. The total leaves out the hidden violations, which went 533 to 522."
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 276"
        role="img"
        aria-label="A step line that only goes down. It starts at 26,332 at the merge on 17 November, reaches 26,135 after 57 hours, drops 108 in one change on 21 November, and ends at 25,787 on 22 November. 40 changes after the merge, and each one lowered the total."
      >
        {[25800, 26000, 26200].map((value) => (
          <g key={value}>
            <path
              className="fig-axis"
              strokeDasharray="2 5"
              d={`M${T_X0} ${ty(value)}H${T_X1}`}
            />
            <text x={T_X0 - 8} y={ty(value) + 4} textAnchor="end" style={TINY}>
              {value.toLocaleString('en-US')}
            </text>
          </g>
        ))}
        <path className="fig-axis" d={`M${T_X0} ${T_Y1 + 8}H${T_X1}`} />
        {dayTicks.map(({ day, x }) => (
          <text
            key={day}
            x={x}
            y={T_Y1 + 26}
            textAnchor="middle"
            style={TINY}
          >
            {day} Nov
          </text>
        ))}

        <path
          d={d}
          fill="none"
          style={{ stroke: MARKS.lilac, strokeWidth: 5 }}
          filter="url(#pp-marker)"
        />
        <circle cx={tx(last.hours)} cy={ty(last.total)} r={4} className="fig-strong" />

        <text className="fig-num" x={tx(0) + 8} y={ty(26332) - 8} style={LABEL}>
          26,332 at the merge
        </text>
        <g opacity={upto >= 18 ? 1 : 0}>
          <text
            x={tx(at57.hours) + 6}
            y={ty(at57.total) - 10}
            style={SMALL}
          >
            26,135 after 57 hours
          </text>
        </g>
        <g opacity={upto >= 32 ? 1 : 0}>
          <HandNote
            x={tx(sso.hours) - 230}
            y={ty(25890)}
            text="one pull request, −108"
            arrowTo={[tx(sso.hours) - 2, ty(sso.total) + 8]}
          />
        </g>
        <g opacity={upto >= 40 ? 1 : 0}>
          <text
            className="fig-num"
            x={T_X1}
            y={ty(25787) - 12}
            textAnchor="end"
            style={LABEL}
          >
            25,787 now
          </text>
        </g>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* The allowlist that grew, and the count that fell                    */
/* ------------------------------------------------------------------ */

const ALLOW: Array<[string, number]> = [
  ['29 Aug', 87],
  ['15 Sep', 90],
  ['1 Oct', 99],
  ['15 Oct', 100],
  ['1 Nov', 106],
  ['16 Nov', 109],
]
const EFFECTS: Array<[string, number]> = [
  ['17 Nov', 197],
  ['23 Nov', 194],
]
const ALLOW_FRAMES = ALLOW.length + EFFECTS.length

function Grid({
  x,
  y,
  total,
  perRow,
  size,
  mark,
  newFrom,
  newMark,
  goneFrom,
}: {
  x: number
  y: number
  total: number
  perRow: number
  size: number
  mark: MarkName
  newFrom?: number
  newMark?: MarkName
  goneFrom?: number
}) {
  const cells = []
  for (let index = 0; index < total; index++) {
    const row = Math.floor(index / perRow)
    const col = index % perRow
    const isNew = newFrom !== undefined && index >= newFrom
    const isGone = goneFrom !== undefined && index >= goneFrom
    cells.push(
      <rect
        key={index}
        x={x + col * (size + 3)}
        y={y + row * (size + 3)}
        width={size}
        height={size}
        opacity={isGone ? 0.15 : 1}
        filter="url(#pp-marker)"
        style={{ fill: MARKS[isNew && newMark ? newMark : mark] }}
      />,
    )
  }
  return <g>{cells}</g>
}

export function AllowlistLeak() {
  const { ref, step } = useSteps(ALLOW_FRAMES, 700)
  const allowIndex = Math.min(step, ALLOW.length - 1)
  const [allowDate, allowCount] = ALLOW[allowIndex] ?? ALLOW[0]
  const effectStep = step - ALLOW.length
  const effectsOn = effectStep >= 0
  const [effectDate, effectCount] =
    EFFECTS[Math.max(effectStep, 0)] ?? EFFECTS[0]

  return (
    <Figure
      bleed
      title="A list of exempt files only grows. A count per file can fall."
      legend={[
        { label: 'exempt in August', mark: 'sand' },
        { label: 'added to the list later', mark: 'rose' },
        { label: 'effects in the record', mark: 'lilac' },
      ]}
      caption="Left: entries under the useEffect ban's off switch in the app configs. Right: the rule's count in the baseline, in 102 files on both dates."
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 262"
        role="img"
        aria-label="Left, the August allowlist for the useEffect ban: 87 entries on 29 August, then 90, 99, 100, 106 and 109 by 16 November, 22 files added by one-line config edits. Right, the baseline from 17 November: 197 effects in 102 files, then 194 on 23 November."
      >
        <text className="fig-strong" x="24" y="24" style={LABEL}>
          August: files exempt from the ban
        </text>
        <Grid
          x={24}
          y={40}
          total={allowCount}
          perRow={10}
          size={13}
          mark="sand"
          newFrom={87}
          newMark="rose"
        />
        <text className="fig-num" x="200" y="62" style={{ fontSize: 22 }}>
          {allowCount}
        </text>
        <text x="200" y="82" style={SMALL}>
          entries on {allowDate}
        </text>
        <text x="200" y="100" style={SMALL} opacity={allowCount > 87 ? 1 : 0}>
          +{allowCount - 87} since August
        </text>

        <path className="fig-axis" d="M300 34V246" strokeDasharray="3 4" />

        <g opacity={effectsOn ? 1 : 0.12}>
          <text className="fig-strong" x="324" y="24" style={LABEL}>
            November: effects counted per file
          </text>
          <Grid
            x={324}
            y={40}
            total={197}
            perRow={18}
            size={10}
            mark="lilac"
            goneFrom={effectCount}
          />
          <text className="fig-num" x="324" y="236" style={{ fontSize: 22 }}>
            {effectsOn ? effectCount : 197}
          </text>
          <text x="374" y="236" style={SMALL}>
            effects on {effectDate}, in 102 files
          </text>
        </g>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Inputs that passed, from three review rounds                        */
/* ------------------------------------------------------------------ */

type Bypass = {
  label: string
  round: string
  code: Array<string>
  before: string
  after: string
}

const BYPASSES: Array<Bypass> = [
  {
    label: 'Blanket disable',
    round: 'Round 1',
    code: [
      '/* oxlint-disable */',
      'console.log((JSON.parse("{}") as { a: string }).a!)',
    ],
    before: '0 diagnostics. It even silenced the rule for blanket disables.',
    after: 'Directives are counted from the source text, not from lint output.',
  },
  {
    label: 'Edit the record',
    round: 'Round 1',
    code: ['"no-type-assertion": { "…/x.ts": 4 }   // was 3', 'a 4th `as` cast in x.ts'],
    before: 'Exit 0. The record allowed 4, lint found 4.',
    after: 'The record is compared with the merge base. 4 > 3 fails.',
  },
  {
    label: 'A link in a comment',
    round: 'Round 1',
    code: ['// see https://example.com', '// … ten more lines of explanation'],
    before: 'One URL exempted the whole comment block.',
    after: 'A link exempts its own line, not its neighbours.',
  },
  {
    label: 'Same-line and JSX',
    round: 'Round 2',
    code: ['x!; // eslint-disable-line …', '{/* oxlint-disable-next-line */}'],
    before: 'Neither form was counted as a directive.',
    after: 'Every form counts: next line, same line, block, JSX, whole file.',
  },
  {
    label: 'void error',
    round: 'Round 3',
    code: ['} catch (error) {', '  void error;', '}'],
    before: 'Passed as "reading" the error.',
    after: 'no-swallowed-error reports it, with a bare error; too.',
  },
]

export function BypassGallery() {
  const { ref, step, go, replay } = useSteps(BYPASSES.length, 2400)
  const item = BYPASSES[step] ?? BYPASSES[0]

  return (
    <Figure
      title="Inputs that passed the check, and what closed them"
      legend={[
        { label: 'passed, and should not have', mark: 'rose' },
        { label: 'what the check does now', mark: 'sage' },
      ]}
      caption={
        <StepControls
          labels={BYPASSES.map((bypass) => bypass.label)}
          step={step}
          go={go}
          replay={replay}
        />
      }
    >
      <svg
        ref={ref}
        className="wp-fig"
        viewBox="0 0 640 236"
        role="img"
        aria-label="Five inputs from three review rounds that passed the check before a fix: a blanket disable directive that gave zero diagnostics, a hand-edited record, a link in a comment that exempted ten lines, same-line and JSX directives that were not counted, and void error in a catch block. Each one fails now."
      >
        <text className="fig-strong" x="24" y="26" style={LABEL}>
          {item.round}, a different model reviewing
        </text>
        <rect
          x="24"
          y="40"
          width="592"
          height={item.code.length * 24 + 16}
          rx="4"
          style={{ fill: 'none', stroke: 'var(--line)' }}
        />
        {item.code.map((line, index) => (
          <text key={line} x="40" y={64 + index * 24} style={MONO}>
            {line}
          </text>
        ))}

        <Box x={24} y={136} w={592} h={36} mark="rose" opacity={0.85} />
        <text className="fig-strong" x="40" y="159" style={SMALL}>
          Before: {item.before}
        </text>
        <Box x={24} y={184} w={592} h={36} mark="sage" opacity={0.85} />
        <text className="fig-strong" x="40" y="207" style={SMALL}>
          Now: {item.after}
        </text>
      </svg>
    </Figure>
  )
}
