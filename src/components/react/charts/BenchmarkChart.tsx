import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/react/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/react/ui/chart";

// Import benchmark data from the repository
import benchmarkData from "../../../data/benchmark_data/chart_data.json";

const chartConfig = {
  avg_time: {
    label: "Average Time (μs)",
    color: "hsl(var(--chart-1))",
  },
  throughput: {
    label: "Throughput (IDs/sec)",
    color: "hsl(var(--chart-2))",
  },
  storage: {
    label: "Storage (bytes)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

interface BenchmarkChartProps {
  type?: "performance" | "throughput" | "radar";
  title?: string;
  description?: string;
}

export function BenchmarkChart({ 
  type = "performance", 
  title = "UUID Implementation Performance",
  description = "Comparison of different UUID implementations"
}: BenchmarkChartProps) {
  const data = type === "throughput" ? benchmarkData.area_chart : benchmarkData.bar_chart;
  
  if (type === "performance") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="implementation"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="avg_time" fill="var(--color-avg_time)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  // Throughput chart would use Area chart
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="implementation"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="throughput" fill="var(--color-throughput)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}