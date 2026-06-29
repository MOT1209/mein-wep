'use client';

import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqCategories = [
  {
    id: 'general',
    title: 'أسئلة عامة',
    icon: (
      <svg className="h-5 w-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
    items: [
      {
        q: 'ما هي منصة KING2؟',
        a: 'KING2 هي منصة ذكاء اصطناعي متطورة تجمع بين أحدث نماذج اللغة الكبيرة (GPT-4, Claude, Gemini وغيرها) في واجهة موحدة. تتيح لك الدردشة مع الذكاء الاصطناعي، إنشاء الصور، تحليل الملفات، وغيرها من المهام المتقدمة — كل ذلك في بيئة آمنة وسريعة.',
      },
      {
        q: 'كيف أبدأ استخدام KING2؟',
        a: 'يمكنك البدء فوراً بالتسجيل مجاناً. بعد إنشاء حساب، ستتمكن من الوصول إلى لوحة التحكم وبدء محادثات جديدة مع الذكاء الاصطناعي. لا تحتاج إلى بطاقة ائتمان للبدء — النسخة المجانية تمنحك عدداً من الرسائل اليومية لتجربة المنصة.',
      },
    ],
  },
  {
    id: 'features',
    title: 'المميزات والخدمات',
    icon: (
      <svg className="h-5 w-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    items: [
      {
        q: 'ما هي المميزات المتاحة؟',
        a: 'KING2 تقدم مجموعة واسعة من المميزات: نماذج ذكاء اصطناعي متعددة (GPT-4o, Claude 3.5, Gemini 1.5, Grok, DeepSeek)، إنشاء صور بالذكاء الاصطناعي، معالجة وتحليل الملفات (PDF, Word, Excel)، محادثات صوتية، مكتبة قوالب جاهزة، وذاكرة طويلة المدى للمحادثات.',
      },
      {
        q: 'هل يمكنني استخدام KING2 على الجوال؟',
        a: 'نعم، KING2 متجاوبة بالكامل مع جميع الأجهزة. يمكنك استخدامها من متصفح الجوال مباشرة، كما تتوفر تطبيقات iOS و Android للتحميل من المتاجر الرسمية.',
      },
    ],
  },
  {
    id: 'account',
    title: 'الحساب والترقية',
    icon: (
      <svg className="h-5 w-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    items: [
      {
        q: 'كيف يمكن ترقية حسابي؟',
        a: 'يمكنك ترقية حسابك من لوحة التحكم > الإعدادات > الخطط والفوترة. نقدم عدة باقات شهرية وسنوية تناسب احتياجاتك. عند الترقية، ستحصل على رسائل غير محدودة، أولوية في المعالجة، وإمكانية الوصول إلى جميع النماذج والمميزات الحصرية.',
      },
      {
        q: 'هل يمكن إلغاء الاشتراك في أي وقت؟',
        a: 'بالتأكيد. يمكنك إلغاء اشتراكك في أي وقت من إعدادات الحساب. إذا ألغيت الاشتراك، سيبقى حسابك نشطاً حتى نهاية فترة الفوترة الحالية، ثم يتحول تلقائياً إلى النسخة المجانية.',
      },
    ],
  },
  {
    id: 'security',
    title: 'الخصوصية والأمان',
    icon: (
      <svg className="h-5 w-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    items: [
      {
        q: 'هل بياناتي آمنة على KING2؟',
        a: 'نعم، أمن بياناتك هو أولويتنا القصوى. نستخدم تشفير AES-256 للبيانات المخزنة وتشفير TLS 1.3 أثناء النقل. جميع المحادثات مشفرة ولا نشارك بياناتك مع أطراف ثالثة. نلتزم بأعلى معايير الأمان العالمية مثل GDPR و SOC 2.',
      },
      {
        q: 'كيف تتم حماية خصوصية محادثاتي؟',
        a: 'جميع محادثاتك خاصة ولا يمكن لأحد الاطلاع عليها إلا أنت. لا نستخدم محتوى محادثاتك لتدريب النماذج بدون إذن صريح. يمكنك أيضاً تفعيل خاصية "المحادثة المؤقتة" التي لا تحفظ أي سجل بعد إنهاء الجلسة.',
      },
    ],
  },
  {
    id: 'support',
    title: 'الدعم الفني',
    icon: (
      <svg className="h-5 w-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    items: [
      {
        q: 'كيف يمكن التواصل مع الدعم الفني؟',
        a: 'يمكنك التواصل معنا عبر عدة قنوات: البريد الإلكتروني (نرد خلال 24 ساعة)، الدردشة المباشرة (متاحة 24/7)، أو عبر صفحة الدعم في التطبيق. فريق الدعم الفني متخصص ومستعد لمساعدتك في أي استفسار أو مشكلة تواجهها.',
      },
    ],
  },
];

const quickGuides = [
  {
    title: 'بدء محادثة جديدة',
    description: 'تعلم كيفية إنشاء محادثة واختيار النموذج المناسب',
    icon: (
      <svg className="h-6 w-6 text-king-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    href: '/chat',
  },
  {
    title: 'إنشاء الصور',
    description: 'دليل استخدام مولد الصور بالذكاء الاصطناعي',
    icon: (
      <svg className="h-6 w-6 text-king-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
    href: '/chat',
  },
  {
    title: 'تحليل الملفات',
    description: 'كيفية رفع وتحليل المستندات والملفات',
    icon: (
      <svg className="h-6 w-6 text-king-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    href: '/chat',
  },
  {
    title: 'إدارة الحساب',
    description: 'تحديث البيانات، تغيير كلمة المرور، وإدارة الفوترة',
    icon: (
      <svg className="h-6 w-6 text-king-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    href: '/settings',
  },
];

const contactChannels = [
  {
    label: 'البريد الإلكتروني',
    value: 'zwnt45602@gmail.com',
    icon: (
      <svg className="h-6 w-6 text-king-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: 'الدردشة المباشرة',
    value: 'متاحة 24/7',
    icon: (
      <svg className="h-6 w-6 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    label: 'تويتر',
    value: '@KING2_AI',
    icon: (
      <svg className="h-6 w-6 text-sky-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    href: 'https://twitter.com/KING2_AI',
  },
  {
    label: 'لينكد إن',
    value: 'KING2 AI',
    icon: (
      <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    href: 'https://linkedin.com/company/king2-ai',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-king-500 to-king-700 shadow-lg shadow-king-900/30">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">المساعدة والدعم</h1>
          <p className="mt-3 text-base text-zinc-400 sm:text-lg">كل ما تحتاج معرفته عن KING2</p>
        </div>

        {/* User Guide Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-king-500/10">
              <svg className="h-4 w-4 text-king-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">دليل الاستخدام</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {quickGuides.map((guide) => (
              <Link
                key={guide.title}
                href={guide.href}
                className="king-card group flex items-start gap-4 rounded-2xl border border-zinc-800/60 bg-surface-secondary p-5 transition-all hover:border-king-600/30 hover:shadow-lg hover:shadow-king-900/20"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-king-500/10 transition-colors group-hover:bg-king-500/20">
                  {guide.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{guide.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{guide.description}</p>
                </div>
                <svg className="mr-auto mt-1 h-5 w-5 shrink-0 text-zinc-600 transition-colors group-hover:text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gold/10">
              <svg className="h-4 w-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">الأسئلة الشائعة</h2>
          </div>

          <div className="space-y-4">
            {faqCategories.map((category) => (
              <div key={category.id} className="king-card rounded-2xl border border-zinc-800/60 bg-surface-secondary p-5 sm:p-6">
                <div className="mb-3 flex items-center gap-3">
                  {category.icon}
                  <h3 className="font-semibold text-white">{category.title}</h3>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item) => (
                    <AccordionItem
                      key={item.q}
                      value={item.q}
                      className="border-zinc-800/60 last:border-0"
                    >
                      <AccordionTrigger className="py-3 text-right text-sm font-medium text-zinc-300 hover:text-white [&[data-state=open]>svg]:text-accent-gold">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-7 text-zinc-400">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support Section */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-emerald/10">
              <svg className="h-4 w-4 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">تواصل معنا</h2>
          </div>

          <div className="king-card rounded-2xl border border-zinc-800/60 bg-surface-secondary p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {contactChannels.map((channel) => (
                <div key={channel.label} className="flex items-center gap-4 rounded-xl bg-surface-tertiary p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated">
                    {channel.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500">{channel.label}</p>
                    {'href' in channel ? (
                      <a
                        href={channel.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 block text-sm font-semibold text-zinc-200 transition-colors hover:text-accent-gold"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-semibold text-zinc-200">{channel.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-zinc-600">
              فريق الدعم الفني متاحة لخدمتك على مدار الساعة طوال أيام الأسبوع
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
