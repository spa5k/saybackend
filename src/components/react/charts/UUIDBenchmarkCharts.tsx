"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@components/ui/ui/chart";

// Import benchmark data
import benchmarkData from "../../../data/benchmark_data/chart_data.json";

const performanceData = benchmarkData.bar_chart.map((item) => ({
  implementation: item.implementation,
  avgTime: item.avg_time,
  throughput: item.throughput,
}));

const chartConfig = {
  avgTime: {
    label: "Average Time (μs)",
    color: "var(--chart-1)",
  },
  throughput: {
    label: "Throughput (IDs/sec)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

// Performance comparison chart
export function PerformanceComparisonChart() {
  const [activeMetric, setActiveMetric] = React.useState<
    "avgTime" | "throughput"
  >("avgTime");

  const data = performanceData.map((item) => ({
    name: item.implementation,
    value: activeMetric === "avgTime" ? item.avgTime : item.throughput,
  }));

  const getBarColor = (name: string) => {
    if (name === "Native uuidv7()") return "#10b981"; // green
    if (name === "Custom uuidv7()") return "#3b82f6"; // blue
    if (name === "UUIDv4") return "#ef4444"; // red
    if (name === "ULID") return "#f59e0b"; // yellow
    if (name === "TypeID") return "#8b5cf6"; // purple
    return "var(--chart-1)";
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>
            {activeMetric === "avgTime"
              ? "Single-threaded performance (lower is better)"
              : "Concurrent throughput (higher is better)"}
          </CardDescription>
        </div>
        <div className="flex">
          <button
            data-active={activeMetric === "avgTime"}
            className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
            onClick={() => setActiveMetric("avgTime")}
          >
            <span className="text-muted-foreground text-xs">Performance</span>
            <span className="text-lg leading-none font-bold sm:text-2xl">
              Avg Time
            </span>
          </button>
          <button
            data-active={activeMetric === "throughput"}
            className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
            onClick={() => setActiveMetric("throughput")}
          >
            <span className="text-muted-foreground text-xs">Throughput</span>
            <span className="text-lg leading-none font-bold sm:text-2xl">
              IDs/sec
            </span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) =>
                  activeMetric === "throughput"
                    ? `${(value / 1000).toFixed(0)}k`
                    : value.toString()
                }
              />
              <ChartTooltip
                wrapperClassName="!bg-white dark:!bg-gray-900"
                content={
                  <ChartTooltipContent
                    className="!bg-white !text-black dark:!bg-gray-900 dark:!text-white"
                    formatter={(value) => {
                      if (activeMetric === "avgTime") {
                        return `${value} μs`;
                      }
                      return `${value.toLocaleString()} IDs/sec`;
                    }}
                  />
                }
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Storage efficiency chart
export function StorageComparisonChart() {
  const storageData = benchmarkData.bar_chart.map((item) => ({
    name: item.implementation,
    storage: item.storage,
  }));

  const getBarColor = (name: string) => {
    if (name === "Native uuidv7()") return "#10b981";
    if (name === "Custom uuidv7()") return "#3b82f6";
    if (name === "UUIDv4") return "#ef4444";
    if (name === "ULID") return "#f59e0b";
    if (name === "TypeID") return "#8b5cf6";
    return "var(--chart-3)";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Requirements</CardTitle>
        <CardDescription>Text representation size in bytes</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={storageData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <ChartTooltip
                wrapperClassName="!bg-white dark:!bg-gray-900"
                content={
                  <ChartTooltipContent
                    className="!bg-white !text-black dark:!bg-gray-900 dark:!text-white"
                    formatter={(value) => `${value} bytes`}
                  />
                }
              />
              <Bar dataKey="storage" radius={[4, 4, 0, 0]}>
                {storageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
