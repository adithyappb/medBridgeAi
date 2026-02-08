import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Brain,
  Loader2,
  Navigation,
  Building2,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Cpu,
  Gauge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FacilityDistance, OptimizationNode, RecommendedFacility } from '@/lib/optimizer/networkOptimizer';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface FacilityOptimizationCardProps {
  facility: FacilityDistance;
  node?: OptimizationNode;
  recommendations?: RecommendedFacility[];
  onClose: () => void;
}

export function FacilityOptimizationCard({
  facility,
  node,
  recommendations = [],
  onClose,
}: FacilityOptimizationCardProps) {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find nearby recommendations for this facility
  const nearbyRecommendations = recommendations.filter(rec => {
    if (!node) return false;
    const latDiff = Math.abs(rec.suggestedLocation.lat - node.lat);
    const lngDiff = Math.abs(rec.suggestedLocation.lng - node.lng);
    return latDiff < 0.5 && lngDiff < 0.5;
  });

  // Generate AI insight
  useEffect(() => {
    const generateInsight = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facility-insights`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              facility: {
                name: facility.facilityName,
                nearestFacility: facility.nearestFacilityName,
                distanceKm: facility.distanceKm,
                travelTimeMinutes: facility.travelTimeMinutes,
                capabilities: node?.capabilities || [],
                qualityScore: node?.qualityScore,
                nearbyRecommendations: nearbyRecommendations.map(r => ({
                  type: r.facilityType,
                  priority: r.priority,
                  justification: r.justification,
                })),
              },
              mode: 'optimization',
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to generate insights');
        }

        const data = await response.json();
        setAiInsight(data.insights);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate insights');
      } finally {
        setLoading(false);
      }
    };

    generateInsight();
  }, [facility.facilityId]);

  const getWHOStatus = () => {
    if (facility.travelTimeMinutes <= 90) return { text: 'PASS', color: 'text-success bg-success/10' };
    if (facility.travelTimeMinutes <= 120) return { text: 'MARGINAL', color: 'text-warning bg-warning/10' };
    return { text: 'FAIL', color: 'text-danger bg-danger/10' };
  };

  const openInMaps = () => {
    if (!node) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${node.lat},${node.lng}`,
      '_blank'
    );
  };

  const whoStatus = getWHOStatus();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="relative bg-card rounded-2xl border border-border shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-background/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-foreground text-lg truncate">
                {facility.facilityName}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Gauge className="w-3 h-3" />
                Algorithmic Analysis
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[65vh] space-y-4">
          {/* Core Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <div className="text-2xl font-bold text-foreground">
                {facility.distanceKm}
              </div>
              <div className="text-xs text-muted-foreground">km to hub</div>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <div className="text-2xl font-bold text-foreground">
                {facility.travelTimeMinutes}
              </div>
              <div className="text-xs text-muted-foreground">min travel</div>
            </div>
            <div className={cn('p-3 rounded-xl text-center', whoStatus.color)}>
              <div className="text-lg font-bold">
                {whoStatus.text}
              </div>
              <div className="text-xs opacity-80">WHO 90min</div>
            </div>
          </div>

          {/* Network Connection */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Nearest hub:</span>
              <span className="font-medium text-foreground truncate">{facility.nearestFacilityName}</span>
            </div>
          </div>

          {/* Location */}
          {node && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between text-xs"
              onClick={openInMaps}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>{node.lat.toFixed(4)}, {node.lng.toFixed(4)}</span>
              </div>
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}

          {/* Nearby Optimization Opportunities */}
          {nearbyRecommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-sm font-semibold text-warning">
                  Detected Optimization Opportunity
                </span>
              </div>
              <div className="space-y-1.5">
                {nearbyRecommendations.slice(0, 2).map((rec, idx) => (
                  <div key={idx} className="text-sm text-foreground/80 flex items-center gap-2">
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded font-medium uppercase',
                      rec.priority === 'critical' ? 'bg-danger/20 text-danger' :
                      rec.priority === 'high' ? 'bg-warning/20 text-warning' :
                      'bg-primary/20 text-primary'
                    )}>
                      {rec.priority}
                    </span>
                    <span className="truncate">
                      +{rec.facilityType.replace('_', ' ')} → {(rec.estimatedPopulationServed / 1000).toFixed(0)}k pop.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Algorithmic Analysis</span>
              <Sparkles className="w-3 h-3 text-primary/50" />
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-primary/70 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Running network analysis...</span>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {aiInsight && !loading && (
              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-xs text-foreground/90 mb-2 leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="text-foreground font-semibold text-xs">{children}</strong>,
                    ul: ({ children }) => <ul className="text-xs text-foreground/90 space-y-1 my-2 pl-0 list-none">{children}</ul>,
                    li: ({ children }) => (
                      <li className="flex items-start gap-1.5 text-xs">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{children}</span>
                      </li>
                    ),
                  }}
                >
                  {aiInsight}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
