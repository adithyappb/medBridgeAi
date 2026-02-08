import { useState } from 'react';
import { Download, FileSpreadsheet, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useFacilityData } from '@/hooks/useFacilityData';
import { exportVulnerabilityReport, exportActionableInsights } from '@/lib/exportUtils';
import { supabase } from '@/integrations/supabase/client';
import type { CountryCode } from '@/lib/countryConfig';

interface ExportPanelProps {
  country: CountryCode;
}

export function ExportPanel({ country }: ExportPanelProps) {
  const { toast } = useToast();
  const { facilities, regionStats, medicalDeserts } = useFacilityData();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleExportVulnerability = () => {
    try {
      exportVulnerabilityReport(facilities, regionStats, medicalDeserts, country);
      toast({
        title: 'Export Complete',
        description: 'Vulnerability report downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not generate vulnerability report.',
        variant: 'destructive',
      });
    }
  };

  const handleExportInsights = () => {
    try {
      exportActionableInsights(facilities, regionStats, medicalDeserts, country);
      toast({
        title: 'Export Complete',
        description: 'Actionable insights downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not generate insights report.',
        variant: 'destructive',
      });
    }
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-facilities', {
        body: {
          facilities: facilities.slice(0, 100).map(f => ({
            name: f.name,
            specialties: f.specialties,
            procedures: f.procedures,
            equipment: f.equipment,
            capabilities: f.capabilities,
            city: f.address.city,
            region: f.address.stateOrRegion,
            status: f.status,
            facilityType: f.facilityTypeId,
            dataQualityScore: f.dataQualityScore
          })),
          country,
          analysisType: 'vulnerability'
        }
      });

      if (error) throw error;

      // Create downloadable report from AI analysis
      const report = JSON.stringify(data, null, 2);
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${country.toLowerCase()}-ai-analysis-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'AI Analysis Complete',
        description: 'Detailed vulnerability analysis downloaded.',
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'AI analysis could not be completed.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Reports</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportVulnerability}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Vulnerability Report (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportInsights}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Actionable Insights (CSV)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleAIAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 mr-2" />
          )}
          AI Deep Analysis (JSON)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
