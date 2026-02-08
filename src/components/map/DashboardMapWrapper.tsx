import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CoverageMap } from './CoverageMap';
import { Scan, Activity, Radio } from 'lucide-react';

export function DashboardMapWrapper() {
    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
            {/* Base Map Layer - Interactive but stripped UI */}
            <CoverageMap className="w-full h-full" isDashboardMode={true} />

            {/* High-Tech Overlays */}
            <div className="absolute inset-0 pointer-events-none z-[500]">

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(2,6,23,0.8)_100%)]" />

                {/* Scanning Line Effect */}
                <motion.div
                    animate={{ top: ['0%', '100%'] }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 1
                    }}
                    className="absolute left-0 right-0 h-px bg-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                />

                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 rounded-br-lg" />

                {/* Live Status Indicators */}
                <div className="absolute top-4 left-6 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/80 border border-cyan-500/30 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 tracking-wider">LIVE FEED</span>
                    </div>
                </div>

                {/* Scanning Animation Text */}
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-4 left-6 text-[10px] font-mono text-cyan-500/70"
                >
                    SCANNING SECTOR 7G...
                </motion.div>

                {/* Signal Strength */}
                <div className="absolute bottom-4 right-6 flex items-end gap-0.5 h-3">
                    {[1, 2, 3, 4].map((bar) => (
                        <motion.div
                            key={bar}
                            animate={{ height: ['20%', '100%', '60%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: bar * 0.1 }}
                            className="w-1 bg-cyan-500/50 rounded-sm"
                            style={{ height: `${bar * 25}%` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
