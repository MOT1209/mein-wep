'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Stats {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  todayMessages: number;
  totalKnowledgeBase: number;
  apiUsage: {
    gemini: { used: number; limit: number };
    groq: { used: number; limit: number };
  };
  systemHealth: {
    database: 'healthy' | 'unhealthy';
    api: 'healthy' | 'unhealthy';
    storage: 'healthy' | 'unhealthy';
  };
  recentActivity: Array<{
    id: string;
    type: 'user_signup' | 'message_sent' | 'knowledge_added';
    description: string;
    timestamp: Date;
  }>;
}

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'purple' | 'amber' | 'red';
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className={`king-card border ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}% من الأمس
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    if (status === 'loading') return;

    const username = (session?.user as any)?.username;
    if (!username || username !== 'Rashid2010') {
      router.replace('/');
      return;
    }

    const checkConnection = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      } catch {
        setConnectionStatus('disconnected');
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('فشل في تحميل الإحصائيات');
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
    fetchStats();

    const interval = setInterval(fetchStats, 30000);
    const healthInterval = setInterval(checkConnection, 15000);
    return () => {
      clearInterval(interval);
      clearInterval(healthInterval);
    };
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-king-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">جارٍ تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <p className="font-medium">{error || 'خطأ في تحميل البيانات'}</p>
          <p className="text-sm mt-1">تأكد من اتصال قاعدة البيانات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
          <p className="text-zinc-400 mt-1">مرحباً بك يا Rashid2010، تفضل بإدارة منصتك</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-tertiary/50 border border-zinc-800/50">
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : connectionStatus === 'disconnected' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-xs text-zinc-400">
              {connectionStatus === 'connected' ? 'متصل' : connectionStatus === 'disconnected' ? 'منفصل' : 'جارٍ الفحص...'}
            </span>
          </div>
          <span className={`king-badge ${connectionStatus === 'connected' ? 'king-badge-success' : 'king-badge-error'}`}>
            {connectionStatus === 'connected' ? 'النظام سليم' : 'تحقق من الاتصال'}
          </span>
          <span className="text-sm text-zinc-500">
            آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المستخدمين"
          value={stats.totalUsers.toLocaleString()}
          change={12}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="emerald"
        />

        <StatCard
          title="إجمالي المحادثات"
          value={stats.totalConversations.toLocaleString()}
          change={8}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          color="blue"
        />

        <StatCard
          title="إجمالي الرسائل"
          value={stats.totalMessages.toLocaleString()}
          change={15}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          }
          color="purple"
        />

        <StatCard
          title="رسائل اليوم"
          value={stats.todayMessages.toLocaleString()}
          change={23}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="amber"
        />
      </div>

      {/* API Usage & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Usage */}
        <div className="king-card">
          <h2 className="text-lg font-semibold text-white mb-4">استهلاك الـ APIs</h2>

          <div className="space-y-6">
            {/* Gemini */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-400">G</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Gemini 2.0 Flash</p>
                    <p className="text-xs text-zinc-500">Google AI</p>
                  </div>
                </div>
                <span className="text-sm text-zinc-400">
                  {stats.apiUsage.gemini.used.toLocaleString()} / {stats.apiUsage.gemini.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                  style={{
                    width: `${(stats.apiUsage.gemini.used / stats.apiUsage.gemini.limit) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Groq */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-emerald-400">GRQ</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Groq Mixtral</p>
                    <p className="text-xs text-zinc-500">GroqCloud</p>
                  </div>
                </div>
                <span className="text-sm text-zinc-400">
                  {stats.apiUsage.groq.used.toLocaleString()} / {stats.apiUsage.groq.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                  style={{
                    width: `${(stats.apiUsage.groq.used / stats.apiUsage.groq.limit) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="king-card">
          <h2 className="text-lg font-semibold text-white mb-4">حالة النظام</h2>

          <div className="space-y-4">
            {Object.entries(stats.systemHealth).map(([key, status]) => {
              const labels = {
                database: { name: 'قاعدة البيانات', icon: '🗄️' },
                api: { name: 'API', icon: '⚡' },
                storage: { name: 'التخزين', icon: '💾' },
              };

              return (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-surface-tertiary/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{labels[key as keyof typeof labels].icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{labels[key as keyof typeof labels].name}</p>
                      <p className="text-xs text-zinc-500">
                        {status === 'healthy' ? 'يعمل بشكل طبيعي' : 'غير متصل'}
                      </p>
                    </div>
                  </div>
                  <span className={`king-badge ${status === 'healthy' ? 'king-badge-success' : 'king-badge-error'}`}>
                    {status === 'healthy' ? 'سليم' : 'معطل'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Knowledge Base & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Base */}
        <div className="king-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">قاعدة المعرفة</h2>
            <button className="text-sm text-king-400 hover:text-king-300">
              إدارة +
            </button>
          </div>

          <div className="flex items-center justify-center h-32 rounded-xl bg-surface-tertiary/50 border border-zinc-800/50">
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{stats.totalKnowledgeBase}</p>
              <p className="text-sm text-zinc-400 mt-1">مقال في قاعدة المعرفة</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="king-card">
          <h2 className="text-lg font-semibold text-white mb-4">النشاط الأخير</h2>

          <div className="space-y-3 max-h-48 overflow-y-auto">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">لا يوجد نشاط حديث</p>
            ) : (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-tertiary/50">
                  <div className="w-8 h-8 rounded-lg bg-king-500/20 flex items-center justify-center flex-shrink-0">
                    {activity.type === 'user_signup' && <span>👤</span>}
                    {activity.type === 'message_sent' && <span>💬</span>}
                    {activity.type === 'knowledge_added' && <span>📚</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{activity.description}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="king-card">
        <h2 className="text-lg font-semibold text-white mb-4">إجراءات سريعة</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-4 rounded-xl bg-surface-tertiary/50 border border-zinc-800/50 hover:border-king-500/30 transition-all text-right">
            <svg className="w-6 h-6 text-king-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-sm font-medium text-white">إضافة مقال</p>
          </button>

          <button className="p-4 rounded-xl bg-surface-tertiary/50 border border-zinc-800/50 hover:border-king-500/30 transition-all text-right">
            <svg className="w-6 h-6 text-emerald-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-white">تصدير البيانات</p>
          </button>

          <button className="p-4 rounded-xl bg-surface-tertiary/50 border border-zinc-800/50 hover:border-king-500/30 transition-all text-right">
            <svg className="w-6 h-6 text-amber-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="text-sm font-medium text-white">تحديث الـ Cache</p>
          </button>

          <button className="p-4 rounded-xl bg-surface-tertiary/50 border border-zinc-800/50 hover:border-king-500/30 transition-all text-right">
            <svg className="w-6 h-6 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium text-white">مسح السجلات</p>
          </button>
        </div>
      </div>
    </div>
  );
}
