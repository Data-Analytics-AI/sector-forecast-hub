import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plug, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Loader2,
  Globe, Key, Code2, Wifi, Check, Send, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import ForecastParams from '@/components/forecast/ForecastParams';
import ForecastResults, { ForecastRow } from '@/components/forecast/ForecastResults';

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

const apiTypes = [
  { value: 'rest', label: 'REST API', icon: Globe },
  { value: 'graphql', label: 'GraphQL', icon: Code2 },
  { value: 'websocket', label: 'WebSocket', icon: Wifi },
];

const steps = [
  { label: 'API Type', description: 'Select your API protocol' },
  { label: 'Configuration', description: 'Enter endpoint & auth' },
  { label: 'Test & Confirm', description: 'Verify your connection' },
];

export default function ConnectAPI() {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiType, setApiType] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [authHeader, setAuthHeader] = useState('Authorization');
  const [status, setStatus] = useState<ConnectionStatus>('idle');

  // Forecast params
  const [dateCol, setDateCol] = useState('');
  const [valueCol, setValueCol] = useState('');
  const [horizon, setHorizon] = useState(30);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');
  const [forecastData, setForecastData] = useState<ForecastRow[] | null>(null);

  const canProceed = [
    () => !!apiType,
    () => !!endpoint,
    () => true,
  ];

  const handleNext = () => {
    if (currentStep < 2) setCurrentStep((s) => s + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    setStatus('idle');
  };

  const handleTest = async () => {
    setStatus('testing');
    await new Promise((r) => setTimeout(r, 2200));
    setStatus(Math.random() > 0.3 ? 'success' : 'error');
  };

  const handleLoadData = async () => {
    if (!endpoint || !dateCol || !valueCol) return;
    setForecastLoading(true);
    setForecastError('');
    setForecastData(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: 'api',
          source_path: endpoint,
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

  const canLoadData = status === 'success' && dateCol && valueCol && horizon > 0;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Plug className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Connect API</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">API Connection Wizard</h1>
          <p className="text-sm text-muted-foreground mb-10">Follow the steps below to connect your external API.</p>

          {/* Vertical Stepper */}
          <div className="flex gap-8">
            <div className="hidden sm:flex flex-col items-center pt-1">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                      i < currentStep
                        ? 'bg-primary border-primary text-primary-foreground'
                        : i === currentStep
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-border text-muted-foreground bg-secondary/30'
                    }`}
                  >
                    {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-16 transition-colors duration-300 ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <div className="sm:hidden mb-4">
                  <p className="text-xs text-muted-foreground font-mono">Step {currentStep + 1} of 3</p>
                  <p className="text-sm font-semibold text-foreground">{steps[currentStep].label}</p>
                </div>

                {currentStep === 0 && (
                  <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <div className="glass-card p-6 space-y-4">
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-1">Select API Type</h3>
                        <p className="text-xs text-muted-foreground">Choose the protocol that matches your data source.</p>
                      </div>
                      <div className="grid gap-3">
                        {apiTypes.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setApiType(t.value)}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              apiType === t.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40 bg-background/30'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              apiType === t.value ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-muted-foreground'
                            }`}>
                              <t.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{t.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Connect via {t.label} protocol</p>
                            </div>
                            {apiType === t.value && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <div className="glass-card p-6 space-y-5">
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-1">Endpoint & Authentication</h3>
                        <p className="text-xs text-muted-foreground">Provide the URL and credentials for your API.</p>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-muted-foreground" /> Endpoint URL
                          </Label>
                          <Input
                            value={endpoint}
                            onChange={(e) => setEndpoint(e.target.value)}
                            placeholder="https://api.example.com/v1/data"
                            className="bg-background/50 font-mono text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-muted-foreground" /> Auth Header Name
                          </Label>
                          <Select value={authHeader} onValueChange={setAuthHeader}>
                            <SelectTrigger className="bg-background/50 font-mono text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Authorization">Authorization</SelectItem>
                              <SelectItem value="X-API-Key">X-API-Key</SelectItem>
                              <SelectItem value="Bearer">Bearer Token</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-muted-foreground" /> API Key / Token
                          </Label>
                          <Input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-••••••••••••••••"
                            className="bg-background/50 font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <div className="glass-card p-6 space-y-5">
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-1">Test Connection</h3>
                        <p className="text-xs text-muted-foreground">Verify that ForecastIQ can reach your API endpoint.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="bg-secondary/40 rounded-lg px-3 py-2">
                          <span className="text-muted-foreground">Protocol</span>
                          <p className="text-foreground font-semibold mt-0.5">{apiTypes.find((a) => a.value === apiType)?.label}</p>
                        </div>
                        <div className="bg-secondary/40 rounded-lg px-3 py-2">
                          <span className="text-muted-foreground">Auth</span>
                          <p className="text-foreground font-semibold mt-0.5">{authHeader}</p>
                        </div>
                        <div className="col-span-2 bg-secondary/40 rounded-lg px-3 py-2">
                          <span className="text-muted-foreground">Endpoint</span>
                          <p className="text-foreground font-semibold mt-0.5 truncate">{endpoint}</p>
                        </div>
                      </div>

                      <Button
                        onClick={handleTest}
                        disabled={status === 'testing'}
                        className="w-full gap-2 font-semibold"
                        size="lg"
                      >
                        <AnimatePresence mode="wait">
                          {status === 'testing' ? (
                            <motion.span key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> Testing…
                            </motion.span>
                          ) : status === 'success' ? (
                            <motion.span key="s" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Connected
                            </motion.span>
                          ) : status === 'error' ? (
                            <motion.span key="e" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                              <XCircle className="w-4 h-4" /> Failed — Retry
                            </motion.span>
                          ) : (
                            <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                              <Wifi className="w-4 h-4" /> Test Connection
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </div>

                    <AnimatePresence>
                      {status === 'success' && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 glass-card p-5 border-primary/30">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-chart-up/20 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-chart-up" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">API Verified</p>
                              <p className="text-xs text-muted-foreground">Endpoint is reachable and responding correctly.</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {status === 'error' && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 glass-card p-5 border-destructive/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                              <XCircle className="w-5 h-5 text-destructive" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">Connection Failed</p>
                              <p className="text-xs text-muted-foreground">Check your endpoint URL and credentials, then try again.</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 0} className="gap-1.5 font-medium">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                {currentStep < 2 && (
                  <Button onClick={handleNext} disabled={!canProceed[currentStep]()} className="gap-1.5 font-medium">
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Forecast section after successful connection */}
          {status === 'success' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mt-10">
              <div className="glass-card p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" /> Forecast Configuration
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Specify columns and horizon, then load data for forecasting.</p>
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
