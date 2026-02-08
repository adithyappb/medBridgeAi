import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  RefreshCcw,
  Building2,
  AlertTriangle,
  Users,
  Activity,
  TrendingUp,
  MapPin,
  FileText,
  Share2,
  Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Facility } from '@/types/facility';
import { MetricsGrid } from './MetricsGrid';
import { VulnerabilityChart } from './VulnerabilityChart';
import { RegionalBreakdown } from './RegionalBreakdown';
import { UrgencyIndicator } from './UrgencyIndicator';
import { exportFacilitiesToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';

interface RegionalStat {
  name: string;
  total: number;
  critical: number;
  riskLevel: 'high' | 'medium' | 'low';
}

interface InsightsPanelProps {
  facilities: Facility[];
  fileName: string;
  onReset: () => void;
}

export function InsightsPanel({ facilities, fileName, onReset }: InsightsPanelProps) {
  const navigate = useNavigate();
  const stats = useMemo(() => {
    const totalFacilities = facilities.length;
    const hospitals = facilities.filter(f => f.facilityTypeId === 'hospital').length;
    const clinics = facilities.filter(f => f.facilityTypeId === 'clinic').length;
    const healthCenters = facilities.filter(f => f.facilityTypeId === 'health_center').length;

    const criticalFacilities = facilities.filter(f => f.status === 'critical').length;
    const limitedFacilities = facilities.filter(f => f.status === 'limited').length;
    const operationalFacilities = facilities.filter(f => f.status === 'operational').length;

    // Calculate unique regions
    const regions = [...new Set(facilities.map(f => f.address.stateOrRegion || f.address.city || 'Unknown'))];

    // Calculate population at risk (facilities with critical status)
    const populationAtRisk = facilities
      .filter(f => f.status === 'critical' || f.status === 'limited')
      .reduce((sum, f) => sum + (f.capacity || 5000), 0);

    // Calculate average coverage score
    const avgCoverage = facilities.length > 0
      ? Math.round(facilities.reduce((sum, f) => sum + (f.dataQualityScore || 0), 0) / facilities.length)
      : 0;

    // Status breakdown for chart
    const statusBreakdown = [
      { name: 'Operational', value: operationalFacilities, color: 'hsl(152, 60%, 42%)' },
      { name: 'Limited', value: limitedFacilities, color: 'hsl(38, 92%, 50%)' },
      { name: 'Critical', value: criticalFacilities, color: 'hsl(0, 72%, 51%)' },
    ];

    // Type breakdown for chart
    const typeBreakdown = [
      { name: 'Hospitals', value: hospitals, color: 'hsl(187, 72%, 45%)' },
      { name: 'Clinics', value: clinics, color: 'hsl(262, 52%, 55%)' },
      { name: 'Health Centers', value: healthCenters, color: 'hsl(152, 60%, 42%)' },
    ];

    // Regional stats
    const regionalStats: RegionalStat[] = regions.map(region => {
      const regionFacilities = facilities.filter(f =>
        (f.address.stateOrRegion || f.address.city || 'Unknown') === region
      );
      const critical = regionFacilities.filter(f => f.status === 'critical').length;
      const total = regionFacilities.length;
      const riskLevel: 'high' | 'medium' | 'low' = critical > total * 0.3 ? 'high' : critical > total * 0.1 ? 'medium' : 'low';
      return {
        name: region,
        total,
        critical,
        riskLevel
      };
    }).sort((a, b) => b.critical - a.critical);

    return {
      totalFacilities,
      hospitals,
      clinics,
      healthCenters,
      criticalFacilities,
      limitedFacilities,
      operationalFacilities,
      populationAtRisk,
      avgCoverage,
      regions: regions.length,
      statusBreakdown,
      typeBreakdown,
      regionalStats
    };
  }, [facilities]);

  const handleExport = () => {
    try {
      exportFacilitiesToCSV(facilities, 'healthcare-insights-report');
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <FileText className="w-4 h-4" />
            <span>{fileName}</span>
            <span className="text-border">•</span>
            <span>{stats.totalFacilities} facilities analyzed</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Healthcare Vulnerability Insights
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            New Analysis
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Urgency Banner */}
      <UrgencyIndicator
        criticalCount={stats.criticalFacilities}
        totalCount={stats.totalFacilities}
        populationAtRisk={stats.populationAtRisk}
      />

      {/* Key Metrics */}
      <MetricsGrid
        totalFacilities={stats.totalFacilities}
        criticalFacilities={stats.criticalFacilities}
        populationAtRisk={stats.populationAtRisk}
        avgCoverage={stats.avgCoverage}
        regions={stats.regions}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VulnerabilityChart
          data={stats.statusBreakdown}
          title="Facility Status Distribution"
          subtitle="Operational health of facilities"
        />
        <VulnerabilityChart
          data={stats.typeBreakdown}
          title="Facility Type Breakdown"
          subtitle="Distribution by facility category"
        />
      </div>

      {/* Regional Breakdown */}
      <RegionalBreakdown regions={stats.regionalStats} />

      {/* Call to Action - Critical Facilities Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-danger/5 border border-primary/10 text-center"
      >
        <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-display font-bold text-foreground mb-2">
          {stats.criticalFacilities} Facilities Need Immediate Attention
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          This data reveals significant healthcare gaps affecting approximately{' '}
          <strong className="text-foreground">{stats.populationAtRisk >= 1000000 ? `${(stats.populationAtRisk / 1000000).toFixed(1)}M` : `${(stats.populationAtRisk / 1000).toFixed(0)}K`} people</strong>.
          Export this report to escalate to health officials and drive actionable change.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button onClick={handleExport} size="lg" className="gap-2">
            <Download className="w-5 h-5" />
            Download Full Report for Officials
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="outline" size="lg" className="gap-2">
            <Map className="w-5 h-5" />
            Explore Full Dashboard
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
