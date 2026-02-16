import { motion } from 'framer-motion';
import { Settings, RefreshCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SettingsPanelProps {
  horizon: number;
  sensitivity: string;
  onHorizonChange: (v: number) => void;
  onSensitivityChange: (v: string) => void;
  onRefresh: () => void;
}

export default function SettingsPanel({ horizon, sensitivity, onHorizonChange, onSensitivityChange, onRefresh }: SettingsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Settings className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Forecast Settings</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Forecast Horizon
          </label>
          <div className="flex items-center gap-4 mt-2">
            <Slider
              value={[horizon]}
              onValueChange={(v) => onHorizonChange(v[0])}
              min={3}
              max={24}
              step={3}
              className="flex-1"
            />
            <span className="text-sm font-mono font-medium text-foreground w-20 text-right">
              {horizon} months
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Model Sensitivity
          </label>
          <Select value={sensitivity} onValueChange={onSensitivityChange}>
            <SelectTrigger className="mt-2 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Data Source
          </label>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">Demo Model</span>
            <span className="text-muted-foreground">• Synthetic data for preview</span>
          </div>
        </div>

        <Button 
          onClick={onRefresh}
          variant="outline"
          className="w-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Regenerate Forecast
        </Button>
      </div>
    </motion.div>
  );
}
