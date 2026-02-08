import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Building2, MapPin, AlertCircle, Loader2, Sparkles, Zap, Eye, Activity, Shield, ArrowRight } from 'lucide-react';
import { useFacilityData } from '@/hooks/useFacilityData';
import { cn } from '@/lib/utils';
import { FacilityDetailModal } from './FacilityDetailModal';
import type { Facility } from '@/types/facility';

const facilityTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'hospital', label: 'Hospitals' },
  { value: 'clinic', label: 'Clinics' },
  { value: 'pharmacy', label: 'Pharmacies' },
  { value: 'dentist', label: 'Dentists' },
];

const statusFilters = [
  { value: 'all', label: 'All Status' },
  { value: 'operational', label: 'Operational' },
  { value: 'limited', label: 'Limited' },
  { value: 'critical', label: 'Critical' },
  { value: 'unknown', label: 'Unknown' },
];

export function FacilitiesView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const { facilities, isLoading } = useFacilityData();

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const location = [facility.address.city, facility.address.stateOrRegion].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch =
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.includes(searchQuery.toLowerCase()) ||
        facility.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'all' || facility.facilityTypeId === typeFilter;
      const matchesStatus = statusFilter === 'all' || facility.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [facilities, searchQuery, typeFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: facilities.length,
    operational: facilities.filter(f => f.status === 'operational').length,
    limited: facilities.filter(f => f.status === 'limited').length,
    critical: facilities.filter(f => f.status === 'critical').length,
  }), [facilities]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-950">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <Building2 className="absolute inset-0 m-auto w-6 h-6 text-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at top left, rgba(0, 212, 255, 0.03) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.03) 0%, transparent 50%)
        `,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-900/20 group-hover:bg-cyan-500/20 transition-all duration-500">
              <Building2 className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-cyan-500/30 group-hover:ring-cyan-500/60 transition-all duration-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              Facility Registry
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/20 tracking-wider">
                LIVE NODES: {facilities.length}
              </span>
            </h1>
            <p className="text-slate-400 font-medium mt-2 text-lg">
              Healthcare Infrastructure Analysis & Real-time Status
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Activity className="w-6 h-6" />} value={stats.total} label="Total Nodes" color="cyan" delay={0} />
        <StatCard icon={<Shield className="w-6 h-6" />} value={stats.operational} label="Operational" color="green" delay={0.1} />
        <StatCard icon={<AlertCircle className="w-6 h-6" />} value={stats.limited} label="Limited Capacity" color="orange" delay={0.2} />
        <StatCard icon={<Zap className="w-6 h-6" />} value={stats.critical} label="Critical Status" color="red" delay={0.3} />
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col md:flex-row gap-4 p-1 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50"
      >
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, or specialty..."
            className="w-full pl-12 pr-4 py-4 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 p-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
          >
            {facilityTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
          >
            {statusFilters.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-400">
          Showing <span className="font-bold text-cyan-400">{filteredFacilities.length}</span> active facilities matches
        </p>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredFacilities.slice(0, 30).map((facility, index) => (
            <motion.div
              layout
              key={facility.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
            >
              <FuturisticFacilityCard
                facility={facility}
                onClick={() => setSelectedFacility(facility)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredFacilities.length > 30 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="text-sm text-slate-500 font-mono">
            // END OF PREVIEW // Showing 30 of {filteredFacilities.length} nodes
          </p>
        </motion.div>
      )}

      {filteredFacilities.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 rounded-3xl bg-slate-800/30 border border-slate-700/50 flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No facilities found</h3>
          <p className="text-slate-400">Adjust your search parameters to locate infrastructure nodes.</p>
        </motion.div>
      )}

      {/* Facility Detail Modal */}
      <AnimatePresence>
        {selectedFacility && (
          <FacilityDetailModal
            facility={selectedFacility}
            onClose={() => setSelectedFacility(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, value, label, color, delay }: { icon: React.ReactNode; value: number; label: string; color: 'cyan' | 'green' | 'orange' | 'red'; delay: number }) {
  const colors = {
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
    green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', glow: 'shadow-orange-500/10' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', glow: 'shadow-red-500/10' },
  };
  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        'p-5 rounded-2xl border backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300',
        c.bg, c.border, 'shadow-lg', c.glow
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-4 relative z-10">
        <div className={cn('p-3 rounded-xl bg-slate-900/50', c.text)}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function FuturisticFacilityCard({ facility, onClick }: { facility: Facility; onClick: () => void }) {
  const statusColors = {
    operational: 'from-emerald-900/10 to-emerald-900/5 border-emerald-500/20 hover:border-emerald-500/50',
    limited: 'from-orange-900/10 to-orange-900/5 border-orange-500/20 hover:border-orange-500/50',
    critical: 'from-red-900/10 to-red-900/5 border-red-500/20 hover:border-red-500/50',
    unknown: 'from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-slate-600/50',
  };

  const statusBadge = {
    operational: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    limited: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
    unknown: 'bg-slate-700/50 text-slate-400 border border-slate-600/50',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative p-5 rounded-2xl bg-gradient-to-br border cursor-pointer overflow-hidden backdrop-blur-md',
        statusColors[facility.status]
      )}
    >
      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-lg truncate group-hover:text-cyan-400 transition-colors">
              {facility.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {[facility.address.city, facility.address.stateOrRegion].filter(Boolean).join(', ') || 'Unknown Region'}
            </p>
          </div>
          <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', statusBadge[facility.status])}>
            {facility.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700 font-medium capitalize flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-cyan-500" />
            {facility.facilityTypeId?.replace('_', ' ') || 'Facility'}
          </span>
          {facility.dataQualityScore && (
            <span className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold border',
              facility.dataQualityScore >= 70 ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' :
                facility.dataQualityScore >= 40 ? 'bg-yellow-950/30 text-yellow-400 border-yellow-500/20' :
                  'bg-red-950/30 text-red-400 border-red-500/20'
            )}>
              DQ: {facility.dataQualityScore}%
            </span>
          )}
        </div>

        {facility.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {facility.specialties.slice(0, 3).map((spec, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-400 text-[10px] border border-slate-700/50">
                {spec.replace(/([A-Z])/g, ' $1').trim().slice(0, 15)}
              </span>
            ))}
            {facility.specialties.length > 3 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-500 text-[10px] border border-slate-700/50">
                +{facility.specialties.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-slate-800/50 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium group-hover:text-cyan-400 transition-colors">
            <Eye className="w-3.5 h-3.5" />
            <span>Analyze Node Data</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </div>
      </div>
    </div>
  );
}
