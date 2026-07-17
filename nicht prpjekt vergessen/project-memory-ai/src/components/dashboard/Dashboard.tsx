'use client'

import React, { useEffect, useState } from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { createClient } from '@/lib/supabase-browser'
import { 
  LayoutDashboard, Zap, Target, DollarSign, Radio, Users, Globe2, User,
  Code2, Clapperboard, Folder, FileText, CheckCircle, Clock,
  TrendingUp, Activity, Sparkles
} from 'lucide-react'
import { TrendRadar } from './TrendRadar'
import { EngagementBot } from './EngagementBot'
import { RevenueDashboard } from './RevenueDashboard'
import { LiveCenter } from './LiveCenter'
import { CompetitorsRadar } from './CompetitorsRadar'

const socialStats = [
  { platform: 'YouTube', followers: '125K', views: '2.3M', likes: '89K', growth: '+12%' },
  { platform: 'TikTok', followers: '89K', views: '5.1M', likes: '456K', growth: '+23%' },
  { platform: 'Instagram', followers: '45K', views: '890K', likes: '34K', growth: '+8%' },
]

const mockActivities = [
  { action: 'Audit completed', project: 'E-Commerce', time: '5 min ago', type: 'success' },
  { action: 'File uploaded', project: 'AI Dashboard', time: '1h ago', type: 'info' },
  { action: 'Task completed', project: 'Mobile App', time: '2h ago', type: 'success' },
  { action: 'New issue found', project: 'API Service', time: '3h ago', type: 'warning' },
]

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  color: string
  last_activity: string
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
}

const DASHBOARD_TABS = [
  { id: 'main', icon: LayoutDashboard, labelAr: 'الرئيسية', labelEn: 'Main', color: 'purple' },
  { id: 'trends', icon: Zap, labelAr: 'الترندات', labelEn: 'Trends', color: 'orange' },
  { id: 'engagement', icon: Users, labelAr: 'التفاعل', labelEn: 'Engagement', color: 'pink' },
  { id: 'revenue', icon: DollarSign, labelAr: 'الأرباح', labelEn: 'Revenue', color: 'green' },
  { id: 'live', icon: Radio, labelAr: 'المباشر', labelEn: 'Live', color: 'red' },
  { id: 'competitors', icon: Target, labelAr: 'المنافسين', labelEn: 'Competitors', color: 'orange' },
]

export function Dashboard() {
  const { t, lang, setActiveWorkspace, user, activeDashboardTab, setActiveDashboardTab } = useWorkspace()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          supabase.from('projects').select('*').eq('user_id', user.id).order('last_activity', { ascending: false }).limit(10),
          supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(5)
        ])
        if (projectsRes.data) setProjects(projectsRes.data)
        if (tasksRes.data) setTasks(tasksRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, supabase])

  // Render the active sub-tab
  if (activeDashboardTab === 'trends') return <TrendRadar />
  if (activeDashboardTab === 'engagement') return <EngagementBot />
  if (activeDashboardTab === 'revenue') return <RevenueDashboard />
  if (activeDashboardTab === 'live') return <LiveCenter />
  if (activeDashboardTab === 'competitors') return <CompetitorsRadar />

  const stats = [
    { label: 'total_projects', value: projects.length || '0', icon: Folder, change: '+1', color: 'purple' },
    { label: 'files_analyzed', value: '0', icon: FileText, change: '+0', color: 'cyan' },
    { label: 'tasks_done', value: tasks.filter(t => t.status === 'DONE').length.toString(), icon: CheckCircle, change: '+0', color: 'green' },
    { label: 'pending', value: tasks.filter(t => t.status !== 'DONE').length.toString(), icon: Clock, change: '-0', color: 'orange' },
  ]

  const recentProjects = projects.map(p => ({
    name: p.name,
    status: p.status.toLowerCase(),
    files: 0,
    lastEdit: new Date(p.last_activity).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')
  }))

  const getColorClass = (color: string) => {
    const colors: any = {
      purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
      cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
      green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
      orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
    }
    return colors[color] || colors.purple
  }

  return (
    <div className="h-full overflow-auto">
      {/* Sub-Navigation */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {DASHBOARD_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveDashboardTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap border ${
                activeDashboardTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/20 border-transparent'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent'
              }`}
            >
              <tab.icon size={14} />
              {lang === 'ar' ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-wide bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {lang === 'ar' ? 'مرحباً بك في منصة AlKing 2.0' : 'Welcome to AlKing 2.0 Platform'}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveWorkspace('inspector')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 text-sm font-bold hover:bg-purple-500/30 transition-all"
            >
              <Code2 size={16} />
              {t('inspector')}
            </button>
            <button 
              onClick={() => setActiveWorkspace('studio')}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 text-sm font-bold hover:bg-cyan-500/30 transition-all"
            >
              <Clapperboard size={16} />
              {t('studio')}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`glass-card p-4 border ${getColorClass(stat.color)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t(stat.label)}</p>
                  <p className="text-2xl font-black mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getColorClass(stat.color).split(' ')[0]}`}>
                  <stat.icon size={20} className={getColorClass(stat.color).split(' ')[2]} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <TrendingUp size={12} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold">{stat.change}</span>
                <span className="text-slate-500">{lang === 'ar' ? 'هذا الأسبوع' : 'this week'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2 glass-card p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Folder size={18} className="text-purple-400" />
                {lang === 'ar' ? 'المشاريع الأخيرة' : 'Recent Projects'}
              </h2>
              <button className="text-xs text-slate-500 hover:text-white transition-colors">
                {lang === 'ar' ? 'عرض الكل' : 'View All'}
              </button>
            </div>
            <div className="space-y-3">
              {recentProjects.map((project, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-emerald-400' : 'bg-orange-400'}`} />
                    <div>
                      <p className="font-bold text-white text-sm">{project.name}</p>
                      <p className="text-slate-500 text-xs">{project.files} {lang === 'ar' ? 'ملف' : 'files'}</p>
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs">{project.lastEdit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Stats */}
          <div className="glass-card p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-cyan-400" />
                {lang === 'ar' ? 'إحصائيات السوشيال' : 'Social Stats'}
              </h2>
            </div>
            <div className="space-y-4">
              {socialStats.map((stat, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{stat.platform}</span>
                    <span className="text-emerald-400 text-xs font-bold">{stat.growth}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-purple-400 text-xs">{lang === 'ar' ? 'متابعون' : 'Followers'}</p>
                      <p className="text-white text-sm font-bold">{stat.followers}</p>
                    </div>
                    <div>
                      <p className="text-cyan-400 text-xs">{lang === 'ar' ? 'مشاهدات' : 'Views'}</p>
                      <p className="text-white text-sm font-bold">{stat.views}</p>
                    </div>
                    <div>
                      <p className="text-pink-400 text-xs">{lang === 'ar' ? 'إعجابات' : 'Likes'}</p>
                      <p className="text-white text-sm font-bold">{stat.likes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="glass-card p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" />
              {lang === 'ar' ? 'سجل النشاطات' : 'Activity Log'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {mockActivities.map((activity, i) => (
              <div key={i} className={`p-3 rounded-xl border ${
                activity.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                activity.type === 'warning' ? 'bg-orange-500/10 border-orange-500/30' :
                'bg-cyan-500/10 border-cyan-500/30'
              }`}>
                <p className="text-white text-sm font-bold">{activity.action}</p>
                <p className="text-slate-500 text-xs mt-1">{activity.project}</p>
                <p className="text-slate-600 text-xs mt-2">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
