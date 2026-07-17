'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AgentStep } from '@/lib/agents/types';

interface TaskProgressProps {
  steps: AgentStep[];
  currentStep: number;
  totalSteps: number;
}

const stepIcons: Record<string, string> = {
  reason: '🧠',
  plan: '📋',
  tool_call: '🔧',
  tool_result: '📊',
  analysis: '🔍',
  final_answer: '💬',
};

export function TaskProgress({ steps, currentStep, totalSteps }: TaskProgressProps) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-1.5 mr-6 my-3">
      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">
        تقدم المهمة
      </p>
      <AnimatePresence>
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
              transition: { delay: index * 0.1 },
            }}
            className={`flex items-start gap-2 px-3 py-2 rounded-lg transition-colors ${
              step.status === 'running'
                ? 'bg-king-600/10 border border-king-500/20'
                : step.status === 'done'
                ? 'bg-emerald-500/5'
                : step.status === 'failed'
                ? 'bg-red-500/5'
                : ''
            }`}
          >
            <span className="text-sm mt-0.5">{stepIcons[step.type] || '•'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-300">{step.content}</span>
                {step.status === 'running' && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-[10px] text-yellow-400"
                  >
                    جاري...
                  </motion.span>
                )}
                {step.status === 'done' && (
                  <span className="text-[10px] text-emerald-400">✓</span>
                )}
                {step.status === 'failed' && (
                  <span className="text-[10px] text-red-400">✗</span>
                )}
              </div>
              {step.toolName && (
                <span className="text-[10px] text-zinc-500">
                  الأداة: {step.toolName}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
