import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { generateRecommendations } from '@/data/demoData';
import { useMemo } from 'react';

interface RecommendationsProps {
  industryId: string;
}

const priorityStyles = {
  high: 'border-l-destructive bg-destructive/5',
  medium: 'border-l-primary bg-primary/5',
  low: 'border-l-muted-foreground bg-muted/30',
};

const priorityBadge = {
  high: 'bg-destructive/20 text-destructive',
  medium: 'bg-primary/20 text-primary',
  low: 'bg-muted text-muted-foreground',
};

export default function Recommendations({ industryId }: RecommendationsProps) {
  const recs = useMemo(() => generateRecommendations(industryId), [industryId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Optimization Recommendations</h2>
      </div>
      <div className="space-y-3">
        {recs.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className={`border-l-2 rounded-r-lg p-4 ${priorityStyles[rec.priority]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${priorityBadge[rec.priority]}`}>
                    {rec.priority}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground truncate">{rec.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-primary shrink-0">
                {rec.impact}
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
