'use client';

import { motion } from 'framer-motion';
import { Sparkles, Cpu, Zap, Shield } from 'lucide-react';

interface Provider {
  name: string;
  model: string;
  description: string;
  color: string;
  borderColor: string;
  gradient: string;
}

const providers: Provider[] = [
  {
    name: 'Groq',
    model: 'Llama 4 Scout',
    description: 'أسرع استجابة مع دعم ممتاز للأكواد البرمجية',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    gradient: 'from-emerald-500/10 to-transparent',
  },
  {
    name: 'Gemini',
    model: 'Gemini 2.5 Flash',
    description: 'قوة Google AI للتحليل والرؤية الحاسوبية',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    gradient: 'from-blue-500/10 to-transparent',
  },
  {
    name: 'OpenRouter',
    model: 'Gemini 2.5 Flash',
    description: 'بوابة موحدة لأحدث نماذج AI مفتوحة المصدر',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    gradient: 'from-purple-500/10 to-transparent',
  },
  {
    name: 'Z.ai',
    model: 'GLM-5.1',
    description: 'نماذج صينية متطورة للإبداع والمهام العامة',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/20',
    gradient: 'from-rose-500/10 to-transparent',
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export function ModelsShowcase() {
  return (
    <section id="models" className="relative px-4 py-20 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-king-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-king-500/20 bg-king-500/10 px-4 py-1.5 text-sm text-king-300">
            <Cpu className="h-4 w-4" />
            <span>مزودون متعددون</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            أقوى مزودي AI في العالم
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-zinc-400">
            نختار الأفضل تلقائياً حسب طلبك. نظام التوجيه الذكي يحلل المحتوى
            ويوجهه لأفضل مزود متاح.
          </p>
        </motion.div>

        {/* Provider Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {providers.map((provider) => (
            <motion.div
              key={provider.name}
              variants={itemVariants}
              className={`group relative overflow-hidden rounded-2xl border ${provider.borderColor} bg-surface-secondary/50 p-5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg`}
            >
              {/* Gradient */}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${provider.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />

              {/* Header */}
              <div className="relative mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-tertiary ring-1 ring-zinc-800/50">
                  <span className="text-sm font-bold text-white">
                    {provider.name[0]}
                  </span>
                </div>
                <div>
                  <h3 className={`font-semibold text-white ${provider.color}`}>
                    {provider.name}
                  </h3>
                  <p className="text-xs text-zinc-500">{provider.model}</p>
                </div>
              </div>

              {/* Description */}
              <p className="relative text-sm leading-7 text-zinc-400">
                {provider.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Smart Routing Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto max-w-3xl rounded-2xl border border-king-600/20 bg-gradient-to-br from-king-600/10 via-king-500/5 to-accent-gold/10 p-6 text-center backdrop-blur-sm sm:p-8"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-king-600/20 ring-1 ring-king-500/30">
            <Shield className="h-6 w-6 text-king-400" />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-white">
            توجيه ذكي تلقائي
          </h3>
          <p className="mx-auto max-w-xl text-sm leading-7 text-zinc-400">
            KING2 لا يعتمد على مزود واحد. نظام التوجيه الذكي يحلل طلبك،
            يفحص حالة كل مزود (سرعة، صحة، توفر)، ويختار الأفضل لك تلقائياً.
            استمتع بأعلى جودة وأسرع استجابة دون أي إعدادات معقدة.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              { label: 'تحليل المحتوى', icon: Zap },
              { label: 'فحص الصحة', icon: Shield },
              { label: 'اختيار الأفضل', icon: Cpu },
            ].map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-tertiary px-3 py-1.5 text-xs text-zinc-400 ring-1 ring-zinc-800/50"
              >
                <item.icon className="h-3.5 w-3.5 text-king-400" />
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
