'use client';

import { motion } from 'framer-motion';
import {
  MessageSquare,
  Bot,
  ImageIcon,
  FileText,
  Code,
  Mic,
  Sparkles,
} from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    icon: MessageSquare,
    title: 'دردشة ذكية',
    description:
      'محادثة طبيعية باللغة العربية مع فهم عميق للسياق. يجيب KING2 على أسئلتك بدقة ووضوح.',
    gradient: 'from-king-600/20 via-king-500/10 to-transparent',
    iconColor: 'text-king-400',
  },
  {
    icon: Bot,
    title: 'وكيل ذكي SABAgent',
    description:
      'وكيل ذكي متعدد المهام ينفذ أوامرك المعقدة، يبحث في الإنترنت، ويتخذ قرارات ذكية نيابة عنك.',
    gradient: 'from-accent-gold/20 via-amber-500/10 to-transparent',
    iconColor: 'text-accent-gold',
  },
  {
    icon: ImageIcon,
    title: 'إنشاء الصور',
    description:
      'حول أفكارك إلى صور مذهلة باستخدام أحدث نماذج توليد الصور. صف فقط ما تريد وراقب السحر.',
    gradient: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
    iconColor: 'text-emerald-400',
  },
  {
    icon: FileText,
    title: 'تحليل PDF',
    description:
      'ارفع ملفات PDF واستخرج المعلومات، لخص المحتوى، وحلل المستندات الطويلة في ثوانٍ.',
    gradient: 'from-blue-500/20 via-blue-400/10 to-transparent',
    iconColor: 'text-blue-400',
  },
  {
    icon: Code,
    title: 'مساعد برمجة',
    description:
      'يساعدك في كتابة وتصحيح الأكواد البرمجية بلغات متعددة. دعم كامل لـ Python، JavaScript، TypeScript والمزيد.',
    gradient: 'from-purple-500/20 via-purple-400/10 to-transparent',
    iconColor: 'text-purple-400',
  },
  {
    icon: Mic,
    title: 'محادثة صوتية',
    description:
      'تحدث مع KING2 بصوتك الطبيعي. يدعم الإدخال الصوتي والاستجابة الصوتية لتجربة تفاعلية كاملة.',
    gradient: 'from-rose-500/20 via-rose-400/10 to-transparent',
    iconColor: 'text-rose-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative px-4 py-20 sm:px-6 lg:px-8">
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
          <span>إمكانيات لا محدودة</span>
        </div>
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          كل ما تحتاجه في منصة واحدة
        </h2>
        <p className="text-lg leading-8 text-zinc-400">
          KING2 AI يجمع لك أحدث تقنيات الذكاء الاصطناعي في واجهة عربية
          سهلة الاستخدام، مع دعم كامل للغة العربية والمحتوى المحلي.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-surface-secondary/50 p-6 backdrop-blur-sm transition-all hover:border-king-600/30 hover:bg-surface-tertiary/50 hover:shadow-lg hover:shadow-king-900/20"
          >
            {/* Gradient Background */}
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
            />

            {/* Icon */}
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-tertiary ring-1 ring-zinc-800/50 transition-all group-hover:ring-king-500/30">
              <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
            </div>

            {/* Content */}
            <h3 className="relative mb-2 text-lg font-semibold text-white">
              {feature.title}
            </h3>
            <p className="relative text-sm leading-7 text-zinc-400">
              {feature.description}
            </p>

            {/* Hover Shine */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
