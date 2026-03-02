export interface Industry {
  id: string;
  name: string;
  icon: string;
  description: string;
  kpis: string[];
}

export const industries: Industry[] = [
  { id: 'general', name: 'General Forecast', icon: '📊', description: 'Universal demand forecasting, trend analysis & optimization for any business unit or sector', kpis: ['Total Volume', 'Growth Rate', 'Forecast Accuracy', 'Trend Score'] },
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
  description?: string;
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
  const general: IndustryContext = {
    valueLabel: 'Demand Volume',
    unit: 'units',
    metricName: 'demand volume',
    tooltipContext: (period, value, type, lower, upper) =>
      type === 'actual'
        ? `${period}: Actual demand was ${value.toLocaleString()} units. This is real recorded data.`
        : `${period}: Forecasted demand is ${value.toLocaleString()} units, with 95% confidence between ${lower?.toLocaleString()} and ${upper?.toLocaleString()} units.`,
    copilotContext: (period, value, type, forecast, lower, upper) =>
      type === 'actual'
        ? `In ${period}, actual demand was ${value.toLocaleString()} units. The model predicted ${forecast?.toLocaleString()} — ${Math.abs(value - (forecast || 0)) < value * 0.05 ? 'very accurate, your planning is well-calibrated.' : `a gap of ${Math.abs(value - (forecast || 0)).toLocaleString()} units. This feedback improves future predictions.`}`
        : `In ${period}, we forecast ${value.toLocaleString()} units (95% CI: ${lower?.toLocaleString()}–${upper?.toLocaleString()}). ${(upper || 0) - (lower || 0) > value * 0.2 ? 'Higher uncertainty — consider building buffer capacity.' : 'High confidence — safe to plan with these numbers.'}`,
  };
  return general;
}

export function generateForecastData(industryId: string, horizon: number): ForecastPoint[] {
  const base = 1000;
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

function generateKPIInterpretations(values: { v: string; c: number }[], labels: string[]): string[] {
  const trendWord = (c: number) => c > 0 ? `up ${Math.abs(c)}% from last period, indicating positive growth` : c < 0 ? `down ${Math.abs(c)}% from last period, signaling a decline` : 'unchanged from last period, showing stability';

  return labels.map((label, i) => {
    const { v, c } = values[i];
    if (label === 'Total Volume') return `Your total demand volume this period is ${v}, ${trendWord(c)}. ${c > 5 ? 'Strong growth — consider scaling capacity.' : c < 0 ? 'Declining volume warrants investigation.' : 'Steady performance.'}`;
    if (label === 'Growth Rate') return `Period-over-period growth rate is ${v}, ${trendWord(c)}. ${c > 0 ? 'Accelerating growth is a positive signal.' : 'Slowing growth — review drivers.'}`;
    if (label === 'Forecast Accuracy') return `Model accuracy is ${v}, ${trendWord(c)}. ${parseFloat(v) >= 95 ? 'Excellent — predictions are highly reliable.' : 'There is room to improve with more data.'}`;
    return `The trend score is ${v}, ${trendWord(c)}. ${parseFloat(v) > 0 ? 'Positive trajectory overall.' : 'Negative trend detected — monitor closely.'}`;
  });
}

export function generateKPIs(industryId: string): KPIData[] {
  const industry = industries.find(i => i.id === industryId);
  if (!industry) return [];
  
  const values = [
    { v: '12.4K', c: 8.5 }, { v: '8.5%', c: 3.2 },
    { v: '94.2%', c: 1.8 }, { v: '+0.72', c: 5.4 },
  ];

  const descriptions = generateKPIInterpretations(values, industry.kpis);
  
  return industry.kpis.map((label, i) => ({
    label,
    value: values[i].v,
    change: values[i].c,
    trend: values[i].c > 0 ? 'up' as const : values[i].c < 0 ? 'down' as const : 'neutral' as const,
    description: descriptions[i],
  }));
}

export function extendCustomDataWithForecast(data: ForecastPoint[], horizon: number): ForecastPoint[] {
  if (data.length < 2) return data;

  // All uploaded points are treated as actuals
  const actuals = data.map(d => ({ ...d, actual: d.actual ?? d.forecast }));

  // Calculate simple linear trend from actuals
  const values = actuals.map(d => d.actual!);
  const n = values.length;
  const avgX = (n - 1) / 2;
  const avgY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - avgX) * (values[i] - avgY);
    den += (i - avgX) * (i - avgX);
  }
  const slope = den !== 0 ? num / den : 0;
  const intercept = avgY - slope * avgX;

  // Detect simple seasonality (if enough data)
  const seasonLen = Math.min(12, Math.floor(n / 2));
  const seasonal: number[] = new Array(seasonLen).fill(0);
  if (n >= seasonLen * 2) {
    for (let i = 0; i < n; i++) {
      const detrended = values[i] - (intercept + slope * i);
      seasonal[i % seasonLen] += detrended;
    }
    const counts = new Array(seasonLen).fill(0);
    for (let i = 0; i < n; i++) counts[i % seasonLen]++;
    for (let i = 0; i < seasonLen; i++) seasonal[i] /= counts[i] || 1;
  }

  // Parse last period to generate future period labels
  const lastPeriod = actuals[actuals.length - 1].period;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let lastMonthIdx = monthNames.findIndex(m => lastPeriod.startsWith(m));
  let lastYear = parseInt(lastPeriod.match(/'(\d+)/)?.[1] || '26');
  if (lastMonthIdx === -1) lastMonthIdx = 0;

  // Generate forecast points
  const forecastPoints: ForecastPoint[] = [];
  for (let i = 1; i <= horizon; i++) {
    const futureIdx = n + i - 1;
    const trendValue = intercept + slope * futureIdx;
    const seasonValue = seasonal[futureIdx % seasonLen] || 0;
    const predicted = Math.round(trendValue + seasonValue);
    const uncertainty = Math.abs(predicted) * 0.05 * Math.sqrt(i);

    const mIdx = (lastMonthIdx + i) % 12;
    const yOffset = Math.floor((lastMonthIdx + i) / 12);
    const yearStr = (lastYear + yOffset).toString().slice(-2);

    forecastPoints.push({
      period: `${monthNames[mIdx]} '${yearStr}`,
      actual: null,
      forecast: Math.max(0, predicted),
      upper: Math.max(0, Math.round(predicted + uncertainty)),
      lower: Math.max(0, Math.round(predicted - uncertainty)),
    });
  }

  return [...actuals, ...forecastPoints];
}

export function generateCustomKPIs(industryId: string, data: ForecastPoint[]): KPIData[] {
  const industry = industries.find(i => i.id === industryId);
  if (!industry || data.length === 0) return generateKPIs(industryId);

  const actuals = data.filter(d => d.actual !== null).map(d => d.actual!);
  const forecasts = data.filter(d => d.actual === null).map(d => d.forecast);
  
  if (actuals.length < 2) return generateKPIs(industryId);

  const latest = actuals[actuals.length - 1];
  const previous = actuals[actuals.length - 2];
  const change = previous !== 0 ? ((latest - previous) / previous) * 100 : 0;
  const avg = actuals.reduce((a, b) => a + b, 0) / actuals.length;
  const nextForecast = forecasts.length > 0 ? forecasts[0] : latest;
  const forecastChange = latest !== 0 ? ((nextForecast - latest) / latest) * 100 : 0;

  const ctx = getIndustryContext(industryId);
  const formatVal = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toFixed(0);

  return [
    { label: `Latest ${ctx.metricName}`, value: formatVal(latest), change: parseFloat(change.toFixed(1)), trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral', description: `Your most recent ${ctx.metricName} came in at ${formatVal(latest)} ${ctx.unit}. That's ${change > 0 ? `up ${Math.abs(change).toFixed(1)}% from the previous period — a positive trend suggesting growing ${ctx.metricName}.` : change < 0 ? `down ${Math.abs(change).toFixed(1)}% from the previous period — worth monitoring for further decline.` : 'unchanged from the previous period.'}` },
    { label: `Average ${ctx.metricName}`, value: formatVal(avg), change: 0, trend: 'neutral', description: `Across all ${actuals.length} periods in your data, the average ${ctx.metricName} is ${formatVal(avg)} ${ctx.unit}. ${latest > avg * 1.1 ? `Your latest value is ${((latest / avg - 1) * 100).toFixed(0)}% above this average — performance is trending higher than normal.` : latest < avg * 0.9 ? `Your latest value is ${((1 - latest / avg) * 100).toFixed(0)}% below this average — recent performance is lagging.` : 'Your latest value is close to the average — performance is consistent.'}` },
    { label: 'Next Period Forecast', value: formatVal(nextForecast), change: parseFloat(forecastChange.toFixed(1)), trend: forecastChange > 0 ? 'up' : forecastChange < 0 ? 'down' : 'neutral', description: `The model predicts ${formatVal(nextForecast)} ${ctx.unit} for the next period — ${forecastChange > 0 ? `a ${forecastChange.toFixed(1)}% increase from the latest actual. Prepare for higher ${ctx.metricName}.` : forecastChange < 0 ? `a ${Math.abs(forecastChange).toFixed(1)}% decrease. Consider adjusting plans for lower ${ctx.metricName}.` : `flat compared to the latest period.`}` },
    { label: 'Data Points', value: `${actuals.length}`, change: forecasts.length, trend: 'up', description: `You uploaded ${actuals.length} historical data points, and the model generated ${forecasts.length} forecast periods. ${actuals.length >= 12 ? 'With a full year of data, the model can capture seasonal patterns effectively.' : actuals.length >= 6 ? 'A decent amount of data — predictions will improve with more historical periods.' : 'Limited data available — consider uploading more periods for more reliable forecasts.'}` },
  ];
}

export function generateCustomRecommendations(industryId: string, data: ForecastPoint[]): Recommendation[] {
  const actuals = data.filter(d => d.actual !== null).map(d => d.actual!);
  const forecasts = data.filter(d => d.actual === null);
  const ctx = getIndustryContext(industryId);

  if (actuals.length < 2 || forecasts.length === 0) return generateRecommendations(industryId);

  const latest = actuals[actuals.length - 1];
  const avg = actuals.reduce((a, b) => a + b, 0) / actuals.length;
  const nextForecast = forecasts[0].forecast;
  const maxForecast = Math.max(...forecasts.map(f => f.forecast));
  const minForecast = Math.min(...forecasts.map(f => f.forecast));
  const trend = nextForecast > latest ? 'increasing' : 'decreasing';
  const volatility = (maxForecast - minForecast) / avg;

  const recs: Recommendation[] = [];

  if (trend === 'increasing') {
    recs.push({
      id: '1', priority: 'high',
      title: `Prepare for rising ${ctx.metricName}`,
      description: `Forecast shows ${ctx.metricName} increasing from ${latest.toLocaleString()} to ${nextForecast.toLocaleString()} next period. Scale capacity and resources proactively.`,
      impact: `+${((nextForecast - latest) / latest * 100).toFixed(1)}% projected growth`,
    });
  } else {
    recs.push({
      id: '1', priority: 'high',
      title: `Manage declining ${ctx.metricName}`,
      description: `Forecast shows ${ctx.metricName} decreasing from ${latest.toLocaleString()} to ${nextForecast.toLocaleString()}. Optimize costs and investigate root causes.`,
      impact: `${((nextForecast - latest) / latest * 100).toFixed(1)}% projected change`,
    });
  }

  if (volatility > 0.3) {
    recs.push({
      id: '2', priority: 'high',
      title: `High volatility detected in ${ctx.metricName}`,
      description: `Forecast range spans from ${minForecast.toLocaleString()} to ${maxForecast.toLocaleString()} ${ctx.unit}. Build buffer capacity and flexible scheduling.`,
      impact: `${(volatility * 100).toFixed(0)}% variation range`,
    });
  } else {
    recs.push({
      id: '2', priority: 'low',
      title: `Stable ${ctx.metricName} outlook`,
      description: `Low volatility in forecast (${minForecast.toLocaleString()}–${maxForecast.toLocaleString()} ${ctx.unit}). Current plans can proceed with high confidence.`,
      impact: 'Low risk',
    });
  }

  const peakPeriod = forecasts.reduce((max, f) => f.forecast > max.forecast ? f : max, forecasts[0]);
  recs.push({
    id: '3', priority: 'medium',
    title: `Peak ${ctx.metricName} expected in ${peakPeriod.period}`,
    description: `The highest forecasted value is ${peakPeriod.forecast.toLocaleString()} ${ctx.unit} in ${peakPeriod.period}. Ensure resources are allocated for this peak.`,
    impact: `${peakPeriod.forecast.toLocaleString()} ${ctx.unit} peak`,
  });

  if (latest > avg * 1.1) {
    recs.push({
      id: '4', priority: 'medium',
      title: `Current ${ctx.metricName} above historical average`,
      description: `Latest value (${latest.toLocaleString()}) is ${((latest / avg - 1) * 100).toFixed(0)}% above the historical average of ${Math.round(avg).toLocaleString()}. Monitor whether this trend sustains.`,
      impact: `+${((latest / avg - 1) * 100).toFixed(0)}% above average`,
    });
  }

  return recs;
}

export function generateRecommendations(industryId: string): Recommendation[] {
  return [
    { id: '1', priority: 'high', title: 'Scale capacity for projected demand surge', description: 'Forecast shows demand increasing significantly over the next 3 periods. Ensure resources and capacity can handle the projected volume.', impact: '+15% throughput' },
    { id: '2', priority: 'high', title: 'Investigate recent variance from forecast', description: 'Actual values have diverged from predictions — review data inputs and external factors that may be driving the gap.', impact: 'Improved accuracy' },
    { id: '3', priority: 'medium', title: 'Optimize resource allocation for peak period', description: 'The forecast identifies a peak demand window. Pre-position resources and adjust scheduling to meet it efficiently.', impact: '-12% cost' },
    { id: '4', priority: 'medium', title: 'Extend forecast horizon with additional data', description: 'Uploading more historical data points will improve model confidence and extend reliable prediction range.', impact: '+2 month horizon' },
    { id: '5', priority: 'low', title: 'Review and update baseline assumptions', description: 'Periodic recalibration of baseline values ensures the model stays aligned with current operating conditions.', impact: 'Better calibration' },
  ];
}
