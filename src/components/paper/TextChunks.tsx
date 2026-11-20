import { Figure, GraphPaper, HandNote, MARKS } from './Figure'
import type { LegendItem, MarkName } from './Figure'
import type { ReactNode } from 'react'

type Chunk = {
  /** Index of the line that holds this chunk. */
  line: number
  /** First character, and the character after the last one. */
  from: number
  to: number
  mark: MarkName
}

type Props = {
  title: string
  lines: Array<string>
  chunks: Array<Chunk>
  legend?: Array<LegendItem>
  /** A handwritten note that points at one character of one line. */
  note?: { text: string; line: number; at: number }
  caption?: ReactNode
  description: string
}

const WIDTH = 640
const LEFT = 20
const CHAR = 7.8
const TEXT_HEIGHT = 22
const LANE = 11

/**
 * Real text with a marker band under each chunk. Chunks that overlap sit on
 * two lanes, so the shared characters have two bands.
 */
export function TextChunks({
  title,
  lines,
  chunks,
  legend,
  note,
  caption,
  description,
}: Props) {
  // Give each chunk a lane: the first lane that is free at its start.
  const placed = lines.map((_, line) => {
    const ends: Array<number> = []
    return chunks
      .filter((chunk) => chunk.line === line)
      .sort((a, b) => a.from - b.from)
      .map((chunk) => {
        let lane = ends.findIndex((end) => end <= chunk.from)
        if (lane < 0) lane = ends.length
        ends[lane] = chunk.to
        return { ...chunk, lane }
      })
  })
  const lanes = placed.map((row) =>
    Math.max(1, ...row.map((chunk) => chunk.lane + 1)),
  )
  const tops: Array<number> = []
  let cursor = 14
  lines.forEach((_, index) => {
    tops.push(cursor)
    cursor += TEXT_HEIGHT + lanes[index] * LANE + 12
  })
  const height = cursor + (note ? 30 : 0)
  const x = (character: number) => LEFT + character * CHAR

  return (
    <Figure title={title} legend={legend} caption={caption}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={description}
      >
        <GraphPaper width={WIDTH} height={height} bleed={30} />
        {lines.map((line, index) => (
          <g key={`${index}-${line}`}>
            <text
              x={LEFT}
              y={tops[index] + 14}
              textLength={line.length * CHAR}
              lengthAdjust="spacingAndGlyphs"
              xmlSpace="preserve"
              style={{
                fill: 'var(--ink)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
              }}
            >
              {line}
            </text>
            <g filter="url(#pp-marker)">
              {placed[index].map((chunk) => (
                <rect
                  key={`${chunk.from}-${chunk.to}`}
                  x={x(chunk.from) + 1}
                  y={tops[index] + TEXT_HEIGHT + chunk.lane * LANE}
                  width={(chunk.to - chunk.from) * CHAR - 2}
                  height={LANE - 3}
                  style={{ fill: MARKS[chunk.mark] }}
                />
              ))}
            </g>
          </g>
        ))}
        {note ? (
          <HandNote
            x={Math.min(x(note.at) + 26, WIDTH - 250)}
            y={height - 10}
            text={note.text}
            rotate={-2}
            arrowToFrom="left"
            arrowTo={[
              x(note.at),
              tops[note.line] + TEXT_HEIGHT + lanes[note.line] * LANE + 4,
            ]}
          />
        ) : null}
      </svg>
    </Figure>
  )
}
