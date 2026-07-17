'use client'

import React, { useState, useEffect } from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { MapPin, Radio, Users, Eye, TrendingUp, Activity, Clock, Globe, Play, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react'

interface LiveStream {
  id: string
  title: string
  platform: 'youtube' | 'tiktok' | 'twitch'
  viewerCount: number
  totalViews: number
  duration: string
  country: string
  flag: string
  category: string
  status: 'live' | 'ended'
  growth: number
}

const MOCK_LIVE_STREAMS: LiveStream[] = [
  { id: 'l1', title: 'بث مباشر | تطوير تطبيق AI', platform: 'youtube', viewerCount: 1234, totalViews: 45600, duration: '2:34:00', country: 'السعودية', flag: '🇸🇦', category: 'برمجة', status: 'live', growth: 23 },
  { id: 'l2', title: 'جيمنج | لعبة جديدة مع المشاهدين', platform: 'twitch', viewerCount: 8900, totalViews: 234000, duration: '1:20:00', country: 'مصر', flag: '🇪🇬', category: 'ألعاب', status: 'live', growth: 45 },
  { id: 'l3', title: 'طبخ | وصفة جديدة على الهواء', platform: 'tiktok', viewerCount: 3400, totalViews: 89000, duration: '0:45:00', country: 'الإمارات', flag: '🇦🇪', category: 'طبخ', status: 'live', growth: 12 },
  { id: 'l4', title: 'نقاش | مستقبل العملات الرقمية', platform: 'youtube', viewerCount: 567, totalViews: 12000, duration: '1:10:00', country: 'الكويت', flag: '🇰🇼', category: 'اقتصاد', status: 'live', growth: 8 },
  { id: 'l5', title: 'مراجعة هاتف جديد', platform: 'youtube', viewerCount: 2100, totalViews: 67000, duration: '0:30:00', country: 'قطر', flag: '🇶🇦', category: 'تكنولوجيا', status: 'ended', growth: -5 },
  { id: 'l6', title: 'تحدي رياضي | 24 ساعة', platform: 'tiktok', viewerCount: 12000, totalViews: 450000, duration: '5:20:00', country: 'البحرين', flag: '🇧🇭', category: 'رياضة', status: 'live', growth: 89 },
  { id: 'l7', title: 'تعليم | دورة برمجة كاملة', platform: 'twitch', viewerCount: 890, totalViews: 23000, duration: '3:00:00', country: 'عمان', flag: '🇴🇲', category: 'تعليم', status: 'live', growth: 34 },
]

const PLATFORM_ICONS: Record<string, string> = {
  youtube: '▶️',
  tiktok: '🎵',
  twitch: '📺',
}

const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  'السعودية': { lat: 24.7136, lng: 46.6753 },
  'مصر': { lat: 30.0444, lng: 31.2357 },
  'الإمارات': { lat: 25.2048, lng: 55.2708 },
  'الكويت': { lat: 29.3759, lng: 47.9774 },
  'قطر': { lat: 25.2854, lng: 51.5310 },
  'البحرين': { lat: 26.0667, lng: 50.5577 },
  'عمان': { lat: 23.5880, lng: 58.3829 },
}

export function LiveCenter() {
  const { lang } = useWorkspace()
  const [streams] = useState<LiveStream[]>(MOCK_LIVE_STREAMS)
  const [selectedStream, setSelectedStream] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const liveStreams = streams.filter(s => s.status === 'live')
  const totalViewers = liveStreams.reduce((a, s) => a + s.viewerCount, 0)
  const totalLive = liveStreams.length

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const formatNumber = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
    return n.toString()
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-wide bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-3">
            <Radio size={28} className="text-red-400" />
            {lang === 'ar' ? 'مركز التحكم المباشر' : 'Live Center'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'ar' ? 'راقب البثوث المباشرة والمشاهدات على الخريطة' : 'Monitor live streams and views on the map'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-400">{totalLive} {lang === 'ar' ? 'بث مباشر' : 'Live'}</span>
          </div>
          <button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50">
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {lang === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: lang === 'ar' ? 'المشاهدات المباشرة' : 'Live Viewers', value: formatNumber(totalViewers), icon: Eye, color: 'text-red-400' },
          { label: lang === 'ar' ? 'إجمالي المشاهدات' : 'Total Views', value: formatNumber(streams.reduce((a, s) => a + s.totalViews, 0)), icon: Activity, color: 'text-cyan-400' },
          { label: lang === 'ar' ? 'متوسط وقت المشاهدة' : 'Avg Watch Time', value: '2:15', icon: Clock, color: 'text-purple-400' },
          { label: lang === 'ar' ? 'دول نشطة' : 'Active Countries', value: new Set(streams.map(s => s.country)).size.toString(), icon: Globe, color: 'text-green-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 border border-white/10 rounded-xl bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">{stat.label}</p>
                <p className="text-2xl font-black mt-1 text-white">{stat.value}</p>
              </div>
              <stat.icon size={20} className={stat.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Map & Streams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <div className="lg:col-span-1 glass-card p-5 border border-white/10 rounded-xl bg-white/5 h-[400px] relative overflow-hidden">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-red-400" />
            {lang === 'ar' ? 'الخريطة الحية' : 'Live Map'}
          </h3>
          <div className="absolute inset-0 m-5 mt-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 overflow-hidden">
            {/* Simplified map with dots */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(239,68,68,0.3) 0%, transparent 50%), radial-gradient(circle at 60% 30%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 45% 60%, rgba(16,185,129,0.3) 0%, transparent 50%)'
            }} />
            {Object.entries(COUNTRY_COORDS).map(([country, coords], i) => {
              const stream = streams.find(s => s.country === country)
              const x = ((coords.lng + 180) / 360) * 100
              const y = ((90 - coords.lat) / 180) * 100
              const isLive = stream?.status === 'live'
              return (
                <div
                  key={i}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className={`w-4 h-4 rounded-full ${isLive ? 'bg-red-500 animate-ping' : 'bg-slate-600'} opacity-75 absolute`} />
                  <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500' : 'bg-slate-500'} relative z-10 border-2 border-white`} />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] px-2 py-1 rounded-lg whitespace-nowrap border border-white/10">
                    {country} {stream && `(${formatNumber(stream.viewerCount)})`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Streams List */}
        <div className="lg:col-span-2 space-y-3 max-h-[400px] overflow-auto">
          {streams.map(stream => (
            <div
              key={stream.id}
              onClick={() => setSelectedStream(selectedStream === stream.id ? null : stream.id)}
              className={`glass-card p-4 border rounded-xl bg-white/5 transition-all cursor-pointer ${
                selectedStream === stream.id ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 hover:bg-white/10'
              } ${stream.status === 'live' ? 'border-l-4 border-l-red-500' : 'opacity-60'}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{PLATFORM_ICONS[stream.platform]}</span>
                    <h3 className="text-sm font-bold text-white truncate">{stream.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {stream.flag} {stream.country}</span>
                    <span>{stream.category}</span>
                    <span><Clock size={10} className="inline" /> {stream.duration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-bold text-white">
                    <Eye size={14} className="text-red-400" />
                    {formatNumber(stream.viewerCount)}
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${stream.growth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stream.growth > 0 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    {stream.growth}%
                  </div>
                </div>
              </div>
              {selectedStream === stream.id && (
                <div className="mt-3 pt-3 border-t border-white/10 animate-in slide-in-from-top-2">
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                      <Play size={12} /> {lang === 'ar' ? 'مشاهدة البث' : 'Watch Stream'}
                    </button>
                    <button className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-400 hover:text-white transition-all">
                      {lang === 'ar' ? 'تحليل' : 'Analyze'}
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                    <span>{lang === 'ar' ? 'إجمالي المشاهدات' : 'Total Views'}: <span className="text-white font-bold">{formatNumber(stream.totalViews)}</span></span>
                    <span>{lang === 'ar' ? 'نسبة النمو' : 'Growth Rate'}: <span className={`font-bold ${stream.growth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{stream.growth}%</span></span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          {lang === 'ar' ? 'النشاط المباشر' : 'Live Activity'}
        </h3>
        <div className="space-y-2">
          {[
            { time: 'قبل دقيقة', ar: 'مشاهد جديد من السعودية', en: 'New viewer from Saudi Arabia' },
            { time: 'قبل 3 دقائق', ar: 'ارتفاع في المشاهدات بنسبة 15%', en: 'Viewership spike +15%' },
            { time: 'قبل 5 دقائق', ar: 'تعليق جديد على البث', en: 'New comment on stream' },
            { time: 'قبل 8 دقائق', ar: 'تمت مشاركة البث 12 مرة', en: 'Stream shared 12 times' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-300">{lang === 'ar' ? activity.ar : activity.en}</span>
              </div>
              <span className="text-[10px] text-slate-600">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
