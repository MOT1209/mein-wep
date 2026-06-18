'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== 'application/pdf') {
      setError('يُقبل فقط ملفات PDF');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('الملف كبير جداً (الحد الأقصى 10MB)');
      return;
    }

    setFile(f);
    setError('');
    setText('');
    setIsLoading(true);

    try {
      const form = new FormData();
      form.append('file', f);

      const res = await fetch('/api/media/pdf', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل في معالجة الملف');

      setText(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragOver(false), []);

  const copyText = useCallback(() => {
    if (text) {
      try {
        navigator.clipboard.writeText(text);
      } catch {
        // silently fail
      }
    }
  }, [text]);

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-900/30 ring-1 ring-white/10">
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">قارئ PDF</h1>
          <p className="mt-2 text-zinc-400">ارفع أي ملف PDF لاستخراج النص منه باستخدام الذكاء الاصطناعي</p>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`relative mb-6 cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            isDragOver
              ? 'border-amber-500/60 bg-amber-500/5'
              : file
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-zinc-700/50 bg-surface-secondary/30 hover:border-zinc-600'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-emerald-400">{file.name}</p>
              <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              <p className="text-xs text-zinc-500 mt-1">انقر أو اسحب ملفاً آخر لاستبداله</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <svg className="h-12 w-12 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-zinc-400">
                اسحب ملف PDF إلى هنا أو <span className="text-amber-400 underline decoration-amber-500/30">تصفّح</span>
              </p>
              <p className="text-xs text-zinc-600">الحد الأقصى 10MB</p>
            </div>
          )}
        </div>

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

        {isLoading && (
          <div className="mb-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/50 bg-surface-secondary/30 py-12">
            <div className="relative mb-4 flex h-14 w-14 items-center justify-center">
              <div className="absolute h-full w-full animate-ping rounded-full bg-amber-500/20" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                <svg className="h-6 w-6 animate-pulse text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-zinc-400">KING2 يقرأ المستند...</p>
          </div>
        )}

        <AnimatePresence>
          {text && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-800/50 bg-surface-secondary p-4 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-zinc-300">النص المستخرج</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyText}
                    className="rounded-lg bg-surface-tertiary px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
                  >
                    نسخ النص
                  </button>
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto rounded-xl bg-surface-primary p-4">
                <pre className="whitespace-pre-wrap text-sm leading-7 text-zinc-300 font-sans">
                  {text}
                </pre>
              </div>
              <p className="mt-3 text-xs text-zinc-600">
                ~{Math.round(text.length / 4)} كلمة &middot; مستخرج بواسطة KING2 AI
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!text && !isLoading && !file && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="mb-4 h-12 w-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-zinc-500">ارفع ملف PDF لاستخراج النص</p>
          </div>
        )}
      </div>
    </div>
  );
}
