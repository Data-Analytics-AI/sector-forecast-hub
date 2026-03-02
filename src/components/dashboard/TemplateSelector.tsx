import { motion } from 'framer-motion';
import { industries } from '@/data/demoData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TemplateSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  const current = industries.find(i => i.id === selected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 max-w-md"
    >
      <div className="flex items-start gap-4">
        {current && (
          <span className="text-3xl mt-1">{current.icon}</span>
        )}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Forecast Template</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select the sector that best fits your use case
            </p>
          </div>
          <Select value={selected || undefined} onValueChange={onSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a sector…" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry.id} value={industry.id}>
                  <span className="flex items-center gap-2">
                    <span>{industry.icon}</span>
                    <span>{industry.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {current && (
            <p className="text-xs text-muted-foreground leading-relaxed">{current.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
