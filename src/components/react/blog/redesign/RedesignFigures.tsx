import { Figure, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

const SHEET_W = 128
const SHEET_H = 150
const SHEET_Y = 34
const sheets = [
  { x: 10, label: 'paper', paper: true, marker: false, pen: false },
  { x: 174, label: 'marker', paper: false, marker: true, pen: false },
  { x: 338, label: 'pen', paper: false, marker: false, pen: true },
  { x: 502, label: 'a figure', paper: true, marker: true, pen: true },
]

/** The three layers of the design, apart and then together. */
export function ThreeLayers() {
  return (
    <Figure bleed title="Every figure is three layers">
      <svg
        viewBox="0 0 640 230"
        role="img"
        aria-label="Three sheets side by side: paper with faint plus marks, two flat marker bars, and one handwritten pen note with an arrow. A fourth sheet shows the three together as a finished figure."
      >
        {sheets.map((sheet, index) => (
          <g key={sheet.label}>
            <rect
              x={sheet.x}
              y={SHEET_Y}
              width={SHEET_W}
              height={SHEET_H}
              style={{ fill: 'var(--paper)', stroke: 'var(--rule)' }}
            />
            {sheet.paper ? (
              <g transform="scale(.5)" aria-hidden="true">
                <rect
                  x={sheet.x * 2}
                  y={SHEET_Y * 2}
                  width={SHEET_W * 2}
                  height={SHEET_H * 2}
                  fill="url(#pp-plus)"
                />
              </g>
            ) : null}
            {sheet.marker ? (
              <g filter="url(#pp-marker)">
                <rect
                  x={sheet.x + 26}
                  y={SHEET_Y + 44}
                  width="30"
                  height="90"
                  style={{ fill: 'var(--m-sand)' }}
                />
                <rect
                  x={sheet.x + 68}
                  y={SHEET_Y + 116}
                  width="30"
                  height="18"
                  style={{ fill: 'var(--m-lilac)' }}
                />
                <path
                  className="fig-axis"
                  d={`M${sheet.x + 16} ${SHEET_Y + 135}H${sheet.x + 112}`}
                />
              </g>
            ) : null}
            {sheet.pen ? (
              <g>
                <text
                  className="fig-hand"
                  x={sheet.x + 62}
                  y={SHEET_Y + 62}
                  transform={`rotate(-4 ${sheet.x + 62} ${SHEET_Y + 62})`}
                >
                  the result
                </text>
                <path
                  className="ink-stroke"
                  markerEnd="url(#pp-ink-arrow)"
                  d={`M${sheet.x + 96} ${SHEET_Y + 70}C${sheet.x + 98} ${
                    SHEET_Y + 86
                  } ${sheet.x + 92} ${SHEET_Y + 98} ${sheet.x + 84} ${
                    SHEET_Y + 108
                  }`}
                />
              </g>
            ) : null}
            <text
              className="fig-strong"
              x={sheet.x + SHEET_W / 2}
              y={SHEET_Y + SHEET_H + 24}
              textAnchor="middle"
            >
              {sheet.label}
            </text>
            {index < sheets.length - 1 ? (
              <text
                className="fig-num"
                x={sheet.x + SHEET_W + 18}
                y={SHEET_Y + SHEET_H / 2 + 6}
                textAnchor="middle"
              >
                {index === sheets.length - 2 ? '=' : '+'}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </Figure>
  )
}

const stages = [
  { x: 14, filter: undefined, label: 'flat fill', detail: 'a plain rect' },
  {
    x: 228,
    filter: 'url(#rd-grain)',
    label: 'grain',
    detail: 'fine noise takes ink out',
  },
  {
    x: 442,
    filter: 'url(#pp-marker)',
    label: 'rough edge',
    detail: 'coarse noise moves the pixels',
  },
]

/** One rectangle through the two steps of the marker filter, at 2x. */
export function MarkerEdge() {
  return (
    <Figure
      bleed
      title="One rectangle through the marker filter, drawn at 2×"
      caption="The third rectangle uses the same filter as every shape on the site."
    >
      <svg
        viewBox="0 0 640 190"
        role="img"
        aria-label="The same blue rectangle three times. First with a flat fill. Second with fine grain that removes some ink. Third with the grain and an uneven, hand-drawn edge."
      >
        <defs>
          <filter
            id="rd-grain"
            x="-6%"
            y="-6%"
            width="112%"
            height="112%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".8"
              numOctaves="2"
              seed="3"
              result="grain"
            />
            <feColorMatrix in="grain" type="luminanceToAlpha" result="alpha" />
            <feComposite
              in="SourceGraphic"
              in2="alpha"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="-.15"
              k4="0"
            />
          </filter>
        </defs>
        {stages.map((stage, index) => (
          <g key={stage.label}>
            <g transform="scale(2)">
              <rect
                x={stage.x / 2}
                y="10"
                width="92"
                height="50"
                filter={stage.filter}
                style={{ fill: 'var(--m-lilac)' }}
              />
            </g>
            <text className="fig-strong" x={stage.x} y="148">
              {`${index + 1}. ${stage.label}`}
            </text>
            <text x={stage.x} y="166">
              {stage.detail}
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  )
}

const subjects: Array<{ name: string; mark: MarkName }> = [
  { name: 'Go', mark: 'lilac' },
  { name: 'Postgres', mark: 'blue' },
  { name: 'Agents', mark: 'amber' },
  { name: 'Web', mark: 'sage' },
  { name: 'Other', mark: 'sand' },
]

/** The colour a post gets from its subject. */
export function SubjectColours() {
  return (
    <Figure title="One colour per subject">
      <svg
        viewBox="0 0 640 110"
        role="img"
        aria-label="Five marker squares with their subjects: blue for Go, teal for Postgres, amber for agents, green for web, and sand for all other posts."
      >
        {subjects.map((subject, index) => (
          <g key={subject.name}>
            <rect
              x={40 + index * 120}
              y="14"
              width="52"
              height="52"
              filter="url(#pp-marker)"
              style={{ fill: MARKS[subject.mark] }}
            />
            <text
              className="fig-strong"
              x={66 + index * 120}
              y="92"
              textAnchor="middle"
            >
              {subject.name}
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  )
}
