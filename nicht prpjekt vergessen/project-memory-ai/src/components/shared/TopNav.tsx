'use client'

import React, { useEffect } from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { LayoutDashboard, Code2, Clapperboard, LogOut, Settings, Sun, Moon, User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export function TopNav() {
  const { activeWorkspace, setActiveWorkspace, lang, setLang, theme, setTheme, t, user, setUser } = useWorkspace()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user)
    })
  }, [supabase, setUser])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar')
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/5 backdrop-blur-xl bg-slate-950/80">
      <div className="flex items-center justify-between h-full px-4 max-w-[1800px] mx-auto">

        {/* Left: Logo */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg shadow-purple-500/10 shrink-0">
            <img src="/logo-alking.png" alt="AlKing" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[15px] leading-tight tracking-[0.2em] bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent uppercase">
              ALKING 2.0
            </span>
            {process.env.NODE_ENV === 'development' && (
              <span className="text-[10px] font-black text-green-400 tracking-widest uppercase mt-1 animate-pulse">V3 - LATEST</span>
            )}
          </div>
        </div>

        {/* Center: Main Switcher */}
        <div className="flex items-center bg-slate-900/60 p-1 rounded-2xl border border-white/5 shadow-inner">
          <WorkspaceBtn 
            active={activeWorkspace === 'dashboard'} 
            onClick={() => setActiveWorkspace('dashboard')}
            icon={<LayoutDashboard size={16} />} 
            label={t('dashboard')}
          />
          <WorkspaceBtn 
            active={activeWorkspace === 'inspector'} 
            onClick={() => setActiveWorkspace('inspector')}
            icon={<Code2 size={16} />} 
            label={t('inspector')}
          />
          <WorkspaceBtn 
            active={activeWorkspace === 'studio'} 
            onClick={() => setActiveWorkspace('studio')}
            icon={<Clapperboard size={16} />} 
            label={t('studio')}
          />
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3 min-w-[200px] justify-end">
          {/* Language Toggle */}
          <button onClick={toggleLang} className="px-2 py-1 text-slate-400 hover:text-white transition-colors text-[10px] font-bold">
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>

          {/* Theme Toggle */}
          <HeaderIconBtn 
            onClick={toggleTheme} 
            icon={theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />} 
            title={t(theme === 'dark' ? 'light' : 'dark')}
          />

          {/* Settings Toggle */}
          <HeaderIconBtn 
            onClick={() => setActiveWorkspace('settings')} 
            icon={<Settings size={15} />} 
            active={activeWorkspace === 'settings'}
            title={t('settings')}
          />

          <div className="h-6 w-px bg-white/5 mx-1" />

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-white truncate max-w-[100px]">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="text-[9px] text-emerald-400/80 font-mono tracking-tighter">PRO MEMBER</span>
            </div>
            <div className="relative group">
              <button 
                onClick={handleLogout}
                className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 overflow-hidden hover:border-red-500/50 transition-all flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={14} className="text-slate-400 group-hover:text-red-400" />
                )}
                <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <LogOut size={12} className="text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </nav>
  )
}

function WorkspaceBtn({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all duration-300
        ${active 
          ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/20' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
        }`}
    >
      {icon} <span>{label}</span>
    </button>
  )
}

function HeaderIconBtn({ onClick, icon, title, active }: any) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-all
        ${active 
          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
          : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10'
        }`}
    >
      {icon}
    </button>
  )
}
