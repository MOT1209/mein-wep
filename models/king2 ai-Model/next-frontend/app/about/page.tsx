'use client';

import { motion } from 'framer-motion';
import {
  Crown,
  Bot,
  Brain,
  Mic,
  Image,
  Shield,
  Globe,
  Sparkles,
  Cpu,
  Lock,
  Zap,
  Workflow,
} from 'lucide-react';

const sections = [
  {
    id: 'about',
    icon: Crown,
    title: 'عن المنصة',
    gradient: 'from-king-500 to-king-700',
    content: 'KING2 AI هي منصة ذكاء اصطناعي عربية متطورة تجمع أحدث تقنيات الذكاء الاصطناعي في واجهة واحدة سلسة. صممت خصيصاً للمستخدم العربي، مع دعم كامل للغة العربية وفهم عميق للسياق الثقافي المحلي.',
    details: [
      'منصة متعددة المزودين تدعم Gemini، Groq، OpenRouter، Gemma 4',
      'معالجة طبيعية للغة العربية الفصحى والعامية',
      'واجهة مستخدم عربية بالكامل مع دعم RTL',
    ],
  },
  {
    id: 'features',
    icon: Sparkles,
    title: 'المميزات الرئيسية',
    gradient: 'from-emerald-500 to-emerald-700',
    content: 'مجموعة متكاملة من الأدوات الذكية المصممة لتلبية احتياجاتك اليومية.',
    features: [
      { icon: MessageSquare, label: 'دردشة ذكية', desc: 'محادثة طبيعية بفهم عميق للسياق' },
      { icon: Bot, label: 'AI Agent', desc: 'وكيل متعدد المهام ينفذ أوامرك المعقدة' },
      { icon: Image, label: 'توليد الصور', desc: 'إنشاء صور فريدة من الأوصاف النصية' },
      { icon: Mic, label: 'محادثة صوتية', desc: 'تحدث مع KING2 بصوتك الطبيعي' },
      { icon: Globe, label: 'ترجمة فورية', desc: 'ترجمة بين 10 لغات بدقة عالية' },
      { icon: Cpu, label: 'مساعد برمجي', desc: 'كتابة وتصحيح الأكواد البرمجية' },
    ],
  },
  {
    id: 'models',
    icon: Cpu,
    title: 'النماذج المدعومة',
    gradient: 'from-purple-500 to-purple-700',
    content: 'KING2 AI يجمع لك أقوى نماذج الذكاء الاصطناعي في العالم.',
    models: [
      { name: 'Gemini', provider: 'Google', desc: 'نموذج متعدد الوسائط مع فهم عميق' },
      { name: 'Gemma 4 E4B', provider: 'Google DeepMind', desc: 'نموذج مفتوح المصدر يعمل محلياً' },
      { name: 'Groq', provider: 'Groq Inc', desc: 'سرعة فائقة في المعالجة' },
      { name: 'OpenRouter', provider: 'OpenRouter', desc: 'وصول لأحدث النماذج العالمية' },
      { name: 'ZAI', provider: 'Zero AI', desc: 'نموذج عربي متخصص' },
    ],
  },
  {
    id: 'agent',
    icon: Bot,
    title: 'AI Agent',
    gradient: 'from-amber-500 to-amber-700',
    content: 'وكيل ذكي متعدد الوكالات المتخصصة، كل وكيل مصمم لمهمة محددة.',
    agents: [
      { name: 'Bug_Hunter_Agent', role: 'صائد الأخطاء', desc: 'يكشف الأخطاء قبل حدوثها' },
      { name: 'OpenCode_Refiner_Agent', role: 'مهندس الأكواد', desc: 'ينتج أكواد نظيفة واحترافية' },
      { name: 'Kaggle_Data_Injecter', role: 'محلل البيانات', desc: 'يسحب ويحلل البيانات من Kaggle' },
      { name: 'Sovereign_Translator', role: 'المترجم السيادي', desc: 'يترجم بين 10 لغات بدقة' },
    ],
  },
  {
    id: 'memory',
    icon: Brain,
    title: 'نظام الذاكرة',
    gradient: 'from-sky-500 to-sky-700',
    content: 'نظام ذاكرة ذكي يتعلم من تفاعلاتك ويتذكر تفضيلاتك عبر الجلسات.',
    details: [
      'ذاكرة طويلة المدى تحفظ محادثاتك السابقة',
      'RAG Pipeline لاسترجاع المعرفة ذات الصلة',
      'تحديث مستمر لقاعدة المعرفة',
      'تعلم من تفاعلات المستخدمين',
    ],
  },
  {
    id: 'privacy',
    icon: Shield,
    title: 'الخصوصية والأمان',
    gradient: 'from-rose-500 to-rose-700',
    content: 'أمان بياناتك هو أولويتنا القصوى. نطبق أحدث معايير الأمان لحماية معلوماتك.',
    details: [
      'تشفير كامل للبيانات في transit و rest',
      'عدم مشاركة بيانات المستخدمين مع أطراف ثالثة',
      'إمكانية حذف المحادثات والبيانات بالكامل',
      'دعم التشغيل المحلي عبر Gemma 4 للخصوصية القصوى',
    ],
  },
  {
    id: 'how-it-works',
    icon: Workflow,
    title: 'طريقة عمل المنصة',
    gradient: 'from-cyan-500 to-cyan-700',
    content: 'KING2 AI يعمل بنظام هجين يجمع بين التشغيل المحلي والسحابي.',
    steps: [
      { title: 'استقبال الطلب', desc: 'يتم تحليل طلبك وتصنيفه تلقائياً' },
      { title: 'اختيار المزود', desc: 'نظام التوجيه الذكي يختار أفضل نموذج' },
      { title: 'استرجاع المعرفة', desc: 'RAG يسحب المعلومات ذات الصلة من قاعدة المعرفة' },
      { title: 'معالجة ذكية', desc: 'النموذج يعالج طلبك مع السياق الكامل' },
      { title: 'توليد الرد', desc: 'يتم توليد الرد بدقة وباللغة العربية الفصحى' },
    ],
  },
];

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="h-full overflow-y-auto bg-surface-primary">
      {/* Hero */}
      <section className="relative px-4 pt-12 pb-8 sm:px-6 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-king-600/10 blur-[100px]" />
          <div className="absolute right-1/4 top-1/2 h-[250px] w-[250px] rounded-full bg-amber-500/8 blur-[80px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-king-500 to-king-700 shadow-2xl shadow-king-900/40 ring-1 ring-white/10 mb-5">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            عن <span className="bg-gradient-to-r from-king-400 to-amber-400 bg-clip-text text-transparent">KING2 AI</span>
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
            منصة الذكاء الاصطناعي العربية الأولى — مساعدك الذكي الشامل
          </p>
        </motion.div>
      </section>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-zinc-800/40 bg-surface-secondary/50 p-6 sm:p-8 hover:border-zinc-700/60 transition-all"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${section.gradient} shadow-lg ring-1 ring-white/10`}>
                <section.icon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">{section.content}</p>

            {/* Features Grid */}
            {'features' in section && section.features && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {section.features.map((f: any) => (
                  <div key={f.label} className="flex items-start gap-2.5 rounded-xl bg-surface-tertiary/30 p-3 border border-zinc-800/30">
                    <f.icon className="w-4 h-4 text-king-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">{f.label}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Models */}
            {'models' in section && section.models && (
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {section.models.map((m: any) => (
                  <div key={m.name} className="flex items-center gap-3 rounded-xl bg-surface-tertiary/30 p-3.5 border border-zinc-800/30">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-king-600/30 to-king-800/30 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-king-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{m.name}</p>
                      <p className="text-[11px] text-zinc-500">{m.provider} · {m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Agents */}
            {'agents' in section && section.agents && (
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {section.agents.map((a: any) => (
                  <div key={a.name} className="rounded-xl bg-surface-tertiary/30 p-3.5 border border-zinc-800/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="w-4 h-4 text-amber-400" />
                      <p className="text-sm font-medium text-white">{a.name}</p>
                    </div>
                    <p className="text-[11px] text-amber-400/80 mb-1">{a.role}</p>
                    <p className="text-[11px] text-zinc-500">{a.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Steps */}
            {'steps' in section && section.steps && (
              <div className="space-y-3 mt-4">
                {section.steps.map((s: any, i: number) => (
                  <div key={s.title} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-king-600/20 text-king-400 text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{s.title}</p>
                      <p className="text-xs text-zinc-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Details List */}
            {'details' in section && section.details && !section.steps && !section.features && !section.models && !section.agents && (
              <ul className="space-y-2 mt-3">
                {section.details.map((d: string, i: number) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-king-500/50 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
