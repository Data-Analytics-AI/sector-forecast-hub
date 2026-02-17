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
  
  const values = [
    { v: '2.4M', c: 12.3 }, { v: '3.2%', c: -0.8 },
    { v: '87.5%', c: 4.2 }, { v: '$142', c: -6.1 },
  ];
  
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
