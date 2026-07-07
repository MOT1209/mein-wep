'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/components/LocaleProvider';

// ─── Password visibility toggle icon ───
function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {open ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </>
      )}
    </svg>
  );
}

// ─── Toggle / Switch component ───
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  'data-testid'?: string;
}

function Toggle({ checked, onChange, disabled, 'data-testid': testId }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-testid={testId}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        ${checked ? 'bg-[#D4AF37]' : 'bg-zinc-700'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

// ─── Connected session item ───
interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

const MOCK_SESSIONS: Session[] = [
  {
    id: '1',
    device: 'Windows PC',
    browser: 'Chrome 125',
    ip: '192.168.1.100',
    lastActive: 'الآن',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'iPhone 15 Pro',
    browser: 'Safari',
    ip: '192.168.1.101',
    lastActive: 'منذ ساعتين',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'MacBook Air',
    browser: 'Firefox 128',
    ip: '192.168.1.102',
    lastActive: 'منذ 3 أيام',
    isCurrent: false,
  },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  // ── General state ──
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    if (typeof window === 'undefined') return 'ar';
    return (window.localStorage.getItem('king2:locale') as 'ar' | 'en') || 'ar';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [generalSaved, setGeneralSaved] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // ── Security state ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);

  // Load settings from API
  useEffect(() => {
    fetch('/king2/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.language === 'ar' || data.language === 'en') {
          setLanguage(data.language);
          setLocale(data.language);
        }
        if (data.theme) setTheme(data.theme === 'DARK' ? 'dark' : 'light');
        if (data.emailNotifications !== undefined) setNotificationsEnabled(data.emailNotifications);
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLanguage(locale);
  }, [locale]);

  const isDark = theme === 'dark';

  const handleSaveGeneral = async () => {
    setGeneralSaved(true);
    setTimeout(() => setGeneralSaved(false), 2000);

    // Persist locale to localStorage immediately (works for guests too)
    setLocale(language);

    // Optionally persist to API (server-side) for authenticated users
    try {
      await fetch('/king2/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          theme: theme === 'dark' ? 'DARK' : 'LIGHT',
          email_notifications: notificationsEnabled,
        }),
      });
    } catch {
      // Local persistence already done above
    }
  };

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // ── Shared input class ──
  const inputClass =
    'w-full rounded-xl border border-zinc-800/50 bg-surface-tertiary/50 px-4 py-3 text-sm text-white placeholder-zinc-500 transition-colors focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30';

  return (
    <div className="p-6 space-y-6">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
        <p className="text-zinc-400 mt-1">إدارة تفضيلات الحساب وإعدادات الأمان</p>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="general" dir="rtl" className="w-full">
        <TabsList className="w-full sm:w-auto gap-1 rounded-2xl border border-zinc-800/50 bg-surface-secondary p-1.5">
          <TabsTrigger
            value="general"
            className="flex-1 sm:flex-none rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-400 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B0C10] data-[state=active]:shadow-lg transition-all"
          >
            عام
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex-1 sm:flex-none rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-400 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B0C10] data-[state=active]:shadow-lg transition-all"
          >
            الأمان
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="flex-1 sm:flex-none rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-400 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B0C10] data-[state=active]:shadow-lg transition-all"
          >
            الحساب
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════
           GENERAL TAB
           ════════════════════════════════════════ */}
        <TabsContent value="general" className="mt-6">
          <div className="rounded-2xl border border-zinc-800/50 bg-surface-secondary p-6 space-y-6">
            {/* Language */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white mb-2.5">
                <svg aria-hidden="true" className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                اللغة
              </label>
              <div className="relative">
                <select
                  data-testid="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')}
                  className={`${inputClass} appearance-none cursor-pointer`}
                  dir="rtl"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pr-3">
                  <svg aria-hidden="true" className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-tertiary/50">
                  <svg aria-hidden="true" className="w-5 h-5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">الوضع الداكن</p>
                  <p className="text-xs text-zinc-500">{isDark ? 'مفعل' : 'غير مفعل'}</p>
                </div>
              </div>
              <Toggle checked={isDark} onChange={(v) => setTheme(v ? 'dark' : 'light')} data-testid="dark-mode-toggle" />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-tertiary/50">
                  <svg aria-hidden="true" className="w-5 h-5 text-king-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">الإشعارات</p>
                  <p className="text-xs text-zinc-500">استلام إشعارات النشاطات والتحديثات</p>
                </div>
              </div>
              <Toggle checked={notificationsEnabled} onChange={setNotificationsEnabled} data-testid="notifications-toggle" />
            </div>

            {/* Save button */}
            <div className="pt-2 border-t border-zinc-800/50">
              <button
                data-testid="save-settings"
                onClick={handleSaveGeneral}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 px-6 py-3 text-sm font-bold text-[#0B0C10] transition-all hover:from-[#D4AF37] hover:to-amber-400 active:scale-[0.97]"
              >
                {generalSaved ? (
                  <>
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    تم الحفظ
                  </>
                ) : (
                  <>
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    حفظ التغييرات
                  </>
                )}
              </button>
            </div>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════
           SECURITY TAB
           ════════════════════════════════════════ */}
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* ── Change password card ── */}
          <div className="rounded-2xl border border-zinc-800/50 bg-surface-secondary p-6 space-y-5">
            <div className="flex items-center gap-2">
              <svg aria-hidden="true" className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 11V7a4 4 0 00-8 0v4" />
              </svg>
              <h2 className="text-lg font-semibold text-white">تغيير كلمة المرور</h2>
            </div>

            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">كلمة المرور الحالية</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  dir="auto"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showCurrent ? 'إخفاء كلمة المرور الحالية' : 'إظهار كلمة المرور الحالية'}
                >
                  <EyeIcon open={showCurrent} />
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">كلمة المرور الجديدة</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة مرور جديدة"
                  className={inputClass}
                  dir="auto"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showNew ? 'إخفاء كلمة المرور الجديدة' : 'إظهار كلمة المرور الجديدة'}
                >
                  <EyeIcon open={showNew} />
                </button>
              </div>
            </div>

            {/* Confirm new password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">تأكيد كلمة المرور الجديدة</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  className={inputClass}
                  dir="auto"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showConfirm ? 'إخفاء تأكيد كلمة المرور' : 'إظهار تأكيد كلمة المرور'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            {/* Password requirements hint */}
            {(newPassword || confirmPassword) && (
              <div className="rounded-xl bg-surface-tertiary/50 p-3 space-y-1.5">
                <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <svg aria-hidden="true" className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  8 أحرف على الأقل
                </p>
                <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <svg aria-hidden="true" className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  حرف كبير وحرف صغير
                </p>
                <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <svg aria-hidden="true" className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  رقم أو رمز خاص
                </p>
              </div>
            )}

            {/* Change password button */}
            <button
              disabled={!currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 px-6 py-3 text-sm font-bold text-[#0B0C10] transition-all hover:from-[#D4AF37] hover:to-amber-400 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              تغيير كلمة المرور
            </button>
          </div>

          {/* ── Two-factor authentication card ── */}
          <div className="rounded-2xl border border-zinc-800/50 bg-surface-secondary p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-tertiary/50">
                  <svg aria-hidden="true" className="w-5 h-5 text-king-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">المصادقة الثنائية (2FA)</p>
                  <p className="text-xs text-zinc-500">
                    {twoFactorEnabled ? 'مفعلة — أمان إضافي لحسابك' : 'غير مفعلة — يُنصح بتفعيلها لحماية حسابك'}
                  </p>
                </div>
              </div>
              <Toggle checked={twoFactorEnabled} onChange={setTwoFactorEnabled} />
            </div>
          </div>

          {/* ── Connected sessions card ── */}
          <div className="rounded-2xl border border-zinc-800/50 bg-surface-secondary p-6 space-y-4">
            <div className="flex items-center gap-2">
              <svg aria-hidden="true" className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-lg font-semibold text-white">الجلسات المتصلة</h2>
            </div>

            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg aria-hidden="true" className="w-10 h-10 text-zinc-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-zinc-500">لا توجد جلسات متصلة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-xl bg-surface-tertiary/50 p-4 border border-zinc-800/50"
                  >
                    <div className="flex items-center gap-3">
                      {/* Device icon */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
                        {session.device.toLowerCase().includes('iphone') || session.device.toLowerCase().includes('ios') ? (
                          <svg aria-hidden="true" className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="1.5" />
                            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="1.5" />
                          </svg>
                        ) : session.device.toLowerCase().includes('mac') ? (
                          <svg aria-hidden="true" className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="1.5" />
                            <line x1="2" y1="20" x2="22" y2="20" strokeWidth="1.5" />
                          </svg>
                        ) : (
                          <svg aria-hidden="true" className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="1.5" />
                            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="1.5" />
                          </svg>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{session.device}</p>
                          {session.isCurrent && (
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                              هذه الجلسة
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {session.browser} · {session.ip} · {session.lastActive}
                        </p>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                      >
                        إلغاء
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════
           ACCOUNT TAB
           ════════════════════════════════════════ */}
        <TabsContent value="account" className="mt-6">
          <div className="rounded-2xl border border-red-900/30 bg-surface-secondary p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">منطقة الخطر</h3>
                <p className="text-sm text-zinc-400">إجراءات حساسة خاصة بالحساب — لا يمكن التراجع عنها</p>
              </div>
            </div>

            <div className="border-t border-red-900/20 pt-6 space-y-4">
              {/* Logout */}
              <div className="flex items-center justify-between rounded-xl bg-surface-tertiary p-4">
                <div>
                  <p className="text-sm font-medium text-white">تسجيل الخروج</p>
                  <p className="text-xs text-zinc-500">تسجيل الخروج من جميع الأجهزة</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/king2' })}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 transition-all"
                >
                  تسجيل الخروج
                </button>
              </div>

              {/* Delete Account */}
              <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-400">حذف الحساب</p>
                    <p className="text-xs text-zinc-500">حذف الحساب وجميع البيانات بشكل نهائي</p>
                  </div>
                  {!deleteConfirm ? (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="rounded-xl px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all"
                    >
                      حذف الحساب
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 transition-all"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={async () => {
                          setDeleting(true);
                          try {
                            const res = await fetch('/king2/api/user/delete', { method: 'DELETE' });
                            if (res.ok) {
                              await signOut({ callbackUrl: '/king2' });
                            } else {
                              const data = await res.json();
                              alert(data.error || 'فشل حذف الحساب');
                            }
                          } catch {
                            alert('حدث خطأ في الاتصال');
                          } finally {
                            setDeleting(false);
                          }
                        }}
                        disabled={deleting}
                        className="rounded-xl px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-all"
                      >
                        {deleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
