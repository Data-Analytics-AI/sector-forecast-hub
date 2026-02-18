import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ArrowUpDown, MessageCircle } from 'lucide-react';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateForecastData } from '@/data/demoData';
import { Button } from '@/components/ui/button';

interface SampleDataTableProps {
  industryId: string;
  horizon: number;
}

const VISIBLE_ROWS = 5;

function getTooltip(row: { period: string; actual: number | null; forecast: number; upper: number; lower: number }): string {
  if (row.actual !== null) {
    return `${row.period}: Actual recorded value was ${row.actual.toLocaleString()} units. This is real historical data used to train the forecast model.`;
  }
  return `${row.period}: Forecast is ${row.forecast.toLocaleString()} units, with a 95% confidence interval between ${row.lower.toLocaleString()} and ${row.upper.toLocaleString()}. This means we're 95% sure the real value will fall in that range.`;
}

const SampleDataTable = ({ industryId, horizon }: SampleDataTableProps) => {
  const [expanded, setExpanded] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [showCopilot, setShowCopilot] = useState<number | null>(null);

  const allData = useMemo(() => generateForecastData(industryId, horizon), [industryId, horizon]);

  // Take a balanced sample: 3 historical + 2 forecast for compact view, or slice more for expanded
  const sampleData = useMemo(() => {
    const historical = allData.filter(d => d.actual !== null);
    const forecasted = allData.filter(d => d.actual === null);
    const sample = [
      ...historical.slice(-3),
      ...forecasted.slice(0, expanded ? forecasted.length : 2),
    ];
    return sortAsc ? sample : [...sample].reverse();
  }, [allData, expanded, sortAsc]);

  const toggleSort = () => setSortAsc(s => !s);

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">📊 Data Format & Forecast Preview</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            This shows how your data should look. <span className="text-primary font-medium">Blue rows</span> = your historical data · <span className="text-accent-foreground font-medium">Default rows</span> = AI forecast. Hover any row for a plain-English explanation.
          </p>
        </div>

        <div className="overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground font-medium">
                  <button onClick={toggleSort} className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                    Period
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium text-right">Type</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium text-right">Value</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium text-right">Forecast</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium text-right">Range (95% CI)</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium text-center w-10">💡</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {sampleData.map((row, i) => {
                  const isHistorical = row.actual !== null;
                  return (
                    <motion.tr
                      key={row.period}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`border-border/30 transition-colors ${
                        isHistorical
                          ? 'bg-primary/5 hover:bg-primary/10'
                          : 'hover:bg-muted/30'
                      }`}
                    >
                      <TableCell className="text-xs font-mono text-foreground font-medium">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help border-b border-dotted border-muted-foreground/30">
                              {row.period}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[260px] text-xs">
                            {getTooltip(row)}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isHistorical
                            ? 'bg-primary/15 text-primary'
                            : 'bg-accent/50 text-accent-foreground'
                        }`}>
                          {isHistorical ? 'Actual' : 'Forecast'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {isHistorical ? (
                          <span className="text-primary font-semibold">{row.actual!.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono text-foreground">
                        {row.forecast.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono text-muted-foreground">
                        {row.lower.toLocaleString()} – {row.upper.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setShowCopilot(showCopilot === i ? null : i)}
                              className="p-1 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">Click for AI explanation</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Copilot explanation panel */}
        <AnimatePresence>
          {showCopilot !== null && sampleData[showCopilot] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/50"
            >
              <div className="px-5 py-3 bg-primary/5 flex items-start gap-3">
                <span className="text-lg mt-0.5">🤖</span>
                <div className="text-xs text-foreground leading-relaxed">
                  <span className="font-semibold text-primary">Copilot: </span>
                  {(() => {
                    const row = sampleData[showCopilot];
                    if (row.actual !== null) {
                      return `In ${row.period}, the actual recorded value was ${row.actual.toLocaleString()} units. The model's forecast for that period was ${row.forecast.toLocaleString()} units — ${
                        Math.abs(row.actual - row.forecast) < row.actual * 0.05
                          ? 'very close to the real value, showing good model accuracy.'
                          : `a difference of ${Math.abs(row.actual - row.forecast).toLocaleString()} units. This helps the model learn and improve future predictions.`
                      }`;
                    }
                    return `In ${row.period}, the forecast is stable at ${row.forecast.toLocaleString()} units, with a 95% confidence interval between ${row.lower.toLocaleString()} and ${row.upper.toLocaleString()}. This means we're 95% confident the actual value will fall within this range. ${
                      row.upper - row.lower > row.forecast * 0.2
                        ? 'The wider range suggests more uncertainty — consider additional data sources to narrow it.'
                        : 'The narrow range indicates a high-confidence prediction.'
                    }`;
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand/Collapse toggle */}
        <div className="border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setExpanded(e => !e); setShowCopilot(null); }}
            className="w-full text-xs text-muted-foreground hover:text-primary gap-1.5 rounded-none h-9"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Show all forecast periods
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default SampleDataTable;
