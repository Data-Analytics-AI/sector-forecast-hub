import { motion } from 'framer-motion';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { generateForecastData } from '@/data/demoData';

interface SampleDataTableProps {
  industryId: string;
  horizon: number;
}

const SampleDataTable = ({ industryId, horizon }: SampleDataTableProps) => {
  const data = generateForecastData(industryId, horizon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Sample Forecast Data</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Historical actuals and forecasted values with confidence intervals
        </p>
      </div>
      <div className="max-h-[400px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs text-muted-foreground font-medium">Period</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium text-right">Actual</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium text-right">Forecast</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium text-right">Lower CI</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium text-right">Upper CI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i} className="border-border/30 hover:bg-muted/30">
                <TableCell className="text-xs font-mono text-foreground">{row.period}</TableCell>
                <TableCell className="text-xs text-right font-mono">
                  {row.actual !== null ? (
                    <span className="text-primary">{row.actual.toLocaleString()}</span>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-right font-mono text-foreground">
                  {row.forecast.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-right font-mono text-muted-foreground">
                  {row.lower.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-right font-mono text-muted-foreground">
                  {row.upper.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default SampleDataTable;
