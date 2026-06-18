'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AgentChat } from '@/components/agent/AgentChat';

const AGENTS = [
  {
    id: 'bug-hunter',
    icon: '🕵️',
    name: 'Bug_Hunter_Agent',
    role: 'صائد الأخطاء',
    description: 'يفحص السيرفر والـ API Routes، ويتنبأ بأخطاء الـ 404 والـ 500 قبل رفع الكود على Vercel، مستنداً إلى داتا الـ Bug Dataset من Kaggle.',
    color: 'from-red-600 to-orange-600',
    bgGlow: 'bg-red-500/10',
  },
  {
    id: 'opencode-refiner',
    icon: '💻',
    name: 'OpenCode_Refiner_Agent',
    role: 'مهندس الأكواد',
    description: 'توليد وتحسين شفرات Next.js 14 و Typescript النظيفة والمطابقة لمعايير هندسة البرمجيات الاحترافية.',
    color: 'from-emerald-600 to-teal-600',
    bgGlow: 'bg-emerald-500/10',
  },
  {
    id: 'kaggle-injecter',
    icon: '📊',
    name: 'Kaggle_Data_Injecter',
    role: 'محلل البيانات',
    description: 'سحب جداول البيانات من Kaggle، وتنظيفها عبر سكريبتات بايثون، وتحويلها إلى كائنات JSON جاهزة لحقنها في الـ RAG Pipeline.',
    color: 'from-violet-600 to-purple-600',
    bgGlow: 'bg-violet-500/10',
  },
  {
    id: 'sovereign-translator',
    icon: '🌐',
    name: 'Sovereign_Translator_Agent',
    role: 'المترجم السيادي',
    description: 'الترجمة الفورية والاحترافية بين 10 لغات: العربية، الإنجليزية، الألمانية، الفرنسية، الإسبانية، الصينية، التركية، الفارسية، الأردية، الروسية. مع الحفاظ على السياق والدقة اللغوية.',
    color: 'from-sky-600 to-blue-600',
    bgGlow: 'bg-sky-500/10',
  },
];

export default function AgentPage() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);

  return (
    <div className="flex h-full">
      {/* Agent Sidebar */}
      <aside className="w-72 shrink-0 border-l border-zinc-800/30 bg-surface-secondary/50 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-zinc-800/30">
          <h2 className="text-sm font-bold text-white">AIAGENT</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">اختر الوكيل الذكي</p>
        </div>

        <div className="flex-1 p-3 space-y-2">
          {AGENTS.map((agent, i) => (
            <motion.button
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full text-right rounded-xl p-3 transition-all duration-200 ${
                selectedAgent.id === agent.id
                  ? 'bg-king-600/15 ring-1 ring-king-500/20'
                  : 'hover:bg-surface-tertiary'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-lg shrink-0`}>
                  {agent.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${
                      selectedAgent.id === agent.id ? 'text-king-400' : 'text-zinc-200'
                    }`}>
                      {agent.name}
                    </p>
                    {selectedAgent.id === agent.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-king-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{agent.role}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected Agent Details */}
        <div className="p-4 border-t border-zinc-800/30 bg-surface-tertiary/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{selectedAgent.icon}</span>
            <span className="text-xs font-medium text-zinc-400">{selectedAgent.name}</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            {selectedAgent.description}
          </p>
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/30 bg-surface-secondary/30">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedAgent.color} flex items-center justify-center text-base`}>
              {selectedAgent.icon}
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">{selectedAgent.name}</h1>
              <p className="text-[10px] text-zinc-500">{selectedAgent.role}</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            نشط
          </span>
        </div>
        <AgentChat agentId={selectedAgent.id} agentName={selectedAgent.name} />
      </div>
    </div>
  );
}
