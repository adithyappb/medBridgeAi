import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useFacilityInsights } from '@/hooks/useFacilityInsights';
import type { Facility } from '@/types/facility';
import ReactMarkdown from 'react-markdown';

interface FacilityInsightsProps {
  facility: Facility;
}

export function FacilityInsights({ facility }: FacilityInsightsProps) {
  const { loading, insights, error, fetchInsights, reset } = useFacilityInsights();

  useEffect(() => {
    fetchInsights(facility);
    return () => reset();
  }, [facility.id, fetchInsights, reset]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20"
      >
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Analyzing facility...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={() => fetchInsights(facility)}
            className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </motion.div>
    );
  }

  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-primary">AI Intelligence</span>
      </div>
      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="text-xs text-foreground/90 mb-2 leading-relaxed">{children}</p>,
            strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
            ul: ({ children }) => <ul className="text-xs text-foreground/90 space-y-1 my-2 pl-0 list-none">{children}</ul>,
            li: ({ children }) => (
              <li className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                <span>{children}</span>
              </li>
            ),
          }}
        >
          {insights}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}
