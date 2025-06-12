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

const chartData = [
  {
    implementation: "Native uuidv7() (PG18)",
    avgTime: 58.1,
    throughput: 34127,
    storage: 36,
  },
  {
    implementation: "Custom uuidv7()",
    avgTime: 87.3,
    throughput: 29456,
    storage: 36,
  },
  {
    implementation: "UUIDv4",
    avgTime: 86.8,
    throughput: 29238,
    storage: 36,
  },
  {
    implementation: "ULID",
    avgTime: 124.5,
    throughput: 24832,
    storage: 39,
  },
  {
    implementation: "TypeID",
    avgTime: 198.7,
    throughput: 18943,
    storage: 42,
  },
];

const chartConfig = {
  avgTime: {
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

export function ShadcnPerformanceChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>UUID Implementation Performance Comparison</CardTitle>
        <CardDescription>
          Performance metrics across different UUID implementations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
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
            <Bar dataKey="avgTime" fill="var(--color-avgTime)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}