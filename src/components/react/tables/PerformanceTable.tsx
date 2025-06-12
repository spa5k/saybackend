import { useMemo } from "react";

interface PerformanceData {
  implementation: string;
  avg_time_us: number;
  median_time_us: number;
  p95_time_us: number;
  p99_time_us: number;
  throughput_per_second: number;
  storage_bytes: number;
  pg_version: number;
}

interface PerformanceTableProps {
  data: PerformanceData[];
  showMetricsExplanation?: boolean;
}

export default function PerformanceTable({
  data,
  showMetricsExplanation = true,
}: PerformanceTableProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.avg_time_us - b.avg_time_us);
  }, [data]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getRowClass = (implementation: string) => {
    if (implementation.includes("Native uuidv7")) {
      return "bg-chart-1/10 dark:bg-chart-1/20 border-chart-1/30 font-semibold";
    }
    if (implementation.includes("UUIDv4")) {
      return "bg-chart-2/10 dark:bg-chart-2/20 border-chart-2/30";
    }
    return "hover:bg-muted/30 transition-colors";
  };

  const getBadgeClass = (version: number) => {
    if (version === 18) {
      return "bg-chart-1/15 text-chart-1 dark:bg-chart-1/25 dark:text-chart-1 border border-chart-1/30";
    }
    return "bg-chart-2/15 text-chart-2 dark:bg-chart-2/25 dark:text-chart-2 border border-chart-2/30";
  };

  return (
    <div className="my-6 overflow-x-auto">
      <div className="border-border bg-card rounded-md border shadow-sm">
        <table className="m-0 min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-border bg-muted/50 border-b">
              <th className="text-foreground border-border border-r px-4 py-3 text-left font-semibold">
                Implementation
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                PostgreSQL
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                Avg Time (μs)
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                P95 (μs)
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                P99 (μs)
              </th>
              <th className="text-foreground px-4 py-3 text-center font-semibold">
                Throughput (ops/sec)
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={index}
                className={`border-border border-b last:border-b-0 ${getRowClass(row.implementation)}`}
              >
                <td className="border-border border-r px-4 py-3">
                  <span
                    className={`text-foreground ${row.implementation.includes("Native uuidv7") ? "font-bold" : ""}`}
                  >
                    {row.implementation
                      .replace(" (PG18)", "")
                      .replace(" (PG17)", "")}
                  </span>
                </td>
                <td className="border-border border-r px-4 py-3 text-center">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${getBadgeClass(row.pg_version)}`}
                  >
                    {row.pg_version}
                  </span>
                </td>
                <td className="text-foreground border-border border-r px-4 py-3 text-center font-mono">
                  {row.implementation.includes("Native uuidv7") ? (
                    <strong>{row.avg_time_us}</strong>
                  ) : (
                    row.avg_time_us
                  )}
                </td>
                <td className="text-foreground border-border border-r px-4 py-3 text-center font-mono">
                  {row.implementation.includes("Native uuidv7") ? (
                    <strong>{row.p95_time_us}</strong>
                  ) : (
                    row.p95_time_us
                  )}
                </td>
                <td className="text-foreground border-border border-r px-4 py-3 text-center font-mono">
                  {row.implementation.includes("Native uuidv7") ? (
                    <strong>{row.p99_time_us}</strong>
                  ) : (
                    row.p99_time_us
                  )}
                </td>
                <td className="text-foreground px-4 py-3 text-center font-mono">
                  {row.implementation.includes("Native uuidv7") ? (
                    <strong>{formatNumber(row.throughput_per_second)}</strong>
                  ) : (
                    formatNumber(row.throughput_per_second)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showMetricsExplanation && (
        <div className="border-border bg-muted/30 mt-4 rounded-md border p-4">
          <h4 className="text-foreground mb-2 text-sm font-semibold">
            Performance Metrics Explained:
          </h4>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>
              <strong className="text-foreground">Avg Time:</strong> Mean
              execution time across 50,000 iterations
            </li>
            <li>
              <strong className="text-foreground">P95:</strong> 95th percentile
              latency (95% of operations complete within this time)
            </li>
            <li>
              <strong className="text-foreground">P99:</strong> 99th percentile
              latency (99% of operations complete within this time)
            </li>
            <li>
              <strong className="text-foreground">Throughput:</strong>{" "}
              Operations per second in single-threaded execution
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
