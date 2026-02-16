import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { generateKPIs } from '@/data/demoData';
import { useMemo } from 'react';

interface KPICardsProps {
  industryId: string;
}

export default function KPICards({ industryId }: KPICardsProps) {
  const kpis = useMemo(() => generateKPIs(industryId), [industryId]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + i * 0.05 }}
          className="glass-card p-4"
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</p>
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
  );
}
