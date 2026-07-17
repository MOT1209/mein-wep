'use client'

import React, { useState } from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, BarChart3, Download, Calendar, ArrowUpRight, ExternalLink, ChevronDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const MONTHLY_DATA = [
  { month: 'يناير', revenue: 12500, views: 450000, subs: 1200 },
  { month: 'فبراير', revenue: 14800, views: 520000, subs: 1500 },
  { month: 'مارس', revenue: 16200, views: 610000, subs: 1800 },
  { month: 'أبريل', revenue: 15800, views: 580000, subs: 1600 },
  { month: 'مايو', revenue: 19200, views: 720000, subs: 2100 },
  { month: 'يونيو', revenue: 23500, views: 890000, subs: 2800 },
  { month: 'يوليو', revenue: 28100, views: 1050000, subs: 3400 },
  { month: 'أغسطس', revenue: 26300, views: 980000, subs: 3100 },
  { month: 'سبتمبر', revenue: 31200, views: 1200000, subs: 3900 },
  { month: 'أكتوبر', revenue: 35800, views: 1350000, subs: 4200 },
  { month: 'نوفمبر', revenue: 42300, views: 1580000, subs: 5100 },
  { month: 'ديسمبر', revenue: 48900, views: 1850000, subs: 5800 },
]

const PLATFORM_REVENUE = [
  { platform: 'YouTube', revenue: 24500, ads: 18200, memberships: 6300, change: '+12%', icon: '▶️' },
  { platform: 'TikTok', revenue: 8900, ads: 8900, memberships: 0, change: '+23%', icon: '🎵' },
  { platform: 'Instagram', revenue: 5600, ads: 3200, memberships: 2400, change: '+8%', icon: '📸' },
  { platform: 'Snapchat', revenue: 3200, ads: 3200, memberships: 0, change: '+45%', icon: '👻' },
]

export function RevenueDashboard() {
  const { lang } = useWorkspace()
  const [selectedPeriod, setSelectedPeriod] = useState('year')

  const totalRevenue = PLATFORM_REVENUE.reduce((a, p) => a + p.revenue, 0)
  const totalViews = MONTHLY_DATA[MONTHLY_DATA.length - 1].views
  const totalSubs = MONTHLY_DATA[MONTHLY_DATA.length - 1].subs
  const revenueGrowth = ((MONTHLY_DATA[MONTHLY_DATA.length - 1].revenue - MONTHLY_DATA[0].revenue) / MONTHLY_DATA[0].revenue * 100).toFixed(0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-wide bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
            <DollarSign size={28} className="text-emerald-400" />
            {lang === 'ar' ? 'لوحة الأرباح' : 'Revenue Dashboard'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'ar' ? 'متابعة الدخل من جميع المنصات في مكان واحد' : 'Track income across all platforms'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="month">{lang === 'ar' ? 'هذا الشهر' : 'This Month'}</option>
            <option value="quarter">{lang === 'ar' ? 'هذا الربع' : 'This Quarter'}</option>
            <option value="year">{lang === 'ar' ? 'هذه السنة' : 'This Year'}</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-xs font-bold">
            <Download size={14} /> {lang === 'ar' ? 'تصدير' : 'Export'}
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 border border-emerald-500/20 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">{lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
          <p className="text-3xl font-black text-white">{formatCurrency(totalRevenue)}</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs font-bold">
            <TrendingUp size={14} /> +{revenueGrowth}% {lang === 'ar' ? 'عن السنة الماضية' : 'vs last year'}
          </div>
        </div>
        <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">{lang === 'ar' ? 'إجمالي المشاهدات' : 'Total Views'}</p>
          <p className="text-3xl font-black text-white">{totalViews.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-cyan-400 text-xs font-bold">
            <BarChart3 size={14} /> +38% {lang === 'ar' ? 'نمو' : 'growth'}
          </div>
        </div>
        <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">{lang === 'ar' ? 'المشتركين' : 'Subscribers'}</p>
          <p className="text-3xl font-black text-white">{totalSubs.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-purple-400 text-xs font-bold">
            <ArrowUpRight size={14} /> +{((totalSubs - MONTHLY_DATA[0].subs) / MONTHLY_DATA[0].subs * 100).toFixed(0)}% {lang === 'ar' ? 'نمو' : 'growth'}
          </div>
        </div>
        <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">{lang === 'ar' ? ' RPM' : 'RPM'}</p>
          <p className="text-3xl font-black text-white">$8.42</p>
          <div className="flex items-center gap-1 mt-2 text-yellow-400 text-xs font-bold">
            <Wallet size={14} /> {lang === 'ar' ? 'لكل 1000 مشاهدة' : 'per 1000 views'}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="glass-card p-6 border border-white/10 rounded-xl bg-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-white">{lang === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</h3>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[10px] text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400" /> {lang === 'ar' ? 'الإيرادات' : 'Revenue'}</span>
            <span className="flex items-center gap-1 text-[10px] text-cyan-400"><div className="w-2 h-2 rounded-full bg-cyan-400" /> {lang === 'ar' ? 'المشاهدات' : 'Views'}</span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#475569" fontSize={10} />
              <YAxis stroke="#475569" fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
          <h3 className="font-bold text-white mb-4">{lang === 'ar' ? 'توزيع الإيرادات حسب المنصة' : 'Revenue by Platform'}</h3>
          <div className="space-y-4">
            {PLATFORM_REVENUE.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.icon}</span>
                  <div>
                    <p className="text-white text-sm font-bold">{p.platform}</p>
                    <div className="flex gap-3 text-[10px] text-slate-500">
                      <span>{lang === 'ar' ? 'إعلانات' : 'Ads'}: {formatCurrency(p.ads)}</span>
                      {p.memberships > 0 && <span>{lang === 'ar' ? 'عضوية' : 'Memberships'}: {formatCurrency(p.memberships)}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{formatCurrency(p.revenue)}</p>
                  <span className="text-emerald-400 text-xs font-bold">{p.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
          <h3 className="font-bold text-white mb-4">{lang === 'ar' ? 'مقاييس سريعة' : 'Quick Metrics'}</h3>
          <div className="space-y-3">
            {[
              { label: lang === 'ar' ? 'مشاهدات اليوم' : 'Today Views', value: '45,230', icon: TrendingUp, color: 'text-emerald-400' },
              { label: lang === 'ar' ? 'مشاهدات هذا الأسبوع' : 'This Week', value: '312,450', icon: BarChart3, color: 'text-cyan-400' },
              { label: lang === 'ar' ? 'متوسط وقت المشاهدة' : 'Avg Watch Time', value: '8:42', icon: Calendar, color: 'text-purple-400' },
              { label: lang === 'ar' ? 'نسبة النقر (CTR)' : 'Click Rate (CTR)', value: '12.4%', icon: ArrowUpRight, color: 'text-orange-400' },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <m.icon size={16} className={m.color} />
                  <span className="text-slate-300 text-xs">{m.label}</span>
                </div>
                <span className="text-white font-bold text-sm">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payout Info */}
      <div className="glass-card p-5 border border-emerald-500/20 rounded-xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard size={24} className="text-emerald-400" />
            <div>
              <p className="text-white font-bold">{lang === 'ar' ? 'آخر دفعة' : 'Last Payout'}</p>
              <p className="text-slate-400 text-xs">{lang === 'ar' ? 'تم تحويل' : 'Transferred'} <span className="text-emerald-400 font-bold">$12,450</span> {lang === 'ar' ? 'بتاريخ 15 يونيو 2025' : 'on June 15, 2025'}</p>
            </div>
          </div>
          <button className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 hover:text-white transition-all">
            <ExternalLink size={12} /> {lang === 'ar' ? 'عرض التفاصيل' : 'Details'}
          </button>
        </div>
      </div>
    </div>
  )
}
