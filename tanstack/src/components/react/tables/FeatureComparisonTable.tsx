interface FeatureData {
  feature: string;
  uuidv4: boolean;
  uuidv7_plpgsql: boolean;
  uuidv7_sql: boolean;
  uuidv7_subms: boolean;
  ulid: boolean;
  typeid: boolean;
}

interface FeatureComparisonTableProps {
  data: FeatureData[];
}

export default function FeatureComparisonTable({
  data,
}: FeatureComparisonTableProps) {
  const CheckIcon = () => (
    <span className="text-chart-1 text-lg font-bold">✅</span>
  );

  const CrossIcon = () => (
    <span className="text-chart-2 text-lg font-bold">❌</span>
  );

  const getBooleanIcon = (value: boolean) => {
    return value ? <CheckIcon /> : <CrossIcon />;
  };

  return (
    <div className="my-6 overflow-x-auto">
      <div className="border-border bg-card rounded-md border shadow-sm">
        <table className="m-0 min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-border bg-muted/50 border-b">
              <th className="text-foreground border-border min-w-40 border-r px-4 py-3 text-left font-semibold">
                Feature
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                UUIDv4
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                UUIDv7 (PL/pgSQL)
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                UUIDv7 (SQL)
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                UUIDv7 (Sub-ms)
              </th>
              <th className="text-foreground border-border border-r px-4 py-3 text-center font-semibold">
                ULID
              </th>
              <th className="text-foreground px-4 py-3 text-center font-semibold">
                TypeID
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-border hover:bg-muted/30 border-b transition-colors last:border-b-0"
              >
                <td className="text-foreground border-border border-r px-4 py-3 font-semibold">
                  {row.feature}
                </td>
                <td className="border-border border-r px-4 py-3 text-center">
                  {getBooleanIcon(row.uuidv4)}
                </td>
                <td className="border-border border-r px-4 py-3 text-center">
                  {getBooleanIcon(row.uuidv7_plpgsql)}
                </td>
                <td className="border-border border-r px-4 py-3 text-center">
                  {getBooleanIcon(row.uuidv7_sql)}
                </td>
                <td className="border-border border-r px-4 py-3 text-center">
                  {getBooleanIcon(row.uuidv7_subms)}
                </td>
                <td className="border-border border-r px-4 py-3 text-center">
                  {getBooleanIcon(row.ulid)}
                </td>
                <td className="px-4 py-3 text-center">
                  {getBooleanIcon(row.typeid)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
