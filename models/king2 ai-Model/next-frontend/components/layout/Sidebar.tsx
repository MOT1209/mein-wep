'use client';

import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from '@/components/LocaleProvider';
import {
  MessageSquare,
  Bot,
  History,
  Info,
  Settings,
  HelpCircle,
  User,
  LogIn,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_TOP = [
  { href: '/', labelAr: 'المحادثات', labelEn: 'Chats', icon: MessageSquare },
  { href: '/agent', labelAr: 'AI AGENT', labelEn: 'AI AGENT', icon: Bot },
  { href: '/chat-history', labelAr: 'سجل الدردشات', labelEn: 'Chat History', icon: History },
  { href: '/about', labelAr: 'عن KING2 AI', labelEn: 'About KING2 AI', icon: Info },
];

const NAV_BOTTOM = [
  { href: '/settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: Settings },
  { href: '/help', labelAr: 'المساعدة', labelEn: 'Help', icon: HelpCircle },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { locale } = useLocale();
  const isEnglish = locale === 'en';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isLoggedIn = status === 'authenticated' && session?.user;
  const isLoading = status === 'loading';
  const userInitial = session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0)?.toUpperCase() || 'م';

  const navLink = (item: { href: string; labelAr: string; labelEn: string; icon: React.ElementType }) => (
    <Link
      key={item.href}
      href={item.href}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
        isActive(item.href)
          ? 'bg-king-600/15 text-king-400 ring-1 ring-king-500/20'
          : 'text-zinc-400 hover:bg-surface-tertiary hover:text-zinc-200'
      }`}
    >
      <item.icon className="w-[18px] h-[18px] shrink-0" />
      <span className="text-sm font-medium">{isEnglish ? item.labelEn : item.labelAr}</span>
      {isActive(item.href) && (
        <motion.div
          layoutId="active-indicator"
          className="mr-auto w-1.5 h-1.5 rounded-full bg-king-400"
        />
      )}
    </Link>
  );

  return (
    <>
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 right-4 z-50 lg:hidden p-2.5 rounded-xl bg-surface-secondary border border-zinc-800/50 text-zinc-400 hover:text-white hover:bg-surface-tertiary transition-colors shadow-lg"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onToggle} />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-64 bg-surface-secondary border-l border-zinc-800/50 flex flex-col transition-all duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-l-0 lg:p-0'
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-king-500 to-king-700 flex items-center justify-center ring-1 ring-white/10 group-hover:ring-king-400/30 transition-all">
              <Image src="/logo.svg" alt="KING2" width={36} height={36} className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">KING2 AI</div>
              <p className="text-[10px] text-zinc-500">{isEnglish ? 'Your AI platform' : 'منصتك الذكية'}</p>
            </div>
          </Link>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:bg-surface-tertiary hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto scrollbar-hide">
          {NAV_TOP.map(navLink)}

          <div className="h-px bg-zinc-800/30 my-2.5" />

          {NAV_BOTTOM.map(navLink)}
        </nav>

        {/* Bottom: Profile or Auth */}
        <div className="p-2.5 border-t border-zinc-800/50">
          {isLoading ? (
            <div className="flex items-center gap-3 p-2.5">
              <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-king-500 animate-spin" />
              <span className="text-sm text-zinc-500">جاري التحميل...</span>
            </div>
          ) : isLoggedIn ? (
            <Link
              href="/profile"
              className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
                isActive('/profile') ? 'bg-king-600/15 ring-1 ring-king-500/20' : 'hover:bg-surface-tertiary'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-king-400 to-king-600 flex items-center justify-center text-white font-semibold text-xs">
                  {userInitial}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-surface-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name || (isEnglish ? 'User' : 'المستخدم')}
                </p>
                <p className="text-[10px] text-zinc-500">{isEnglish ? 'Online' : 'متصل'}</p>
              </div>
            </Link>
          ) : (
            <div className="space-y-2 p-1">
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="w-8 h-8 rounded-full bg-surface-tertiary flex items-center justify-center">
                  <User className="w-4 h-4 text-zinc-500" />
                </div>
                <span className="text-sm text-zinc-400">{isEnglish ? 'Guest' : 'زائر'}</span>
              </div>
              <button
                onClick={() => signIn(undefined, { callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-king-600 to-king-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-king-900/20 transition-all hover:from-king-500 hover:to-king-600 active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                {isEnglish ? 'Sign In' : 'تسجيل الدخول'}
              </button>
              <Link
                href="/auth/signup"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-surface-tertiary/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:bg-surface-tertiary hover:text-white active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-king-400" />
                {isEnglish ? 'Sign Up' : 'إنشاء حساب'}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
