import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegionalStat {
  name: string;
  total: number;
  critical: number;
  riskLevel: 'high' | 'medium' | 'low';
}

interface RegionalBreakdownProps {
  regions: RegionalStat[];
}

export function RegionalBreakdown({ regions }: RegionalBreakdownProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-danger bg-danger/10 border-danger/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-success bg-success/10 border-success/20';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return AlertTriangle;
      case 'medium': return TrendingDown;
      default: return MapPin;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-6 rounded-2xl bg-card border border-border shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Regional Breakdown</h3>
          <p className="text-sm text-muted-foreground mt-1">Healthcare gaps by region</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-danger" />
            High Risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            Low
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.slice(0, 9).map((region, index) => {
          const RiskIcon = getRiskIcon(region.riskLevel);
          const criticalPercent = region.total > 0 
            ? Math.round((region.critical / region.total) * 100) 
            : 0;

          return (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={cn(
                'p-4 rounded-xl border transition-all duration-300 hover:shadow-md',
                getRiskColor(region.riskLevel)
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RiskIcon className="w-4 h-4" />
                  <span className="font-medium text-foreground text-sm truncate max-w-[120px]">
                    {region.name}
                  </span>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                  region.riskLevel === 'high' ? 'bg-danger/20 text-danger' :
                  region.riskLevel === 'medium' ? 'bg-warning/20 text-warning' :
                  'bg-success/20 text-success'
                )}>
                  {region.riskLevel}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Facilities</span>
                  <span className="font-semibold text-foreground">{region.total}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Critical</span>
                  <span className={cn(
                    'font-semibold',
                    region.critical > 0 ? 'text-danger' : 'text-foreground'
                  )}>
                    {region.critical} ({criticalPercent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${criticalPercent}%` }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className={cn(
                      'h-full rounded-full',
                      region.riskLevel === 'high' ? 'bg-danger' :
                      region.riskLevel === 'medium' ? 'bg-warning' : 'bg-success'
                    )}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {regions.length > 9 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          + {regions.length - 9} more regions in full report
        </p>
      )}
    </motion.div>
  );
}
