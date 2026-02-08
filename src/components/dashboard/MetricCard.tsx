import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle,
  icon,
  trend,
  status = 'neutral',
  className 
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend.value < 0) return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-success';
    if (trend.value < 0) return 'text-danger';
    return 'text-muted-foreground';
  };

  const getStatusBorder = () => {
    switch (status) {
      case 'success': return 'border-l-success';
      case 'warning': return 'border-l-warning';
      case 'danger': return 'border-l-danger';
      default: return 'border-l-transparent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'metric-card border-l-4',
        getStatusBorder(),
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', getTrendColor())}>
          {getTrendIcon()}
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}
