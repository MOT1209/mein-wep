'use client';

import { useState, useEffect, useRef, type ChangeEvent, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [conversationCount, setConversationCount] = useState(0);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (status !== 'authenticated') return;
    try {
      setLoading(true);
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('فشل جلب البيانات');
      const data = await res.json();
      setName(data.name || '');
      setUsername(data.username || '');
      setPhone(data.phone || '');
      setBio(data.bio || '');
      if (data.memberSince) {
        const d = new Date(data.memberSince);
        setMemberSince(d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }));
      }
      if (data.avatarUrl) setAvatarPreview(data.avatarUrl);
      if (data.conversationCount !== undefined) setConversationCount(data.conversationCount);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل الملف الشخصي');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
      return;
    }
    fetchProfile();
  }, [status, fetchProfile, router]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, phone, bio }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'فشل الحفظ');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-king-500 border-t-transparent animate-spin" />
          <p className="text-zinc-500 text-sm">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  const currentPlan = 'KING2 Pro';
  const email = session?.user?.email || '';

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold text-white">الملف الشخصي</h1>
        <p className="mt-2 text-zinc-400 leading-relaxed">إدارة معلومات حسابك الشخصية</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Avatar Section */}
      <section className="king-card flex flex-col items-center gap-4 py-10">
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-king-500 to-king-700 ring-4 ring-zinc-800/60">
            {avatarPreview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarPreview}
                alt="الصورة الشخصية"
                className="h-full w-full object-cover"
              />
            ) : (
              <svg className="h-14 w-14 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-surface-secondary bg-emerald-500" />
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="king-btn-secondary king-btn text-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          تغيير الصورة
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </section>

      {/* Personal Info */}
      <section className="king-card space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="h-5 w-5 text-king-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          المعلومات الشخصية
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-tertiary/50 border border-zinc-800/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:border-king-500/50 focus:ring-1 focus:ring-king-500/20 transition-colors"
              placeholder="الاسم الكامل"
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">اسم المستخدم</label>
            <div className="relative">
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-tertiary/50 border border-zinc-800/50 rounded-xl px-4 py-3 pr-10 text-white placeholder:text-zinc-600 focus:border-king-500/50 focus:ring-1 focus:ring-king-500/20 transition-colors"
                placeholder="username"
              />
            </div>
          </div>

          {/* Email (disabled) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-surface-tertiary/30 border border-zinc-800/30 rounded-xl px-4 py-3 text-zinc-500 placeholder:text-zinc-700 cursor-not-allowed select-all"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">رقم الهاتف</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-surface-tertiary/50 border border-zinc-800/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:border-king-500/50 focus:ring-1 focus:ring-king-500/20 transition-colors"
              placeholder="+966 5X XXX XXXX"
            />
          </div>
        </div>

        {/* Bio (full width) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-400">نبذة عني</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full bg-surface-tertiary/50 border border-zinc-800/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:border-king-500/50 focus:ring-1 focus:ring-king-500/20 transition-colors resize-y"
            placeholder="اكتب نبذة عن نفسك..."
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'king-btn king-btn-primary min-w-[160px]',
              saving && 'opacity-70 cursor-not-allowed'
            )}
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جاري الحفظ...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                حفظ التغييرات
              </>
            )}
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400 animate-in fade-in slide-in-from-top-1 duration-300">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              تم الحفظ بنجاح
            </span>
          )}
        </div>
      </section>

      {/* Account Stats */}
      <section className="king-card">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-5">
          <svg className="h-5 w-5 text-king-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          إحصائيات الحساب
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Member Since */}
          <div className="rounded-xl bg-surface-tertiary/40 border border-zinc-800/30 p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-king-500/10">
              <svg className="h-5 w-5 text-king-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 mb-1">تاريخ التسجيل</p>
            <p className="text-white font-medium">{memberSince || '---'}</p>
          </div>

          {/* Conversation Count */}
          <div className="rounded-xl bg-surface-tertiary/40 border border-zinc-800/30 p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 mb-1">عدد المحادثات</p>
            <p className="text-white font-medium">{conversationCount.toLocaleString('ar-SA')}</p>
          </div>

          {/* Current Plan */}
          <div className="rounded-xl bg-surface-tertiary/40 border border-zinc-800/30 p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 mb-1">الخطة الحالية</p>
            <div className="flex items-center justify-center gap-1.5">
              <span className="king-badge king-badge-success">{currentPlan}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
