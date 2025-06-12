import {
  Chart,
  Legend,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Scatter } from "solid-chartjs";
import { createSignal, onMount } from "solid-js";

Chart.register(LinearScale, PointElement, Title, Tooltip, Legend);

interface ScatterDataPoint {
  x: number; // storage
  y: number; // performance
  label: string;
}

// Import benchmark data
import benchmarkData from "../../../data/benchmark_data/chart_data.json";

const defaultData: ScatterDataPoint[] = benchmarkData.bar_chart.map(item => ({
  x: item.storage,
  y: item.avg_time,
  label: item.implementation,
}));

interface Props {
  data?: ScatterDataPoint[];
  title?: string;
}

export default function PerformanceScatterChart(props: Props) {
  const [chartData, setChartData] = createSignal({});
  const data = props.data || defaultData;

  onMount(() => {
    const colors = [
      "rgba(46, 204, 113, 0.8)", // Native uuidv7() (bright green)
      "rgba(54, 162, 235, 0.8)", // UUIDv7 PL/pgSQL
      "rgba(255, 206, 86, 0.8)", // ULID
      "rgba(75, 192, 192, 0.8)", // UUIDv7 Pure SQL
      "rgba(255, 99, 132, 0.8)", // UUIDv4
      "rgba(153, 102, 255, 0.8)", // TypeID
      "rgba(255, 159, 64, 0.8)", // UUIDv7 Sub-ms
    ];

    setChartData({
      datasets: [
        {
          label: "ID Generation Methods",
          data: data.map((point, index) => ({
            x: point.x,
            y: point.y,
            pointRadius: 8,
            pointHoverRadius: 10,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace("0.8", "1"),
            borderWidth: 2,
          })),
          pointLabels: data.map((point) => point.label),
        },
      ],
    });
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: !!props.title,
        text: props.title,
        font: {
          size: 16,
          weight: "bold",
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const point = data[context.dataIndex];
            return [
              `${point.label}`,
              `Performance: ${context.parsed.y} μs`,
              `Storage: ${context.parsed.x} bytes`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        position: "bottom" as const,
        title: {
          display: true,
          text: "Storage Size (bytes)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Generation Time (μs)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  return (
    <div class="mb-6 h-80 w-full">
      <Scatter data={chartData()} options={options} />
    </div>
  );
}
