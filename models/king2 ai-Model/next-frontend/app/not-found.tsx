import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-primary px-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-surface-tertiary ring-1 ring-zinc-800/50 mx-auto">
          <span className="text-5xl font-bold text-zinc-600">404</span>
        </div>
        <h1 className="text-2xl font-bold text-white">الصفحة غير موجودة</h1>
        <p className="mt-2 text-zinc-400">عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-king-600 px-6 py-3 font-medium text-white transition-all hover:bg-king-500 active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}
