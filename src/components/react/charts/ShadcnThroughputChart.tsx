import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
    implementation: "Native uuidv7()",
    throughput: 34127,
    concurrentThroughput: 28456,
  },
  {
    implementation: "Custom uuidv7()",
    throughput: 29456,
    concurrentThroughput: 24832,
  },
  {
    implementation: "UUIDv4",
    throughput: 29238,
    concurrentThroughput: 24654,
  },
  {
    implementation: "ULID",
    throughput: 24832,
    concurrentThroughput: 20943,
  },
  {
    implementation: "TypeID",
    throughput: 18943,
    concurrentThroughput: 15672,
  },
];

const chartConfig = {
  throughput: {
    label: "Single-threaded",
    color: "hsl(var(--chart-1))",
  },
  concurrentThroughput: {
    label: "Concurrent",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ShadcnThroughputChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Throughput Performance Comparison</CardTitle>
        <CardDescription>
          Single-threaded vs concurrent throughput (IDs/second)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
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
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="concurrentThroughput"
              type="natural"
              fill="var(--color-concurrentThroughput)"
              fillOpacity={0.4}
              stroke="var(--color-concurrentThroughput)"
              stackId="a"
            />
            <Area
              dataKey="throughput"
              type="natural"
              fill="var(--color-throughput)"
              fillOpacity={0.4}
              stroke="var(--color-throughput)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}