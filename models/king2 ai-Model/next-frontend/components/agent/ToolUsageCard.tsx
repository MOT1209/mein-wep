'use client';

import { motion } from 'framer-motion';

interface ToolUsageCardProps {
  toolName: string;
  input: string;
  output?: string;
  status: 'pending' | 'running' | 'done' | 'failed';
}

const toolIcons: Record<string, string> = {
  web_search: '🔍',
  calculator: '🧮',
  image_generation: '🎨',
  file_reader: '📄',
  pdf_parser: '📑',
  code_interpreter: '💻',
};

const toolLabels: Record<string, string> = {
  web_search: 'بحث في الإنترنت',
  calculator: 'آلة حاسبة',
  image_generation: 'إنشاء صور',
  file_reader: 'قراءة ملفات',
  pdf_parser: 'تحليل PDF',
  code_interpreter: 'تحليل كود',
};

export function ToolUsageCard({ toolName, input, output, status }: ToolUsageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mr-8 my-2 rounded-xl border border-zinc-800/30 bg-surface-tertiary/30 overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/20 border-b border-zinc-800/30">
        <span className="text-sm">{toolIcons[toolName] || '🔧'}</span>
        <span className="text-xs font-medium text-zinc-300">
          {toolLabels[toolName] || toolName}
        </span>
        {status === 'running' && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-[10px] text-yellow-400 mr-auto"
          >
            جاري التنفيذ...
          </motion.span>
        )}
        {status === 'done' && (
          <span className="text-[10px] text-emerald-400 mr-auto">تم بنجاح ✓</span>
        )}
        {status === 'failed' && (
          <span className="text-[10px] text-red-400 mr-auto">فشل ✗</span>
        )}
      </div>
      <div className="px-3 py-2 space-y-1">
        <div className="text-xs text-zinc-500">
          <span className="text-zinc-600">المدخل:</span> {input.slice(0, 100)}
        </div>
        {output && (
          <div className="text-xs text-zinc-400">
            <span className="text-zinc-600">النتيجة:</span>{' '}
            {output.slice(0, 150)}
            {output.length > 150 && '...'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
