'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export function AddAccountButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/80 border border-gray-700/50 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-sm font-semibold text-gray-300 hover:text-cyan-400 transition-all group shadow-sm"
    >
      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-700 group-hover:bg-cyan-500/20 transition-colors">
        <Plus className="h-3.5 w-3.5" />
      </div>
      إضافة حساب
    </motion.button>
  );
}
