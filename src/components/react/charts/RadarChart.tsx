import {
  Chart,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Radar } from "solid-chartjs";
import { createSignal, onMount } from "solid-js";

Chart.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

interface RadarDataPoint {
  implementation: string;
  performance: number; // Higher is better (normalized)
  throughput: number; // Higher is better (normalized)
  storage: number; // Higher is better (normalized - lower storage is better)
}

// Import benchmark data
import benchmarkData from "../../../data/benchmark_data/chart_data.json";

// Normalized scores (0-100, higher is better)
const defaultData: RadarDataPoint[] = benchmarkData.radar_chart.map(item => ({
  implementation: item.implementation,
  performance: item.performance,
  throughput: item.throughput,
  storage: item.storage_efficiency,
}));

interface Props {
  data?: RadarDataPoint[];
  title?: string;
  selectedImplementations?: string[];
}

export default function RadarChart(props: Props) {
  const [chartData, setChartData] = createSignal({});
  const data = props.data || defaultData;

  onMount(() => {
    const colors = [
      "rgba(46, 204, 113, 0.6)", // Native uuidv7() (bright green)
      "rgba(54, 162, 235, 0.6)", // UUIDv7 PL/pgSQL
      "rgba(255, 206, 86, 0.6)", // ULID
      "rgba(75, 192, 192, 0.6)", // UUIDv7 Pure SQL
      "rgba(255, 99, 132, 0.6)", // UUIDv4
      "rgba(153, 102, 255, 0.6)", // TypeID
      "rgba(255, 159, 64, 0.6)", // UUIDv7 Sub-ms
    ];

    const filteredData = props.selectedImplementations
      ? data.filter((d) =>
          props.selectedImplementations!.includes(d.implementation),
        )
      : data;

    const datasets = filteredData.map((item, index) => ({
      label: item.implementation,
      data: [item.performance, item.throughput, item.storage],
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length].replace("0.6", "1"),
      borderWidth: 2,
      pointBackgroundColor: colors[index % colors.length].replace("0.6", "1"),
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: colors[index % colors.length].replace("0.6", "1"),
    }));

    setChartData({
      labels: [
        "Performance\n(Speed)",
        "Throughput\n(Concurrent)",
        "Storage\n(Efficiency)",
      ],
      datasets,
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
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const labels = ["Performance", "Throughput", "Storage Efficiency"];
            return `${context.dataset.label}: ${context.parsed.r}% ${labels[context.dataIndex]}`;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: function (value: any) {
            return value + "%";
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        angleLines: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        pointLabels: {
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
  };

  return (
    <div class="mb-6 h-96 w-full">
      <Radar data={chartData()} options={options} />
    </div>
  );
}
