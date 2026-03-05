import { motion } from 'framer-motion';
import { Table2, LineChart as LineChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Area, ComposedChart
} from 'recharts';

export interface ForecastRow {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

interface ForecastResultsProps {
  data: ForecastRow[];
}

export default function ForecastResults({ data }: ForecastResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Chart */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-primary" />
            Forecast Visualization
            <Badge variant="secondary" className="ml-auto text-xs font-mono">
              {data.length} periods
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(174, 60%, 40%)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(174, 60%, 40%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis
                  dataKey="ds"
                  tick={{ fontSize: 11, fill: 'hsl(215, 12%, 50%)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(220, 14%, 18%)' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(215, 12%, 50%)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(220, 14%, 18%)' }}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(220, 18%, 12%)',
                    border: '1px solid hsl(220, 14%, 18%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'hsl(210, 20%, 92%)',
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="yhat_upper"
                  stroke="none"
                  fill="url(#confidenceGrad)"
                  name="Upper Bound"
                />
                <Area
                  type="monotone"
                  dataKey="yhat_lower"
                  stroke="none"
                  fill="hsl(220, 20%, 7%)"
                  name="Lower Bound"
                />
                <Line
                  type="monotone"
                  dataKey="yhat"
                  stroke="hsl(174, 60%, 40%)"
                  strokeWidth={2.5}
                  dot={false}
                  name="Forecast"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Table2 className="h-4 w-4 text-primary" />
            Forecast Data
            <Badge variant="secondary" className="ml-auto text-xs font-mono">
              {data.length} rows
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-mono text-xs">Date (ds)</TableHead>
                  <TableHead className="font-mono text-xs">Forecast (yhat)</TableHead>
                  <TableHead className="font-mono text-xs">Lower Bound</TableHead>
                  <TableHead className="font-mono text-xs">Upper Bound</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} className="hover:bg-muted/20">
                    <TableCell className="font-mono text-xs py-2">{row.ds}</TableCell>
                    <TableCell className="font-mono text-xs py-2">{row.yhat.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-xs py-2">{row.yhat_lower.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-xs py-2">{row.yhat_upper.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
