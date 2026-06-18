'use client';

import { motion } from 'framer-motion';
import { AgentStatus as AgentStatusType } from '@/lib/agents/types';

interface AgentStatusProps {
  status: AgentStatusType;
  currentStep?: string;
  progress?: { current: number; total: number };
}

const statusConfig: Record<AgentStatusType, { label: string; color: string; icon: string }> = {
  idle: { label: 'بانتظار', color: 'text-zinc-400', icon: '⚪' },
  thinking: { label: 'يفكر...', color: 'text-yellow-400', icon: '🤔' },
  planning: { label: 'يخطط...', color: 'text-blue-400', icon: '📋' },
  executing_tool: { label: 'ينفذ أداة...', color: 'text-purple-400', icon: '🔧' },
  analyzing: { label: 'يحلل النتائج...', color: 'text-cyan-400', icon: '📊' },
  loading_memory: { label: 'يسترجع الذاكرة...', color: 'text-indigo-400', icon: '💾' },
  generating_answer: { label: 'يصوغ الإجابة...', color: 'text-amber-400', icon: '✍️' },
  cancelled: { label: 'تم الإلغاء', color: 'text-zinc-500', icon: '🚫' },
  error: { label: 'حدث خطأ', color: 'text-red-400', icon: '❌' },
  done: { label: 'اكتمل', color: 'text-emerald-400', icon: '✅' },
};

export function AgentStatus({ status, currentStep, progress }: AgentStatusProps) {
  const config = statusConfig[status];

  if (status === 'idle') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-tertiary/50 border border-zinc-800/30"
    >
      <motion.span
        animate={status === 'thinking' || status === 'executing_tool' || status === 'analyzing' ? { rotate: [0, 360] } : {}}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="text-lg"
      >
        {config.icon}
      </motion.span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          {(status === 'thinking' || status === 'executing_tool' || status === 'analyzing') && (
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                  className="w-1 h-1 rounded-full bg-current"
                />
              ))}
            </span>
          )}
        </div>
        {currentStep && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">{currentStep}</p>
        )}
        {progress && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                className="h-full bg-king-500 rounded-full"
              />
            </div>
            <span className="text-[10px] text-zinc-500">
              {progress.current}/{progress.total}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
