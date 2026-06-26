'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'دائماً',
    desc: 'للمستخدمين الجدد وتجربة المنصة',
    highlight: false,
    features: [
      '100 رسالة / يوم',
      'Gemini 2.0 Flash',
      'ذاكرة أساسية',
      'دعم المجتمع',
    ],
    cta: 'ابدأ مجاناً',
    href: '/auth/signin',
  },
  {
    name: 'Pro',
    price: '49',
    period: 'شهرياً',
    desc: 'للمحترفين وصناع المحتوى',
    highlight: true,
    features: [
      'رسائل غير محدودة',
      'Gemini 2.0 Flash + Groq',
      'ذاكرة متقدمة (Vector RAG)',
      'محرك المونتاج AI',
      'دعم فني優先',
      'تصدير البيانات',
    ],
    cta: 'اختر Pro',
    href: '/auth/signin?plan=pro',
  },
  {
    name: 'Royalty',
    price: '199',
    period: 'شهرياً',
    desc: 'الحزمة الملكية الكاملة',
    highlight: false,
    features: [
      'كل ميزات Pro',
      'API Keys مخصصة',
      'تكامل Firecrawl + Pixabay',
      'خادم خاص (VPC)',
      'دعم فني مخصص 24/7',
      'تدريب نموذج مخصص',
      'SLA 99.99%',
    ],
    cta: 'اختر Royalty',
    href: '/auth/signin?plan=royalty',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.15 },
  }),
};

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState('FREE');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/king2/api/subscription')
        .then((r) => r.json())
        .then((data) => setCurrentPlan(data.plan))
        .catch(() => {});
    }
  }, [status]);

  const handlePlanClick = useCallback(async (planName: string) => {
    if (status !== 'authenticated') {
      router.push(`/auth/signin?plan=${planName.toLowerCase()}`);
      return;
    }

    if (planName === 'Free') return;
    if (currentPlan !== 'FREE') return;

    setIsLoading(planName);
    try {
      const res = await fetch('/king2/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName.toUpperCase() }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPlan(planName.toUpperCase());
      }
    } catch {}
    setIsLoading(null);
  }, [status, currentPlan, router]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0C10' }}>
      <div className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">الأسعار</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4">اختر خطتك الملكية</h1>
          <p className="text-zinc-400 text-lg mt-4 max-w-lg mx-auto">
            ابدأ مجاناً، ثم ترقّى عندما تحتاج المزيد من القوة
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const isCurrent = currentPlan === plan.name.toUpperCase();
            const isLoadingPlan = isLoading === plan.name;
            return (
              <motion.div
                key={plan.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                  isCurrent
                    ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-zinc-900/50 shadow-[0_0_40px_-12px_#10b981]/30'
                    : plan.highlight
                      ? 'border-[#D4AF37]/40 bg-gradient-to-b from-[#D4AF37]/10 to-zinc-900/50 shadow-[0_0_40px_-12px_#D4AF37]/30'
                      : 'border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700/60'
                }`}
              >
                {(plan.highlight && !isCurrent) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#D4AF37] text-[#0B0C10] text-xs font-bold">
                    الأكثر شهرة
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">
                    خطتك الحالية
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-zinc-500 text-sm">{plan.desc}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-zinc-500 text-sm mr-1">/ {plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8" role="list">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-zinc-300">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanClick(plan.name)}
                  disabled={isCurrent || isLoadingPlan}
                  className={`w-full text-center py-3 px-6 rounded-xl font-medium transition-all disabled:opacity-60 ${
                    isCurrent
                      ? 'bg-emerald-600 text-white cursor-default'
                      : plan.highlight
                        ? 'bg-[#D4AF37] text-[#0B0C10] hover:bg-amber-400'
                        : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {isLoadingPlan ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      جاري التفعيل...
                    </span>
                  ) : isCurrent ? (
                    'مفعلة'
                  ) : (
                    plan.cta
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-zinc-600 text-sm">
            جميع الخطط تشمل التشفير الكامل (AES-256) والامتثال لـ GDPR. 
            <a href="/king2/privacy" className="text-[#D4AF37] hover:underline mr-1">سياسة الخصوصية</a>
          </p>
        </div>
      </div>
    </div>
  );
}