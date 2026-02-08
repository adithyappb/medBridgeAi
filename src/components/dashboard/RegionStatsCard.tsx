import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { RegionStats } from '@/types/facility';
import { displayValue, displayNumber } from '@/lib/sanitize';

interface RegionStatsCardProps {
  stats: RegionStats;
  onClick?: () => void;
}

export function RegionStatsCard({ stats, onClick }: RegionStatsCardProps) {
  const getCoverageColor = (score: number) => {
    if (score >= 70) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-danger';
  };

  const getCoverageStatus = (score: number) => {
    if (score >= 70) return { label: 'Good Coverage', class: 'status-operational' };
    if (score >= 50) return { label: 'Limited', class: 'status-limited' };
    return { label: 'Critical', class: 'status-critical' };
  };

  const coverage = getCoverageStatus(stats.coverageScore);
  const regionName = displayValue(stats.name, 'Region');
  const totalFacilities = displayNumber(stats.totalFacilities, '0');
  const coverageScore = stats.coverageScore ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'bg-card rounded-xl p-4 border border-border cursor-pointer',
        'hover:shadow-card-hover transition-all duration-200'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold text-foreground">{regionName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalFacilities} facilities
          </p>
        </div>
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', coverage.class)}>
          {coverage.label}
        </span>
      </div>

      {/* Coverage Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Healthcare Coverage</span>
          <span className="font-medium text-foreground">{coverageScore}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${coverageScore}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn('h-full rounded-full', getCoverageColor(coverageScore))}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/50 rounded-lg py-2 px-1">
          <p className="text-lg font-display font-bold text-primary">{stats.hospitals}</p>
          <p className="text-xs text-muted-foreground">Hospitals</p>
        </div>
        <div className="bg-muted/50 rounded-lg py-2 px-1">
          <p className="text-lg font-display font-bold text-foreground">{stats.clinics}</p>
          <p className="text-xs text-muted-foreground">Clinics</p>
        </div>
        <div className="bg-muted/50 rounded-lg py-2 px-1">
          <p className="text-lg font-display font-bold text-foreground">{stats.healthCenters}</p>
          <p className="text-xs text-muted-foreground">Centers</p>
        </div>
      </div>

      {stats.medicalDesertAreas > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-danger">
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse-subtle" />
            <span className="text-xs font-medium">
              {stats.medicalDesertAreas} medical desert areas identified
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
