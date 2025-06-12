"use client";

import {
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
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
import { type ChartConfig, ChartContainer } from "@components/ui/ui/chart";

// Import benchmark data
import benchmarkData from "../../../data/benchmark_data/chart_data.json";

const scatterData = benchmarkData.bar_chart.map((item) => ({
  x: item.storage,
  y: item.avg_time,
  name: item.implementation,
}));

const radarData = benchmarkData.radar_chart.map((item) => ({
  implementation: item.implementation,
  performance: item.performance,
  throughput: item.throughput,
  storage: item.storage_efficiency,
}));

const chartConfig = {
  performance: {
    label: "Performance",
    color: "var(--chart-1)",
  },
  throughput: {
    label: "Throughput",
    color: "var(--chart-2)",
  },
  storage: {
    label: "Storage Efficiency",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

// Scatter plot for performance vs storage trade-off
export function PerformanceStorageScatterChart() {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background rounded-lg border p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[0.70rem] font-medium uppercase">
                {data.name}
              </span>
              <span className="text-muted-foreground font-bold">
                Performance: {data.y} μs
              </span>
              <span className="text-muted-foreground font-bold">
                Storage: {data.x} bytes
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance vs Storage Trade-off</CardTitle>
        <CardDescription>
          Lower left corner is optimal (fast and compact)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Storage"
                unit=" bytes"
                label={{
                  value: "Storage Size (bytes)",
                  position: "insideBottom",
                  offset: -10,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Performance"
                unit=" μs"
                label={{
                  value: "Generation Time (μs)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                name="Implementations"
                data={scatterData}
                fill="#8884d8"
                shape={(props: any) => {
                  const { cx, cy, payload } = props;
                  const colors: Record<string, string> = {
                    "Native uuidv7()": "#10b981",
                    "Custom uuidv7()": "#3b82f6",
                    UUIDv4: "#ef4444",
                    ULID: "#f59e0b",
                    TypeID: "#8b5cf6",
                  };
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={8}
                      fill={colors[payload.name] || "#8884d8"}
                      stroke={colors[payload.name] || "#8884d8"}
                      strokeWidth={2}
                      fillOpacity={0.8}
                    />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Radar chart for multi-metric comparison
export function MultiMetricRadarChart({
  selectedImplementations,
}: {
  selectedImplementations?: string[];
}) {
  const filteredData = selectedImplementations
    ? radarData.filter((d) =>
        selectedImplementations.includes(d.implementation),
      )
    : radarData;

  const metrics = [
    { name: "Performance\n(Speed)", key: "performance" },
    { name: "Throughput\n(Concurrent)", key: "throughput" },
    { name: "Storage\n(Efficiency)", key: "storage" },
  ];

  const chartData = metrics.map((metric) => {
    const point: any = { metric: metric.name };
    filteredData.forEach((impl) => {
      point[impl.implementation] = impl[metric.key as keyof typeof impl];
    });
    return point;
  });

  const colors: Record<string, string> = {
    "Native uuidv7()": "#10b981",
    "Custom uuidv7()": "#3b82f6",
    UUIDv4: "#ef4444",
    ULID: "#f59e0b",
    TypeID: "#8b5cf6",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-metric Comparison</CardTitle>
        <CardDescription>
          Normalized scores (0-100, higher is better)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid gridType="polygon" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              {filteredData.map((impl, index) => (
                <Radar
                  key={impl.implementation}
                  name={impl.implementation}
                  dataKey={impl.implementation}
                  stroke={colors[impl.implementation] || "#8884d8"}
                  fill={colors[impl.implementation] || "#8884d8"}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              ))}
              <Tooltip
                formatter={(value: any) => `${value}%`}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
