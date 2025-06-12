import { useMemo } from "react";

interface PerformanceData {
  implementation: string;
  avg_time_us: number;
  throughput_per_second: number;
  storage_bytes: number;
  pg_version: number;
}

interface ComprehensivePerformanceTableProps {
  data: PerformanceData[];
}

export default function ComprehensivePerformanceTable({
  data,
}: ComprehensivePerformanceTableProps) {
  const processedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      storageText: getStorageText(item.implementation, item.storage_bytes),
      storageBinary: getStorageBinary(item.implementation),
      format: getFormat(item.implementation),
    }));
  }, [data]);

  const sortedData = useMemo(() => {
    return [...processedData].sort((a, b) => a.avg_time_us - b.avg_time_us);
  }, [processedData]);

  function getStorageText(implementation: string, storageBytes: number) {
    if (implementation.includes("ULID")) return "26 bytes";
    if (implementation.includes("TypeID")) return "31 bytes";
    return "36 bytes";
  }

  function getStorageBinary(implementation: string) {
    if (implementation.includes("ULID") || implementation.includes("TypeID"))
      return "N/A";
    return "16 bytes";
  }

  function getFormat(implementation: string) {
    if (implementation.includes("ULID")) return "Human-readable";
    if (implementation.includes("TypeID")) return "Type-safe";
    return "Standard UUID";
  }

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
    if (implementation.includes("ULID")) {
      return "bg-chart-3/10 dark:bg-chart-3/20 border-chart-3/30";
    }
    if (implementation.includes("TypeID")) {
      return "bg-chart-4/10 dark:bg-chart-4/20 border-chart-4/30";
    }
    return "hover:bg-muted/30 transition-colors";
  };

  const getFormatBadgeClass = (format: string) => {
    switch (format) {
      case "Standard UUID":
        return "bg-chart-2/15 text-chart-2 dark:bg-chart-2/25 dark:text-chart-2 border border-chart-2/30";
      case "Human-readable":
        return "bg-chart-3/15 text-chart-3 dark:bg-chart-3/25 dark:text-chart-3 border border-chart-3/30";
      case "Type-safe":
        return "bg-chart-4/15 text-chart-4 dark:bg-chart-4/25 dark:text-chart-4 border border-chart-4/30";
      default:
        return "bg-muted/50 text-muted-foreground border border-border";
    }
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
                Avg Time (μs)
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                Storage (Text)
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                Storage (Binary)
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                Throughput (ops/sec)
              </th>
              <th className="text-foreground px-4 py-3 text-center font-semibold">
                Format
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
                <td className="text-foreground border-border border-r px-4 py-3 text-center font-mono">
                  {row.implementation.includes("Native uuidv7") ? (
                    <strong>{row.avg_time_us}</strong>
                  ) : (
                    row.avg_time_us
                  )}
                </td>
                <td className="text-foreground border-border border-r px-4 py-3 text-center">
                  {row.storageText}
                </td>
                <td className="text-muted-foreground border-border border-r px-4 py-3 text-center">
                  {row.storageBinary}
                </td>
                <td className="text-foreground border-border border-r px-4 py-3 text-center font-mono">
                  {row.implementation.includes("Native uuidv7") ? (
                    <strong>{formatNumber(row.throughput_per_second)}</strong>
                  ) : (
                    formatNumber(row.throughput_per_second)
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap ${getFormatBadgeClass(row.format)}`}
                  >
                    {row.format}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
