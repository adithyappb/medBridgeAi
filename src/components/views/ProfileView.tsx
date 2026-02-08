import { motion } from 'framer-motion';
import {
  UserCircle2, Globe2, Clock, Activity, Shield, MapPin, Calendar, LogOut, Sparkles, Zap, Network
} from 'lucide-react';
import { useCountry, useFacilityStats } from '@/hooks/useFacilityData';
import { COUNTRY_REGISTRY } from '@/lib/countryConfig';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function ProfileView() {
  const { country } = useCountry();
  const { stats } = useFacilityStats();
  const countryName = COUNTRY_REGISTRY[country].name;
  const navigate = useNavigate();
  const sessionStart = new Date().toLocaleTimeString();

  const profileStats = [
    { icon: Activity, label: 'Facilities Analyzed', value: stats.totalFacilities.toString(), color: 'cyan' },
    { icon: MapPin, label: 'Regions Covered', value: stats.totalRegions.toString(), color: 'green' },
    { icon: Globe2, label: 'Active Dataset', value: countryName, color: 'purple' },
    { icon: Clock, label: 'Session Started', value: sessionStart, color: 'orange' },
  ];

  return (
    <div className="h-full flex flex-col p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      style={{ backgroundImage: 'radial-gradient(ellipse at top left, rgba(0, 212, 255, 0.03) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.03) 0%, transparent 50%)' }}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-900/20">
              <UserCircle2 className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Guest Profile</h1>
            <p className="text-slate-400 font-medium mt-1">Anonymous session • <span className="text-emerald-400">Privacy Protected</span></p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-medium hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Exit Session
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-cyan-500/30 group-hover:scale-110 transition-transform duration-500">
                <UserCircle2 className="w-14 h-14 text-cyan-400" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-[spin_10s_linear_infinite]" />
              <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1">
                <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse border-2 border-slate-900" />
              </div>
            </div>

            <h2 className="font-bold text-2xl text-white mb-1 tracking-tight">Guest User</h2>
            <p className="text-sm text-slate-400 mb-6 font-medium">Healthcare Intelligence Access</p>

            <div className="w-full space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between group-hover:border-cyan-500/30 transition-colors">
                <span className="text-xs text-slate-400">Status</span>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Network className="w-3 h-3" />
                  <span>CONNECTED</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between group-hover:border-emerald-500/30 transition-colors">
                <span className="text-xs text-slate-400">Security</span>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Shield className="w-3 h-3" />
                  <span>ENCRYPTED</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Session Activity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profileStats.map((stat, index) => {
              const colors = { cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30', orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}
                  className={cn('p-4 rounded-xl border', colors[stat.color as keyof typeof colors])}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-slate-800/50 to-purple-500/5 border border-cyan-500/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-2">MedBridge-AI Mission</h3>
                <p className="text-slate-400">You're part of a global movement to ensure healthcare reaches every person. By analyzing facility data, you're helping identify gaps and drive actionable change.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}