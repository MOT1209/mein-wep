'use client'

import React from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { User, Shield, Bell, Zap, Palette, Globe, CreditCard, Sun, Moon } from 'lucide-react'

export function SettingsView() {
  const { lang, setLang, theme, setTheme, t, user } = useWorkspace()

  return (
    <div className="h-full overflow-auto bg-slate-950/50 backdrop-blur-md p-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header>
          <h1 className="text-4xl font-black mb-2 tracking-tight">{t('settings')}</h1>
          <p className="text-slate-500">{lang === 'ar' ? 'إدارة حسابك وتفضيلات المنصة.' : 'Manage your account and platform preferences.'}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-1">
            <SettingsTab icon={<User size={18} />} label={lang === 'ar' ? 'الملف الشخصي' : 'Account'} active />
            <SettingsTab icon={<Palette size={18} />} label={lang === 'ar' ? 'المظهر' : 'Appearance'} />
            <SettingsTab icon={<Shield size={18} />} label={lang === 'ar' ? 'الأمان' : 'Security'} />
            <SettingsTab icon={<Bell size={18} />} label={lang === 'ar' ? 'الإشعارات' : 'Notifications'} />
            <SettingsTab icon={<CreditCard size={18} />} label={lang === 'ar' ? 'الاشتراك' : 'Billing'} />
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Section */}
            <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-600">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{user?.user_metadata?.full_name || 'AlKing User'}</h3>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <button className="mt-2 text-xs text-purple-400 font-bold hover:underline">Change Avatar</button>
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('ar' === 'ar' ? 'اللغة' : 'Language')}</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setLang('ar')}
                      className={`flex-1 py-3 rounded-xl border transition-all text-sm font-bold ${lang === 'ar' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      العربية
                    </button>
                    <button 
                      onClick={() => setLang('en')}
                      className={`flex-1 py-3 rounded-xl border transition-all text-sm font-bold ${lang === 'en' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'المظهر العام' : 'Interface Theme'}</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`flex-1 py-3 rounded-xl border transition-all text-sm font-bold flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      <Moon size={16} /> {t('dark')}
                    </button>
                    <button 
                      onClick={() => setTheme('light')}
                      className={`flex-1 py-3 rounded-xl border transition-all text-sm font-bold flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      <Sun size={16} /> {t('light')}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Billing Preview */}
            <section className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/10 rounded-3xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{lang === 'ar' ? 'العضوية الحالية' : 'Current Plan'}</h3>
                  <p className="text-xs text-slate-400">Pro Developer Monthly</p>
                </div>
                <div className="px-3 py-1 bg-purple-500 text-white text-[10px] font-black rounded-full">ACTIVE</div>
              </div>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-3xl font-black text-white">$29</span>
                <span className="text-slate-500 text-sm mb-1">/ Month</span>
              </div>
              <button className="w-full py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                Manage Billing
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsTab({ icon, label, active }: any) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
      ${active ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
    `}>
      {icon} {label}
    </button>
  )
}
