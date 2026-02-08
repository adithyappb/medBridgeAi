import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UrgencyIndicatorProps {
  criticalCount: number;
  totalCount: number;
  populationAtRisk: number;
}

export function UrgencyIndicator({ criticalCount, totalCount, populationAtRisk }: UrgencyIndicatorProps) {
  const urgencyPercent = totalCount > 0 ? Math.round((criticalCount / totalCount) * 100) : 0;

  const getUrgencyLevel = () => {
    if (urgencyPercent >= 30) return { level: 'critical', label: 'Critical', color: 'danger' };
    if (urgencyPercent >= 15) return { level: 'high', label: 'High Priority', color: 'warning' };
    if (urgencyPercent >= 5) return { level: 'moderate', label: 'Moderate', color: 'warning' };
    return { level: 'low', label: 'Stable', color: 'success' };
  };

  const urgency = getUrgencyLevel();

  if (criticalCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden p-6 rounded-2xl border',
        urgency.color === 'danger' && 'bg-danger/5 border-danger/20',
        urgency.color === 'warning' && 'bg-warning/5 border-warning/20',
        urgency.color === 'success' && 'bg-success/5 border-success/20'
      )}
    >
      {/* Animated background pulse for critical */}
      {urgency.level === 'critical' && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.05, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-danger rounded-2xl"
        />
      )}

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center',
            urgency.color === 'danger' && 'bg-danger/20',
            urgency.color === 'warning' && 'bg-warning/20',
            urgency.color === 'success' && 'bg-success/20'
          )}>
            <AlertTriangle className={cn(
              'w-7 h-7',
              urgency.color === 'danger' && 'text-danger',
              urgency.color === 'warning' && 'text-warning',
              urgency.color === 'success' && 'text-success'
            )} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
                urgency.color === 'danger' && 'bg-danger/20 text-danger',
                urgency.color === 'warning' && 'bg-warning/20 text-warning',
                urgency.color === 'success' && 'bg-success/20 text-success'
              )}>
                {urgency.label}
              </span>
              <Zap className={cn(
                'w-4 h-4',
                urgency.color === 'danger' && 'text-danger',
                urgency.color === 'warning' && 'text-warning',
                urgency.color === 'success' && 'text-success'
              )} />
            </div>
            <p className="text-foreground font-medium">
              {urgencyPercent}% of facilities require immediate attention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className={cn(
              'text-2xl font-display font-bold',
              urgency.color === 'danger' && 'text-danger',
              urgency.color === 'warning' && 'text-warning',
              urgency.color === 'success' && 'text-success'
            )}>
              {criticalCount}
            </p>
            <p className="text-muted-foreground">Critical</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-foreground flex items-center gap-1">
              <Users className="w-5 h-5 text-muted-foreground" />
              {populationAtRisk > 1000000
                ? `${(populationAtRisk / 1000000).toFixed(1)}M`
                : populationAtRisk >= 1000000
                  ? `${(populationAtRisk / 1000000).toFixed(1)}M`
                  : `${(populationAtRisk / 1000).toFixed(0)}K`}
            </p>
            <p className="text-muted-foreground">People at Risk</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
