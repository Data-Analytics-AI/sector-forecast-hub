import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { generateKPIs, generateCustomKPIs, type ForecastPoint } from '@/data/demoData';
import { useMemo } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface KPICardsProps {
  industryId: string;
  customData?: ForecastPoint[];
}

export default function KPICards({ industryId, customData }: KPICardsProps) {
  const kpis = useMemo(() => customData ? generateCustomKPIs(industryId, customData) : generateKPIs(industryId), [industryId, customData]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi, i) => {
        const card = (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card p-4 cursor-default"
          >
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider leading-tight">
              {kpi.label}
            </p>
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
        );

        if (kpi.description) {
          return (
            <HoverCard key={kpi.label} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                {card}
              </HoverCardTrigger>
              <HoverCardContent
                side="bottom"
                align="center"
                className="w-64 text-sm leading-relaxed z-[9999]"
              >
                <p className="font-semibold text-foreground mb-1">{kpi.label}</p>
                <p className="text-muted-foreground text-xs">{kpi.description}</p>
              </HoverCardContent>
            </HoverCard>
          );
        }

        return card;
      })}
    </div>
  );
}
