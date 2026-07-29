interface DecisionData {
  priority: string;
  recommendation: string;
  why: string;
}

interface DecisionMatrixTableProps {
  data: DecisionData[];
}

export default function DecisionMatrixTable({
  data,
}: DecisionMatrixTableProps) {
  const getRowClass = (index: number) => {
    const colors = [
      "bg-chart-1/10 dark:bg-chart-1/20 border-chart-1/30",
      "bg-chart-2/10 dark:bg-chart-2/20 border-chart-2/30",
      "bg-chart-3/10 dark:bg-chart-3/20 border-chart-3/30",
      "bg-chart-4/10 dark:bg-chart-4/20 border-chart-4/30",
      "bg-chart-5/10 dark:bg-chart-5/20 border-chart-5/30",
      "bg-muted/20 dark:bg-muted/30 border-muted/40",
    ];
    return (
      colors[index % colors.length] || "hover:bg-muted/30 transition-colors"
    );
  };

  const getPriorityBadgeClass = (priority: string) => {
    if (priority.includes("Maximum Performance")) {
      return "bg-chart-1/15 text-chart-1 dark:bg-chart-1/25 dark:text-chart-1 border border-chart-1/30";
    }
    if (priority.includes("Compatibility")) {
      return "bg-chart-2/15 text-chart-2 dark:bg-chart-2/25 dark:text-chart-2 border border-chart-2/30";
    }
    if (priority.includes("Readability")) {
      return "bg-chart-3/15 text-chart-3 dark:bg-chart-3/25 dark:text-chart-3 border border-chart-3/30";
    }
    if (priority.includes("Type Safety")) {
      return "bg-chart-4/15 text-chart-4 dark:bg-chart-4/25 dark:text-chart-4 border border-chart-4/30";
    }
    if (priority.includes("Storage")) {
      return "bg-chart-5/15 text-chart-5 dark:bg-chart-5/25 dark:text-chart-5 border border-chart-5/30";
    }
    return "bg-muted/50 text-muted-foreground border border-border";
  };

  return (
    <div className="my-6 overflow-x-auto">
      <div className="border-border bg-card rounded-md border shadow-sm">
        <table className="m-0 min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-border bg-muted/50 border-b">
              <th className="text-foreground border-border min-w-48 border-r px-4 py-3 text-left font-semibold">
                Priority
              </th>
              <th className="text-foreground border-border min-w-48 border-r px-4 py-3 text-left font-semibold">
                Recommendation
              </th>
              <th className="text-foreground px-4 py-3 text-left font-semibold">
                Why
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={`border-border border-b last:border-b-0 ${getRowClass(index)}`}
              >
                <td className="border-border border-r px-4 py-3">
                  <span
                    className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap ${getPriorityBadgeClass(row.priority)}`}
                  >
                    {row.priority}
                  </span>
                </td>
                <td className="text-foreground border-border border-r px-4 py-3 font-semibold">
                  {row.recommendation}
                </td>
                <td className="text-foreground px-4 py-3">{row.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
