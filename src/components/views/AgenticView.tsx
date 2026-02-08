
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Copy, Check, Database, Globe, Cpu } from 'lucide-react';
import { useFacilityData, useFacilityStats, useCountry } from '@/hooks/useFacilityData';
import { getStrategicInsights } from '@/core-logic/global-insights';
import { cn } from '@/lib/utils';

export function AgenticView() {
    const { facilities, medicalDeserts, isLoading } = useFacilityData();
    const { stats } = useFacilityStats();
    const { country } = useCountry();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'status' | 'json' | 'strategy'>('status');

    const insights = getStrategicInsights(medicalDeserts.length, 'Medium'); // Medium budget

    const systemStatus = {
        timestamp: new Date().toISOString(),
        nodes_active: facilities.length,
        network_health: stats.averageCoverageScore > 80 ? 'OPTIMAL' : 'DEGRADED',
        agent_version: 'v2.4.0-alpha',
        protocol: 'HL7-FHIR-R4'
    };

    const copyToClipboard = () => {
        const data = JSON.stringify({ systemStatus, stats, medicalDeserts }, null, 2);
        navigator.clipboard.writeText(data);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) return <div className="p-8 text-cyan-500 font-mono">INITIALIZING AGENT INTERFACE...</div>;

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8 overflow-hidden relative">
            {/* CRT Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] opacity-20" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-green-900/50 pb-4">
                <div className="flex items-center gap-3">
                    <Terminal className="w-6 h-6 animate-pulse" />
                    <h1 className="text-xl font-bold tracking-widest text-green-400">
                        MED_BRIDGE_AGENT_INTERFACE <span className="text-xs bg-green-900/30 px-2 py-0.5 rounded text-green-300">LIVE</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-xs text-green-700">
                    <span>UNK_OP_ID: 8X-99</span>
                    <span>SECURE_CONN_EST</span>
                </div>
            </div>

            {/* Control Panel */}
            <div className="flex gap-4 mb-6">
                {['status', 'json', 'strategy'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={cn(
                            "px-4 py-2 border text-sm transition-all uppercase tracking-wider",
                            activeTab === tab
                                ? "border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                                : "border-green-900 text-green-700 hover:border-green-700 hover:text-green-500"
                        )}
                    >
                        [{tab.toUpperCase()}]
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

                {/* Main Display Area */}
                <div className="lg:col-span-2 border border-green-900/50 bg-black/50 rounded-sm p-4 overflow-auto scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent">

                    {activeTab === 'status' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-green-900/30 p-4">
                                    <h3 className="text-xs text-green-700 mb-2">// SYSTEM_METRICS</h3>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between"><span>TOTAL_NODES</span> <span className="text-white">{stats.totalFacilities}</span></div>
                                        <div className="flex justify-between"><span>COVERAGE_IDX</span> <span className="text-white">{stats.averageCoverageScore.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>RISK_POP</span> <span className="text-red-500">{stats.populationAtRisk}</span></div>
                                    </div>
                                </div>
                                <div className="border border-green-900/30 p-4">
                                    <h3 className="text-xs text-green-700 mb-2">// LATENCY_CHECK</h3>
                                    <div className="h-full flex items-end gap-1">
                                        {[40, 65, 30, 80, 55, 90, 45, 60].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
                                                className="flex-1 bg-green-500/20 hover:bg-green-500 transition-colors"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs text-green-700 mb-2">// ACTIVE_CRITICAL_ALERTS</h3>
                                {medicalDeserts.length > 0 ? (
                                    <div className="space-y-2">
                                        {medicalDeserts.slice(0, 5).map((d, i) => (
                                            <div key={i} className="flex items-center gap-4 text-sm border-l-2 border-red-500 pl-4 bg-red-900/10 py-2">
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                <span className="text-red-400">CRIT_DESERT_DETECTED: {d.region}</span>
                                                <span className="text-red-700 text-xs">DESERT_SCORE: {d.desertScore}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-green-500 flex items-center gap-2"><Check className="w-4 h-4" /> NO_CRITICAL_ALERTS</div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'json' && (
                        <div className="relative">
                            <button
                                onClick={copyToClipboard}
                                className="absolute top-0 right-0 p-2 text-green-700 hover:text-green-400 transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                                {JSON.stringify({
                                    meta: { type: 'AGENT_EXPORT', generated: new Date() },
                                    data: { facilities, stats, medicalDeserts }
                                }, null, 2)}
                            </pre>
                        </div>
                    )}

                    {activeTab === 'strategy' && (
                        <div className="space-y-4">
                            <div className="text-sm text-green-600 mb-4">// CALCULATING_GLOBAL_OPTIMAL_STRATEGIES...</div>
                            {insights.map((rec, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="border border-green-800 p-4 hover:bg-green-900/10 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-green-300 font-bold flex items-center gap-2">
                                            <Globe className="w-4 h-4" /> {rec.strategy}
                                        </h4>
                                        <span className="text-xs bg-green-900 text-green-400 px-2 py-1">{rec.estimatedImpact}</span>
                                    </div>
                                    <div className="space-y-2 mt-3">
                                        {rec.relevantCaseStudies.map(cs => (
                                            <div key={cs.id} className="text-xs text-green-600 pl-4 border-l border-green-800">
                                                <span className="text-green-500">REF: {cs.region} ({cs.budgetTier} Budget)</span>
                                                <p className="opacity-70">"{cs.title}" - {cs.impactMetric}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Sidebar Status */}
                <div className="border-l border-green-900/50 pl-6 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h4 className="text-[10px] text-green-800 uppercase tracking-widest">Processing Node</h4>
                            <div className="flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-green-500" />
                                <span className="text-green-300 text-sm">QUANTUM_SIM_01</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-[10px] text-green-800 uppercase tracking-widest">Data Stream</h4>
                            <div className="h-32 bg-green-900/10 border border-green-900/30 p-2 overflow-hidden relative">
                                <div className="absolute inset-0 flex flex-col justify-end">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 100 }}
                                            animate={{ opacity: [0, 1, 0], x: -100 }}
                                            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                                            className="text-[10px] text-green-800 font-mono whitespace-nowrap"
                                        >
                                            {`0x${Math.random().toString(16).substr(2, 8)} :: STREAM_PACKET_${i}`}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-[10px] text-green-900 text-center">
                        SECURE TERMINAL ACCESS<br />
                        AUTHORIZED PERS ONLY<br />
                        SESSION_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </div>
                </div>

            </div>
        </div>
    );
}

function AlertTriangle(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
}
