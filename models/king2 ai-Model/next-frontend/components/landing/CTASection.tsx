'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Rocket, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-king-600/15 via-accent-gold/10 to-emerald-500/10 blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-4xl"
      >
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/50 bg-surface-secondary/80 p-8 backdrop-blur-xl sm:p-12 lg:p-16">
          {/* Inner Glow */}
          <div className="pointer-events-none absolute -inset-40 bg-gradient-to-r from-king-600/5 via-accent-gold/5 to-emerald-500/5 blur-3xl" />

          {/* Grid Pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-king-600 to-king-700 shadow-2xl shadow-king-900/30 ring-1 ring-white/10"
            >
              <Rocket className="h-7 w-7 text-white" />
            </motion.div>

            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              مستعد لتجربة المستقبل؟
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg leading-8 text-zinc-400">
              انضم إلى آلاف المستخدمين الذين يثقون في KING2 AI.
              ابدأ مجاناً ولا تحتاج لبطاقة ائتمان.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-king-600 to-king-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-king-900/30 transition-all hover:from-king-500 hover:to-king-600 hover:shadow-king-900/50 active:scale-[0.98]"
              >
                <Sparkles className="h-5 w-5" />
                ابدأ الآن مجاناً
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-zinc-700 bg-surface-tertiary/50 px-8 py-4 text-base font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-king-600/40 hover:text-white active:scale-[0.98]"
              >
                <MessageSquare className="h-5 w-5 text-king-400" />
                اكتشف الميزات
              </Link>
            </div>

            {/* Trust Line */}
            <p className="mt-6 text-xs text-zinc-600">
              لا تحتاج بطاقة ائتمان · إلغاء في أي وقت · ١٠ محادثات مجانية
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
