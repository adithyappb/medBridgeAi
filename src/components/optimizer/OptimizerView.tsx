import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Clock, Target, TrendingUp, AlertTriangle, ChevronDown, ChevronUp,
  Activity, MapPin, CheckCircle2, Loader2, Network, Shield,
  Building2, Navigation, AlertCircle, Award, Ruler, Cpu, Sparkles, Binary,
  Database, Server, Smartphone
} from 'lucide-react';
import { useFacilityData, useCountry } from '@/hooks/useFacilityData';
import {
  cleanFacilityData, optimizeNetwork,
  type OptimizationResult,
} from '@/lib/optimizer';
import { displayValue, displayNumber } from '@/lib/sanitize';
import { cn } from '@/lib/utils';
import { getStrategicInsights } from '@/core-logic/global-insights';
import { Coins, Globe } from 'lucide-react';

type AIModel = 'Standard' | 'Lightweight' | 'Edge';

import { ResearchAgent } from './ResearchAgent';

// ... (existing imports)

export function OptimizerView() {
  const { facilities, regionStats, isLoading: dataLoading } = useFacilityData();
  const { country } = useCountry();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // New state for agent
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [selectedModel, setSelectedModel] = useState<AIModel>('Lightweight');

  // ... (existing state)

  const runOptimization = async () => {
    // Start Research Agent first
    setIsSearching(true);
  };

  const finishResearch = async () => {
    setIsSearching(false);
    setIsOptimizing(true);

    // Simulate inference time based on model
    const delay = selectedModel === 'Lightweight' ? 600 : selectedModel === 'Edge' ? 300 : 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    const { cleaned } = cleanFacilityData(facilities);
    const optimizationResult = optimizeNetwork(cleaned, regionStats);
    setResult(optimizationResult);
    setIsOptimizing(false);
  };

  const modelMetrics = {
    Standard: { name: 'Transformer (ViT-L)', precision: 'FP32', size: '340MB', inference: '145ms', energy: 'High' },
    Lightweight: { name: 'DistilBERT-Lite', precision: 'INT8', size: '45MB', inference: '12ms', energy: 'Low' },
    Edge: { name: 'MobileNetV3', precision: 'INT4', size: '12MB', inference: '4ms', energy: 'Ultra-Low' },
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <Cpu className="absolute inset-0 m-auto w-6 h-6 text-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-auto p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at top left, rgba(0, 212, 255, 0.03) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.03) 0%, transparent 50%)
        `,
      }}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-lg shadow-purple-900/20">
              <Network className="w-8 h-8 text-purple-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Neural Optimization Engine
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 tracking-wider">
                AI GEN-2
              </span>
            </h1>
            <p className="text-slate-400 font-medium mt-1">
              Select AI Architecture • Optimize Coverage • Simulate Scenarios
            </p>
          </div>
        </div>
        {!isSearching && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runOptimization}
            disabled={isOptimizing}
            className={cn(
              'flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-white transition-all',
              'bg-gradient-to-r from-cyan-500 to-purple-500',
              'hover:from-cyan-400 hover:to-purple-400',
              'shadow-lg shadow-cyan-500/25',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Graph...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Initiate Global Analysis</span>
              </>
            )}
          </motion.button>
        )
        }
      </div >

      {/* Research Agent Overlay */}
      <AnimatePresence>
        {
          isSearching && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl">
                <ResearchAgent region="GHANA (Ashanti Region)" onComplete={finishResearch} />
              </div>
            </div>
          )
        }
      </AnimatePresence >

      {/* Model Selection & Configuration */}
      < div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6" >
        <div className="col-span-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center gap-1">
          {(['Standard', 'Lightweight', 'Edge'] as const).map((model) => (
            <button
              key={model}
              onClick={() => setSelectedModel(model)}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex flex-col sm:flex-row items-center justify-center gap-2",
                selectedModel === model
                  ? "bg-slate-800 text-cyan-400 shadow-md border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <div className="flex items-center gap-2">
                {model === 'Standard' && <Server className="w-4 h-4" />}
                {model === 'Lightweight' && <Cpu className="w-4 h-4" />}
                {model === 'Edge' && <Smartphone className="w-4 h-4" />}
                <span className="font-bold">{model}</span>
              </div>
              <span className={cn(
                "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded",
                model === 'Lightweight' ? "bg-emerald-500/20 text-emerald-400" :
                  model === 'Standard' ? "bg-red-500/10 text-red-400" :
                    "bg-slate-700 text-slate-300"
              )}>
                {model === 'Lightweight' ? 'Recommended (Free)' :
                  model === 'Standard' ? 'Expensive (Heavy)' :
                    'Ultra-Light'}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="text-xs text-slate-500">
            <span className="block uppercase tracking-wider mb-1">Architecture</span>
            <span className="text-white font-mono">{modelMetrics[selectedModel].name}</span>
          </div>
          <div className="text-right text-xs text-slate-500">
            <span className="block uppercase tracking-wider mb-1">Latency</span>
            <span className={cn("font-mono font-bold",
              selectedModel === 'Standard' ? 'text-orange-400' : 'text-emerald-400'
            )}>
              ~{modelMetrics[selectedModel].inference}
            </span>
          </div>
          <div className="text-right text-xs text-slate-500">
            <span className="block uppercase tracking-wider mb-1">Precision</span>
            <span className="text-cyan-400 font-mono">{modelMetrics[selectedModel].precision}</span>
          </div>
        </div>
      </div >

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Grade & WHO Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 backdrop-blur-xl"
                style={{ boxShadow: '0 0 40px rgba(0, 212, 255, 0.1)' }}
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    'w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black border-2',
                    result.criticalInsights.accessibilityGrade === 'A'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                      : result.criticalInsights.accessibilityGrade === 'B'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_30px_rgba(0,212,255,0.4)]'
                        : result.criticalInsights.accessibilityGrade === 'C'
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.4)]'
                          : 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                  )}>
                    {result.criticalInsights.accessibilityGrade}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-2">Healthcare Accessibility Grade</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 rounded-full bg-slate-700/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.criticalInsights.whoComplianceScore}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                        />
                      </div>
                      <span className="text-2xl font-bold text-cyan-400">
                        {result.criticalInsights.whoComplianceScore}%
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">WHO compliance across {result.metrics.totalFacilities} facilities</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Binary className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-slate-400">ALGORITHM STATUS</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Nodes Processed</span>
                    <span className="text-white font-mono">{result.nodes.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Edge Connections</span>
                    <span className="text-white font-mono">{result.edges.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Hub Facilities</span>
                    <span className="text-cyan-400 font-mono">{result.hubFacilities.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Coverage Gaps</span>
                    <span className={cn('font-mono', result.coverageGaps.length > 0 ? 'text-red-400' : 'text-emerald-400')}>
                      {result.coverageGaps.length}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricTile icon={<Clock className="w-5 h-5" />} label="Avg Response" value={`${result.metrics.averageResponseTime} min`} color={result.metrics.averageResponseTime <= 90 ? 'cyan' : 'red'} />
              <MetricTile icon={<Target className="w-5 h-5" />} label="Coverage" value={`${result.metrics.coveragePercentage}%`} color={result.metrics.coveragePercentage >= 80 ? 'green' : 'orange'} />
              <MetricTile icon={<TrendingUp className="w-5 h-5" />} label="Pareto Score" value={result.metrics.paretoScore} color="purple" />
              <MetricTile icon={<Ruler className="w-5 h-5" />} label="Avg Distance" value={`${result.metrics.avgInterFacilityDistance} km`} color="cyan" />
              <MetricTile icon={<Navigation className="w-5 h-5" />} label="Min Distance" value={`${result.metrics.minInterFacilityDistance} km`} color="green" />
              <MetricTile icon={<Activity className="w-5 h-5" />} label="Max Distance" value={`${result.metrics.maxInterFacilityDistance} km`} color={result.metrics.maxInterFacilityDistance <= 200 ? 'cyan' : 'red'} />
            </div>

            {/* Optimal Hub Locations */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20"
              style={{ boxShadow: '0 0 30px rgba(0, 212, 255, 0.05)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Optimal Hub Locations</h3>
                  <p className="text-xs text-slate-400">Ranked by Network Centrality × Quality Score</p>
                </div>
              </div>
              <div className="space-y-2">
                {result.criticalInsights.optimalHubLocations.map((hub, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900' :
                          index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-slate-900' :
                              'bg-slate-700 text-slate-300'
                      )}>
                        {hub.rank}
                      </div>
                      <div>
                        <p className="font-medium text-white">{hub.name}</p>
                        <p className="text-xs text-slate-400">{hub.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-mono text-sm">{hub.currentCoverageRadius} km</p>
                      <p className="text-xs text-slate-400">{(hub.populationServed / 1000).toFixed(0)}k pop.</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Coverage Gaps / Region Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  result.coverageGaps.length > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20'
                )}>
                  {result.coverageGaps.length > 0
                    ? <AlertTriangle className="w-5 h-5 text-red-400" />
                    : <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {result.coverageGaps.length > 0
                      ? `Coverage Gaps (${result.coverageGaps.length} regions exceed threshold)`
                      : 'All Regions Meet WHO Standards ✓'
                    }
                  </h3>
                  <p className="text-xs text-slate-400">Regional healthcare accessibility analysis</p>
                </div>
              </div>

              {result.coverageGaps.length > 0 ? (
                <div className="max-h-80 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {result.coverageGaps.map((gap, index) => (
                    <motion.div
                      key={gap.regionName}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.5) }}
                      className={cn(
                        'p-4 rounded-xl border',
                        gap.urgencyScore >= 0.8 ? 'bg-red-500/10 border-red-500/30' :
                          gap.urgencyScore >= 0.5 ? 'bg-orange-500/10 border-orange-500/30' :
                            'bg-yellow-500/10 border-yellow-500/30'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <span className="font-medium text-white">{gap.regionName}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {(gap.urgencyScore * 100).toFixed(0)}% urgency
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            {gap.nearestFacilityDistance.toFixed(1)} km • {gap.nearestFacilityTime.toFixed(0)} min travel
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-slate-800 text-slate-300">
                          {gap.recommendedAction}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <Sparkles className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-emerald-400">
                      All analyzed regions have healthcare access within WHO's 90-minute threshold.
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-2">
                    {regionStats.map((region, index) => (
                      <motion.div
                        key={region.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.3) }}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-white">{region.name}</span>
                        </div>
                        <span className="text-sm text-slate-400 font-mono">{region.totalFacilities} facilities</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>



            {/* Strategic Budget Simulation */}
            <CollapsibleSection
              icon={<Coins className="w-5 h-5 text-yellow-400" />}
              title="Global Improvement Strategy Case Studies"
              isOpen={true}
              onToggle={() => { }}
            >
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
                    {(['Low', 'Medium', 'High'] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBudget(b)}
                        className={cn(
                          "px-6 py-2 rounded-md text-sm font-bold transition-all",
                          selectedBudget === b
                            ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-700"
                        )}
                      >
                        {b} Budget
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Benchmarked against {result.metrics.totalFacilities} active nodes</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getStrategicInsights(result.coverageGaps.length, selectedBudget).map((insight, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-cyan-500/40 transition-all group">
                      <h4 className="font-black text-xl text-white mb-2 flex items-center gap-2 tracking-tight">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        {insight.strategy}
                      </h4>
                      <p className="text-sm text-cyan-300 font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Expected Impact: {insight.estimatedImpact}
                      </p>

                      <div className="space-y-3">
                        {insight.relevantCaseStudies.map(cs => (
                          <a
                            key={cs.id}
                            href={cs.referenceLink || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => !cs.referenceLink && e.preventDefault()}
                            className="block p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:bg-slate-900 hover:border-cyan-500/30 transition-all group/link"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{cs.region} MODEL</span>
                              <Navigation className="w-3 h-3 text-slate-600 group-hover/link:text-cyan-400 transition-colors" />
                            </div>
                            <p className="font-semibold text-white group-hover/link:text-cyan-200 transition-colors">"{cs.title}"</p>
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400/80">View Analysis</span>
                              {cs.referenceLink && <span>• External Source</span>}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleSection>


          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center max-w-lg">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 animate-pulse" />
                <div className="absolute inset-4 rounded-2xl bg-slate-800/80 flex items-center justify-center">
                  <Network className="w-12 h-12 text-cyan-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Ready to Optimize</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Analyze <span className="text-cyan-400 font-semibold">{facilities.length}</span> healthcare facilities
                using Dijkstra-based shortest path algorithms to identify coverage gaps and optimize
                response times according to WHO standards.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runOptimization}
                className="flex items-center gap-3 px-8 py-4 mx-auto rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 shadow-lg shadow-cyan-500/25"
              >
                <Zap className="w-5 h-5" />
                <span>Initialize Optimization</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}

// Sub-components
function MetricTile({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: 'cyan' | 'purple' | 'green' | 'red' | 'orange' }) {
  const colors = {
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    green: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    red: 'text-red-400 border-red-500/30 bg-red-500/10',
    orange: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('p-4 rounded-xl border', colors[color])}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="opacity-80">{icon}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </motion.div>
  );
}



function CollapsibleSection({ icon, title, isOpen, onToggle, children }: { icon: React.ReactNode; title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50">
      <button onClick={onToggle} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">{icon}</div>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-4 mt-4 border-t border-slate-700/50">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}