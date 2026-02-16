import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Database } from 'lucide-react';
import TemplateSelector from '@/components/dashboard/TemplateSelector';
import ForecastChart from '@/components/dashboard/ForecastChart';
import KPICards from '@/components/dashboard/KPICards';
import Recommendations from '@/components/dashboard/Recommendations';
import SettingsPanel from '@/components/dashboard/SettingsPanel';
import { industries } from '@/data/demoData';

const Index = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('retail');
  const [horizon, setHorizon] = useState(6);
  const [sensitivity, setSensitivity] = useState('balanced');
  const [refreshKey, setRefreshKey] = useState(0);

  const currentIndustry = industries.find(i => i.id === selectedIndustry);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
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
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Database className="w-3.5 h-3.5" />
              <span>Demo Mode</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-primary font-medium">{currentIndustry?.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        {/* Template Selector */}
        <section>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium"
          >
            Select Industry Template
          </motion.p>
          <TemplateSelector selected={selectedIndustry} onSelect={setSelectedIndustry} />
        </section>

        {/* KPI Cards */}
        <KPICards key={`kpi-${selectedIndustry}-${refreshKey}`} industryId={selectedIndustry} />

        {/* Chart + Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ForecastChart key={`chart-${selectedIndustry}-${horizon}-${refreshKey}`} industryId={selectedIndustry} horizon={horizon} />
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

        {/* Recommendations */}
        <Recommendations key={`rec-${selectedIndustry}-${refreshKey}`} industryId={selectedIndustry} />
      </main>
    </div>
  );
};

export default Index;
