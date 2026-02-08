import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FuturisticCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'purple' | 'green' | 'red' | 'orange' | 'none';
  animate?: boolean;
  hover?: boolean;
}

export function FuturisticCard({ 
  children, 
  className, 
  glow = 'none',
  animate = true,
  hover = true,
}: FuturisticCardProps) {
  const glowStyles = {
    cyan: 'shadow-[0_0_30px_rgba(0,212,255,0.15)] border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(0,212,255,0.25)]',
    purple: 'shadow-[0_0_30px_rgba(168,85,247,0.15)] border-purple-500/30 hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]',
    green: 'shadow-[0_0_30px_rgba(34,197,94,0.15)] border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(34,197,94,0.25)]',
    red: 'shadow-[0_0_30px_rgba(239,68,68,0.15)] border-red-500/30 hover:border-red-500/50 hover:shadow-[0_0_40px_rgba(239,68,68,0.25)]',
    orange: 'shadow-[0_0_30px_rgba(245,158,11,0.15)] border-orange-500/30 hover:border-orange-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]',
    none: 'border-slate-700/50',
  };

  const Component = animate ? motion.div : 'div';
  const animateProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  } : {};

  return (
    <Component
      {...animateProps}
      className={cn(
        'relative rounded-2xl border bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl p-5',
        'transition-all duration-300',
        hover && 'hover:scale-[1.01]',
        glowStyles[glow],
        className
      )}
      style={{
        boxShadow: glow !== 'none' ? undefined : 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-purple-500/30 rounded-tr-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-purple-500/30 rounded-bl-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-500/30 rounded-br-2xl pointer-events-none" />
      
      {children}
    </Component>
  );
}

interface GlowingMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'cyan' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
}

export function GlowingMetric({ 
  icon, 
  label, 
  value, 
  trend = 'neutral',
  color = 'cyan',
  size = 'md',
}: GlowingMetricProps) {
  const colorMap = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    red: 'text-red-400 bg-red-500/10 border-red-500/30',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  };

  const sizeMap = {
    sm: { container: 'p-3', icon: 'w-8 h-8', value: 'text-lg', label: 'text-[10px]' },
    md: { container: 'p-4', icon: 'w-10 h-10', value: 'text-2xl', label: 'text-xs' },
    lg: { container: 'p-5', icon: 'w-12 h-12', value: 'text-3xl', label: 'text-sm' },
  };

  const sizes = sizeMap[size];

  return (
    <div className={cn(
      'relative rounded-xl border bg-gradient-to-br from-slate-800/80 to-slate-900/80',
      'transition-all duration-300 hover:scale-105',
      colorMap[color],
      sizes.container
    )}
    style={{
      boxShadow: `0 0 20px ${color === 'cyan' ? 'rgba(0,212,255,0.1)' : 
                            color === 'purple' ? 'rgba(168,85,247,0.1)' :
                            color === 'green' ? 'rgba(34,197,94,0.1)' :
                            color === 'red' ? 'rgba(239,68,68,0.1)' :
                            'rgba(245,158,11,0.1)'}`,
    }}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'rounded-xl flex items-center justify-center',
          'bg-gradient-to-br from-transparent to-current/10',
          sizes.icon
        )}>
          {icon}
        </div>
        <div>
          <p className={cn('font-bold text-white', sizes.value)}>{value}</p>
          <p className={cn('text-slate-400 uppercase tracking-wider', sizes.label)}>{label}</p>
        </div>
      </div>
      
      {/* Animated glow line at bottom */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />
    </div>
  );
}

interface NeuralBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  pulse?: boolean;
  className?: string;
}

export function NeuralBadge({ 
  children, 
  variant = 'default',
  pulse = false,
  className,
}: NeuralBadgeProps) {
  const variants = {
    default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    danger: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
      'uppercase tracking-wider',
      variants[variant],
      className
    )}>
      {pulse && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full animate-pulse',
          variant === 'success' ? 'bg-emerald-400' :
          variant === 'warning' ? 'bg-orange-400' :
          variant === 'danger' ? 'bg-red-400' :
          variant === 'info' ? 'bg-cyan-400' : 'bg-slate-400'
        )} />
      )}
      {children}
    </span>
  );
}