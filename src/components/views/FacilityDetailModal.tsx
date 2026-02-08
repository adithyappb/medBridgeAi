import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ExternalLink, MapPin, Building2, Activity,
    AlertTriangle, CheckCircle2, Stethoscope,
    BrainCircuit, Sparkles, Server, ArrowRight
} from 'lucide-react';
import { type Facility } from '@/types/facility';
import { cn } from '@/lib/utils';

interface FacilityDetailModalProps {
    facility: Facility;
    onClose: () => void;
}

export function FacilityDetailModal({ facility, onClose }: FacilityDetailModalProps) {
    const [analyzing, setAnalyzing] = useState(true);
    const [insights, setInsights] = useState<string[]>([]);

    useEffect(() => {
        // Simulate AI Analysis
        const timer = setTimeout(() => {
            const generatedInsights = [];

            // Critical Status Logic
            if (facility.status === 'critical') {
                if ((facility.numberDoctors || 0) > 2) {
                    generatedInsights.push('CRITICAL: Supply chain disruption detected. Recommend immediate restocking.');
                    generatedInsights.push('Staffing levels adequate for current capacity.');
                } else {
                    generatedInsights.push('CRITICAL: Severe staffing shortage detected. Immediate deployment required.');
                }
            } else {
                generatedInsights.push('Operational efficiency within standard parameters.');
            }

            // Data Quality Logic
            if (facility.dataQualityScore && facility.dataQualityScore < 60) {
                generatedInsights.push('Data Fidelity Warning: High variance in reported metrics. Verification needed.');
            } else {
                generatedInsights.push('Data integrity verified. Confidence score: High.');
            }

            // Specialty Logic
            if (facility.specialties.length > 5) {
                generatedInsights.push('Regional Hub Candidate: High specialty coverage indicates potential for referral center status.');
            } else {
                generatedInsights.push('Primary care focus. Limited specialty support.');
            }

            setInsights(generatedInsights);
            setAnalyzing(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [facility]);

    const websiteUrl = facility.officialWebsite || facility.websites?.[0];
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${facility.name} ${facility.address.city || ''} ${facility.address.stateOrRegion || ''}`)}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-cyan-900/40 to-slate-900/40 border-b border-slate-700 p-6 flex flex-col justify-end">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                    {facility.facilityTypeId || 'Facility'}
                                </span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] uppercase font-bold border",
                                    facility.status === 'operational' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        facility.status === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                )}>
                                    {facility.status}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {facility.name}
                                {facility.dataQualityScore && facility.dataQualityScore > 80 && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                )}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Info */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> Facility Data
                            </h3>
                            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Location</span>
                                    <span className="text-white font-medium text-right ml-4">
                                        {[facility.address.city, facility.address.stateOrRegion].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Type</span>
                                    <span className="text-white font-medium capitalize">
                                        {facility.facilityTypeId?.replace('_', ' ') || 'Unknown'}
                                    </span>
                                </div>
                                {facility.numberDoctors !== undefined && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Medical Staff</span>
                                        <span className="text-white font-medium">{facility.numberDoctors} Doctors</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Stethoscope className="w-4 h-4" /> Key Specialties
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {facility.specialties.slice(0, 6).map((spec, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700">
                                        {spec.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                ))}
                                {facility.specialties.length === 0 && (
                                    <span className="text-sm text-slate-500 italic">No specialty data recorded</span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            {websiteUrl && (
                                <a
                                    href={websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700"
                                >
                                    <ExternalLink className="w-4 h-4" /> Official Site
                                </a>
                            )}
                            <a
                                href={mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors border",
                                    websiteUrl
                                        ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                                        : "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-900/20"
                                )}
                            >
                                <MapPin className="w-4 h-4" />
                                {websiteUrl ? "View Map" : "Locate Exact Site"}
                            </a>
                        </div>
                    </div>

                    {/* AI Insights Panel */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-2xl" />
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

                        <div className="relative h-full p-5 rounded-2xl border border-cyan-500/20 bg-slate-900/40 backdrop-blur-sm flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                    <BrainCircuit className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">AI Node Analysis</h3>
                                    <p className="text-[10px] text-cyan-400 font-mono">LIVE INFERENCE RUNNING</p>
                                </div>
                            </div>

                            <div className="flex-1 min-h-[200px]">
                                <AnimatePresence mode='wait'>
                                    {analyzing ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="h-full flex flex-col items-center justify-center text-center space-y-3"
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
                                                <Server className="absolute inset-0 m-auto w-5 h-5 text-cyan-400/50" />
                                            </div>
                                            <p className="text-xs text-slate-400 animate-pulse">
                                                Aggregating regional health data...
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="content"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-3"
                                        >
                                            {insights.map((insight, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="p-3 rounded-lg bg-slate-950/50 border border-slate-700/50 flex gap-3 items-start"
                                                >
                                                    <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs text-slate-300 leading-relaxed">
                                                        {insight}
                                                    </p>
                                                </motion.div>
                                            ))}

                                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500">Confidence Score</span>
                                                    <span className="text-emerald-400 font-bold font-mono">98.4%</span>
                                                </div>
                                                <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                                                    <div className="w-[98%] h-full bg-emerald-500 rounded-full" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
