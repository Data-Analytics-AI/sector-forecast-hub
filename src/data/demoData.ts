export interface Industry {
  id: string;
  name: string;
  icon: string;
  description: string;
  kpis: string[];
}

export const industries: Industry[] = [
  { id: 'banking', name: 'Banking', icon: '🏦', description: 'Cash & loan demand forecasting, ATM replenishment, risk scoring & portfolio optimization', kpis: ['Cash Demand', 'ATM Uptime', 'Default Risk', 'Loan Volume'] },
  { id: 'retail', name: 'Retail', icon: '🛍️', description: 'Demand forecasting, inventory & pricing optimization', kpis: ['Revenue', 'Basket Size', 'Inventory Turn', 'Margin'] },
  { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', description: 'Production planning, quality & supply chain', kpis: ['Output', 'Defect Rate', 'OEE', 'Lead Time'] },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', description: 'Patient volume, resource allocation & cost control', kpis: ['Admissions', 'Bed Util.', 'Wait Time', 'Cost/Patient'] },
  { id: 'logistics', name: 'Logistics', icon: '🚛', description: 'Route optimization, fleet utilization & delivery SLA', kpis: ['On-Time %', 'Fleet Util.', 'Cost/Mile', 'Volume'] },
  { id: 'energy', name: 'Energy', icon: '⚡', description: 'Load forecasting, grid optimization & pricing', kpis: ['Load (MW)', 'Efficiency', 'Price/kWh', 'Uptime'] },
];

export interface ForecastPoint {
  period: string;
  actual: number | null;
  forecast: number;
  upper: number;
  lower: number;
}

export interface KPIData {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}

export interface IndustryContext {
  valueLabel: string;
  unit: string;
  metricName: string;
  tooltipContext: (period: string, value: number, type: 'actual' | 'forecast', lower?: number, upper?: number) => string;
  copilotContext: (period: string, value: number, type: 'actual' | 'forecast', forecast?: number, lower?: number, upper?: number) => string;
}

export function getIndustryContext(industryId: string): IndustryContext {
  const contexts: Record<string, IndustryContext> = {
    banking: {
      valueLabel: 'Cash Demand (₦)',
      unit: '₦',
      metricName: 'cash demand',
      tooltipContext: (period, value, type, lower, upper) =>
        type === 'actual'
          ? `${period}: Actual ATM cash demand was ₦${value.toLocaleString()}. This is real withdrawal data from your branch network.`
          : `${period}: Forecasted cash demand is ₦${value.toLocaleString()}, with a 95% confidence interval between ₦${lower?.toLocaleString()} and ₦${upper?.toLocaleString()}. Plan ATM replenishment accordingly.`,
      copilotContext: (period, value, type, forecast, lower, upper) =>
        type === 'actual'
          ? `In ${period}, the actual ATM cash demand was ₦${value.toLocaleString()}. The model predicted ₦${forecast?.toLocaleString()} — ${Math.abs(value - (forecast || 0)) < value * 0.05 ? 'very accurate, meaning your cash replenishment strategy is well-calibrated.' : `a gap of ₦${Math.abs(value - (forecast || 0)).toLocaleString()}. This helps refine future ATM loading schedules.`}`
          : `In ${period}, we predict cash demand of ₦${value.toLocaleString()}, with 95% confidence it falls between ₦${lower?.toLocaleString()} and ₦${upper?.toLocaleString()}. ${(upper || 0) - (lower || 0) > value * 0.2 ? 'The wider range suggests volatile withdrawal patterns — consider more frequent ATM checks.' : 'The tight range means you can confidently plan cash loading schedules.'}`,
    },
    retail: {
      valueLabel: 'Sales Units',
      unit: 'units',
      metricName: 'sales volume',
      tooltipContext: (period, value, type, lower, upper) =>
        type === 'actual'
          ? `${period}: Actual sales were ${value.toLocaleString()} units across all stores. This is real point-of-sale data.`
          : `${period}: Forecasted sales are ${value.toLocaleString()} units, with 95% confidence between ${lower?.toLocaleString()} and ${upper?.toLocaleString()} units. Adjust inventory orders accordingly.`,
      copilotContext: (period, value, type, forecast, lower, upper) =>
        type === 'actual'
          ? `In ${period}, actual store sales were ${value.toLocaleString()} units. The forecast was ${forecast?.toLocaleString()} units — ${Math.abs(value - (forecast || 0)) < value * 0.05 ? 'spot on! Your demand planning is working well.' : `off by ${Math.abs(value - (forecast || 0)).toLocaleString()} units. This feedback improves next quarter's stock orders.`}`
          : `In ${period}, we expect sales of ${value.toLocaleString()} units (95% CI: ${lower?.toLocaleString()}–${upper?.toLocaleString()}). ${(upper || 0) - (lower || 0) > value * 0.2 ? 'Higher uncertainty — consider flexible supplier agreements.' : 'High confidence — safe to pre-stock inventory.'}`,
    },
    manufacturing: {
      valueLabel: 'Production Output',
      unit: 'units',
      metricName: 'production output',
      tooltipContext: (period, value, type, lower, upper) =>
        type === 'actual'
          ? `${period}: Actual production output was ${value.toLocaleString()} units from all manufacturing lines.`
          : `${period}: Forecasted output is ${value.toLocaleString()} units, with 95% confidence between ${lower?.toLocaleString()} and ${upper?.toLocaleString()} units.`,
      copilotContext: (period, value, type, forecast, lower, upper) =>
        type === 'actual'
          ? `In ${period}, actual production was ${value.toLocaleString()} units. The model predicted ${forecast?.toLocaleString()} — ${Math.abs(value - (forecast || 0)) < value * 0.05 ? 'excellent accuracy, production planning is on track.' : `a variance of ${Math.abs(value - (forecast || 0)).toLocaleString()} units. Check for equipment downtime or supply chain delays.`}`
          : `In ${period}, expected output is ${value.toLocaleString()} units (95% CI: ${lower?.toLocaleString()}–${upper?.toLocaleString()}). ${(upper || 0) - (lower || 0) > value * 0.2 ? 'Wide range suggests potential disruptions — schedule preventive maintenance.' : 'Narrow range — production lines are running predictably.'}`,
    },
    healthcare: {
      valueLabel: 'Patient Admissions',
      unit: 'patients',
      metricName: 'patient admissions',
      tooltipContext: (period, value, type, lower, upper) =>
        type === 'actual'
          ? `${period}: ${value.toLocaleString()} patients were admitted across all facilities.`
          : `${period}: Forecasted admissions are ${value.toLocaleString()} patients, 95% CI: ${lower?.toLocaleString()}–${upper?.toLocaleString()}. Plan bed capacity and staffing.`,
      copilotContext: (period, value, type, forecast, lower, upper) =>
        type === 'actual'
          ? `In ${period}, ${value.toLocaleString()} patients were admitted. The forecast was ${forecast?.toLocaleString()} — ${Math.abs(value - (forecast || 0)) < value * 0.05 ? 'very accurate. Staffing levels matched demand well.' : `off by ${Math.abs(value - (forecast || 0)).toLocaleString()} patients. Review seasonal illness patterns for better planning.`}`
          : `In ${period}, we expect ${value.toLocaleString()} admissions (95% CI: ${lower?.toLocaleString()}–${upper?.toLocaleString()}). ${(upper || 0) - (lower || 0) > value * 0.2 ? 'Higher uncertainty — have contingency beds and on-call staff ready.' : 'Stable forecast — standard staffing should suffice.'}`,
    },
    logistics: {
      valueLabel: 'Shipment Volume',
      unit: 'shipments',
      metricName: 'shipment volume',
      tooltipContext: (period, value, type, lower, upper) =>
        type === 'actual'
          ? `${period}: ${value.toLocaleString()} shipments were processed across the delivery network.`
          : `${period}: Forecasted volume is ${value.toLocaleString()} shipments, 95% CI: ${lower?.toLocaleString()}–${upper?.toLocaleString()}. Plan fleet capacity accordingly.`,
      copilotContext: (period, value, type, forecast, lower, upper) =>
        type === 'actual'
          ? `In ${period}, ${value.toLocaleString()} shipments were processed. Forecast was ${forecast?.toLocaleString()} — ${Math.abs(value - (forecast || 0)) < value * 0.05 ? 'well predicted. Fleet allocation was optimal.' : `a gap of ${Math.abs(value - (forecast || 0)).toLocaleString()} shipments. Adjust route planning and driver schedules.`}`
          : `In ${period}, we forecast ${value.toLocaleString()} shipments (95% CI: ${lower?.toLocaleString()}–${upper?.toLocaleString()}). ${(upper || 0) - (lower || 0) > value * 0.2 ? 'Volatile demand expected — keep reserve fleet on standby.' : 'Predictable volume — optimize routes for cost savings.'}`,
    },
    energy: {
      valueLabel: 'Load Demand (MW)',
      unit: 'MW',
      metricName: 'energy load',
      tooltipContext: (period, value, type, lower, upper) =>
        type === 'actual'
          ? `${period}: Actual grid load was ${value.toLocaleString()} MW across all distribution zones.`
          : `${period}: Forecasted load is ${value.toLocaleString()} MW, 95% CI: ${lower?.toLocaleString()}–${upper?.toLocaleString()} MW. Schedule generation capacity.`,
      copilotContext: (period, value, type, forecast, lower, upper) =>
        type === 'actual'
          ? `In ${period}, actual grid load was ${value.toLocaleString()} MW. The model predicted ${forecast?.toLocaleString()} MW — ${Math.abs(value - (forecast || 0)) < value * 0.05 ? 'excellent accuracy. Generation dispatch was well-matched.' : `off by ${Math.abs(value - (forecast || 0)).toLocaleString()} MW. Review weather patterns and industrial consumption data.`}`
          : `In ${period}, we forecast ${value.toLocaleString()} MW demand (95% CI: ${lower?.toLocaleString()}–${upper?.toLocaleString()}). ${(upper || 0) - (lower || 0) > value * 0.2 ? 'High variability — pre-position peak reserves and check renewable availability.' : 'Stable load expected — standard dispatch schedule should work.'}`,
    },
  };
  return contexts[industryId] || contexts.retail;
}

export function generateForecastData(industryId: string, horizon: number): ForecastPoint[] {
  const baseValues: Record<string, number> = {
    banking: 1200, retail: 850, manufacturing: 2400,
    healthcare: 340, logistics: 1800, energy: 4500,
  };
  const base = baseValues[industryId] || 1000;
  const points: ForecastPoint[] = [];
  const totalPeriods = 12 + horizon;
  
  for (let i = 0; i < totalPeriods; i++) {
    const month = i % 12;
    const seasonality = Math.sin((month / 12) * Math.PI * 2) * base * 0.15;
    const trend = i * base * 0.008;
    const noise = (Math.random() - 0.5) * base * 0.08;
    const value = base + seasonality + trend + noise;
    const isHistorical = i < 12;
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = i < 12 ? '25' : '26';
    
    points.push({
      period: `${monthNames[month]} '${year}`,
      actual: isHistorical ? Math.round(value) : null,
      forecast: Math.round(value),
      upper: Math.round(value + base * 0.12 * (isHistorical ? 0.3 : 1 + (i - 12) * 0.1)),
      lower: Math.round(value - base * 0.12 * (isHistorical ? 0.3 : 1 + (i - 12) * 0.1)),
    });
  }
  return points;
}

export function generateKPIs(industryId: string): KPIData[] {
  const industry = industries.find(i => i.id === industryId);
  if (!industry) return [];
  
  const industryValues: Record<string, { v: string; c: number }[]> = {
    banking: [
      { v: '₦2.4B', c: 12.3 }, { v: '98.7%', c: 1.2 },
      { v: '3.2%', c: -0.8 }, { v: '₦1.8B', c: 8.5 },
    ],
    retail: [
      { v: '$4.2M', c: 9.1 }, { v: '$68.50', c: 3.4 },
      { v: '8.2x', c: 4.2 }, { v: '34.5%', c: -1.3 },
    ],
    manufacturing: [
      { v: '12,400', c: 5.6 }, { v: '1.8%', c: -2.1 },
      { v: '87.5%', c: 4.2 }, { v: '4.2 days', c: -6.1 },
    ],
    healthcare: [
      { v: '1,240', c: 8.3 }, { v: '92.1%', c: 3.7 },
      { v: '18 min', c: -12.4 }, { v: '$3,420', c: -4.2 },
    ],
    logistics: [
      { v: '96.8%', c: 2.1 }, { v: '88.4%', c: 5.3 },
      { v: '$1.42', c: -3.8 }, { v: '48.2K', c: 11.2 },
    ],
    energy: [
      { v: '4,520', c: 7.8 }, { v: '91.3%', c: 2.4 },
      { v: '$0.087', c: -5.1 }, { v: '99.2%', c: 0.8 },
    ],
  };

  const values = industryValues[industryId] || industryValues.retail;
  
  return industry.kpis.map((label, i) => ({
    label,
    value: values[i].v,
    change: values[i].c,
    trend: values[i].c > 0 ? 'up' as const : values[i].c < 0 ? 'down' as const : 'neutral' as const,
  }));
}

export function generateRecommendations(industryId: string): Recommendation[] {
  const recs: Record<string, Recommendation[]> = {
    banking: [
      { id: '1', priority: 'high', title: 'Optimize ATM cash replenishment schedule', description: 'Forecast cash demand across ATM networks to prevent shortages and reduce excess idle cash by aligning refill cycles with predicted withdrawal patterns.', impact: '-22% idle cash' },
      { id: '2', priority: 'high', title: 'Rebalance loan distribution portfolio', description: 'Forecast loan demand across segments and regions to optimize allocation, reduce concentration risk, and capture underserved growth markets.', impact: '+$4.1M lending revenue' },
      { id: '3', priority: 'high', title: 'Enhance credit risk scoring model', description: 'Leverage predictive risk models to identify high-default-probability borrowers early, adjusting approval thresholds and pricing to minimize losses.', impact: '-2.8% default rate' },
      { id: '4', priority: 'medium', title: 'Align staffing with transaction volume', description: 'Deploy staff and resources based on predicted transaction peaks across branches, reducing wait times and overtime costs.', impact: '-18% staffing cost' },
      { id: '5', priority: 'medium', title: 'Streamline cash transport logistics', description: 'Optimize cash-in-transit routes and schedules using regional demand forecasts to cut transport costs and improve turnaround.', impact: '-15% transport cost' },
      { id: '6', priority: 'low', title: 'Reduce regional cash surplus', description: 'Reallocate cash supply across regions by matching distribution to actual demand, minimizing holding costs and capital lockup.', impact: '+$1.4M freed capital' },
    ],
    retail: [
      { id: '1', priority: 'high', title: 'Pre-stock seasonal inventory', description: 'Demand forecast shows 22% spike in outdoor category starting week 14.', impact: '+$1.8M sales' },
      { id: '2', priority: 'high', title: 'Adjust dynamic pricing', description: 'Competitor analysis and demand curves suggest 8% price optimization opportunity.', impact: '+4.2% margin' },
      { id: '3', priority: 'medium', title: 'Optimize warehouse allocation', description: 'Regional demand patterns indicate redistribution could cut shipping costs.', impact: '-15% logistics cost' },
    ],
    manufacturing: [
      { id: '1', priority: 'high', title: 'Schedule preventive maintenance', description: 'Equipment degradation model predicts Line 3 failure within 6 weeks.', impact: '-$420K downtime' },
      { id: '2', priority: 'medium', title: 'Adjust production mix', description: 'Demand shift toward Product B requires rebalancing line allocation by 12%.', impact: '+8% throughput' },
      { id: '3', priority: 'low', title: 'Renegotiate supplier contracts', description: 'Raw material price forecasts suggest locking in Q3 rates now.', impact: '-6% material cost' },
    ],
    healthcare: [
      { id: '1', priority: 'high', title: 'Add weekend staffing', description: 'Patient volume forecast exceeds capacity threshold for 3 consecutive weekends.', impact: '-25% wait time' },
      { id: '2', priority: 'medium', title: 'Redirect elective procedures', description: 'Bed utilization model shows Facility B has 30% more availability.', impact: '+18% utilization' },
      { id: '3', priority: 'low', title: 'Bulk order medical supplies', description: 'Usage trend analysis suggests ordering now at volume discount.', impact: '-12% supply cost' },
    ],
    logistics: [
      { id: '1', priority: 'high', title: 'Reroute southern corridor', description: 'Congestion forecast indicates 35% delay risk on primary route next month.', impact: '+8% on-time' },
      { id: '2', priority: 'medium', title: 'Deploy additional fleet', description: 'Volume forecast exceeds current capacity by 15% in weeks 8-12.', impact: '+$2.1M throughput' },
      { id: '3', priority: 'low', title: 'Consolidate regional hubs', description: 'Network analysis shows 2 hubs can be merged without SLA impact.', impact: '-$180K/month' },
    ],
    energy: [
      { id: '1', priority: 'high', title: 'Pre-position peak reserves', description: 'Load forecast predicts record demand during upcoming heat wave period.', impact: '-$1.2M penalty risk' },
      { id: '2', priority: 'medium', title: 'Optimize renewable mix', description: 'Solar and wind forecast models suggest shifting dispatch schedule.', impact: '+5% efficiency' },
      { id: '3', priority: 'low', title: 'Lock forward contracts', description: 'Price volatility models indicate favorable rates for Q4 hedging.', impact: '-8% cost variance' },
    ],
  };
  return recs[industryId] || recs.retail;
}
