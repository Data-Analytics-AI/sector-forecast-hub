import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { industries, type Industry } from '@/data/demoData';

interface TemplateSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  const hasSelection = !!selected;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <AnimatePresence mode="popLayout">
          {industries.map((industry, i) => {
            const isSelected = selected === industry.id;
            if (hasSelection && !isSelected) return null;

            return (
              <motion.button
                key={industry.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ delay: hasSelection ? 0 : i * 0.05, duration: 0.3 }}
                onClick={() => onSelect(industry.id)}
                className={`glass-card p-4 text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                  isSelected
                    ? 'border-primary/60 glow-primary'
                    : 'hover:border-primary/30'
                }`}
              >
                <span className="text-2xl">{industry.icon}</span>
                <h3 className="mt-2 text-sm font-semibold text-foreground">{industry.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-tight">{industry.description}</p>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {hasSelection && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => onSelect('')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mx-auto"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Show all sectors
        </motion.button>
      )}
    </div>
  );
}
