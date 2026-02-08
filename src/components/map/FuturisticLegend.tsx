import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Activity, Radio, Zap, Eye, EyeOff, 
  ChevronRight, Sparkles, AlertTriangle, Building2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAP_COLORS } from '@/lib/map/colors';

interface FuturisticLegendProps {
  showFacilities: boolean;
  showDeserts: boolean;
  showNetwork: boolean;
  onToggleFacilities: (show: boolean) => void;
  onToggleDeserts: (show: boolean) => void;
  onToggleNetwork: (show: boolean) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  stats: {
    totalFacilities: number;
    hospitals: number;
    clinics: number;
    healthCenters: number;
    deserts: number;
    criticalDeserts: number;
  };
}

const FACILITY_TYPES = [
  { id: 'all', label: 'All Facilities', icon: '🏥', color: '#00d4ff' },
  { id: 'hospital', label: 'Hospitals', icon: '🏥', color: MAP_COLORS.hospital },
  { id: 'clinic', label: 'Clinics', icon: '🏨', color: MAP_COLORS.clinic },
  { id: 'health_center', label: 'Health Centers', icon: '⚕️', color: MAP_COLORS.health_center },
  { id: 'pharmacy', label: 'Pharmacies', icon: '💊', color: MAP_COLORS.pharmacy },
];

export function FuturisticLegend({
  showFacilities,
  showDeserts,
  showNetwork,
  onToggleFacilities,
  onToggleDeserts,
  onToggleNetwork,
  selectedType,
  onTypeChange,
  stats,
}: FuturisticLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'absolute top-4 left-4 z-[1000]',
        'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95',
        'backdrop-blur-xl rounded-2xl',
        'border border-cyan-500/20',
        'shadow-2xl shadow-black/50',
        isExpanded ? 'w-80' : 'w-auto'
      )}
      style={{
        boxShadow: '0 0 40px rgba(0, 212, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors rounded-2xl"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-sm font-semibold text-white">Neural Map</h3>
          <p className="text-xs text-slate-400">AI-Powered Visualization</p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Live Stats Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/30 border border-slate-700/50">
                <StatBox 
                  label="Facilities" 
                  value={stats.totalFacilities} 
                  color="cyan"
                  icon={<Building2 className="w-3 h-3" />}
                />
                <StatBox 
                  label="Deserts" 
                  value={stats.deserts} 
                  color="red"
                  icon={<AlertTriangle className="w-3 h-3" />}
                />
                <StatBox 
                  label="Critical" 
                  value={stats.criticalDeserts} 
                  color="orange"
                  icon={<Zap className="w-3 h-3" />}
                  pulse
                />
              </div>

              {/* Layer Controls */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Active Layers
                </p>
                <LayerToggle
                  active={showFacilities}
                  onToggle={onToggleFacilities}
                  label="Healthcare Network"
                  description="Facilities & Infrastructure"
                  color="cyan"
                  icon={<Radio className="w-4 h-4" />}
                />
                <LayerToggle
                  active={showDeserts}
                  onToggle={onToggleDeserts}
                  label="Coverage Gaps"
                  description="Medical Desert Zones"
                  color="red"
                  icon={<AlertTriangle className="w-4 h-4" />}
                />
                <LayerToggle
                  active={showNetwork}
                  onToggle={onToggleNetwork}
                  label="Neural Links"
                  description="Facility Connections"
                  color="purple"
                  icon={<Activity className="w-4 h-4" />}
                />
              </div>

              {/* Facility Type Filter */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  Filter by Type
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {FACILITY_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => onTypeChange(type.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-200',
                        selectedType === type.id
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-white'
                          : 'bg-slate-800/50 border border-slate-700/30 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                      )}
                      style={selectedType === type.id ? { boxShadow: `0 0 15px ${type.color}30` } : {}}
                    >
                      <span>{type.icon}</span>
                      <span className="truncate">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Legend */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  Visual Encoding
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <LegendItem color={MAP_COLORS.hospital} label="Hospital" glow />
                  <LegendItem color={MAP_COLORS.clinic} label="Clinic" glow />
                  <LegendItem color={MAP_COLORS.health_center} label="Health Ctr" glow />
                  <LegendItem color={MAP_COLORS.pharmacy} label="Pharmacy" glow />
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-2" />
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <LegendItem color={MAP_COLORS.desertHigh} label="Critical" dashed />
                  <LegendItem color={MAP_COLORS.desertMedium} label="High" dashed />
                  <LegendItem color={MAP_COLORS.desertLow} label="Moderate" dashed />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatBox({ 
  label, value, color, icon, pulse 
}: { 
  label: string; 
  value: number; 
  color: 'cyan' | 'red' | 'orange'; 
  icon: React.ReactNode;
  pulse?: boolean;
}) {
  const colors = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    red: 'text-red-400 bg-red-500/10 border-red-500/30',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  };

  return (
    <div className={cn(
      'text-center py-2 rounded-lg border',
      colors[color],
      pulse && 'animate-pulse'
    )}>
      <div className="flex items-center justify-center gap-1 mb-0.5">
        {icon}
        <span className="text-lg font-bold">{value}</span>
      </div>
      <span className="text-[9px] uppercase tracking-wider opacity-70">{label}</span>
    </div>
  );
}

function LayerToggle({ 
  active, onToggle, label, description, color, icon 
}: {
  active: boolean;
  onToggle: (v: boolean) => void;
  label: string;
  description: string;
  color: 'cyan' | 'red' | 'purple';
  icon: React.ReactNode;
}) {
  const glowColors = {
    cyan: 'shadow-cyan-500/30 border-cyan-500/50',
    red: 'shadow-red-500/30 border-red-500/50',
    purple: 'shadow-purple-500/30 border-purple-500/50',
  };

  return (
    <button
      onClick={() => onToggle(!active)}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
        active 
          ? `bg-gradient-to-r from-${color}-500/10 to-transparent border shadow-lg ${glowColors[color]}` 
          : 'bg-slate-800/30 border border-slate-700/30 opacity-60 hover:opacity-100'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
        active 
          ? `bg-${color}-500/20 text-${color}-400` 
          : 'bg-slate-700/50 text-slate-500'
      )}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className={cn('text-sm font-medium', active ? 'text-white' : 'text-slate-400')}>{label}</p>
        <p className="text-[10px] text-slate-500">{description}</p>
      </div>
      {active ? (
        <Eye className="w-4 h-4 text-slate-400" />
      ) : (
        <EyeOff className="w-4 h-4 text-slate-600" />
      )}
    </button>
  );
}

function LegendItem({ 
  color, label, glow, dashed 
}: { 
  color: string; 
  label: string; 
  glow?: boolean; 
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'w-3 h-3 rounded-full',
          dashed && 'border-2 border-dashed bg-transparent'
        )}
        style={{
          backgroundColor: dashed ? 'transparent' : color,
          borderColor: dashed ? color : 'transparent',
          boxShadow: glow ? `0 0 10px ${color}80` : 'none',
        }}
      />
      <span className="text-slate-400">{label}</span>
    </div>
  );
}