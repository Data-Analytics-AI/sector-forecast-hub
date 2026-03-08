import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, BarChart3, ArrowLeft, Clock, Database, Upload, Plug, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  name: string;
  source_type: string;
  source_label: string | null;
  file_path: string | null;
  status: string;
  created_at: string;
}

const sourceIcon: Record<string, typeof FileText> = {
  csv: Upload,
  api: Plug,
  database: Database,
};

export default function MyReports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      fetchReports();
    };
    checkAuth();
  }, [navigate]);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('id, name, source_type, source_label, file_path, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading reports', description: error.message, variant: 'destructive' });
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast({ title: 'Report deleted' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">ForecastIQ</span>
          </Link>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </nav>

      <div className="max-w-[1280px] mx-auto px-6 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Reports</h1>
          <p className="text-muted-foreground mt-1">All your uploaded files and processed forecasts</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No reports yet</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Upload data or run a forecast from the dashboard to see your reports here.
            </p>
            <Button className="gap-2 mt-2" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {reports.map((report, i) => {
                const Icon = sourceIcon[report.source_type] || FileText;
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card p-4 flex items-center gap-4 group hover:border-primary/40 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{report.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground capitalize">{report.source_type}</span>
                        {report.source_label && (
                          <span className="text-xs text-muted-foreground">· {report.source_label}</span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        report.status === 'completed'
                          ? 'bg-chart-up/15 text-chart-up'
                          : 'bg-primary/15 text-primary'
                      }`}
                    >
                      {report.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => handleDelete(report.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
