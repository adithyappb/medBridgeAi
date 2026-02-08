import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Globe2, 
  Heart, 
  TrendingUp, 
  Shield, 
  Sparkles,
  ArrowRight,
  Activity,
  Users,
  MapPin,
  FileBarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Globe2,
    title: 'Universal Access',
    description: 'Healthcare insights for every community, regardless of resources or location.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'No login required. Your data stays yours. Analyze in complete anonymity.',
  },
  {
    icon: TrendingUp,
    title: 'Actionable Intelligence',
    description: 'Export reports to escalate healthcare gaps to officials and drive real change.',
  },
];

const stats = [
  { value: '2.4B+', label: 'People Lack Access', icon: Users },
  { value: '50%', label: 'Rural Areas Underserved', icon: MapPin },
  { value: '100+', label: 'Countries Impacted', icon: Globe2 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">MedBridge-AI</span>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 lg:px-12 pt-12 pb-20 lg:pt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Healthcare Intelligence</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6">
              Healthcare Insights
              <br />
              <span className="gradient-text">For Every Human</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Upload your healthcare data. Get instant AI-powered analysis. 
              Export actionable reports to drive change. <strong className="text-foreground">No login required.</strong>
            </p>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              <Button
                onClick={() => navigate('/analyze')}
                size="lg"
                className="relative h-16 px-10 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Upload className="w-5 h-5" />
                  Upload Data & Get Insights
                  <motion.span
                    animate={{ x: isHovering ? 5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary"
                  animate={{ opacity: isHovering ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>

            <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
              <p className="text-sm text-muted-foreground">
                <Heart className="w-4 h-4 inline mr-1 text-danger" />
                100% free. No account needed.
              </p>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="text-sm text-primary hover:text-primary/80"
              >
                Or explore live demo →
              </Button>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center group-hover:bg-danger/20 transition-colors">
                    <stat.icon className="w-6 h-6 text-danger" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-24"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-center text-foreground mb-12">
              Why MedBridge-AI?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="relative p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-24 text-center"
          >
            <div className="max-w-3xl mx-auto p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/5 via-card to-primary/5 border border-primary/10">
              <FileBarChart2 className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Healthcare Intelligence is a Universal Right
              </h2>
              <p className="text-muted-foreground text-lg">
                We believe actionable healthcare insights should be accessible to everyone—from remote village health workers 
                to government officials. Upload any healthcare vulnerability data, receive instant AI analysis, 
                and export reports that can save lives.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-foreground">MedBridge-AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Ensuring healthcare reaches every last person in humanity.
          </p>
        </div>
      </footer>
    </div>
  );
}
