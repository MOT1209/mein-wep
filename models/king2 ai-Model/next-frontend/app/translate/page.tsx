'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'en', name: 'الإنجليزية', dir: 'ltr' },
  { code: 'de', name: 'الألمانية', dir: 'ltr' },
  { code: 'fr', name: 'الفرنسية', dir: 'ltr' },
  { code: 'es', name: 'الإسبانية', dir: 'ltr' },
  { code: 'zh', name: 'الصينية', dir: 'ltr' },
  { code: 'tr', name: 'التركية', dir: 'ltr' },
  { code: 'fa', name: 'الفارسية', dir: 'rtl' },
  { code: 'ur', name: 'الأردية', dir: 'rtl' },
  { code: 'ru', name: 'الروسية', dir: 'ltr' },
];

export default function TranslatePage() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const swapLanguages = () => {
    if (sourceLang === 'auto') return;
    const newSource = targetLang;
    const newTarget = sourceLang;
    setSourceLang(newSource);
    setTargetLang(newTarget);
    setSourceText(translatedText);
    setTranslatedText('');
    setError('');
  };

  async function handleTranslate() {
    if (!sourceText.trim()) {
      setError('يرجى إدخال النص المراد ترجمته');
      return;
    }

    setIsTranslating(true);
    setError('');
    setTranslatedText('');

    const sourceLabel = sourceLang === 'auto'
      ? 'اللغة المصدر (auto-detect)'
      : LANGUAGES.find((l) => l.code === sourceLang)?.name || sourceLang;
    const targetLabel = LANGUAGES.find((l) => l.code === targetLang)?.name || targetLang;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `أنت مترجم محترف. ترجم النص التالي من ${sourceLabel} إلى ${targetLabel}. أعد الترجمة فقط بدون شرح إضافي.`,
            },
            {
              role: 'user',
              content: sourceText,
            },
          ],
          model: 'auto',
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(errText || `HTTP ${response.status}`);
      }

      // قراءة الـ streaming response وتجميع النص
      const reader = response.body?.getReader();
      if (!reader) throw new Error('لا يمكن قراءة الاستجابة');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      setTranslatedText(accumulated.trim() || '(ترجمة فارغة)');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الترجمة');
    } finally {
      setIsTranslating(false);
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const splitTranslated = (text: string): string[] => {
    if (!text) return [];
    const segments = text.split(/\n{2,}/);
    return segments.filter((s) => s.trim());
  };

  const segments = splitTranslated(translatedText);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-surface-primary">
      {/* Header */}
      <div className="border-b border-zinc-800/30 bg-surface-secondary/50 px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-blue-600 text-lg">
            🌐
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">الترجمة</h1>
            <p className="text-xs text-zinc-500">
              ترجمة فورية بين 10 لغات باستخدام الذكاء الاصطناعي
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Source & Target Language Selectors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            {/* Source Language */}
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                اللغة المصدر
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full rounded-xl border border-zinc-800/30 bg-surface-tertiary px-4 py-2.5 text-sm text-zinc-200 focus:border-king-500/30 focus:outline-none focus:ring-2 focus:ring-king-500/20"
              >
                <option value="auto">🔍 كشف تلقائي</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={swapLanguages}
              disabled={sourceLang === 'auto'}
              className="mt-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800/30 bg-surface-tertiary text-zinc-400 transition-all hover:border-king-500/30 hover:text-king-400 disabled:opacity-30 disabled:cursor-not-allowed"
              title="تبديل اللغات"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            {/* Target Language */}
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                اللغة الهدف
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full rounded-xl border border-zinc-800/30 bg-surface-tertiary px-4 py-2.5 text-sm text-zinc-200 focus:border-king-500/30 focus:outline-none focus:ring-2 focus:ring-king-500/20"
              >
                {LANGUAGES.filter((l) => l.code !== sourceLang || sourceLang === 'auto').map(
                  (lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ),
                )}
              </select>
            </div>
          </motion.div>

          {/* Input Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <label className="text-xs font-medium text-zinc-500">النص المراد ترجمته</label>
            <textarea
              value={sourceText}
              onChange={(e) => {
                setSourceText(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
              placeholder="اكتب أو الصق النص هنا..."
              rows={5}
              className="w-full resize-none rounded-2xl border border-zinc-800/30 bg-surface-tertiary/80 px-5 py-4 text-sm text-zinc-200 placeholder-zinc-600 backdrop-blur-sm focus:border-king-500/30 focus:outline-none focus:ring-2 focus:ring-king-500/20"
              dir={sourceLang === 'ar' || sourceLang === 'fa' || sourceLang === 'ur' ? 'rtl' : 'ltr'}
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-600">
                {sourceText.length} حرف | Ctrl+Enter للترجمة
              </span>
              <button
                onClick={() => {
                  setSourceText('');
                  setTranslatedText('');
                  setError('');
                }}
                className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                مسح
              </button>
            </div>
          </motion.div>

          {/* Translate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="king-btn king-btn-primary w-full gap-3 py-3.5 text-base"
            >
              {isTranslating ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري الترجمة...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5.49A18.025 18.025 0 0114.25 3h.035a2 2 0 012 2 2 2 0 012 2 2 2 0 01-2 2h-.035a18.025 18.025 0 01-1.499 5.49" />
                  </svg>
                  ترجمة
                </>
              )}
            </button>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Translated Output */}
          <AnimatePresence>
            {translatedText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-medium text-zinc-500">النص المترجم</h2>
                  {segments.length > 1 && (
                    <span className="text-[11px] text-zinc-600">
                      {segments.length} أجزاء
                    </span>
                  )}
                </div>

                <div
                  ref={outputRef}
                  className="glass-panel rounded-2xl p-5 space-y-4"
                  dir={
                    targetLang === 'ar' || targetLang === 'fa' || targetLang === 'ur'
                      ? 'rtl'
                      : 'ltr'
                  }
                >
                  {segments.length > 1 ? (
                    segments.map((segment, i) => (
                      <div
                        key={i}
                        className="group relative rounded-xl border border-zinc-800/30 bg-surface-primary/50 p-4"
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                          {segment}
                        </p>
                        <button
                          onClick={() => copyToClipboard(segment, i)}
                          className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800/30 bg-surface-tertiary/80 text-zinc-500 opacity-0 transition-all hover:border-king-500/30 hover:text-king-400 group-hover:opacity-100"
                          title="نسخ هذا الجزء"
                        >
                          {copiedIndex === i ? (
                            <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="group relative">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                        {translatedText}
                      </p>
                      <button
                        onClick={() => copyToClipboard(translatedText, 0)}
                        className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800/30 bg-surface-tertiary/80 text-zinc-500 opacity-0 transition-all hover:border-king-500/30 hover:text-king-400 group-hover:opacity-100"
                        title="نسخ النص المترجم"
                      >
                        {copiedIndex === 0 ? (
                          <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Copy All Button for multi-segment */}
                {segments.length > 1 && (
                  <button
                    onClick={() => copyToClipboard(translatedText, -1)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800/30 bg-surface-tertiary/50 px-4 py-2.5 text-sm text-zinc-400 transition-all hover:border-king-500/30 hover:text-king-400"
                  >
                    {copiedIndex === -1 ? (
                      <>
                        <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        تم النسخ!
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        نسخ الكل
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Language Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-zinc-800/30 bg-surface-secondary/50 p-4"
          >
            <p className="mb-2 text-[11px] font-medium text-zinc-500">اللغات المدعومة</p>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((lang) => (
                <span
                  key={lang.code}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] transition-colors ${
                    targetLang === lang.code || sourceLang === lang.code
                      ? 'border-king-500/30 bg-king-500/10 text-king-400'
                      : 'border-zinc-800/30 text-zinc-500'
                  }`}
                >
                  {lang.name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
