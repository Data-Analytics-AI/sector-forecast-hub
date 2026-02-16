import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { generateForecastData, type ForecastPoint } from '@/data/demoData';
import { motion } from 'framer-motion';

interface ForecastChartProps {
  industryId: string;
  horizon: number;
  customData?: ForecastPoint[];
}

export default function ForecastChart({ industryId, horizon, customData }: ForecastChartProps) {
  const data = useMemo(() => customData ?? generateForecastData(industryId, horizon), [industryId, horizon, customData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card p-3 text-xs space-y-1">
        <p className="font-semibold text-foreground">{label}</p>
        {payload[0]?.payload?.actual !== null && (
          <p className="text-foreground">Actual: <span className="font-mono font-medium">{payload[0].payload.actual?.toLocaleString()}</span></p>
        )}
        <p className="text-primary">Forecast: <span className="font-mono font-medium">{payload[0].payload.forecast?.toLocaleString()}</span></p>
        <p className="text-muted-foreground">
          Range: {payload[0].payload.lower?.toLocaleString()} – {payload[0].payload.upper?.toLocaleString()}
        </p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Demand Forecast</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Historical data + {horizon}-month projection with 95% confidence interval</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-foreground rounded" /> Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-primary rounded" /> Forecast
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-primary/20 rounded-sm" /> Confidence
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(174, 60%, 40%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(174, 60%, 40%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
          <XAxis
            dataKey="period"
            tick={{ fill: 'hsl(215, 12%, 50%)', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(220, 14%, 18%)' }}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: 'hsl(215, 12%, 50%)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x="Jan '26" stroke="hsl(215, 12%, 50%)" strokeDasharray="4 4" label={{ value: 'Today', fill: 'hsl(215, 12%, 50%)', fontSize: 10, position: 'top' }} />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#confidenceGrad)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="hsl(220, 20%, 7%)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="hsl(210, 20%, 82%)"
            strokeWidth={2}
            fill="none"
            dot={false}
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="hsl(174, 60%, 40%)"
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="none"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
