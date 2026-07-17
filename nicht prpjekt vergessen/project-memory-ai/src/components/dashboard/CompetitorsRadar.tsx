'use client'

import React, { useState } from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { Users, TrendingUp, TrendingDown, BarChart3, Target, Eye, ThumbsUp, Video, Search, Plus, ArrowUpRight, Activity, Award } from 'lucide-react'

interface Competitor {
  id: string
  name: string
  channel: string
  avatar: string
  subscribers: number
  totalViews: number
  videosCount: number
  avgViewsPerVideo: number
  growth: number
  engagement: number
  category: string
  strengths: string[]
  weaknesses: string[]
  lastVideoTitle: string
  lastVideoViews: number
}

const MOCK_COMPETITORS: Competitor[] = [
  {
    id: 'comp1', name: 'Tech Ahmed', channel: '@TechAhmed', avatar: '👨‍💻',
    subscribers: 450000, totalViews: 28000000, videosCount: 320,
    avgViewsPerVideo: 87500, growth: 12, engagement: 8.4,
    category: 'تكنولوجيا', strengths: ['محتوى تعليمي', 'إنتاج عالي', 'عنوان جذاب'],
    weaknesses: ['نادر النشر', 'لا يتفاعل مع الجمهور'],
    lastVideoTitle: 'أفضل 10 أدوات AI للمبرمجين 2025',
    lastVideoViews: 125000,
  },
  {
    id: 'comp2', name: 'Sara Vlogs', channel: '@SaraVlogs', avatar: '🎥',
    subscribers: 890000, totalViews: 52000000, videosCount: 560,
    avgViewsPerVideo: 92800, growth: 23, engagement: 12.1,
    category: 'فلوغ', strengths: ['نشر يومي', 'تفاعل عالي', 'قصص شخصية'],
    weaknesses: ['جودة تصوير متوسطة', 'تكرار المواضيع'],
    lastVideoTitle: 'يوم في حياة مبرمجة 💻 | Vlog',
    lastVideoViews: 234000,
  },
  {
    id: 'comp3', name: 'CodeMaster', channel: '@CodeMaster', avatar: '⚡',
    subscribers: 230000, totalViews: 15000000, videosCount: 180,
    avgViewsPerVideo: 83300, growth: 45, engagement: 15.2,
    category: 'برمجة', strengths: ['محتوى متخصص', 'شروحات عميقة', 'SEO ممتاز'],
    weaknesses: ['إنتاج بطيء', 'محتوى طويل جداً'],
    lastVideoTitle: 'بناء تطبيق Full Stack في 30 دقيقة',
    lastVideoViews: 189000,
  },
  {
    id: 'comp4', name: 'AI Revolution', channel: '@AIRevolution', avatar: '🤖',
    subscribers: 670000, totalViews: 38000000, videosCount: 240,
    avgViewsPerVideo: 158000, growth: 67, engagement: 18.9,
    category: 'ذكاء اصطناعي', strengths: ['ترندات حارة', 'عناوين صادمة', 'توزيع ممتاز'],
    weaknesses: ['معلومات سطحية', 'clickbait'],
    lastVideoTitle: 'هذا الذكاء الاصطناعي سينهي البرمجة! 🤯',
    lastVideoViews: 456000,
  },
  {
    id: 'comp5', name: 'Gamer Zone', channel: '@GamerZone', avatar: '🎮',
    subscribers: 1200000, totalViews: 95000000, videosCount: 890,
    avgViewsPerVideo: 106700, growth: 8, engagement: 6.3,
    category: 'ألعاب', strengths: ['جمهور كبير', 'نشر متكرر', 'livestreams'],
    weaknesses: ['محتوى مكرر', 'قلة تميز'],
    lastVideoTitle: 'تحديث جديد في GTA 6 كل ما نعرفه',
    lastVideoViews: 890000,
  },
]

export function CompetitorsRadar() {
  const { lang } = useWorkspace()
  const [competitors] = useState<Competitor[]>(MOCK_COMPETITORS)
  const [selectedComp, setSelectedComp] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = competitors.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.channel.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.subscribers - a.subscribers)

  const avgGrowth = Math.round(competitors.reduce((a, c) => a + c.growth, 0) / competitors.length)
  const totalSubs = competitors.reduce((a, c) => a + c.subscribers, 0)
  const bestGrowth = Math.max(...competitors.map(c => c.growth))
  const bestEngagement = Math.max(...competitors.map(c => c.engagement))

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-wide bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent flex items-center gap-3">
            <Target size={28} className="text-orange-400" />
            {lang === 'ar' ? 'رادار المنافسين' : 'Competitors Radar'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'ar' ? 'تحليل أداء قنوات المنافسين بدقة' : 'Analyze competitor channel performance'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl text-xs font-bold">
          <Plus size={14} /> {lang === 'ar' ? 'إضافة منافس' : 'Add Competitor'}
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: lang === 'ar' ? 'منافسون' : 'Competitors', value: competitors.length.toString(), icon: Users, color: 'from-blue-500/20' },
          { label: lang === 'ar' ? 'إجمالي المشتركين' : 'Total Subs', value: (totalSubs / 1000000).toFixed(1) + 'M', icon: Eye, color: 'from-purple-500/20' },
          { label: lang === 'ar' ? 'متوسط النمو' : 'Avg Growth', value: `${avgGrowth}%`, icon: TrendingUp, color: 'from-green-500/20' },
          { label: lang === 'ar' ? 'أفضل تفاعل' : 'Best Engagement', value: `${bestEngagement}%`, icon: Activity, color: 'from-cyan-500/20' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 border border-white/10 rounded-xl bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">{stat.label}</p>
                <p className="text-2xl font-black mt-1 text-white">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color} to-transparent border border-white/10`}>
                <stat.icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'ar' ? 'ابحث عن منافس...' : 'Search competitor...'}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-1 focus:ring-orange-500/50 text-white placeholder:text-slate-600"
        />
      </div>

      {/* Competitor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((comp, i) => (
          <div
            key={comp.id}
            onClick={() => setSelectedComp(selectedComp === comp.id ? null : comp.id)}
            className={`glass-card p-5 border rounded-xl bg-white/5 transition-all cursor-pointer ${
              selectedComp === comp.id ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-yellow-500/30 flex items-center justify-center text-2xl border border-white/10 shrink-0">
                {comp.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white">{comp.name}</h3>
                  <span className="text-[10px] text-slate-500">{comp.channel}</span>
                  {i === 0 && <span className="text-[10px] text-yellow-400 px-1.5 py-0.5 bg-yellow-500/10 rounded-full">#1</span>}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Award size={10} /> {comp.category}
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${
                comp.growth >= avgGrowth ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {comp.growth >= avgGrowth ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                +{comp.growth}%
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-2 bg-white/5 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase">{lang === 'ar' ? 'مشتركين' : 'Subs'}</p>
                <p className="text-sm font-bold text-white">{(comp.subscribers / 1000).toFixed(0)}K</p>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase">{lang === 'ar' ? 'مشاهدات' : 'Views'}</p>
                <p className="text-sm font-bold text-white">{(comp.totalViews / 1000000).toFixed(1)}M</p>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase">{lang === 'ar' ? 'تفاعل' : 'Eng.'}</p>
                <p className="text-sm font-bold text-white">{comp.engagement}%</p>
              </div>
            </div>

            {/* Last Video */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Video size={12} className="text-slate-500" />
                <span className="text-[10px] text-slate-500">{lang === 'ar' ? 'آخر فيديو' : 'Latest Video'}</span>
              </div>
              <p className="text-xs text-slate-300 truncate">{comp.lastVideoTitle}</p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-cyan-400">
                <Eye size={10} /> {comp.lastVideoViews.toLocaleString()} {lang === 'ar' ? 'مشاهدة' : 'views'}
              </div>
            </div>

            {/* Expanded Analysis */}
            {selectedComp === comp.id && (
              <div className="mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase mb-2">{lang === 'ar' ? 'نقاط قوة' : 'Strengths'}</p>
                    {comp.strengths.map((s, idx) => (
                      <span key={idx} className="block px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-300 mb-1">{s}</span>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] text-red-400 font-bold uppercase mb-2">{lang === 'ar' ? 'نقاط ضعف' : 'Weaknesses'}</p>
                    {comp.weaknesses.map((w, idx) => (
                      <span key={idx} className="block px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-300 mb-1">{w}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl border border-orange-500/20">
                  <p className="text-[10px] font-bold text-orange-400 uppercase">{lang === 'ar' ? 'توصية تنافسية' : 'Competitive Tip'}</p>
                  <p className="text-xs text-orange-200 mt-1">
                    {lang === 'ar'
                      ? `للتغلب على ${comp.name}، ركز على ${comp.weaknesses[0]?.toLowerCase()} وزد ${comp.strengths[0]?.toLowerCase()}`
                      : `To beat ${comp.name}, focus on improving ${comp.weaknesses[0]?.toLowerCase()} while leveraging ${comp.strengths[0]?.toLowerCase()}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
