import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Globe, FileSpreadsheet, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ForecastPoint } from '@/data/demoData';
import { AlertTriangle } from 'lucide-react';

export interface DataConnectorResult {
  source: 'csv' | 'api';
  label: string;
  data: ForecastPoint[];
}

interface DataConnectorProps {
  onDataLoaded: (result: DataConnectorResult) => void;
  onDismiss: () => void;
  selectedIndustry?: string | null;
}

const industryValueColumns: Record<string, string> = {
  banking: 'Cash Demand',
  retail: 'Sales Units',
  manufacturing: 'Production Output',
  healthcare: 'Patient Admissions',
  logistics: 'Shipment Volume',
  energy: 'Load Demand',
};

function parseCSV(text: string, valueColumn: string): ForecastPoint[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const periodIdx = header.findIndex(h => ['period', 'date', 'month', 'time'].includes(h));
  // Match the industry-specific value column (e.g. "cash demand", "sales units")
  const valueColLower = valueColumn.toLowerCase();
  const valueIdx = header.findIndex(h => h === valueColLower);
  // Fallback: also accept generic "value" header
  const fallbackIdx = valueIdx === -1 ? header.findIndex(h => h === 'value') : -1;
  const dataIdx = valueIdx !== -1 ? valueIdx : fallbackIdx;

  if (periodIdx === -1 || dataIdx === -1) return [];

  return lines.slice(1).filter(l => l.trim()).map(line => {
    const cols = line.split(',').map(c => c.trim());
    const value = parseFloat(cols[dataIdx]);
    const base = !isNaN(value) ? value : 0;
    return {
      period: cols[periodIdx] || '',
      actual: !isNaN(value) ? value : null,
      forecast: base,
      upper: Math.round(base * 1.1),
      lower: Math.round(base * 0.9),
    };
  });
}

export default function DataConnector({ onDataLoaded, onDismiss, selectedIndustry }: DataConnectorProps) {
  const valueColumn = selectedIndustry ? industryValueColumns[selectedIndustry] || 'Value' : null;
  const [tab, setTab] = useState('csv');
  const [dragOver, setDragOver] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState('');
  const [csvPreview, setCsvPreview] = useState<ForecastPoint[]>([]);

  const [apiUrl, setApiUrl] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setCsvError('');
    setCsvPreview([]);
    if (!file.name.endsWith('.csv')) {
      setCsvError('Please upload a .csv file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCsvError('File too large (max 5 MB)');
      return;
    }
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text, valueColumn!);
      if (data.length === 0) {
        setCsvError(`Could not parse CSV. Ensure headers are "Period" and "${valueColumn}".`);
        return;
      }
      setCsvPreview(data);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleCsvConfirm = () => {
    if (csvPreview.length > 0 && csvFile) {
      onDataLoaded({ source: 'csv', label: csvFile.name, data: csvPreview });
    }
  };

  const handleApiConnect = async () => {
    if (!apiUrl.trim()) {
      setApiError('Please enter an API URL');
      return;
    }
    setApiLoading(true);
    setApiError('');
    try {
      const res = await fetch(apiUrl.trim());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data: ForecastPoint[] = Array.isArray(json) ? json : json.data;
      if (!Array.isArray(data) || data.length === 0) throw new Error('Response must be a JSON array of forecast points');
      onDataLoaded({ source: 'api', label: new URL(apiUrl).hostname, data });
    } catch (err: any) {
      setApiError(err.message || 'Failed to connect');
    } finally {
      setApiLoading(false);
    }
  };

  if (!valueColumn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Connect Your Data</h2>
          </div>
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/50 border border-accent">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Select a sector first</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Please choose an industry sector below so we know the correct data format for your upload.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Connect Your Data</h2>
        </div>
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4 p-3 rounded-md bg-secondary/60 border border-border">
        <p className="text-xs text-muted-foreground">
          Required columns: <span className="font-semibold text-foreground">Period</span> and <span className="font-semibold text-foreground">{valueColumn}</span>
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full bg-secondary/50 mb-4">
          <TabsTrigger value="csv" className="flex-1 gap-1.5 text-xs">
            <Upload className="w-3.5 h-3.5" /> Upload CSV
          </TabsTrigger>
          <TabsTrigger value="api" className="flex-1 gap-1.5 text-xs">
            <Globe className="w-3.5 h-3.5" /> Live API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-foreground font-medium">
              {csvFile ? csvFile.name : 'Drop CSV here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Headers: <span className="font-medium">Period</span>, <span className="font-medium">{valueColumn}</span>
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            />
          </div>

          {csvError && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {csvError}
            </div>
          )}

          {csvPreview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-primary">
                <Check className="w-3.5 h-3.5" />
                <span>{csvPreview.length} data points parsed successfully</span>
              </div>
              <div className="max-h-32 overflow-auto rounded border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="px-2 py-1 text-left text-muted-foreground font-medium">Period</th>
                      <th className="px-2 py-1 text-right text-muted-foreground font-medium">{valueColumn}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(0, 5).map((p, i) => (
                      <tr key={i} className="border-t border-border/50">
                        <td className="px-2 py-1 text-foreground">{p.period}</td>
                        <td className="px-2 py-1 text-right font-mono text-foreground">{p.actual ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button onClick={handleCsvConfirm} className="w-full">
                <Check className="w-3.5 h-3.5 mr-2" /> Use This Data
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              API Endpoint
            </label>
            <Input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.example.com/forecast"
              className="mt-2 bg-secondary border-border font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Must return JSON array with <span className="font-medium">Period</span> and <span className="font-medium">{valueColumn}</span> fields
            </p>
          </div>

          {apiError && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {apiError}
            </div>
          )}

          <Button
            onClick={handleApiConnect}
            disabled={apiLoading}
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/10"
          >
            {apiLoading ? (
              <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Connecting…</>
            ) : (
              <><Globe className="w-3.5 h-3.5 mr-2" /> Connect</>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
