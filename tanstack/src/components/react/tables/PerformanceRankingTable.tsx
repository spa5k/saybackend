interface RankingData {
  rank: number;
  implementation: string;
  avgTime: number;
  throughput: number;
  performanceVsUuid4: string;
}

interface PerformanceRankingTableProps {
  data: RankingData[];
}

export default function PerformanceRankingTable({
  data,
}: PerformanceRankingTableProps) {
  const getRowClass = (rank: number) => {
    if (rank === 1) {
      return "bg-chart-1/10 dark:bg-chart-1/20 border-chart-1/30 font-semibold";
    }
    if (rank === 2) {
      return "bg-chart-2/10 dark:bg-chart-2/20 border-chart-2/30";
    }
    if (rank === 3) {
      return "bg-chart-3/10 dark:bg-chart-3/20 border-chart-3/30";
    }
    return "hover:bg-muted/30 transition-colors";
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) {
      return "bg-chart-1/15 text-chart-1 border border-chart-1/30";
    }
    if (rank === 2) {
      return "bg-chart-2/15 text-chart-2 border border-chart-2/30";
    }
    if (rank === 3) {
      return "bg-chart-3/15 text-chart-3 border border-chart-3/30";
    }
    return "bg-muted/50 text-muted-foreground border border-border";
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="my-6 overflow-x-auto">
      <div className="border-border bg-card rounded-md border shadow-sm">
        <table className="m-0 min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-border bg-muted/50 border-b">
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                Rank
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-left font-semibold">
                Implementation
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                Avg Time (μs)
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                Throughput (ops/sec)
              </th>
              <th className="text-foreground px-4 py-3 text-center font-semibold">
                Performance vs UUIDv4
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={`border-border border-b last:border-b-0 ${getRowClass(row.rank)}`}
              >
                <td className="border-border border-r px-4 py-3 text-center">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap ${getRankBadgeClass(row.rank)}`}
                  >
                    {row.rank}
                  </span>
                </td>
                <td className="border-border border-r px-4 py-3">
                  <span
                    className={`text-foreground ${row.rank === 1 ? "font-bold" : ""}`}
                  >
                    {row.implementation}
                  </span>
                </td>
                <td className="text-foreground border-border border-r px-4 py-3 text-center font-mono">
                  {row.rank === 1 ? (
                    <strong>{row.avgTime}</strong>
                  ) : (
                    row.avgTime
                  )}
                </td>
                <td className="text-foreground border-border border-r px-4 py-3 text-center font-mono">
                  {row.rank === 1 ? (
                    <strong>{formatNumber(row.throughput)}</strong>
                  ) : (
                    formatNumber(row.throughput)
                  )}
                </td>
                <td className="text-foreground px-4 py-3 text-center">
                  <span
                    className={row.rank === 1 ? "text-chart-1 font-bold" : ""}
                  >
                    {row.performanceVsUuid4}
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
