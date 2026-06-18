'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Brain, CheckCircle2, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    title: 'اكتب سؤالك',
    description:
      'اكتب أي سؤال باللغة العربية الفصحى أو العامية. KING2 يفهم كل اللغات ويساعدك أياً كان مجالك.',
    color: 'from-king-500 to-king-700',
    glowColor: 'shadow-king-900/40',
  },
  {
    icon: Brain,
    title: 'يحلل AI طلبك',
    description:
      'نظام التوجيه الذكي يحلل طلبك ويختار أفضل مزود AI للمهمة. يستخدم KING2 4 مزودين لضمان أفضل جودة.',
    color: 'from-accent-gold to-amber-600',
    glowColor: 'shadow-amber-900/30',
  },
  {
    icon: CheckCircle2,
    title: 'احصل على إجابة دقيقة',
    description:
      'تصل الردود في أجزاء من الثانية مع دعم تنسيق الماركداون، الأكواد البرمجية، والروابط.',
    color: 'from-emerald-500 to-emerald-700',
    glowColor: 'shadow-emerald-900/30',
  },
];

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 1, ease: 'easeInOut' as const },
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-4 py-20 sm:px-6 lg:px-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-16 max-w-3xl text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-king-500/20 bg-king-500/10 px-4 py-1.5 text-sm text-king-300">
          <Sparkles className="h-4 w-4" />
          <span>ثلاث خطوات بسيطة</span>
        </div>
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          كيف يعمل KING2؟
        </h2>
        <p className="text-lg leading-8 text-zinc-400">
          تجربة سلسة وسريعة. ابدأ بالخطوة الأولى ودع الذكاء الاصطناعي يقوم بالباقي.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="mx-auto max-w-4xl">
        <div className="relative grid gap-8 md:gap-12">
          {/* Connecting Line (Desktop) */}
          <div className="pointer-events-none absolute right-[27px] top-0 hidden h-full w-0.5 md:block">
            <motion.div
              variants={lineVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="h-full w-full bg-gradient-to-b from-king-600 via-accent-gold to-emerald-500 origin-top"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative flex items-start gap-6 md:gap-8"
            >
              {/* Step Number & Icon */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-xl ${step.glowColor} ring-1 ring-white/10`}
                >
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <span className="mt-2 text-xs font-bold text-zinc-600">
                  0{index + 1}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 rounded-2xl border border-zinc-800/50 bg-surface-secondary/50 p-5 backdrop-blur-sm transition-all hover:border-zinc-700/50 md:p-6">
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-7 text-zinc-400">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
