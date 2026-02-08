import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/views/DashboardView';
import { MapView } from '@/components/views/MapView';
import { AgentView } from '@/components/views/AgentView';
import { FacilitiesView } from '@/components/views/FacilitiesView';

import { ProfileView } from '@/components/views/ProfileView';
import { SettingsView } from '@/components/views/SettingsView';
import { OptimizerView } from '@/components/optimizer/OptimizerView';

import { ExportPanel } from '@/components/ExportPanel';
import { useCountry } from '@/hooks/useFacilityData';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { User, Settings as SettingsIcon } from 'lucide-react';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const location = useLocation();
  const { country } = useCountry();

  useEffect(() => {
    const state = location.state as { view?: string };
    if (state?.view) {
      setActiveView(state.view);
    }
  }, [location.state]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onViewChange={setActiveView} />;
      case 'map':
        return <MapView />;
      case 'optimizer':
        return <OptimizerView />;
      case 'agent':
        return <AgentView />;
      case 'facilities':
        return <FacilitiesView />;

      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(255, 255, 255, 0.03) 0%, transparent 50%)
        `,
      }}
    >
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-1 overflow-auto">
        {/* Futuristic Top Bar */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
                <span className="text-cyan-400 font-bold text-sm">M</span>
              </div>
              <h1 className="text-lg font-bold text-white">MedBridge-AI</h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-medium border border-cyan-500/30 uppercase tracking-wider">
                Intelligence Platform
              </span>
            </div>
            <div className="h-6 w-px bg-slate-700/50" />
            {/* Country Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <span className="text-slate-400 text-sm">Country:</span>
              <span className="text-cyan-400 font-semibold text-sm">🇬🇭 Ghana</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ExportPanel country={country} />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-cyan-500/50 transition-all duration-300"
                onClick={() => setActiveView('profile')}
              >
                <User className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-cyan-500/50 transition-all duration-300"
                onClick={() => setActiveView('settings')}
              >
                <SettingsIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-57px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeView}-${country}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Index;
