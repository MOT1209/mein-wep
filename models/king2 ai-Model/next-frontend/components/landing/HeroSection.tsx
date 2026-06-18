'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Users, Globe, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PlatformStats {
  totalUsers: number;
  totalConversations: number;
  supportedLanguages: number;
  avgResponseTime: number;
}

const defaultStats: PlatformStats = {
  totalUsers: 0,
  totalConversations: 0,
  supportedLanguages: 15,
  avgResponseTime: 500,
};

export function HeroSection() {
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats>(defaultStats);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalUsers !== undefined) setStats(data);
      })
      .catch(() => {});
  }, []);

  const statItems = [
    { icon: Users, value: stats.totalUsers.toLocaleString('ar-SA') + '+', label: 'مستخدم نشط' },
    { icon: MessageSquare, value: stats.totalConversations.toLocaleString('ar-SA') + '+', label: 'محادثة' },
    { icon: Globe, value: stats.supportedLanguages + '+', label: 'لغة مدعومة' },
    { icon: Zap, value: stats.avgResponseTime + 'مللي', label: 'سرعة الاستجابة' },
  ];

  const handleGuestChat = useCallback(() => {
    router.push('/?guest=true');
  }, [router]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 pt-20 pb-16 sm:px-6 sm:pt-24 lg:px-8">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-king-600/10 blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-accent-gold/10 blur-[100px]" />
        <div className="absolute left-1/4 bottom-1/4 h-[250px] w-[250px] rounded-full bg-king-500/10 blur-[80px]" />
      </div>

      {/* Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-king-500/20 bg-king-500/10 px-4 py-1.5 text-sm text-king-300"
        >
          <Sparkles className="h-4 w-4" />
          <span>الذكاء الاصطناعي متعدد المزودين</span>
        </motion.div>

        {/* Logo with Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-king-600 via-king-500 to-accent-gold opacity-30 blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl overflow-hidden bg-gradient-to-br from-king-600 via-king-700 to-king-950 shadow-2xl shadow-king-900/40 ring-1 ring-white/10 sm:h-28 sm:w-28">
              <Image src="/logo.png" alt="KING2" width={112} height={112} className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
        >
          مساعدك الذكي
          <br />
          <span className="bg-gradient-to-r from-king-400 via-king-300 to-accent-gold bg-clip-text text-transparent">
            العربي الأول
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl"
        >
          منصة ذكاء اصطناعي متطورة تجمع أقوى مزودي AI في العالم.
          دردش، أنشئ صوراً، حلل ملفات PDF، واحصل على إجابات دقيقة
          باللغة العربية الفصحى.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            onClick={handleGuestChat}
            className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-king-600 to-king-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-king-900/30 transition-all hover:from-king-500 hover:to-king-600 hover:shadow-king-900/50 active:scale-[0.98]"
          >
            <MessageSquare className="h-5 w-5" />
            ابدأ المحادثة مجاناً
            <motion.span
              className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"
              layoutId="cta-glow"
            />
          </button>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2.5 rounded-2xl border border-zinc-700 bg-surface-secondary/80 px-8 py-4 text-base font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-king-600/40 hover:bg-surface-tertiary hover:text-white active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5 text-king-400" />
            إنشاء حساب
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
        >
          {statItems.map((stat, index) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-zinc-800/50 bg-surface-secondary/50 p-4 backdrop-blur-sm transition-all hover:border-king-600/20 hover:bg-surface-tertiary/50"
            >
              <stat.icon className="mx-auto mb-2 h-5 w-5 text-king-400" />
              <div className="text-xl font-bold text-white sm:text-2xl">
                {stat.value}
              </div>
              <div className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
