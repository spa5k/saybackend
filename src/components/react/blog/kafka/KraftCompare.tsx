import { Figure, GraphPaper, HandNote, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

const WIDTH = 640
const HEIGHT = 250
const BOX = 44

function Nodes({
  x,
  y,
  mark,
  label,
}: {
  x: number
  y: number
  mark: MarkName
  label: string
}) {
  return (
    <g>
      <g filter="url(#pp-marker)">
        {[0, 1, 2].map((index) => (
          <rect
            key={index}
            x={x + index * (BOX + 14)}
            y={y}
            width={BOX}
            height={BOX}
            style={{ fill: MARKS[mark] }}
          />
        ))}
      </g>
      <text x={x + BOX * 1.5 + 14} y={y + BOX + 16} textAnchor="middle">
        {label}
      </text>
    </g>
  )
}

function Links({ x, from, to }: { x: number; from: number; to: number }) {
  return (
    <g>
      {[0, 1, 2].map((index) => (
        <path
          key={index}
          className="flow-edge"
          markerEnd="url(#pp-arrow)"
          d={`M${x + index * (BOX + 14) + BOX / 2} ${from}V${to}`}
        />
      ))}
    </g>
  )
}

/** A Kafka cluster with a ZooKeeper ensemble, and the same cluster in KRaft mode. */
export function KraftCompare() {
  return (
    <Figure
      title="The same cluster, with ZooKeeper and in KRaft mode"
      legend={[
        { label: 'ZooKeeper node', mark: 'sand' },
        { label: 'Kafka controller', mark: 'lilac' },
        { label: 'Kafka broker', mark: 'blue' },
      ]}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="On the left, a Kafka cluster with ZooKeeper: three ZooKeeper nodes hold the metadata for three Kafka brokers. On the right, KRaft mode: three Kafka controllers form a Raft quorum and hold the metadata for three Kafka brokers. There is no separate ZooKeeper system."
      >
        <GraphPaper width={WIDTH} height={HEIGHT} bleed={30} />
        <text className="fig-strong" x="60" y="22">
          With ZooKeeper
        </text>
        <Nodes x={60} y={38} mark="sand" label="ZooKeeper ensemble" />
        <Links x={60} from={104} to={138} />
        <Nodes x={60} y={142} mark="blue" label="Kafka brokers" />
        <path className="fig-axis" strokeDasharray="3 4" d="M320 14V214" />
        <text className="fig-strong" x="400" y="22">
          KRaft mode
        </text>
        <Nodes x={400} y={38} mark="lilac" label="controller quorum (Raft)" />
        <Links x={400} from={104} to={138} />
        <Nodes x={400} y={142} mark="blue" label="Kafka brokers" />
        <HandNote x={236} y={70} text={'a second system\nto run'} rotate={-3} />
        <HandNote x={576} y={70} text={'all\nKafka'} rotate={-3} />
      </svg>
    </Figure>
  )
}
