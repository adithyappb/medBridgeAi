import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Database, 
  Brain, 
  Globe2, 
  FileText, 
  Download,
  RefreshCcw,
  Check,
  Cpu,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useCountry, useFacilityStats } from '@/hooks/useFacilityData';
import { COUNTRY_REGISTRY, CountryCode } from '@/lib/countryConfig';
import { cn } from '@/lib/utils';

type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

const AI_MODELS: AIModel[] = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'Google', description: 'Fast & efficient' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', description: 'Best reasoning' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', description: 'Balanced performance' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', description: 'Fast & capable' },
  { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI', description: 'Most powerful' },
];

export function SettingsView() {
  const { country, changeCountry } = useCountry();
  const { stats } = useFacilityStats();
  const countryName = COUNTRY_REGISTRY[country].name;
  
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-3-flash-preview');
  const [autoExport, setAutoExport] = useState(false);

  const datasetInfo = {
    name: `${countryName} Healthcare Facilities`,
    file: `${country.toLowerCase()}-facilities.csv`,
    records: stats.totalFacilities,
    lastUpdated: 'Current Session',
  };

  const SettingSection = ({ 
    icon: Icon, 
    title, 
    description, 
    children,
    accentColor = 'cyan'
  }: { 
    icon: React.ElementType; 
    title: string; 
    description: string; 
    children: React.ReactNode;
    accentColor?: 'cyan' | 'purple' | 'green' | 'orange';
  }) => {
    const colors = {
      cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
      purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
      green: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
      orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-400',
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50',
          'backdrop-blur-xl'
        )}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 border',
            colors[accentColor]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
        </div>
        {children}
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
            <Settings className="w-7 h-7 text-cyan-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            System Configuration
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/30">
              ADVANCED
            </span>
          </h1>
          <p className="text-slate-400 mt-0.5">
            Configure analysis preferences, data sources, and AI models
          </p>
        </div>
      </div>

      <div className="space-y-6 pb-8">
        {/* Current Dataset */}
        <SettingSection
          icon={Database}
          title="Active Dataset"
          description="Currently loaded healthcare facility data"
          accentColor="cyan"
        >
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Dataset</p>
                <p className="font-medium text-white">{datasetInfo.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Source File</p>
                <p className="font-medium text-cyan-400 font-mono text-sm">{datasetInfo.file}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Records</p>
                <p className="font-medium text-white">{datasetInfo.records.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Status</p>
                <p className="font-medium text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </p>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Country Selection */}
        <SettingSection
          icon={Globe2}
          title="Geographic Region"
          description="Select the country focus for healthcare analysis"
          accentColor="green"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(COUNTRY_REGISTRY).map(([code, config]) => (
              <button
                key={code}
                onClick={() => changeCountry(code as CountryCode)}
                className={cn(
                  'p-4 rounded-xl border transition-all duration-200 text-left',
                  country === code
                    ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn('font-medium', country === code ? 'text-cyan-400' : 'text-white')}>{config.name}</p>
                    <p className="text-xs text-slate-400">{config.code}</p>
                  </div>
                  {country === code && <Check className="w-5 h-5 text-cyan-400" />}
                </div>
              </button>
            ))}
          </div>
        </SettingSection>

        {/* AI Model Selection */}
        <SettingSection
          icon={Brain}
          title="Neural Network Model"
          description="Select the AI backbone for analysis and agent queries"
          accentColor="purple"
        >
          <div className="space-y-2">
            {AI_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={cn(
                  'w-full p-4 rounded-xl border transition-all duration-200 text-left flex items-center justify-between',
                  selectedModel === model.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-purple-500/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    model.provider === 'Google' ? 'bg-cyan-500/10' : 'bg-emerald-500/10'
                  )}>
                    <Cpu className={cn(
                      'w-5 h-5',
                      model.provider === 'Google' ? 'text-cyan-400' : 'text-emerald-400'
                    )} />
                  </div>
                  <div>
                    <p className={cn('font-medium', selectedModel === model.id ? 'text-purple-400' : 'text-white')}>{model.name}</p>
                    <p className="text-xs text-slate-400">{model.provider} • {model.description}</p>
                  </div>
                </div>
                {selectedModel === model.id && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <Check className="w-5 h-5 text-purple-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Export Settings */}
        <SettingSection
          icon={Download}
          title="Export Configuration"
          description="Configure how reports are generated and exported"
          accentColor="orange"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div>
                <p className="font-medium text-white">Auto-include timestamps</p>
                <p className="text-xs text-slate-400">Add analysis date to exported files</p>
              </div>
              <button
                onClick={() => setAutoExport(!autoExport)}
                className={cn(
                  'w-14 h-7 rounded-full transition-all duration-300 relative',
                  autoExport 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_15px_rgba(0,212,255,0.3)]' 
                    : 'bg-slate-700'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full bg-white absolute top-1 transition-transform duration-300 shadow-lg',
                  autoExport ? 'translate-x-8' : 'translate-x-1'
                )} />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white hover:border-cyan-500/30 transition-colors">
                <FileText className="w-4 h-4 text-cyan-400" />
                Export Analysis
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white hover:border-red-500/30 transition-colors">
                <RefreshCcw className="w-4 h-4 text-red-400" />
                Clear Session
              </button>
            </div>
          </div>
        </SettingSection>

        {/* App Info & Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-slate-800/50 to-purple-500/5 border border-cyan-500/20"
          style={{ boxShadow: '0 0 40px rgba(0, 212, 255, 0.05)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">MedBridge-AI</h3>
              <p className="text-sm text-slate-400">Version 1.0.0 • Healthcare Intelligence Platform</p>
            </div>
          </div>
          
          {/* Tech Stack */}
          <div className="pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Technology Stack</p>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Vite', 'Tailwind', 'Supabase', 'LangGraph', 'MLflow', 'RAG'].map((tech, i) => (
                <span 
                  key={tech}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border',
                    i % 3 === 0 ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                    i % 3 === 1 ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  )}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}