import { motion } from 'framer-motion';
import { Building2, AlertTriangle, Users, Activity, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsGridProps {
  totalFacilities: number;
  criticalFacilities: number;
  populationAtRisk: number;
  avgCoverage: number;
  regions: number;
}

export function MetricsGrid({ 
  totalFacilities, 
  criticalFacilities, 
  populationAtRisk, 
  avgCoverage,
  regions 
}: MetricsGridProps) {
  const metrics = [
    {
      title: 'Total Facilities',
      value: totalFacilities.toLocaleString(),
      icon: Building2,
      color: 'primary',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
    },
    {
      title: 'Critical Status',
      value: criticalFacilities.toLocaleString(),
      icon: AlertTriangle,
      color: 'danger',
      bgColor: 'bg-danger/10',
      textColor: 'text-danger',
      urgent: criticalFacilities > 0,
    },
    {
      title: 'Population at Risk',
      value: populationAtRisk > 1000000 
        ? `${(populationAtRisk / 1000000).toFixed(1)}M` 
        : `${(populationAtRisk / 1000).toFixed(0)}K`,
      icon: Users,
      color: 'warning',
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
    },
    {
      title: 'Avg Coverage',
      value: `${avgCoverage}%`,
      icon: Activity,
      color: avgCoverage >= 70 ? 'success' : avgCoverage >= 40 ? 'warning' : 'danger',
      bgColor: avgCoverage >= 70 ? 'bg-success/10' : avgCoverage >= 40 ? 'bg-warning/10' : 'bg-danger/10',
      textColor: avgCoverage >= 70 ? 'text-success' : avgCoverage >= 40 ? 'text-warning' : 'text-danger',
    },
    {
      title: 'Regions Covered',
      value: regions.toLocaleString(),
      icon: MapPin,
      color: 'primary',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'relative p-5 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300',
            metric.urgent && 'border-danger/30'
          )}
        >
          {metric.urgent && (
            <div className="absolute top-3 right-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
              </span>
            </div>
          )}
          
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', metric.bgColor)}>
            <metric.icon className={cn('w-5 h-5', metric.textColor)} />
          </div>
          
          <p className="text-2xl font-display font-bold text-foreground">{metric.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{metric.title}</p>
        </motion.div>
      ))}
    </div>
  );
}
