import { cn } from '@/lib/utils';

interface FuturisticLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function FuturisticLayout({ children, className }: FuturisticLayoutProps) {
  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
      'text-white',
      className
    )}
    style={{
      backgroundImage: `
        radial-gradient(ellipse at top left, rgba(0, 212, 255, 0.05) 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
        radial-gradient(ellipse at center, rgba(99, 102, 241, 0.03) 0%, transparent 70%)
      `,
    }}
    >
      {/* Scanline effect overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ icon, title, subtitle, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
            <div className="text-cyan-400">{icon}</div>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {title}
            {badge}
          </h1>
          <p className="text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  count?: number;
  action?: React.ReactNode;
}

export function SectionHeader({ icon, title, count, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-cyan-400">{icon}</span>
        <h3 className="font-semibold text-white">{title}</h3>
        {count !== undefined && (
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/30">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}