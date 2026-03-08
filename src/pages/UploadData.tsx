import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileUp, CheckCircle2, AlertCircle, ArrowLeft,
  FileSpreadsheet, X, Eye, Table2, Loader2, Send, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ForecastParams from '@/components/forecast/ForecastParams';
import ForecastResults, { ForecastRow } from '@/components/forecast/ForecastResults';
import { supabase } from '@/integrations/supabase/client';

type UploadStatus = 'idle' | 'validating' | 'uploading' | 'success' | 'error';

interface ParsedData {
  headers: string[];
  rows: string[][];
  fileName: string;
  fileSize: number;
  rowCount: number;
}

const ACCEPTED_FORMATS = ['.csv', '.xlsx', '.xls'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line =>
    line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
  );
  return { headers, rows };
}

function getSourceType(fileName: string): 'csv' | 'excel' {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext === 'csv' ? 'csv' : 'excel';
}

export default function UploadData() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Forecast params
  const [dateCol, setDateCol] = useState('');
  const [valueCol, setValueCol] = useState('');
  const [horizon, setHorizon] = useState(30);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');
  const [forecastData, setForecastData] = useState<ForecastRow[] | null>(null);

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_FORMATS.includes(ext)) {
      return `Invalid format "${ext}". Accepted: CSV, XLSX, XLS`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${formatFileSize(file.size)}). Maximum: ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    return null;
  };

  const processFile = useCallback((file: File) => {
    setError('');
    setStatus('validating');
    setProgress(0);
    setParsedData(null);
    setShowPreview(false);
    setSelectedFile(file);
    setForecastData(null);
    setForecastError('');

    const validationError = validateFile(file);
    if (validationError) {
      setTimeout(() => {
        setStatus('error');
        setError(validationError);
      }, 600);
      return;
    }

    setTimeout(() => {
      setStatus('uploading');
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 18 + 5;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);

          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            const { headers, rows } = parseCSV(text);
            setParsedData({
              headers,
              rows,
              fileName: file.name,
              fileSize: file.size,
              rowCount: rows.length,
            });
            setStatus('success');
          };
          reader.onerror = () => {
            setStatus('error');
            setError('Failed to read file contents.');
          };
          reader.readAsText(file);
        }
        setProgress(Math.min(currentProgress, 100));
      }, 120);
    }, 800);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const resetUpload = () => {
    setStatus('idle');
    setProgress(0);
    setError('');
    setParsedData(null);
    setShowPreview(false);
    setSelectedFile(null);
    setForecastData(null);
    setForecastError('');
  };

  const handleLoadData = async () => {
    if (!selectedFile || !dateCol || !valueCol) return;
    setForecastLoading(true);
    setForecastError('');
    setForecastData(null);

    try {
      // Step 1: Upload the file via edge function
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await supabase.functions.invoke('upload', {
        body: formData,
      });

      if (uploadRes.error) {
        setForecastError(uploadRes.error.message || 'File upload failed.');
        return;
      }

      const serverPath = uploadRes.data?.source_path;
      if (!serverPath) {
        setForecastError('Upload succeeded but no source_path returned.');
        return;
      }

      // Step 2: Call the forecast edge function with the server-side path
      const sourceType = getSourceType(selectedFile.name);
      const forecastRes = await supabase.functions.invoke('forecast', {
        body: {
          source_type: sourceType,
          source_path: serverPath,
          date_col: dateCol,
          value_col: valueCol,
          horizon,
        },
      });

      if (forecastRes.error) {
        setForecastError(forecastRes.error.message || 'Forecast request failed.');
      } else if (forecastRes.data?.error) {
        setForecastError(forecastRes.data.error);
      } else if (forecastRes.data?.forecast) {
        setForecastData(forecastRes.data.forecast);
      } else if (Array.isArray(forecastRes.data)) {
        setForecastData(forecastRes.data);
      } else {
        setForecastError('Unexpected response format from server.');
      }
    } catch (err: any) {
      setForecastError(err.message || 'Failed to connect to forecast server.');
    } finally {
      setForecastLoading(false);
    }
  };

  const canLoadData = status === 'success' && dateCol && valueCol && horizon > 0;
  const previewRows = parsedData?.rows.slice(0, 8) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-6 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground font-sans">Upload Data</h1>
            <p className="text-xs text-muted-foreground">Import CSV or Excel files for forecasting</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Upload Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="shadow-lg border-border/50 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Import Dataset
              </CardTitle>
              <CardDescription>
                Drag and drop your file below, or click to browse. We accept CSV, XLSX, and XLS up to 10 MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <AnimatePresence mode="wait">
                {status === 'idle' || status === 'error' ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`
                      relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
                      flex flex-col items-center justify-center py-16 px-6 text-center
                      ${dragActive
                        ? 'border-primary bg-primary/5 shadow-[0_0_24px_hsl(var(--primary)/0.12)]'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }
                    `}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                    <motion.div
                      animate={dragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="mb-4 rounded-full bg-primary/10 p-4"
                    >
                      <Upload className="h-8 w-8 text-primary" />
                    </motion.div>
                    <p className="text-base font-medium text-foreground mb-1">
                      {dragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">or</p>
                    <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                      <FileUp className="h-4 w-4" /> Browse Files
                    </Button>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {['.CSV', '.XLSX', '.XLS'].map(fmt => (
                        <Badge key={fmt} variant="secondary" className="text-xs font-mono">{fmt}</Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">Max 10 MB</Badge>
                    </div>
                  </motion.div>
                ) : status === 'validating' ? (
                  <motion.div
                    key="validating"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-12 gap-3"
                  >
                    <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    <p className="text-sm font-medium text-foreground">Validating file…</p>
                  </motion.div>
                ) : status === 'uploading' ? (
                  <motion.div
                    key="uploading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 py-8 px-4"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">Processing file…</span>
                      <span className="font-mono text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                    <p className="text-xs text-muted-foreground text-center">
                      Parsing rows and validating data structure
                    </p>
                  </motion.div>
                ) : status === 'success' && parsedData ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex items-start gap-4 rounded-xl bg-primary/5 border border-primary/20 p-5">
                      <div className="rounded-full bg-primary/15 p-2.5 mt-0.5">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground mb-1">Upload Successful</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground block text-xs">File</span>
                            <span className="font-medium text-foreground truncate block">{parsedData.fileName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs">Size</span>
                            <span className="font-medium text-foreground">{formatFileSize(parsedData.fileSize)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs">Rows</span>
                            <span className="font-medium text-foreground">{parsedData.rowCount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs">Columns</span>
                            <span className="font-medium text-foreground">{parsedData.headers.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showPreview ? 'Hide Preview' : 'Preview Data'}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={resetUpload}>
                        <FileUp className="h-4 w-4" /> Upload Another
                      </Button>
                    </div>

                    <AnimatePresence>
                      {showPreview && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <Card className="border-border/40">
                            <CardHeader className="py-3 px-4">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Table2 className="h-4 w-4 text-primary" />
                                Dataset Preview
                                <Badge variant="secondary" className="ml-auto text-xs font-mono">
                                  Showing {previewRows.length} of {parsedData.rowCount} rows
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/40">
                                      {parsedData.headers.map((h, i) => (
                                        <TableHead key={i} className="font-mono text-xs whitespace-nowrap">
                                          {h}
                                        </TableHead>
                                      ))}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {previewRows.map((row, ri) => (
                                      <TableRow key={ri} className="hover:bg-muted/20">
                                        {row.map((cell, ci) => (
                                          <TableCell key={ci} className="font-mono text-xs py-2 whitespace-nowrap">
                                            {cell}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {status === 'error' && error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
                  >
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Validation Failed</p>
                      <p className="text-xs text-destructive/80 mt-0.5">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Forecast Parameters & Load Data */}
        {status === 'success' && parsedData && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="shadow-lg border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Forecast Configuration
                </CardTitle>
                <CardDescription>
                  Specify the date and value columns from your dataset, then run the forecast.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <ForecastParams
                  dateCol={dateCol}
                  valueCol={valueCol}
                  horizon={horizon}
                  onDateColChange={setDateCol}
                  onValueColChange={setValueCol}
                  onHorizonChange={setHorizon}
                />
                <Button
                  onClick={handleLoadData}
                  disabled={!canLoadData || forecastLoading}
                  className="w-full gap-2 font-semibold"
                  size="lg"
                >
                  {forecastLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Running Forecast…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Load Data & Forecast</>
                  )}
                </Button>

                {forecastError && (
                  <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Forecast Error</p>
                      <p className="text-xs text-destructive/80 mt-0.5">{forecastError}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Forecast Results */}
        {forecastData && (
          <>
            <ForecastResults data={forecastData} />
            <div className="flex justify-center mt-6">
              <Link to="/dashboard?mode=optimize">
                <Button size="lg" className="gap-2 font-semibold">
                  <Zap className="w-4 h-4" />
                  Optimize Supply Chain
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
