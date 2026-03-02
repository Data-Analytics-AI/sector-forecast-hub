import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Database, PlugZap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ForecastChart from '@/components/dashboard/ForecastChart';
import KPICards from '@/components/dashboard/KPICards';
import Recommendations from '@/components/dashboard/Recommendations';
import SettingsPanel from '@/components/dashboard/SettingsPanel';
import DataConnector, { type DataConnectorResult } from '@/components/dashboard/DataConnector';
import SampleDataTable from '@/components/dashboard/SampleDataTable';
import { extendCustomDataWithForecast } from '@/data/demoData';

const INDUSTRY_ID = 'general';

const Index = () => {
  const [horizon, setHorizon] = useState(6);
  const [sensitivity, setSensitivity] = useState('balanced');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showConnector, setShowConnector] = useState(false);
  const [customData, setCustomData] = useState<DataConnectorResult | null>(null);

  const extendedData = useMemo(() => {
    if (!customData?.data) return undefined;
    return extendCustomDataWithForecast(customData.data, horizon);
  }, [customData, horizon]);

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

  const dataSourceLabel = customData
    ? `${customData.source === 'csv' ? '📄' : '🌐'} ${customData.label}`
    : 'Demo Mode';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">ForecastIQ</h1>
              <p className="text-[11px] text-muted-foreground">Predictive Analytics & Optimization</p>
            </div>
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
              selectedIndustry={INDUSTRY_ID}
            />
          )}
        </AnimatePresence>

        <KPICards key={`kpi-${refreshKey}`} industryId={INDUSTRY_ID} customData={extendedData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ForecastChart
              key={`chart-${horizon}-${refreshKey}`}
              industryId={INDUSTRY_ID}
              horizon={horizon}
              customData={extendedData}
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

        <Recommendations key={`rec-${refreshKey}`} industryId={INDUSTRY_ID} customData={extendedData} />

        <SampleDataTable key={`table-${horizon}-${refreshKey}`} industryId={INDUSTRY_ID} horizon={horizon} customData={extendedData} />
      </main>
    </div>
  );
};

export default Index;
