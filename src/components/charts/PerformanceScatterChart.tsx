import { Chart, Title, Tooltip, Legend } from 'chart.js'
import {
  LinearScale,
  PointElement,
} from 'chart.js'
import { Scatter } from 'solid-chartjs'
import { createSignal, onMount } from 'solid-js'

Chart.register(LinearScale, PointElement, Title, Tooltip, Legend)

interface ScatterDataPoint {
  x: number // storage
  y: number // performance
  label: string
}

const defaultData: ScatterDataPoint[] = [
  { x: 36, y: 72.3, label: 'UUIDv7 (PL/pgSQL)' },
  { x: 26, y: 79.9, label: 'ULID' },
  { x: 36, y: 82.3, label: 'UUIDv7 (Pure SQL)' },
  { x: 36, y: 86.3, label: 'UUIDv4' },
  { x: 31, y: 86.5, label: 'TypeID' },
  { x: 36, y: 90.6, label: 'UUIDv7 (Sub-ms)' },
]

interface Props {
  data?: ScatterDataPoint[]
  title?: string
}

export default function PerformanceScatterChart(props: Props) {
  const [chartData, setChartData] = createSignal({})
  const data = props.data || defaultData

  onMount(() => {
    const colors = [
      'rgba(54, 162, 235, 0.8)',   // UUIDv7 PL/pgSQL
      'rgba(255, 206, 86, 0.8)',   // ULID
      'rgba(75, 192, 192, 0.8)',   // UUIDv7 Pure SQL
      'rgba(255, 99, 132, 0.8)',   // UUIDv4
      'rgba(153, 102, 255, 0.8)',  // TypeID
      'rgba(255, 159, 64, 0.8)',   // UUIDv7 Sub-ms
    ]

    setChartData({
      datasets: [
        {
          label: 'ID Generation Methods',
          data: data.map((point, index) => ({
            x: point.x,
            y: point.y,
            pointRadius: 8,
            pointHoverRadius: 10,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace('0.8', '1'),
            borderWidth: 2,
          })),
          pointLabels: data.map(point => point.label),
        },
      ],
    })
  })

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: !!props.title,
        text: props.title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const point = data[context.dataIndex]
            return [
              `${point.label}`,
              `Performance: ${context.parsed.y} μs`,
              `Storage: ${context.parsed.x} bytes`
            ]
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'Storage Size (bytes)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Generation Time (μs)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  return (
    <div class="w-full h-80 mb-6">
      <Scatter data={chartData()} options={options} />
    </div>
  )
}