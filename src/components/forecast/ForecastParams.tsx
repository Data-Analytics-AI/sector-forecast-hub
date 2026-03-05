import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, BarChart3, Hash } from 'lucide-react';

interface ForecastParamsProps {
  dateCol: string;
  valueCol: string;
  horizon: number;
  onDateColChange: (v: string) => void;
  onValueColChange: (v: string) => void;
  onHorizonChange: (v: number) => void;
}

export default function ForecastParams({
  dateCol, valueCol, horizon,
  onDateColChange, onValueColChange, onHorizonChange,
}: ForecastParamsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" /> Date Column
        </Label>
        <Input
          value={dateCol}
          onChange={(e) => onDateColChange(e.target.value)}
          placeholder="e.g. date, ds, timestamp"
          className="bg-background/50 font-mono text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" /> Value Column
        </Label>
        <Input
          value={valueCol}
          onChange={(e) => onValueColChange(e.target.value)}
          placeholder="e.g. sales, value, y"
          className="bg-background/50 font-mono text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Forecast Horizon
        </Label>
        <Input
          type="number"
          min={1}
          max={365}
          value={horizon}
          onChange={(e) => onHorizonChange(parseInt(e.target.value) || 1)}
          placeholder="30"
          className="bg-background/50 font-mono text-sm"
        />
      </div>
    </div>
  );
}
