import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, Database, BrainCircuit, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface ResearchAgentProps {
    region: string;
    onComplete: () => void;
}

export function ResearchAgent({ region, onComplete }: ResearchAgentProps) {
    const [step, setStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const researchSteps = [
        { msg: `Scanning global health databases for ${region}...`, icon: Globe, duration: 1500 },
        { msg: "Accessing World Bank economic indicators...", icon: Database, duration: 1400 },
        { msg: "Retrieving latest WHO rural health protocols...", icon: Search, duration: 1600 },
        { msg: "Synthesizing regional case studies (focus: Ghana/West Africa)...", icon: BrainCircuit, duration: 2000 },
        { msg: "Optimization context updated.", icon: Sparkles, duration: 800 }
    ];

    useEffect(() => {
        let currentStep = 0;

        const runStep = () => {
            if (currentStep >= researchSteps.length) {
                setTimeout(onComplete, 500);
                return;
            }

            setStep(currentStep);
            setLogs(prev => [...prev, researchSteps[currentStep].msg]);

            setTimeout(() => {
                currentStep++;
                runStep();
            }, researchSteps[currentStep].duration);
        };

        runStep();
    }, [region]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-900/20"
        >
            <div className="bg-slate-900/50 p-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs font-mono text-cyan-400 font-bold">AI_RESEARCH_AGENT_V2.1</span>
                </div>
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            </div>

            <div className="p-6 font-mono text-sm h-64 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800 bg-slate-950/80 backdrop-blur-md">
                <AnimatePresence mode='popLayout'>
                    {logs.map((log, index) => {
                        const isCurrent = index === step;
                        const Icon = researchSteps[Math.min(index, researchSteps.length - 1)].icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`mb-3 flex items-start gap-3 ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`}
                            >
                                <div className={`mt-0.5 ${isCurrent ? 'animate-pulse' : ''}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p>{log}</p>
                                    {isCurrent && (
                                        <motion.div
                                            layoutId="cursor"
                                            className="inline-block w-1.5 h-4 bg-cyan-400 align-middle ml-1"
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                        />
                                    )}
                                </div>
                                {index < step && <span className="text-emerald-500 text-xs">OK</span>}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="p-3 bg-cyan-950/30 border-t border-cyan-900/50 text-center">
                <p className="text-xs text-cyan-300 flex items-center justify-center gap-2">
                    <Globe className="w-3 h-3" />
                    Gathering live intelligence for: <span className="font-bold underline uppercase">{region}</span>
                </p>
            </div>
        </motion.div>
    );
}
