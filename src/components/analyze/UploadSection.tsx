import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  Shield,
  Zap,
  Loader2
} from 'lucide-react';

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
  isAnalyzing: boolean;
}

export function UploadSection({ onFileUpload, isAnalyzing }: UploadSectionProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto pt-8"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Guest Mode Active</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Upload Your Healthcare Data
        </h1>
        <p className="text-muted-foreground text-lg">
          Drop your healthcare vulnerability CSV file below.
          AI analysis begins instantly.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragActive
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
          ${isAnalyzing ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center text-center">
          {isAnalyzing ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Analyzing Your Data...</h3>
              <p className="text-muted-foreground">AI is processing healthcare vulnerabilities</p>
            </motion.div>
          ) : (
            <>
              <motion.div
                animate={{ y: isDragActive ? -5 : 0 }}
                className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
              >
                {isDragActive ? (
                  <FileSpreadsheet className="w-10 h-10 text-primary" />
                ) : (
                  <Upload className="w-10 h-10 text-primary" />
                )}
              </motion.div>

              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your CSV file'}
              </h3>
              <p className="text-muted-foreground mb-4">or click to browse</p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV format
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Instant analysis
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  100% private
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sample Data Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have data? Try our{' '}
          <a
            href="/data/ghana-facilities.csv"
            download
            className="text-primary hover:underline font-medium"
          >
            sample Ghana dataset
          </a>
          .
        </p>
      </div>
    </motion.div>
  );
}
