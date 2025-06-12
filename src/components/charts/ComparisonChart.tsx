import { Chart, Title, Tooltip, Legend } from 'chart.js'
import {
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import { Bar } from 'solid-chartjs'
import { createSignal, onMount } from 'solid-js'

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ComparisonData {
  implementation: string
  singleThreaded: number  // μs
  concurrent: number      // IDs/sec
  storage: number         // bytes
}

const defaultData: ComparisonData[] = [
  { implementation: 'UUIDv7 (PL/pgSQL)', singleThreaded: 72.3, concurrent: 18126, storage: 36 },
  { implementation: 'ULID', singleThreaded: 79.9, concurrent: 26523, storage: 26 },
  { implementation: 'UUIDv7 (Pure SQL)', singleThreaded: 82.3, concurrent: 25085, storage: 36 },
  { implementation: 'UUIDv4', singleThreaded: 86.3, concurrent: 29492, storage: 36 },
  { implementation: 'TypeID', singleThreaded: 86.5, concurrent: 25775, storage: 31 },
  { implementation: 'UUIDv7 (Sub-ms)', singleThreaded: 90.6, concurrent: 21658, storage: 36 },
]

interface Props {
  data?: ComparisonData[]
  title?: string
  type?: 'side-by-side' | 'stacked'
}

export default function ComparisonChart(props: Props) {
  const [chartData, setChartData] = createSignal({})
  const data = props.data || defaultData

  onMount(() => {
    const labels = data.map(d => d.implementation.replace(' ', '\n'))

    if (props.type === 'side-by-side') {
      // Normalize data for comparison (performance inverted - lower is better)
      const maxThroughput = Math.max(...data.map(d => d.concurrent))
      const minPerformance = Math.min(...data.map(d => d.singleThreaded))

      setChartData({
        labels,
        datasets: [
          {
            label: 'Single-threaded Performance',
            data: data.map(d => ((minPerformance / d.singleThreaded) * 100).toFixed(1)),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            yAxisID: 'y',
          },
          {
            label: 'Concurrent Throughput',
            data: data.map(d => ((d.concurrent / maxThroughput) * 100).toFixed(1)),
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            yAxisID: 'y',
          },
        ],
      })
    } else {
      // Regular comparison
      setChartData({
        labels,
        datasets: [
          {
            label: 'Performance (μs)',
            data: data.map(d => d.singleThreaded),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            yAxisID: 'y',
          },
        ],
      })
    }
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
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const originalData = data[context.dataIndex]
            if (props.type === 'side-by-side') {
              if (context.datasetIndex === 0) {
                return `Single-threaded: ${originalData.singleThreaded} μs (${context.parsed.y}% relative)`
              } else {
                return `Concurrent: ${originalData.concurrent.toLocaleString()} IDs/sec (${context.parsed.y}% relative)`
              }
            }
            return `${context.dataset.label}: ${context.parsed.y} μs`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: props.type === 'side-by-side' ? 'Relative Performance (%)' : 'Time (μs)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        beginAtZero: true,
      },
    },
  }

  return (
    <div class="w-full h-80 mb-6">
      <Bar data={chartData()} options={options} />
    </div>
  )
}