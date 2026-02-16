import { motion } from 'framer-motion';
import { industries, type Industry } from '@/data/demoData';

interface TemplateSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {industries.map((industry, i) => (
        <motion.button
          key={industry.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(industry.id)}
          className={`glass-card p-4 text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
            selected === industry.id
              ? 'border-primary/60 glow-primary'
              : 'hover:border-primary/30'
          }`}
        >
          <span className="text-2xl">{industry.icon}</span>
          <h3 className="mt-2 text-sm font-semibold text-foreground">{industry.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-tight">{industry.description}</p>
        </motion.button>
      ))}
    </div>
  );
}
