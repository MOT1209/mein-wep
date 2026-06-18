'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', icon: '🟨' },
  { id: 'typescript', label: 'TypeScript', icon: '🔵' },
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'html', label: 'HTML/CSS', icon: '🌐' },
  { id: 'react', label: 'React', icon: '⚛️' },
  { id: 'nextjs', label: 'Next.js', icon: '▲' },
  { id: 'nodejs', label: 'Node.js', icon: '🟢' },
  { id: 'sql', label: 'SQL', icon: '🗄️' },
];

const EXAMPLES = [
  { lang: 'typescript', code: '// دالة للبحث الثنائي\nfunction binarySearch(arr: number[], target: number): number {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}' },
  { lang: 'python', code: '# دالة لعكس سلسلة نصية\ndef reverse_string(s: str) -> str:\n    return s[::-1]\n\ndef is_palindrome(s: str) -> bool:\n    s = s.lower().replace(\" \", \"\")\n    return s == s[::-1]' },
  { lang: 'react', code: '// مكون عداد مع useState\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>العدد: {count}</p>\n      <button onClick={() => setCount(count + 1)}>زيادة</button>\n      <button onClick={() => setCount(count - 1)}>نقصان</button>\n    </div>\n  );\n}' },
  { lang: 'sql', code: '-- استعلام لجلب المستخدمين النشطين\nSELECT u.id, u.name, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE u.is_active = true\nGROUP BY u.id, u.name\nHAVING COUNT(o.id) > 5\nORDER BY order_count DESC\nLIMIT 10;' },
];

export default function CodePage() {
  const [language, setLanguage] = useState('typescript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');
  const codeRef = useRef<HTMLTextAreaElement>(null);

  const executeCode = useCallback(async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    setError('');
    setOutput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini',
          messages: [
            { role: 'user', content: `Explain this ${language} code and suggest improvements:\n\n\`\`\`${language}\n${code}\n\`\`\`` }
          ],
        }),
      });

      if (!res.ok) throw new Error('فشل في تحليل الكود');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('لا يوجد رد');

      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        let cleaned = text.replace(/^data: /gm, '').trim();
        setOutput(cleaned);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExecuting(false);
    }
  }, [code, language]);

  const insertExample = useCallback((example: typeof EXAMPLES[0]) => {
    setCode(example.code);
    setLanguage(example.lang);
    codeRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-900/30 ring-1 ring-white/10">
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">مساعد البرمجة KING2</h1>
          <p className="mt-2 text-zinc-400">اكتب كودك واحصل على تحليل وتحسينات فورية</p>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  language === l.id
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
                    : 'bg-surface-tertiary text-zinc-400 hover:bg-surface-elevated hover:text-zinc-200 ring-1 ring-zinc-800/50'
                }`}
              >
                <span>{l.icon}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor + Output */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Code Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-300">الكود</h2>
              <div className="flex gap-2">
                {EXAMPLES.slice(0, 2).map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => insertExample(ex)}
                    className="rounded-lg bg-surface-tertiary px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-surface-elevated hover:text-zinc-200"
                  >
                    مثال {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative rounded-xl border border-zinc-800/50 bg-[#0d1117] ring-1 ring-transparent transition-all focus-within:border-emerald-500/40 focus-within:ring-emerald-500/10">
              <div className="flex items-center gap-2 border-b border-zinc-800/50 px-4 py-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-zinc-600">main.{language}</span>
              </div>
              <textarea
                ref={codeRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] w-full resize-none bg-transparent p-4 font-mono text-sm leading-6 text-green-400 placeholder-zinc-600 focus:outline-none"
                placeholder={`// اكتب كود ${language} هنا...`}
                spellCheck={false}
              />
            </div>
            <button
              onClick={executeCode}
              disabled={!code.trim() || isExecuting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-3 font-medium text-white transition-all hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 active:scale-[0.99]"
            >
              {isExecuting ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  جاري التحليل...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  تحليل الكود
                </>
              )}
            </button>
          </div>

          {/* Output */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-300">التحليل والنتائج</h2>
            <div className="min-h-[300px] rounded-xl border border-zinc-800/50 bg-[#0d1117] p-4">
              {!output && !error && !isExecuting && (
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
                  <svg className="mb-3 h-10 w-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-zinc-600">اكتب كوداً واضغط تحليل لبدء</p>
                </div>
              )}
              {isExecuting && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  <p className="text-sm text-zinc-500">KING2 يحلل الكود...</p>
                </div>
              )}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              {output && (
                <pre className="whitespace-pre-wrap text-sm leading-7 text-zinc-300 font-mono">
                  {output}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
