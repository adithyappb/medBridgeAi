import { AgentChat } from '@/components/agent/AgentChat';
import { Zap } from 'lucide-react';

export function AgentView() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">AI Agent</h1>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
          Ready
        </span>
      </div>

      {/* Chat Container */}
      <div className="flex-1 min-h-0">
        <AgentChat className="h-full" />
      </div>
    </div>
  );
}
