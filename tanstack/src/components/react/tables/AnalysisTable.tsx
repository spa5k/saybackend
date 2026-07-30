interface AnalysisTableProps {
  title: string;
  data: {
    pros: string[];
    cons: string[];
  };
}

export default function AnalysisTable({ title, data }: AnalysisTableProps) {
  return (
    <div className="my-6 overflow-x-auto">
      <div className="border-border bg-card rounded-md border shadow-sm">
        <div className="border-border bg-muted/50 border-b px-4 py-3">
          <h4 className="text-foreground text-sm font-semibold">{title}</h4>
        </div>
        <table className="m-0 min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-border bg-muted/30 border-b">
              <th className="text-foreground w-20 px-4 py-3 text-left font-semibold">
                Aspect
              </th>
              <th className="text-foreground px-4 py-3 text-left font-semibold">
                Assessment
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-border bg-chart-1/5 dark:bg-chart-1/10 border-b">
              <td className="text-foreground px-4 py-3 font-semibold">Pros</td>
              <td className="text-foreground px-4 py-3">
                <ul className="space-y-1">
                  {data.pros.map((pro, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-chart-1 mr-2 font-bold">•</span>
                      <span dangerouslySetInnerHTML={{ __html: pro }} />
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
            <tr className="bg-chart-2/5 dark:bg-chart-2/10">
              <td className="text-foreground px-4 py-3 font-semibold">Cons</td>
              <td className="text-foreground px-4 py-3">
                <ul className="space-y-1">
                  {data.cons.map((con, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-chart-2 mr-2 font-bold">•</span>
                      <span dangerouslySetInnerHTML={{ __html: con }} />
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
