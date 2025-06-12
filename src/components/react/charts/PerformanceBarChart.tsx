import {
  BarElement,
  CategoryScale,
  Chart,
  Colors,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
);

interface PerformanceData {
  implementation: string;
  avgTime: number;
  throughput: number;
  storage: number;
}

// Import benchmark data
import benchmarkData from "../../../data/benchmark_data/chart_data.json";

const defaultData: PerformanceData[] = benchmarkData.bar_chart.map((item) => ({
  implementation: item.implementation,
  avgTime: item.avg_time,
  throughput: item.throughput,
  storage: item.storage,
}));

interface Props {
  data?: PerformanceData[];
  type?: "performance" | "throughput" | "storage";
  title?: string;
}

export default function PerformanceBarChart(props: Props) {
  const [chartData, setChartData] = useState({});
  const data = props.data || defaultData;

  useEffect(() => {
    const labels = data.map((d) => d.implementation);
    let values: number[];
    let label: string;
    let backgroundColor: string;

    switch (props.type) {
      case "throughput":
        values = data.map((d) => d.throughput);
        label = "Concurrent Throughput (IDs/sec)";
        backgroundColor = "rgba(75, 192, 192, 0.8)";
        break;
      case "storage":
        values = data.map((d) => d.storage);
        label = "Storage Size (bytes)";
        backgroundColor = "rgba(255, 159, 64, 0.8)";
        break;
      default:
        values = data.map((d) => d.avgTime);
        label = "Average Time (μs)";
        backgroundColor = "rgba(54, 162, 235, 0.8)";
    }

    setChartData({
      labels,
      datasets: [
        {
          label,
          data: values,
          backgroundColor,
          borderColor: backgroundColor.replace("0.8", "1"),
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    });
  }, [props.type, data]);

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
            const value = context.parsed.y;
            const suffix =
              props.type === "throughput"
                ? " IDs/sec"
                : props.type === "storage"
                  ? " bytes"
                  : " μs";
            return `${context.dataset.label}: ${value.toLocaleString()}${suffix}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          callback: function (value: any) {
            if (props.type === "throughput") {
              return value.toLocaleString();
            }
            return value;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="mb-6 h-80 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
