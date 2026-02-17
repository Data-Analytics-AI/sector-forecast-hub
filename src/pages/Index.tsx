import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Database, PlugZap, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TemplateSelector from '@/components/dashboard/TemplateSelector';
import ForecastChart from '@/components/dashboard/ForecastChart';
import KPICards from '@/components/dashboard/KPICards';
import Recommendations from '@/components/dashboard/Recommendations';
import SettingsPanel from '@/components/dashboard/SettingsPanel';
import DataConnector, { type DataConnectorResult } from '@/components/dashboard/DataConnector';
import SampleDataTable from '@/components/dashboard/SampleDataTable';
import { industries } from '@/data/demoData';

const Index = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [confirmedIndustry, setConfirmedIndustry] = useState<string | null>(null);
  const [horizon, setHorizon] = useState(6);
  const [sensitivity, setSensitivity] = useState('balanced');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showConnector, setShowConnector] = useState(false);
  const [customData, setCustomData] = useState<DataConnectorResult | null>(null);

  const currentIndustry = industries.find(i => i.id === confirmedIndustry);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const handleDataLoaded = useCallback((result: DataConnectorResult) => {
    setCustomData(result);
    setShowConnector(false);
    setRefreshKey(k => k + 1);
  }, []);

  const handleClearCustomData = useCallback(() => {
    setCustomData(null);
    setRefreshKey(k => k + 1);
  }, []);

  const handleLaunchDashboard = () => {
    if (selectedIndustry) {
      setConfirmedIndustry(selectedIndustry);
    }
  };

  const handleBackToSelector = () => {
    setConfirmedIndustry(null);
  };

  const dataSourceLabel = customData
    ? `${customData.source === 'csv' ? '📄' : '🌐'} ${customData.label}`
    : 'Demo Mode';

  // Landing / Template Selection Screen
  if (!confirmedIndustry) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
              <BarChart3 className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">ForecastIQ</h1>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
              Predictive Analytics & Optimization — Select your industry to get started
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full max-w-4xl"
          >
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium text-center">
              Choose Industry Template
            </p>
            <TemplateSelector selected={selectedIndustry ?? ''} onSelect={setSelectedIndustry} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <Button
              size="lg"
              disabled={!selectedIndustry}
              onClick={handleLaunchDashboard}
              className="gap-2 px-8 text-sm"
            >
              Launch Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleBackToSelector} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground tracking-tight">ForecastIQ</h1>
                <p className="text-[11px] text-muted-foreground">Predictive Analytics & Optimization</p>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-3">
            {customData ? (
              <button
                onClick={handleClearCustomData}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <span>{dataSourceLabel}</span>
                <X className="w-3 h-3" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Database className="w-3.5 h-3.5" />
                <span>Demo Mode</span>
              </div>
            )}
            <div className="h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConnector(!showConnector)}
              className="text-xs gap-1.5 text-muted-foreground hover:text-primary"
            >
              <PlugZap className="w-3.5 h-3.5" />
              Connect Data
            </Button>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-primary font-medium">{currentIndustry?.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        <AnimatePresence>
          {showConnector && (
            <DataConnector
              onDataLoaded={handleDataLoaded}
              onDismiss={() => setShowConnector(false)}
            />
          )}
        </AnimatePresence>

        <KPICards key={`kpi-${confirmedIndustry}-${refreshKey}`} industryId={confirmedIndustry} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ForecastChart
              key={`chart-${confirmedIndustry}-${horizon}-${refreshKey}`}
              industryId={confirmedIndustry}
              horizon={horizon}
              customData={customData?.data}
            />
          </div>
          <div>
            <SettingsPanel
              horizon={horizon}
              sensitivity={sensitivity}
              onHorizonChange={setHorizon}
              onSensitivityChange={setSensitivity}
              onRefresh={handleRefresh}
            />
          </div>
        </div>

        <Recommendations key={`rec-${confirmedIndustry}-${refreshKey}`} industryId={confirmedIndustry} />

        <SampleDataTable key={`table-${confirmedIndustry}-${horizon}-${refreshKey}`} industryId={confirmedIndustry} horizon={horizon} />
      </main>
    </div>
  );
};

export default Index;
