import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3, TrendingUp, Package, Clock, DollarSign,
  Upload, Plug, Database, LineChart, Truck,
  ArrowRight, BookOpen, LifeBuoy, Mail,
  Activity, Target, Boxes, Zap,
  LayoutDashboard, FileText, User, LogIn, LogOut, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateForecastData } from '@/data/demoData';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Reports', href: '/dashboard', icon: FileText },
];

const kpis = [
  { icon: Package, label: 'Inventory Levels', value: '24.8K', change: +3.2, unit: 'units' },
  { icon: Target, label: 'Forecast Accuracy', value: '94.2%', change: +1.8, unit: '' },
  { icon: Clock, label: 'Avg Lead Time', value: '4.3 days', change: -12.5, unit: '' },
  { icon: DollarSign, label: 'Cost Savings', value: '$1.2M', change: +22.4, unit: 'YTD' },
];

const quickActions = [
  { icon: Upload, label: 'Upload Data', description: 'Import CSV or Excel files', color: 'bg-primary/15 text-primary', href: '/upload-data' },
  { icon: Plug, label: 'Connect API', description: 'Link external data sources', color: 'bg-primary/15 text-primary', href: '/connect-api' },
  { icon: Database, label: 'Connect Database', description: 'Direct database integration', color: 'bg-primary/15 text-primary', href: '/connect-database' },
  { icon: LineChart, label: 'Generate Forecast', description: 'Run predictive models', color: 'bg-primary/15 text-primary', href: '/dashboard' },
  { icon: Truck, label: 'Optimize Logistics', description: 'Route & inventory optimization', color: 'bg-primary/15 text-primary', href: '/dashboard' },
];

const Index = () => {
  const navigate = useNavigate();
  const chartData = useMemo(() => generateForecastData('general', 6), []);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">ForecastIQ</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/60 flex items-center gap-1.5"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                to="/my-reports"
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/60 flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                My Reports
              </Link>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 font-semibold">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {isLoggedIn && (
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/my-reports')}>
                  <FileText className="w-4 h-4" />
                  My Reports
                </DropdownMenuItem>
              )}
              {!isLoggedIn ? (
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/auth')}>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-destructive"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setIsLoggedIn(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 hero-grid-bg opacity-40" />
        <div className="absolute inset-0 hero-radial" />

        <div className="relative max-w-[1280px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left – Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                <Activity className="w-3.5 h-3.5" />
                AI-Powered Supply Chain Intelligence
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                <span className="gradient-text-hero">Predict demand.</span>
                <br />
                <span className="text-foreground">Optimize supply.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Transform your supply chain with AI-driven forecasting and optimization.
                Reduce costs, improve accuracy, and make data-driven decisions — all in one platform.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  size="lg"
                  className="gap-2 font-semibold glow-primary text-base px-8"
                  onClick={() => document.getElementById('quick-actions')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Zap className="w-4 h-4" />
                  Run Forecast
                </Button>
              </div>
            </motion.div>

            {/* Right – Mini chart visualization */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="relative"
            >
              <div className="glass-card p-6 glow-primary-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Demand Forecast</span>
                  </div>
                  <span className="text-xs font-mono text-primary">Live Preview</span>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.slice(0, 18)}>
                      <defs>
                        <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(174 60% 40%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(174 60% 40%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="period" hide />
                      <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                      <Area
                        type="monotone"
                        dataKey="upper"
                        stroke="none"
                        fill="hsl(174 60% 40% / 0.08)"
                        fillOpacity={1}
                      />
                      <Area
                        type="monotone"
                        dataKey="forecast"
                        stroke="hsl(174 60% 40%)"
                        strokeWidth={2}
                        fill="url(#heroGradient)"
                        fillOpacity={1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>Historical</span>
                  <span className="text-primary font-medium">→ Predicted</span>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
                className="absolute -bottom-4 -left-4 glass-card px-4 py-2.5 flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-chart-up/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 kpi-up" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">+18.3%</p>
                  <p className="text-[10px] text-muted-foreground">Accuracy Improvement</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── KPI Metrics Snapshot ── */}
      <section className="py-16 border-t border-border/30">
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Real-Time Metrics</h2>
            <p className="text-muted-foreground text-sm">Click any card to dive deeper into your supply chain data</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Link to="/dashboard">
                  <div className="glass-card p-5 group hover:border-primary/40 transition-all duration-300 hover:glow-primary cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <kpi.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className={`text-xs font-mono font-semibold ${kpi.change > 0 ? 'kpi-up' : 'kpi-down'}`}>
                        {kpi.change > 0 ? '+' : ''}{kpi.change}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground font-mono">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.label} {kpi.unit && <span className="text-muted-foreground/60">· {kpi.unit}</span>}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section id="quick-actions" className="py-16 border-t border-border/30">
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Quick Actions</h2>
            <p className="text-muted-foreground text-sm">Get started in seconds with common workflows</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Link to={action.href}>
                  <div className="glass-card p-5 text-center group hover:border-primary/40 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Strip ── */}
      <section className="py-16 border-t border-border/30">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Boxes, title: 'Demand Sensing', desc: 'Machine-learning models that adapt to real-time signals, seasonal shifts, and market changes.' },
              { icon: Activity, title: 'Anomaly Detection', desc: 'Automated alerts when patterns deviate — catch disruptions before they cascade.' },
              { icon: Truck, title: 'Route Optimization', desc: 'Minimize transit costs and lead times with intelligent logistics planning.' },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="glass-card p-6 space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feat.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-12">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-bold text-foreground">ForecastIQ</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI-powered supply chain intelligence for modern enterprises.
              </p>
            </div>

            {/* Links */}
            {[
              { title: 'Product', links: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Forecasts', href: '/dashboard' }, { label: 'Optimization', href: '/dashboard' }] },
              { title: 'Resources', links: [{ label: 'Documentation', icon: BookOpen }, { label: 'Support', icon: LifeBuoy }, { label: 'API Reference', icon: Plug }] },
              { title: 'Company', links: [{ label: 'About', icon: null }, { label: 'Contact', icon: Mail }, { label: 'Privacy', icon: null }] },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">{group.title}</h4>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {'href' in link ? (
                        <Link to={link.href as string} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                          {link.label}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          {link.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border/30 mt-8 pt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} ForecastIQ. All rights reserved.</span>
            <span className="font-mono text-primary/60">v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
