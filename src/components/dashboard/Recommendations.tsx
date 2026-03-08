import { motion } from 'framer-motion';
import { ArrowRight, Zap, Loader2, RefreshCw, Upload, Globe, Database } from 'lucide-react';
import { type ForecastPoint } from '@/data/demoData';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface AIRecommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  details: string;
  impact: string;
}

interface AIRecommendationsResponse {
  recommendations: AIRecommendation[];
  summary: {
    expected_benefits: string;
    optimization_focus: string;
  };
}

interface RecommendationsProps {
  industryId: string;
  customData?: ForecastPoint[];
}

const priorityStyles = {
  high: 'border-l-destructive bg-destructive/5',
  medium: 'border-l-primary bg-primary/5',
  low: 'border-l-muted-foreground bg-muted/30',
};

const priorityBadge = {
  high: 'bg-destructive/20 text-destructive',
  medium: 'bg-primary/20 text-primary',
  low: 'bg-muted text-muted-foreground',
};

export default function Recommendations({ industryId, customData }: RecommendationsProps) {
  const [recs, setRecs] = useState<AIRecommendation[]>([]);
  const [summary, setSummary] = useState<AIRecommendationsResponse['summary'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const hasData = customData && customData.length > 0;

  const fetchRecommendations = useCallback(async () => {
    if (!hasData) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recommendations', {
        body: {
          forecastData: customData || [],
          industryId,
          extraFields: [],
        },
      });

      if (error) throw error;

      const response = data as AIRecommendationsResponse;
      setRecs(response.recommendations || []);
      setSummary(response.summary || null);
      setHasLoaded(true);
    } catch (e: any) {
      console.error('Failed to fetch recommendations:', e);
      toast.error(e?.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  }, [industryId, customData, hasData]);

  useEffect(() => {
    if (hasData) {
      fetchRecommendations();
    } else {
      setRecs([]);
      setSummary(null);
      setHasLoaded(false);
    }
  }, [fetchRecommendations, hasData]);

  const dataSourceOptions = [
    { icon: Upload, label: 'Upload CSV/Excel', description: 'Upload a file from your device', href: '/upload' },
    { icon: Globe, label: 'Connect API', description: 'Pull data from a REST or GraphQL endpoint', href: '/connect-api' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">AI Optimization Recommendations</h2>
        </div>
        {hasData && (
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            title="Regenerate recommendations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {!hasData ? (
        <div className="py-8">
          <p className="text-sm text-muted-foreground text-center mb-6">
            No forecast data available. Connect a data source to generate optimization recommendations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dataSourceOptions.map((opt) => (
              <Link
                key={opt.href}
                to={opt.href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <opt.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">{opt.description}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : loading && !hasLoaded ? (
        <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Analyzing forecast patterns…</span>
        </div>
      ) : (
        <>
          {summary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10"
            >
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Focus:</span> {summary.optimization_focus}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">Expected benefits:</span> {summary.expected_benefits}
              </p>
            </motion.div>
          )}

          <div className="space-y-3">
            {recs.map((rec, i) => (
              <motion.div
                key={`${rec.action}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className={`border-l-2 rounded-r-lg p-4 ${priorityStyles[rec.priority]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${priorityBadge[rec.priority]}`}>
                        {rec.priority}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground truncate">{rec.action}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rec.details}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-primary shrink-0">
                    {rec.impact}
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
