import { Chart, Title, Tooltip, Legend, Colors } from 'chart.js'
import {
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import { Bar } from 'solid-chartjs'
import { createSignal, onMount } from 'solid-js'

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Colors)

interface PerformanceData {
  implementation: string
  avgTime: number
  throughput: number
  storage: number
}

const defaultData: PerformanceData[] = [
  { implementation: 'UUIDv7 (PL/pgSQL)', avgTime: 72.3, throughput: 18126, storage: 36 },
  { implementation: 'ULID', avgTime: 79.9, throughput: 26523, storage: 26 },
  { implementation: 'UUIDv7 (Pure SQL)', avgTime: 82.3, throughput: 25085, storage: 36 },
  { implementation: 'UUIDv4', avgTime: 86.3, throughput: 29492, storage: 36 },
  { implementation: 'TypeID', avgTime: 86.5, throughput: 25775, storage: 31 },
  { implementation: 'UUIDv7 (Sub-ms)', avgTime: 90.6, throughput: 21658, storage: 36 },
]

interface Props {
  data?: PerformanceData[]
  type?: 'performance' | 'throughput' | 'storage'
  title?: string
}

export default function PerformanceBarChart(props: Props) {
  const [chartData, setChartData] = createSignal({})
  const data = props.data || defaultData

  onMount(() => {
    const labels = data.map(d => d.implementation)
    let values: number[]
    let label: string
    let backgroundColor: string

    switch (props.type) {
      case 'throughput':
        values = data.map(d => d.throughput)
        label = 'Concurrent Throughput (IDs/sec)'
        backgroundColor = 'rgba(75, 192, 192, 0.8)'
        break
      case 'storage':
        values = data.map(d => d.storage)
        label = 'Storage Size (bytes)'
        backgroundColor = 'rgba(255, 159, 64, 0.8)'
        break
      default:
        values = data.map(d => d.avgTime)
        label = 'Average Time (μs)'
        backgroundColor = 'rgba(54, 162, 235, 0.8)'
    }

    setChartData({
      labels,
      datasets: [
        {
          label,
          data: values,
          backgroundColor,
          borderColor: backgroundColor.replace('0.8', '1'),
          borderWidth: 2,
          borderRadius: 4,
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
            const value = context.parsed.y
            const suffix = props.type === 'throughput' ? ' IDs/sec' : 
                          props.type === 'storage' ? ' bytes' : ' μs'
            return `${context.dataset.label}: ${value.toLocaleString()}${suffix}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            if (props.type === 'throughput') {
              return value.toLocaleString()
            }
            return value
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  }

  return (
    <div class="w-full h-80 mb-6">
      <Bar data={chartData()} options={options} />
    </div>
  )
}