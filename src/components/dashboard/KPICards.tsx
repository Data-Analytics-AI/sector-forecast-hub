import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { generateKPIs, generateCustomKPIs, type ForecastPoint } from '@/data/demoData';
import { useMemo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface KPICardsProps {
  industryId: string;
  customData?: ForecastPoint[];
}

export default function KPICards({ industryId, customData }: KPICardsProps) {
  const kpis = useMemo(() => customData ? generateCustomKPIs(industryId, customData) : generateKPIs(industryId), [industryId, customData]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-start justify-between gap-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider leading-tight">
                {kpi.label}
              </p>
              {kpi.description && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="shrink-0 mt-0.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                      <Info className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="max-w-[220px] text-xs leading-relaxed text-center z-[9999]"
                  >
                    {kpi.description}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold font-mono text-foreground">{kpi.value}</span>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${
                kpi.trend === 'up' ? 'kpi-up' : kpi.trend === 'down' ? 'kpi-down' : 'text-muted-foreground'
              }`}>
                {kpi.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> :
                 kpi.trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> :
                 <Minus className="w-3.5 h-3.5" />}
                {Math.abs(kpi.change)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </TooltipProvider>
  );
}
