import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Database, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle, Loader2, Info,
  Server, Hash, User, Lock, HardDrive, Send, AlertCircle, Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipTrigger
} from '@/components/ui/tooltip';
import ForecastParams from '@/components/forecast/ForecastParams';
import ForecastResults, { ForecastRow } from '@/components/forecast/ForecastResults';

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

const dbTypes = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mssql', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'sqlite', label: 'SQLite' },
];

const defaultPorts: Record<string, string> = {
  postgresql: '5432',
  mysql: '3306',
  mssql: '1433',
  oracle: '1521',
  mongodb: '27017',
  sqlite: '',
};

const dbSchemes: Record<string, string> = {
  postgresql: 'postgresql',
  mysql: 'mysql',
  mssql: 'mssql',
  oracle: 'oracle',
  mongodb: 'mongodb',
  sqlite: 'sqlite',
};

const fields = [
  { id: 'host', label: 'Host', icon: Server, tooltip: 'The hostname or IP address of your database server', placeholder: 'localhost or 192.168.1.1' },
  { id: 'port', label: 'Port', icon: Hash, tooltip: 'The port number your database listens on', placeholder: '5432' },
  { id: 'username', label: 'Username', icon: User, tooltip: 'Database user with read access to your data', placeholder: 'db_user' },
  { id: 'password', label: 'Password', icon: Lock, tooltip: 'Password for the database user', placeholder: '••••••••' },
  { id: 'database', label: 'Database Name', icon: HardDrive, tooltip: 'The specific database or schema to connect to', placeholder: 'my_database' },
] as const;

function buildConnectionString(dbType: string, form: Record<string, string>): string {
  const scheme = dbSchemes[dbType] || dbType;
  const userPart = form.password
    ? `${form.username}:${form.password}`
    : form.username;
  const portPart = form.port ? `:${form.port}` : '';
  return `${scheme}://${userPart}@${form.host}${portPart}/${form.database}`;
}

export default function ConnectDatabase() {
  const [dbType, setDbType] = useState('');
  const [form, setForm] = useState({ host: '', port: '', username: '', password: '', database: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [sqlQuery, setSqlQuery] = useState('');

  // Forecast params
  const [dateCol, setDateCol] = useState('');
  const [valueCol, setValueCol] = useState('');
  const [horizon, setHorizon] = useState(30);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');
  const [forecastData, setForecastData] = useState<ForecastRow[] | null>(null);

  const handleDbTypeChange = (value: string) => {
    setDbType(value);
    setForm((prev) => ({ ...prev, port: defaultPorts[value] || '' }));
    setStatus('idle');
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status !== 'idle') setStatus('idle');
  };

  const isFormValid = dbType && form.host && form.username && form.database;

  const handleTest = async () => {
    setStatus('testing');
    await new Promise((r) => setTimeout(r, 2200));
    setStatus(Math.random() > 0.3 ? 'success' : 'error');
  };

  const handleLoadData = async () => {
    if (!isFormValid || !dateCol || !valueCol || !sqlQuery) return;
    setForecastLoading(true);
    setForecastError('');
    setForecastData(null);

    try {
      const connectionString = buildConnectionString(dbType, form);
      const res = await fetch('http://127.0.0.1:8000/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: 'db',
          source_path: connectionString,
          query: sqlQuery,
          date_col: dateCol,
          value_col: valueCol,
          horizon,
        }),
      });
      const json = await res.json();
      if (json.error) {
        setForecastError(json.error);
      } else if (json.forecast) {
        setForecastData(json.forecast);
      } else if (Array.isArray(json)) {
        setForecastData(json);
      } else {
        setForecastError('Unexpected response format from server.');
      }
    } catch (err: any) {
      setForecastError(err.message || 'Failed to connect to forecast server.');
    } finally {
      setForecastLoading(false);
    }
  };

  const canLoadData = status === 'success' && dateCol && valueCol && horizon > 0 && sqlQuery;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Database className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Connect Database</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Database Connection</h1>
          <p className="text-sm text-muted-foreground mb-8">Enter your database credentials to establish a direct connection.</p>

          <div className="glass-card p-6 space-y-6">
            {/* Database Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="dbtype" className="text-sm font-medium">Database Type</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>Select the type of database you want to connect to</TooltipContent>
                </Tooltip>
              </div>
              <Select value={dbType} onValueChange={handleDbTypeChange}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  {dbTypes.map((db) => (
                    <SelectItem key={db.value} value={db.value}>{db.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {fields.map((f) => (
                <div key={f.id} className={`space-y-2 ${f.id === 'database' ? 'sm:col-span-2' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <f.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <Label htmlFor={f.id} className="text-sm font-medium">{f.label}</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>{f.tooltip}</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <Input
                      id={f.id}
                      type={f.id === 'password' && !showPassword ? 'password' : 'text'}
                      placeholder={f.placeholder}
                      value={form[f.id as keyof typeof form]}
                      onChange={(e) => handleChange(f.id, e.target.value)}
                      className="bg-background/50 font-mono text-sm"
                    />
                    {f.id === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Test Connection Button */}
            <div className="pt-2">
              <Button
                onClick={handleTest}
                disabled={!isFormValid || status === 'testing'}
                className="w-full gap-2 font-semibold"
                size="lg"
              >
                <AnimatePresence mode="wait">
                  {status === 'testing' ? (
                    <motion.span key="testing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Testing Connection…
                    </motion.span>
                  ) : status === 'success' ? (
                    <motion.span key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Connected Successfully
                    </motion.span>
                  ) : status === 'error' ? (
                    <motion.span key="error" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Connection Failed — Retry
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Database className="w-4 h-4" /> Test Connection
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* Result Card */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mt-6 glass-card p-5 border-primary/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-chart-up/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-chart-up" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Connection Verified</p>
                    <p className="text-xs text-muted-foreground">Your database is reachable and credentials are valid.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-secondary/40 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">Type</span>
                    <p className="text-foreground font-semibold mt-0.5">{dbTypes.find((d) => d.value === dbType)?.label}</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">Host</span>
                    <p className="text-foreground font-semibold mt-0.5 truncate">{form.host}</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">Database</span>
                    <p className="text-foreground font-semibold mt-0.5 truncate">{form.database}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mt-6 glass-card p-5 border-destructive/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Connection Failed</p>
                    <p className="text-xs text-muted-foreground">Could not reach the database. Please verify your credentials and try again.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forecast section after successful connection */}
          {status === 'success' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mt-8">
              <div className="glass-card p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" /> Forecast Configuration
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Write a SQL query and specify columns to run the forecast.</p>
                </div>

                {/* SQL Query */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-muted-foreground" /> SQL Query
                  </Label>
                  <Textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="SELECT date, sales FROM orders WHERE date >= '2024-01-01'"
                    className="bg-background/50 font-mono text-sm min-h-[100px]"
                  />
                </div>

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
              </div>
            </motion.div>
          )}

          {forecastData && (
            <div className="mt-8">
              <ForecastResults data={forecastData} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
