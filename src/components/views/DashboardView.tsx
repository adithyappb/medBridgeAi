import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, AlertTriangle, Users, Activity, MapPin, TrendingDown,
  Loader2, Stethoscope, FileSearch, Zap, Network, Sparkles, Shield,
  ArrowRight, BarChart3, Globe, Terminal, Cpu
} from 'lucide-react';
import { useFacilityData, useFacilityStats, useCountry } from '@/hooks/useFacilityData';
import { COUNTRY_REGISTRY } from '@/lib/countryConfig';
import { cn } from '@/lib/utils';
import { AgenticView } from './AgenticView';
import { DashboardMapWrapper } from '@/components/map/DashboardMapWrapper';

interface DashboardViewProps {
  onViewChange: (view: string) => void;
}

export function DashboardView({ onViewChange }: DashboardViewProps) {
  const { facilities, regionStats, medicalDeserts, isLoading } = useFacilityData();
  const { stats } = useFacilityStats();
  const { country } = useCountry();
  const [isAgentMode, setIsAgentMode] = useState(false);
  const countryConfig = COUNTRY_REGISTRY[country] || COUNTRY_REGISTRY.GH;

  const criticalFacilities = facilities.filter(f => f.status === 'critical' || f.status === 'limited');

  if (isAgentMode) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsAgentMode(false)}
          className="absolute top-4 right-4 z-50 bg-red-900/80 text-white px-4 py-2 text-xs font-mono border border-red-500 hover:bg-red-800"
        >
          EXIT_AGENT_MODE
        </button>
        <AgenticView />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-950">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <Globe className="absolute inset-0 m-auto w-6 h-6 text-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at top left, rgba(0, 212, 255, 0.03) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.03) 0%, transparent 50%)
        `,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-900/20">
              <span className="text-4xl">{countryConfig.flag}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              {countryConfig.name}
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 tracking-wider">
                LIVE
              </span>
            </h1>
            <p className="text-slate-400 font-medium mt-1">
              Healthcare Intelligence Hub • <span className="text-slate-300">{stats.totalFacilities.toLocaleString()} Active Nodes</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAgentMode(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/80 border border-green-500/30 text-green-400 hover:text-green-300 hover:border-green-400/50 shadow-lg shadow-green-900/20 font-mono text-sm transition-all"
          >
            <Terminal className="w-4 h-4" />
            <span className="hidden md:inline">AGENT_MODE</span>
          </motion.button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-400">System Online</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<Building2 className="w-6 h-6" />}
          title="Total Facilities"
          value={stats.totalFacilities.toLocaleString()}
          subtitle={`${stats.totalHospitals} hospitals • ${stats.totalClinics} clinics`}
          color="cyan"
        />
        <MetricCard
          icon={<AlertTriangle className="w-6 h-6" />}
          title="Medical Deserts"
          value={stats.medicalDesertCount}
          subtitle="Low coverage regions"
          color="red"
          pulse
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="Population at Risk"
          value={stats.populationAtRisk >= 1000000 ? `${(stats.populationAtRisk / 1000000).toFixed(1)}M` : `${(stats.populationAtRisk / 1000).toFixed(0)}K`}
          subtitle="In underserved areas"
          color="orange"
        />
        <MetricCard
          icon={<Activity className="w-6 h-6" />}
          title="Coverage Score"
          value={`${stats.averageCoverageScore}%`}
          subtitle={`${stats.uniqueSpecialties} unique specialties`}
          color="green"
        />
      </div>

      {/* AI Command Center Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-purple-500/30 p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-1">
                AI Intelligence Agent
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 uppercase tracking-widest">
                  GPT-4o Integration
                </span>
              </h3>
              <p className="text-slate-400 max-w-lg">
                Access real-time insights from {stats.facilitiesWithEquipment} equipment nodes and {stats.facilitiesWithProcedures} procedure records.
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewChange('agent')}
            className="flex items-center gap-3 px-6 py-4 rounded-xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-500 transition-colors"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>Launch Agent</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Coverage */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Regional Network</h2>
            </div>
            <button
              onClick={() => onViewChange('map')}
              className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>View Neural Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {/* Live Coverage Map & AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <Activity className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Live Coverage Map</h2>
                </div>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> OPTIMAL
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> CRITICAL
                  </span>
                </div>
              </div>

              {/* Live Interactive Map */}
              <div className="relative h-64 w-full bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden">
                <DashboardMapWrapper />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {regionStats.slice(0, 4).map((region) => (
                  <div key={region.name} className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-xs text-slate-400">{region.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", region.coverageScore > 75 ? "bg-emerald-500" : region.coverageScore > 50 ? "bg-yellow-500" : "bg-red-500")}
                          style={{ width: `${region.coverageScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-white">{region.coverageScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Alerts & Critical Sidebar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  <h2 className="text-lg font-semibold text-white">Attention Needed</h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                  {criticalFacilities.length}
                </span>
              </div>

              {/* Critical Facilities List */}
              <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 divide-y divide-slate-700/50 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                {criticalFacilities.slice(0, 5).map((facility) => (
                  <div
                    key={facility.id}
                    onClick={() => onViewChange('facilities')}
                    className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white text-sm truncate flex-1">{facility.name}</span>
                      <span className={cn(
                        'ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase',
                        facility.status === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                      )}>
                        {facility.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {[facility.address.city, facility.address.stateOrRegion].filter(Boolean).join(', ') || 'Unknown location'}
                    </p>
                  </div>
                ))}
                {criticalFacilities.length === 0 && (
                  <div className="p-6 text-center">
                    <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">All facilities operational</p>
                  </div>
                )}
              </div>

              {/* Medical Desert Alert */}
              {medicalDeserts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30"
                  style={{ boxShadow: '0 0 30px rgba(239, 68, 68, 0.1)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-400">Coverage Gaps Detected</h3>
                      <p className="text-sm text-red-400/80 mt-1">
                        {medicalDeserts.length} desert zones identified. {stats.medicalDesertCount} facilities in at-risk areas.
                      </p>
                      <button
                        onClick={() => onViewChange('agent')}
                        className="mt-3 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <span>Analyze with AI</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Top Specialties */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className="w-4 h-4 text-purple-400" />
                  <h3 className="font-medium text-white text-sm">Top Specialties</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Internal Medicine', 'OB-GYN', 'Pediatrics', 'Ophthalmology', 'Dentistry'].map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div> {/* Closes Alerts & Critical Sidebar (space-y-4) */}
          </div> {/* Closes Live Coverage Map & AI Insights grid */}
        </div> {/* Closes Regional Coverage (lg:col-span-2 space-y-4) */}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon, title, value, subtitle, color, pulse
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color: 'cyan' | 'green' | 'red' | 'orange';
  pulse?: boolean;
}) {
  const colors = {
    cyan: { bg: 'from-cyan-500/10 to-cyan-500/5', border: 'border-cyan-500/30', text: 'text-cyan-400', shadow: 'rgba(0,212,255,0.1)' },
    green: { bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/30', text: 'text-emerald-400', shadow: 'rgba(34,197,94,0.1)' },
    red: { bg: 'from-red-500/10 to-red-500/5', border: 'border-red-500/30', text: 'text-red-400', shadow: 'rgba(239,68,68,0.1)' },
    orange: { bg: 'from-orange-500/10 to-orange-500/5', border: 'border-orange-500/30', text: 'text-orange-400', shadow: 'rgba(245,158,11,0.1)' },
  };

  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-5 rounded-2xl bg-gradient-to-br border backdrop-blur-xl',
        c.bg, c.border
      )}
      style={{ boxShadow: `0 0 30px ${c.shadow}` }}
    >
      <div className="flex items-center gap-4">
        <div className={cn('w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center', c.text)}>
          {icon}
        </div>
        <div>
          <p className={cn('text-3xl font-bold text-white', pulse && 'animate-pulse')}>{value}</p>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}