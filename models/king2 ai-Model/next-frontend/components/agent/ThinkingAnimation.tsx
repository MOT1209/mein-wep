'use client';

import { motion } from 'framer-motion';

interface ThinkingAnimationProps {
  visible: boolean;
  text?: string;
}

const dots = [0, 1, 2, 3];

export function ThinkingAnimation({ visible, text = 'AIAGENT يعمل' }: ThinkingAnimationProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 px-4 py-3"
    >
      <div className="flex items-center gap-1.5">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
          className="w-2 h-2 rounded-full bg-king-500"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
          className="w-2 h-2 rounded-full bg-king-500"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
          className="w-2 h-2 rounded-full bg-king-500"
        />
      </div>
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-sm text-zinc-400"
      >
        {text}
      </motion.span>
    </motion.div>
  );
}
