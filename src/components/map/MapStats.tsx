import { motion } from 'framer-motion';
import { Activity, Users, Zap, Clock, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapStatsProps {
  facilities: number;
  deserts: number;
  coverage: number;
  avgDistance: number;
}

export function MapStats({ facilities, deserts, coverage, avgDistance }: MapStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]"
    >
      <div className={cn(
        'flex items-center gap-1 px-2 py-2',
        'bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95',
        'backdrop-blur-xl rounded-full',
        'border border-slate-700/50',
        'shadow-2xl shadow-black/50'
      )}
      style={{
        boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 212, 255, 0.1)',
      }}
      >
        <StatPill 
          icon={<Activity className="w-3.5 h-3.5" />}
          value={facilities}
          label="Active"
          color="cyan"
        />
        <Divider />
        <StatPill 
          icon={<Zap className="w-3.5 h-3.5" />}
          value={deserts}
          label="Gaps"
          color="red"
        />
        <Divider />
        <StatPill 
          icon={<Shield className="w-3.5 h-3.5" />}
          value={`${coverage}%`}
          label="Coverage"
          color="green"
        />
        <Divider />
        <StatPill 
          icon={<Clock className="w-3.5 h-3.5" />}
          value={`${avgDistance}km`}
          label="Avg Dist"
          color="purple"
        />
        
        {/* AI Status Indicator */}
        <div className="ml-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">AI Ready</span>
        </div>
      </div>
    </motion.div>
  );
}

function StatPill({ 
  icon, value, label, color 
}: { 
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: 'cyan' | 'red' | 'green' | 'purple';
}) {
  const colors = {
    cyan: 'text-cyan-400',
    red: 'text-red-400',
    green: 'text-emerald-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <div className={cn('opacity-70', colors[color])}>{icon}</div>
      <div>
        <div className={cn('text-sm font-bold', colors[color])}>{value}</div>
        <div className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-600 to-transparent" />;
}