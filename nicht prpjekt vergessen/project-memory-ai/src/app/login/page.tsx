'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Eye, EyeOff, LogIn, Github } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAr, setIsAr] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/')
        router.refresh()
      }
    })
  }, [supabase, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleOAuth = async (provider: 'github' | 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  const t = {
    welcome: isAr ? 'مرحباً بك مجدداً' : 'Welcome back',
    subtitle: isAr ? 'سجل دخولك إلى مساحة العمل الخاصة بك' : 'Sign in to your workspace',
    email: isAr ? 'البريد الإلكتروني' : 'Email',
    password: isAr ? 'كلمة المرور' : 'Password',
    signIn: isAr ? 'تسجيل الدخول' : 'Sign In',
    noAccount: isAr ? 'ليس لديك حساب؟' : "Don't have an account?",
    createOne: isAr ? 'إنشاء حساب جديد' : 'Create one',
    google: isAr ? 'المتابعة باستخدام Google' : 'Continue with Google',
    github: isAr ? 'المتابعة باستخدام GitHub' : 'Continue with GitHub',
    or: isAr ? 'أو عبر البريد' : 'OR EMAIL'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050510] px-4 relative overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="text-2xl font-black tracking-[0.2em] bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent uppercase">
              ALKING 2.0
            </span>
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-purple-500/10">
              <img src="/logo-alking.png" alt="AlKing" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t.welcome}</h1>
          <p className="text-slate-500 text-sm">{t.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-[#0f0f1f]/60 border border-white/5 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl shadow-black/50">
          
          {/* Social Logins */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-200 transition-all hover:scale-[1.02]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
              {t.google}
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-200 transition-all hover:scale-[1.02]"
            >
              <Github size={18} />
              {t.github}
            </button>
          </div>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">{t.or}</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase px-1">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#050510]/80 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-700 text-white text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase px-1">{t.password}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#050510]/80 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-700 text-white text-left"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors`}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-[11px] text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 rounded-2xl font-bold text-sm text-white transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t.signIn}</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
            
            </form>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-8">
          {t.noAccount}{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
            {t.createOne}
          </Link>
        </p>

        {/* Lang Switcher (Simplified) */}
        <div className="mt-4 flex justify-center">
           <button onClick={() => setIsAr(!isAr)} className="text-[10px] text-slate-700 hover:text-slate-500 uppercase font-black tracking-widest">
             {isAr ? 'Switch to English' : 'التحويل للعربية'}
           </button>
        </div>
      </div>
    </div>
  )
}
