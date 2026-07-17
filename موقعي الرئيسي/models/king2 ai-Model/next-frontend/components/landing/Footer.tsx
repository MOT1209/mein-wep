'use client';

import { Heart, ExternalLink, Globe, Mail } from 'lucide-react';
import Link from 'next/link';

const footerLinks = [
  {
    title: 'الروابط',
    links: [
      { label: 'الميزات', href: '#features' },
      { label: 'كيف يعمل', href: '#how-it-works' },
      { label: 'المزودون', href: '#models' },
    ],
  },
  {
    title: 'الدعم',
    links: [
      { label: 'المساعدة', href: '#' },
      { label: 'التوثيق', href: '#' },
      { label: 'حالة الخدمة', href: '#' },
    ],
  },
  {
    title: 'القانوني',
    links: [
      { label: 'شروط الخدمة', href: '#' },
      { label: 'سياسة الخصوصية', href: '#' },
      { label: 'ملفات تعريف الارتباط', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-zinc-800/50 bg-surface-secondary/30 px-4 pt-16 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-king-600 to-king-700 shadow-lg shadow-king-900/30">
                <span className="text-sm font-bold text-white">K2</span>
              </div>
              <span className="text-lg font-bold text-white">KING2 AI</span>
            </div>
            <p className="mb-6 text-sm leading-7 text-zinc-500">
              منصة الذكاء الاصطناعي العربية الأولى. نقدم أحدث تقنيات AI
              بواجهة عربية سلسة وآمنة.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Globe, href: '#', label: 'تويتر' },
                { icon: ExternalLink, href: '#', label: 'جيت هب' },
                { icon: Mail, href: '#', label: 'البريد' },
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-tertiary text-zinc-500 ring-1 ring-zinc-800/50 transition-all hover:bg-surface-elevated hover:text-zinc-300 hover:ring-zinc-700"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-sm font-semibold text-white">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mb-6 border-t border-zinc-800/50" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} KING2 AI. جميع الحقوق محفوظة.
          </p>
          <p className="inline-flex items-center gap-1 text-xs text-zinc-600">
            صُنع بـ
            <Heart className="h-3 w-3 text-red-500" />
            في الوطن العربي
          </p>
        </div>
      </div>
    </footer>
  );
}
