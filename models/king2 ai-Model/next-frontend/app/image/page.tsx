'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ImageStyle = 'photorealistic' | '3d-render' | 'cinematic' | 'anime' | 'oil-painting' | 'pixel-art';

const STYLES: { id: ImageStyle; label: string }[] = [
  { id: 'photorealistic', label: 'واقعي' },
  { id: '3d-render', label: 'ثلاثي الأبعاد' },
  { id: 'cinematic', label: 'سينمائي' },
  { id: 'anime', label: 'أنمي' },
  { id: 'oil-painting', label: 'زيتي' },
  { id: 'pixel-art', label: 'بكسل' },
];

const SUGGESTIONS = [
  'مدينة فضائية عند غروب الشمس بألوان ذهبية',
  'تنين صيني يحلق فوق جبال ضبابية',
  'غابة مسحورة بأضواء متوهجة وفراشات زرقاء',
  'قلعة عائمة في السحب مع حدائق معلقة',
];

interface ImageResult {
  result: string;
  prompt: string;
  style: string;
}

function extractImageMarkdown(text: string): string[] {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const urls: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    urls.push(match[1]);
  }
  if (urls.length === 0) {
    const linkRegex = /https?:\/\/[^\s)]+/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(text)) !== null) {
      urls.push(linkMatch[0]);
    }
  }
  return urls;
}

export default function ImagePage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ImageStyle>('photorealistic');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const generateImage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), style, count: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل في إنشاء الصورة');
      }

      setResults((prev) => [{ result: data.result, prompt: data.prompt, style: data.style }, ...prev]);
      setPrompt('');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, style, isLoading]);

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 shadow-lg shadow-rose-900/30 ring-1 ring-white/10">
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">صانع الصور بالذكاء الاصطناعي</h1>
          <p className="mt-2 text-zinc-400">حوّل أفكارك إلى صور مذهلة باستخدام KING2 AI</p>
        </div>

        {/* Style Selector */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-zinc-300">النمط الفني</p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  style === s.id
                    ? 'bg-rose-600 text-white ring-2 ring-rose-400/50'
                    : 'bg-surface-tertiary text-zinc-400 hover:bg-surface-elevated hover:text-zinc-200 ring-1 ring-zinc-800/50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={generateImage} className="mb-8">
          <div className="flex items-end gap-2 rounded-2xl border border-zinc-800/50 bg-surface-secondary p-2 ring-1 ring-transparent transition-all focus-within:border-rose-500/40 focus-within:ring-rose-500/10">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={1}
              placeholder="صف الصورة التي تريد إنشاءها..."
              className="min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 text-white transition-all hover:from-rose-400 hover:to-purple-500 disabled:opacity-40 active:scale-95"
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Suggestions */}
        <div className="mb-8 grid gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              className="rounded-xl border border-zinc-800/70 bg-surface-secondary/50 px-4 py-3 text-right text-sm text-zinc-400 transition-all hover:border-rose-500/30 hover:bg-surface-tertiary/50 hover:text-zinc-200"
            >
              <span className="line-clamp-1">{s}</span>
            </button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/20"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {isLoading && (
          <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/50 bg-surface-secondary/30 py-20">
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
              <div className="absolute h-full w-full animate-ping rounded-full bg-rose-500/20" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-purple-600">
                <svg className="h-7 w-7 animate-pulse text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-zinc-400">KING2 يبدع صورتك...</p>
          </div>
        )}

        {/* Results Grid */}
        <div ref={resultsRef} className="space-y-6">
          <AnimatePresence>
            {results.map((item, index) => {
              const images = extractImageMarkdown(item.result);
              return (
                <motion.div
                  key={`${item.prompt}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-zinc-800/50 bg-surface-secondary p-4 sm:p-6"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white line-clamp-1">{item.prompt}</p>
                      <p className="text-xs text-zinc-500">
                        {STYLES.find((s) => s.id === item.style)?.label || item.style}
                      </p>
                    </div>
                    <button
                      onClick={() => setResults((prev) => prev.filter((_, i) => i !== index))}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-surface-tertiary hover:text-red-400 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {images.length > 0 ? (
                    <div className={`grid gap-4 ${images.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                      {images.map((url, i) => (
                        <div key={i} className="group relative overflow-hidden rounded-xl bg-surface-tertiary ring-1 ring-zinc-800/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`${item.prompt} - ${i + 1}`}
                            className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                          >
                            فتح الصورة
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-surface-tertiary p-4 text-sm leading-7 text-zinc-300">
                      <p className="whitespace-pre-wrap">{item.result}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {results.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-tertiary ring-1 ring-zinc-800/50">
              <svg className="h-8 w-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-zinc-500">اكتب وصفاً لإنشاء أول صورة لك</p>
          </div>
        )}
      </div>
    </div>
  );
}
