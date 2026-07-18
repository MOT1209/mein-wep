'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp,
  MessageSquarePlus,
  Settings,
  ChevronDown,
} from 'lucide-react';

export function FloatingActions() {
  const router = useRouter();
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isChatPage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setShowScrollTop(scrollY > 300);
      setShowScrollBottom(maxScroll > 100 && scrollY < maxScroll - 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setExpanded(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    setExpanded(false);
  }, []);

  const newChat = useCallback(() => {
    router.push('/');
    setExpanded(false);
  }, [router]);

  const openSettings = useCallback(() => {
    router.push('/settings');
    setExpanded(false);
  }, [router]);

  // Don't show if there's no reason to
  const hasAnyButton = showScrollTop || showScrollBottom || !isChatPage;

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-center gap-2" dir="ltr">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="flex flex-col gap-2"
          >
            {showScrollTop && (
              <motion.button
                onClick={scrollToTop}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-xl bg-surface-secondary border border-zinc-700/50 px-3 py-2.5 text-xs text-zinc-300 shadow-lg backdrop-blur-sm hover:bg-surface-tertiary hover:text-white transition-all"
                title="العودة للأعلى"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>أعلى</span>
              </motion.button>
            )}

            {showScrollBottom && (
              <motion.button
                onClick={scrollToBottom}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-xl bg-surface-secondary border border-zinc-700/50 px-3 py-2.5 text-xs text-zinc-300 shadow-lg backdrop-blur-sm hover:bg-surface-tertiary hover:text-white transition-all"
                title="الذهاب للأسفل"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>أسفل</span>
              </motion.button>
            )}

            {!isChatPage && (
              <motion.button
                onClick={newChat}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-xl bg-king-600/20 border border-king-500/30 px-3 py-2.5 text-xs text-king-400 shadow-lg backdrop-blur-sm hover:bg-king-600/30 hover:text-king-300 transition-all"
                title="محادثة جديدة"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>محادثة</span>
              </motion.button>
            )}

            <motion.button
              onClick={openSettings}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-xl bg-surface-secondary border border-zinc-700/50 px-3 py-2.5 text-xs text-zinc-300 shadow-lg backdrop-blur-sm hover:bg-surface-tertiary hover:text-white transition-all"
              title="الإعدادات"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>إعدادات</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-king-600 to-king-700 text-white shadow-xl shadow-king-900/40 border border-king-500/30 hover:from-king-500 hover:to-king-600 transition-all"
        title={expanded ? 'إخفاء' : 'تحكم سريع'}
      >
        <motion.svg
          animate={{ rotate: expanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </motion.svg>
      </motion.button>
    </div>
  );
}
