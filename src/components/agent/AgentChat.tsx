import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Loader2, Lightbulb, Brain, ChevronDown, AlertTriangle, AlertCircle, CheckCircle2, Zap, Network, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentMessage } from '@/types/facility';
import { useFacilityData, useFacilityStats, useCountry } from '@/hooks/useFacilityData';
import { supabase } from '@/integrations/supabase/client';
import { COUNTRY_REGISTRY } from '@/lib/countryConfig';
import { displayValue, sanitizeArray } from '@/lib/sanitize';
import ReactMarkdown from 'react-markdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AgentChatProps {
  className?: string;
}

type AIModel = {
  id: string;
  name: string;
  provider: string;
};

const AI_MODELS: AIModel[] = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'Google' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI' },
  { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI' },
];

const suggestedQueries = [
  "Which regions need urgent intervention?",
  "Find hospitals with cardiology gaps",
  "Where should we deploy resources?",
];

export function AgentChat({ className }: AgentChatProps) {
  const { facilities, regionStats, medicalDeserts } = useFacilityData();
  const { stats } = useFacilityStats();
  const { country } = useCountry();
  const countryConfig = COUNTRY_REGISTRY[country] || COUNTRY_REGISTRY.GH;
  const countryName = countryConfig.name;

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome',
      role: 'agent',
      content: `**Neural network initialized.** Connected to **${stats.totalFacilities} facility nodes** across **${countryName}**.\n\nI can identify coverage gaps, verify infrastructure claims, and generate intervention strategies. What intelligence do you need?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'agent',
      content: `**Neural network initialized.** Connected to **${stats.totalFacilities} facility nodes** across **${countryName}**.\n\nI can identify coverage gaps, verify infrastructure claims, and generate intervention strategies. What intelligence do you need?`,
      timestamp: new Date(),
    }]);
  }, [country, stats.totalFacilities, countryName]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (useAI) {
      // Pass the updated history including the new user message
      await handleAIResponse(userMessage.content, [...messages, userMessage]);
    } else {
      setTimeout(() => {
        const agentResponse = generateLocalResponse(userMessage.content);
        setMessages(prev => [...prev, agentResponse]);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleAIResponse = async (query: string, currentHistory: AgentMessage[]) => {
    try {
      const cleanedFacilities = facilities.slice(0, 50).map(f => ({
        name: displayValue(f.name, 'Healthcare Facility'),
        specialties: sanitizeArray(f.specialties),
        procedures: sanitizeArray(f.procedures),
        equipment: sanitizeArray(f.equipment),
        capabilities: sanitizeArray(f.capabilities),
        city: displayValue(f.address.city, ''),
        region: displayValue(f.address.stateOrRegion, ''),
        status: f.status || 'unknown',
        facilityType: displayValue(f.facilityTypeId, 'facility'),
        dataQualityScore: f.dataQualityScore ?? 50
      })).filter(f => f.name !== 'Healthcare Facility');

      // Prepare conversation history (Recursive Chat)
      // Limit to last 6 messages to respect token limits
      const chatHistory = currentHistory
        .map(m => ({
          role: m.role === 'agent' ? 'assistant' : 'user',
          content: m.content
        }))
        .slice(-6);

      const { data, error } = await supabase.functions.invoke('analyze-facilities', {
        body: {
          facilities: cleanedFacilities,
          country: countryName,
          query,
          messages: chatHistory, // Send recursive history
          analysisType: 'query',
          model: selectedModel.id
        }
      });

      if (error) throw error;

      const result = data.result;
      let content = '';
      let urgencyLevel: 'critical' | 'high' | 'recommended' | null = null;

      if (result.answer) {
        content = result.answer;

        if (result.keyFindings?.length) {
          content += '\n\n**Key Findings:**\n\n';
          result.keyFindings.forEach((f: string) => {
            content += `- ${f}\n\n`;
          });
        }

        if (result.urgentAction) {
          const actionLower = result.urgentAction.toLowerCase();
          if (actionLower.includes('immediately') || actionLower.includes('critical') || actionLower.includes('urgent')) {
            urgencyLevel = 'critical';
          } else if (actionLower.includes('priority') || actionLower.includes('high')) {
            urgencyLevel = 'high';
          } else {
            urgencyLevel = 'recommended';
          }

          content += `\n[URGENCY:${urgencyLevel}]${result.urgentAction}`;
        }
      } else if (result.rawResponse) {
        content = result.rawResponse;
      } else {
        content = 'Analysis complete. Try rephrasing for more specific insights.';
      }

      setMessages(prev => [...prev, {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('AI response error:', error);
      const agentResponse = generateLocalResponse(query);
      agentResponse.content += '\n\n*Using local analysis*';
      setMessages(prev => [...prev, agentResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalResponse = (query: string): AgentMessage => {
    const lowerQuery = query.toLowerCase();
    let content = '';
    let citations: AgentMessage['citations'] = [];

    if (lowerQuery.includes('coverage') || lowerQuery.includes('lowest')) {
      const sortedRegions = [...regionStats].sort((a, b) => a.coverageScore - b.coverageScore);
      const lowestRegions = sortedRegions.slice(0, 3);

      content = `Based on analysis of ${stats.totalFacilities} facilities in **${countryName}**, here are the regions with lowest coverage:\n\n`;
      lowestRegions.forEach((region, i) => {
        content += `${i + 1}. **${region.name}** - Coverage: **${region.coverageScore}%**\n   • ${region.totalFacilities} facilities (${region.hospitals} hospitals)\n\n`;
      });

      citations = lowestRegions.map(r => ({
        field: 'Coverage Score',
        value: `${r.coverageScore}%`,
        confidence: 0.95,
        facilityName: r.name
      }));
    } else if (lowerQuery.includes('desert') || lowerQuery.includes('underserved')) {
      content = `**Medical Desert Analysis for ${countryName}:**\n\n`;
      content += `Identified **${medicalDeserts.length} regions** with critical healthcare gaps:\n\n`;

      const highSeverity = medicalDeserts.filter(d => d.severity === 'high');
      highSeverity.slice(0, 3).forEach(d => {
        content += `**${d.region}** - ${d.radius}km coverage gap\n`;
        content += `   • Population at risk: ~${((d.estimatedPopulation || 0) / 1000).toFixed(0)}K\n`;
        content += `   • Critical gaps: ${d.criticalGaps.join(', ')}\n\n`;
      });
    } else {
      content = `**${countryName} Healthcare Analysis:**\n\n`;
      content += `• **Total Facilities**: ${stats.totalFacilities}\n`;
      content += `• **Hospitals**: ${stats.totalHospitals}\n`;
      content += `• **Clinics**: ${stats.totalClinics}\n`;
      content += `• **Regions**: ${stats.totalRegions}\n`;
      content += `• **Medical Deserts**: ${stats.medicalDesertCount}\n`;
      content += `• **Avg Coverage**: ${stats.averageCoverageScore}%\n\n`;
      content += `Ask about specific regions, specialties, or recommendations!`;
    }

    return {
      id: `agent-${Date.now()}`,
      role: 'agent',
      content,
      timestamp: new Date(),
      citations,
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderUrgencyBadge = (level: 'critical' | 'high' | 'recommended', action: string) => {
    const config = {
      critical: {
        icon: AlertTriangle,
        label: 'Critical Action Required',
        className: 'bg-red-500/10 border-red-500/30 text-red-400',
        iconClass: 'text-red-400',
      },
      high: {
        icon: AlertCircle,
        label: 'High Priority',
        className: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        iconClass: 'text-orange-400',
      },
      recommended: {
        icon: CheckCircle2,
        label: 'Recommended Steps',
        className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        iconClass: 'text-emerald-400',
      },
    };

    const { icon: Icon, label, className: badgeClassName, iconClass } = config[level];

    return (
      <div className={cn('mt-4 p-4 rounded-xl border', badgeClassName)}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn('w-4 h-4', iconClass)} />
          <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-sm leading-relaxed">{action}</p>
      </div>
    );
  };

  const renderMessageContent = (content: string) => {
    const urgencyMatch = content.match(/\[URGENCY:(critical|high|recommended)\](.+)$/s);

    if (urgencyMatch) {
      const mainContent = content.replace(/\[URGENCY:(critical|high|recommended)\].+$/s, '').trim();
      const urgencyLevel = urgencyMatch[1] as 'critical' | 'high' | 'recommended';
      const urgentAction = urgencyMatch[2].trim();

      return (
        <>
          <ReactMarkdown
            components={{
              strong: ({ children }) => <strong className="font-semibold text-cyan-400">{children}</strong>,
              p: ({ children }) => <p className="text-sm leading-relaxed text-slate-300">{children}</p>,
              ul: ({ children }) => <ul className="list-disc space-y-1 ml-4">{children}</ul>,
              li: ({ children }) => <li className="text-sm text-slate-300">{children}</li>,
            }}
          >
            {mainContent}
          </ReactMarkdown>
          {renderUrgencyBadge(urgencyLevel, urgentAction)}
        </>
      );
    }

    return (
      <ReactMarkdown
        components={{
          strong: ({ children }) => <strong className="font-semibold text-cyan-400">{children}</strong>,
          p: ({ children }) => <p className="text-sm leading-relaxed text-slate-300">{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1 ml-4">{children}</ul>,
          li: ({ children }) => <li className="text-sm text-slate-300">{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className={cn(
      'flex flex-col h-full rounded-2xl overflow-hidden',
      'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95',
      'border border-slate-700/50 backdrop-blur-xl',
      className
    )}
      style={{ boxShadow: '0 0 60px rgba(0, 212, 255, 0.05)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-800 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-white flex items-center gap-2">
              MedBridge Neural Agent
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-semibold border border-purple-500/30">
                AI
              </span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Network className="w-3 h-3" />
              <span>{stats.totalFacilities} {countryName} nodes connected</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Model Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-xs font-medium transition-colors border border-slate-700/50">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>{selectedModel.name}</span>
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              {AI_MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={cn(
                    'flex flex-col items-start gap-0.5 cursor-pointer text-slate-300 hover:bg-slate-700/50',
                    selectedModel.id === model.id && 'bg-cyan-500/10'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                      {model.provider}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setUseAI(!useAI)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border',
              useAI
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
            )}
          >
            <Cpu className="w-3 h-3" />
            {useAI ? 'AI Active' : 'Local Mode'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'agent' && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              )}
              <div className={cn(
                'max-w-[85%] rounded-2xl',
                message.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-5 py-3'
                  : 'bg-slate-800/50 border border-slate-700/50 px-5 py-4'
              )}>
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:my-2 [&>ul]:ml-4 [&>ul>li]:mb-1">
                  {renderMessageContent(message.content)}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0 border border-slate-600/50">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-slate-400">Neural processing...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">Quick Commands</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((suggestion, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 text-sm border border-slate-700/50 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about healthcare infrastructure..."
              rows={1}
              className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}