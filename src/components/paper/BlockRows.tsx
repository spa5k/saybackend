import { Figure, GraphPaper, HandNote, MARKS } from './Figure'
import type { LegendItem, MarkName } from './Figure'
import type { ReactNode } from 'react'

type Block = {
  text: string
  mark: MarkName
  /** Small text under the block, such as a hash. */
  sub?: string
}

type Props = {
  title: string
  rows: Array<{
    label: string
    blocks: Array<Block>
    /** A line of small text under the row. Needs `stacked`. */
    note?: string
  }>
  /** Put each row label above its blocks, to leave room for long rows. */
  stacked?: boolean
  legend?: Array<LegendItem>
  /** Handwritten notes that point at one block. */
  notes?: Array<{
    row: number
    block: number
    text: string
    side?: 'right' | 'below'
  }>
  caption?: ReactNode
  /** Run the figure across the full width of the page. */
  bleed?: boolean
  description: string
}

const WIDTH = 640
const LEFT = 92
const BLOCK_W = 96
const BLOCK_H = 34
const GAP = 8

/**
 * Rows of blocks that line up by position, to compare sequences: what is
 * the same, what changed, and what that change costs.
 */
export function BlockRows({
  title,
  rows,
  stacked = false,
  legend,
  notes = [],
  bleed,
  caption,
  description,
}: Props) {
  const hasSub = rows.some((row) => row.blocks.some((block) => block.sub))
  const hasNote = stacked && rows.some((row) => row.note)
  const left = stacked ? 8 : LEFT
  const most = Math.max(...rows.map((row) => row.blocks.length))
  const blockWidth = Math.min(
    stacked ? 150 : BLOCK_W,
    Math.floor((WIDTH - left - 4) / most) - GAP,
  )
  const labelSpace = stacked ? 20 : 0
  const rowHeight =
    labelSpace + BLOCK_H + (hasSub ? 40 : hasNote ? 34 : stacked ? 16 : 26)
  const top = stacked ? 18 : 16
  const noteSpace = notes.some((note) => note.side === 'below') ? 44 : 0
  const height = top + rows.length * rowHeight + noteSpace
  const x = (index: number) => left + index * (blockWidth + GAP)
  const y = (row: number) => top + row * rowHeight + labelSpace

  return (
    <Figure bleed={bleed} title={title} legend={legend} caption={caption}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={description}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        {rows.map((row, rowIndex) => (
          <g key={row.label}>
            <text
              className="fig-strong"
              x={stacked ? left : LEFT - 12}
              y={stacked ? y(rowIndex) - 8 : y(rowIndex) + BLOCK_H / 2 + 4}
              textAnchor={stacked ? 'start' : 'end'}
            >
              {row.label}
            </text>
            {stacked && row.note ? (
              <text x={left} y={y(rowIndex) + BLOCK_H + 16}>
                {row.note}
              </text>
            ) : null}
            <g filter="url(#pp-marker)">
              {row.blocks.map((block, index) => (
                <rect
                  key={index}
                  x={x(index)}
                  y={y(rowIndex)}
                  width={blockWidth}
                  height={BLOCK_H}
                  style={{ fill: MARKS[block.mark] }}
                />
              ))}
            </g>
            {row.blocks.map((block, index) => (
              <g key={index}>
                <text
                  x={x(index) + blockWidth / 2}
                  y={y(rowIndex) + BLOCK_H / 2 + 4}
                  textAnchor="middle"
                  style={{
                    fill: 'var(--ink)',
                    fontSize: blockWidth < 72 ? 10 : 11.5,
                  }}
                >
                  {block.text}
                </text>
                {block.sub ? (
                  <text
                    x={x(index) + blockWidth / 2}
                    y={y(rowIndex) + BLOCK_H + 15}
                    textAnchor="middle"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}
                  >
                    {block.sub}
                  </text>
                ) : null}
              </g>
            ))}
          </g>
        ))}
        {notes.map((note) => {
          const blockX = x(note.block)
          const blockY = y(note.row)
          return note.side === 'below' ? (
            <HandNote
              key={note.text}
              x={blockX + blockWidth + 10}
              y={blockY + BLOCK_H + (hasSub ? 44 : 30)}
              text={note.text}
              rotate={-2}
              arrowToFrom="left"
              arrowTo={[
                blockX + blockWidth / 2,
                blockY + BLOCK_H + (hasSub ? 22 : 6),
              ]}
            />
          ) : (
            <HandNote
              key={note.text}
              x={blockX + blockWidth + 16}
              y={blockY + BLOCK_H / 2 + 2}
              text={note.text}
              rotate={-2}
            />
          )
        })}
      </svg>
    </Figure>
  )
}
