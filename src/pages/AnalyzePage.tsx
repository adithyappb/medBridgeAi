import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  User,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadSection } from '@/components/analyze/UploadSection';
import { InsightsPanel } from '@/components/analyze/InsightsPanel';
import { parseFacilityCSV } from '@/lib/csvParser';

import type { Facility } from '@/types/facility';
import { toast } from 'sonner';

export default function AnalyzePage() {
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setFileName(file.name);

    try {
      const text = await file.text();
      const parsed = parseFacilityCSV(text);

      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setFacilities(parsed);
      setAnalysisComplete(true);
      toast.success(`Analyzed ${parsed.length} facilities successfully!`);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse CSV file. Please check the format.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFacilities([]);
    setAnalysisComplete(false);
    setFileName('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">MedBridge-AI</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate('/dashboard', { state: { view: 'profile' } })}
          >
            <User className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate('/dashboard', { state: { view: 'settings' } })}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {!analysisComplete ? (
              <UploadSection
                key="upload"
                onFileUpload={handleFileUpload}
                isAnalyzing={isAnalyzing}
              />
            ) : (
              <InsightsPanel
                key="insights"
                facilities={facilities}
                fileName={fileName}
                onReset={handleReset}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
