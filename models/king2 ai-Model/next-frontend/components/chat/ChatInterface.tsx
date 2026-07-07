'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare,
  Code,
  FileText,
  Image,
  Bot,
  Copy,
  Check,
  RefreshCw,
  Square,
  Trash2,
  User,
  Sparkles,
  SendHorizonal,
  AlertTriangle,
  X,
  Brain,
  Mic,
  Zap,
  Globe,
  Cpu,
  Loader2,
  Paperclip,
  ChevronDown,
} from 'lucide-react';

import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { useKing2Chat, Message } from '@/lib/useKing2Chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CHAT_MODELS, getChatModel } from '@/lib/chatModels';

interface ChatInterfaceProps {
  conversationId?: string;
  /** Pre-loaded messages when resuming a saved conversation from history */
  initialMessages?: Message[];
  onNewConversation?: () => void;
  isGuest?: boolean;
}

const FEATURE_CARDS = [
  { icon: Bot, label: 'AI Agent', desc: 'وكيل ذكي متعدد المهام', color: 'from-amber-500 to-amber-700', bgColor: 'bg-amber-500/10' },
  { icon: Brain, label: 'نظام الذاكرة', desc: 'يتذكر محادثاتك السابقة', color: 'from-purple-500 to-purple-700', bgColor: 'bg-purple-500/10' },
  { icon: Mic, label: 'المحادثة الصوتية', desc: 'تحدث بصوتك الطبيعي', color: 'from-rose-500 to-rose-700', bgColor: 'bg-rose-500/10' },
  { icon: Image, label: 'توليد الصور', desc: 'أنشئ صوراً من النص', color: 'from-emerald-500 to-emerald-700', bgColor: 'bg-emerald-500/10' },
  { icon: Globe, label: 'نماذج متعددة', desc: 'Gemini, Groq, Gemma 4', color: 'from-sky-500 to-sky-700', bgColor: 'bg-sky-500/10' },
  { icon: Zap, label: 'استجابة سريعة', desc: 'سرعة فائقة في الرد', color: 'from-yellow-500 to-yellow-700', bgColor: 'bg-yellow-500/10' },
];

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="relative inline-flex h-2 w-2"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        >
          <span className="absolute inset-0 rounded-full bg-king-400" />
          <span className="absolute inset-0 animate-ping rounded-full bg-king-400/40" style={{ animationDelay: `${i * 200}ms` }} />
        </motion.span>
      ))}
    </div>
  );
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex justify-end">
      <div className="flex max-w-[85%] gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-king-500 to-king-700 shadow-lg shadow-king-900/30">
          <span className="text-xs font-bold text-white">K2</span>
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-surface-tertiary px-4 py-3 ring-1 ring-zinc-800/50">
          <ThinkingDots />
        </div>
      </div>
    </motion.div>
  );
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  }, [content]);

  return (
    <motion.button
      onClick={handleCopy}
      whileTap={{ scale: 0.9 }}
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-zinc-500 opacity-0 transition-all hover:bg-surface-elevated hover:text-zinc-300 group-hover:opacity-100"
    >
      {copied ? (
        <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">تم النسخ</span></>
      ) : (
        <><Copy className="h-3 w-3" /><span>نسخ</span></>
      )}
    </motion.button>
  );
}

function SpeedBadge({ charsPerSecond }: { charsPerSecond: number | null }) {
  if (charsPerSecond === null) return null;
  const color = charsPerSecond > 50
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : charsPerSecond > 20
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono ${color}`}>
      <Sparkles className="h-2.5 w-2.5" />{charsPerSecond} ح/ث
    </span>
  );
}

export function ChatInterface({ conversationId, initialMessages, onNewConversation, isGuest }: ChatInterfaceProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localError, setLocalError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [streamStartTime, setStreamStartTime] = useState<number | null>(null);
  const [charsPerSecond, setCharsPerSecond] = useState<number | null>(null);
  const [currentProvider] = useState<string>('KING2 AI');
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('auto');
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

  const {
    messages,
    setMessages,
    isLoading,
    streamingStatus,
    error: hookError,
    append,
    stop,
    reload,
    clearGuestData,
  } = useKing2Chat({
    api: '/king2/api/chat',
    body: { model: selectedModel, conversationId },
    initialMessages,
    initialConversationId: conversationId,
    onFinish: () => {
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      if (streamStartTime) {
        const elapsed = (Date.now() - streamStartTime) / 1000;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.content) setCharsPerSecond(Math.round(lastMessage.content.length / elapsed));
        setStreamStartTime(null);
      }
    },
  });

  // Filter out clipboard/image errors - show as toast instead
  const errorMsg = useMemo(() => {
    if (localError) return localError;
    if (hookError) {
      const msg = typeof hookError === 'string' ? hookError : '';
      if (!msg) return 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.';
      // Suppress clipboard/image errors
      if (msg.includes('clipboard') || msg.includes('does not support image')) return null;
      return msg;
    }
    return null;
  }, [localError, hookError]);

  // Show friendly toast for clipboard/image model errors
  useEffect(() => {
    if (hookError) {
      const msg = typeof hookError === 'string' ? hookError : '';
      if (msg.includes('clipboard') || msg.includes('does not support image')) {
        setToast('هذا النموذج لا يدعم استقبال الصور حالياً');
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
      }
    }
  }, [hookError]);

  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  useEffect(() => {
    if (isGuest) {
      const stored = localStorage.getItem('king2_guest_messages');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
        } catch { localStorage.removeItem('king2_guest_messages'); }
      }
      setIsHistoryLoaded(true);
    } else { setIsHistoryLoaded(true); }
  }, [isGuest, setMessages]);

  useEffect(() => {
    if (isGuest && isHistoryLoaded && messages.length > 0)
      localStorage.setItem('king2_guest_messages', JSON.stringify(messages));
  }, [isGuest, messages, isHistoryLoaded]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => { scrollToBottom(true); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isLoading) { const raf = requestAnimationFrame(() => scrollToBottom(true)); return () => cancelAnimationFrame(raf); }
  }, [isLoading, messages.length, scrollToBottom]);

  useEffect(() => {
    if (streamingStatus === 'streaming' && !streamStartTime) setStreamStartTime(Date.now());
    if (streamingStatus === 'idle') setStreamStartTime(null);
  }, [streamingStatus, streamStartTime]);

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      if (e.message?.includes('clipboard') || e.message?.includes('does not support image')) e.preventDefault();
    };
    const rejectionHandler = (e: PromiseRejectionEvent) => {
      const msg = e.reason?.message || '';
      if (msg.includes('clipboard') || msg.includes('does not support image')) e.preventDefault();
    };
    window.addEventListener('error', handler, true);
    window.addEventListener('unhandledrejection', rejectionHandler, true);
    return () => {
      window.removeEventListener('error', handler, true);
      window.removeEventListener('unhandledrejection', rejectionHandler, true);
    };
  }, []);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }, []);

  useEffect(() => { autoResize(); }, [input, autoResize]);

  const analyzeImage = useCallback(async () => {
    if (!pastedImage) return;
    setIsAnalyzing(true);
    try {
      const blob = await fetch(pastedImage).then((r) => r.blob());
      const formData = new FormData();
      formData.append('file', blob, 'pasted-image.png');
      formData.append('message', input.trim() || 'قم بتحليل هذه الصورة');
      const res = await fetch('/king2/api/vision', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.response) {
        append({ role: 'user', content: '[تم لصق صورة]\n' + (input.trim() || 'حلل هذه الصورة') });
        setTimeout(() => append({ role: 'assistant', content: data.response }), 50);
      } else {
        setToast(data.error || 'فشل تحليل الصورة');
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err: any) {
      setToast('خطأ في الاتصال: ' + (err.message || 'غير معروف'));
      setTimeout(() => setToast(null), 4000);
    } finally {
      setPastedImage(null);
      setIsAnalyzing(false);
      setInput('');
    }
  }, [pastedImage, input, append]);

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || isAnalyzing) return;
    if (pastedImage) { analyzeImage(); return; }
    if (!input.trim()) return;
    setCharsPerSecond(null);
    append({ role: 'user', content: input });
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, isLoading, isAnalyzing, pastedImage, analyzeImage, append]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLoading || isAnalyzing) return;
      if (pastedImage) { analyzeImage(); return; }
      if (!input.trim()) return;
      setCharsPerSecond(null);
      append({ role: 'user', content: input });
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
    if (localError) setLocalError(null);
  }, [input, isLoading, isAnalyzing, pastedImage, analyzeImage, append, localError]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          setPastedImage(dataUrl);
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  }, []);

  // Video / documents → upload to Supabase Storage and attach a link in the chat.
  const uploadAttachment = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/king2/api/media/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        const label = file.type.startsWith('video/') ? '🎬 فيديو مرفوع' : '📎 ملف مرفوع';
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'user',
            content: `${label}: [${file.name}](${data.url})`,
            createdAt: new Date(),
          },
        ]);
      } else {
        setToast(data.error || 'فشل رفع الملف');
        setTimeout(() => setToast(null), 4000);
      }
    } catch {
      setToast('خطأ في رفع الملف');
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsAnalyzing(false);
    }
  }, [setMessages]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    // Images → vision analysis flow
    if (file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setToast('حجم الصورة كبير جداً (الحد 10 ميجابايت)');
        setTimeout(() => setToast(null), 4000);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setPastedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
      return;
    }

    // Video / documents → upload to storage
    if (file.size > 50 * 1024 * 1024) {
      setToast('حجم الملف كبير جداً (الحد 50 ميجابايت)');
      setTimeout(() => setToast(null), 4000);
      return;
    }
    uploadAttachment(file);
  }, [uploadAttachment]);

  // Persist the user's model choice across sessions.
  useEffect(() => {
    const saved = localStorage.getItem('king2_selected_model');
    if (saved && CHAT_MODELS.some((m) => m.id === saved)) setSelectedModel(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('king2_selected_model', selectedModel);
  }, [selectedModel]);

  const clearChat = useCallback(() => {
    // Resets messages AND the hook's tracked conversationId — without this,
    // the next message would silently continue appending to the old
    // conversation even though the UI looks empty.
    clearGuestData();
    setInput('');
    setCharsPerSecond(null);
    onNewConversation?.();
  }, [clearGuestData, onNewConversation]);

  const handleRetry = useCallback(() => reload(), [reload]);

  const guestMessageCount = useMemo(() => messages.filter((m) => m.role === 'user').length, [messages]);
  const isLimitReached = isGuest && messages.length >= 10;

  const renderMessageContent = (message: Message) => {
    if (message.role === 'user') return <p className="whitespace-pre-wrap break-words text-sm leading-7">{message.content}</p>;
    return (
      <div>
        <MarkdownRenderer content={message.content} />
        {message.role === 'assistant' && isLoading && message.id === messages[messages.length - 1]?.id && (
          <span className="inline-flex"><ThinkingDots /></span>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex h-full flex-col bg-surface-primary">
      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
        <div className="mx-auto max-w-3xl space-y-4 px-4 pt-6 pb-32 sm:px-6 sm:pb-36">
          {/* Empty State with Feature Cards */}
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[70vh]"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-king-600 via-king-500 to-king-700 shadow-2xl shadow-king-900/40 ring-1 ring-white/10"
              >
                <NextImage src="/logo.svg" alt="KING2" width={64} height={64} className="w-full h-full object-contain p-2" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mb-1 text-xl font-bold text-white"
              >
                KING2 AI
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 text-sm text-zinc-500"
              >
                مساعدك الذكي العربي — اسألني شيئاً
              </motion.p>

              {/* Feature Cards Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid w-full max-w-lg grid-cols-2 gap-2.5"
              >
                {FEATURE_CARDS.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-start gap-2.5 rounded-xl border border-zinc-800/50 bg-surface-secondary/50 p-3 transition-all hover:border-king-500/20 hover:bg-surface-tertiary/50 group cursor-default"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.bgColor} group-hover:scale-110 transition-transform`}>
                      <card.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{card.label}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{card.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                layout
                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex max-w-[88%] gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {message.role !== 'user' ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-gradient-to-br from-king-500 to-king-700 shadow-lg shadow-king-900/30">
                      <NextImage src="/logo.svg" alt="KING2" width={32} height={32} className="w-full h-full object-contain p-1" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
                      <User className="h-4 w-4 text-zinc-400" />
                    </div>
                  )}
                  <div className={`group relative rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'rounded-tr-sm bg-king-600 text-white'
                      : 'rounded-tl-sm bg-surface-tertiary ring-1 ring-zinc-800/50'
                  }`}>
                    {renderMessageContent(message)}
                    <div className={`mt-2 flex items-center gap-2 ${message.role === 'user' ? 'justify-start' : 'justify-between'}`}>
                      {message.role === 'assistant' && !(isLoading && message.id === messages[messages.length - 1]?.id) && (
                        <div className="flex items-center gap-1"><CopyButton content={message.content} /></div>
                      )}
                      {message.role === 'assistant' && message.id === messages[messages.length - 1]?.id && message.content && !isLoading && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-600">{currentProvider}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role !== 'assistant') && <TypingIndicator />}
          </AnimatePresence>

          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex justify-center">
                <div className="flex items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/20">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                  <button onClick={handleRetry} className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/20">
                    <RefreshCw className="h-3 w-3" />إعادة المحاولة
                  </button>
                  <button onClick={() => setLocalError(null)} className="rounded-full p-1 text-red-400/50 transition-colors hover:text-red-300"><X className="h-3.5 w-3.5" /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Stop Button */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
          >
            <button
              onClick={stop}
              className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-xs text-red-400 ring-1 ring-red-500/20 transition-colors hover:bg-red-500/20 backdrop-blur-sm"
            >
              <Square className="h-3.5 w-3.5" />
              إيقاف التوليد
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Clear Button */}
      {!isLoading && messages.length > 0 && (
        <button
          onClick={clearChat}
          className="absolute top-4 left-4 z-10 rounded-xl p-2 text-zinc-500 transition-colors hover:bg-surface-tertiary hover:text-zinc-300 bg-surface-secondary/80 backdrop-blur-sm border border-zinc-800/50"
          title="محادثة جديدة"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      {/* Speed Badge (when streaming done) */}
      {charsPerSecond !== null && !isLoading && messages.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <SpeedBadge charsPerSecond={charsPerSecond} />
        </div>
      )}

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800/50 bg-gradient-to-t from-surface-primary via-surface-primary/95 to-transparent px-4 py-3 backdrop-blur-xl sm:px-6">
        <form onSubmit={handleFormSubmit} className="mx-auto max-w-3xl">
          {/* Image Preview */}
          <AnimatePresence>
            {pastedImage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 overflow-hidden"
              >
                <div className="relative inline-block rounded-xl border border-zinc-700/50 bg-surface-tertiary p-2">
                  <NextImage
                    src={pastedImage}
                    alt="الصورة الملصقة"
                    width={160}
                    height={120}
                    className="rounded-lg object-cover"
                    style={{ maxHeight: 120 }}
                  />
                  <button
                    type="button"
                    onClick={() => { setPastedImage(null); setToast(null); }}
                    disabled={isAnalyzing}
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow-lg hover:bg-red-400 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {isAnalyzing && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60">
                      <div className="flex items-center gap-2 text-xs text-white">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري التحليل...
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Model selector */}
          <div className="mb-2 flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setModelMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800/60 bg-surface-tertiary px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-king-500/40 hover:text-white"
              >
                <Cpu className="h-3.5 w-3.5 text-king-400" />
                <span>{getChatModel(selectedModel).name}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${modelMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {modelMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setModelMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full right-0 z-50 mb-2 w-64 overflow-hidden rounded-2xl border border-zinc-800/60 bg-surface-secondary p-1.5 shadow-2xl shadow-black/40 ring-1 ring-white/5"
                    >
                      {CHAT_MODELS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => { if (m.action === 'navigate' && m.actionUrl) { setModelMenuOpen(false); router.push(m.actionUrl); } else { setSelectedModel(m.id); setModelMenuOpen(false); } }}
                          className={`flex w-full items-start gap-2 rounded-xl px-3 py-2 text-right transition-colors ${selectedModel === m.id ? 'bg-king-600/15 ring-1 ring-king-500/30' : 'hover:bg-surface-tertiary'}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-white">{m.name}</span>
                              {m.badge && (
                                <span className="rounded-full bg-king-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-king-300">{m.badge}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500">{m.desc}</p>
                          </div>
                          {selectedModel === m.id && <Check className="mt-0.5 h-4 w-4 shrink-0 text-king-400" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex items-end gap-2 rounded-2xl border border-zinc-800/50 bg-surface-secondary p-1.5 ring-1 ring-transparent transition-all focus-within:border-king-500/40 focus-within:ring-king-500/10">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isAnalyzing || isLimitReached}
              title="إرفاق صورة"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-surface-tertiary hover:text-king-300 disabled:opacity-40"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={isLoading ? 'KING2 يكتب...' : isLimitReached ? 'وصلت للحد الأقصى' : pastedImage ? 'أضف سؤالاً عن الصورة...' : 'اكتب رسالتك هنا...'}
              rows={1}
              disabled={isLoading || isLimitReached || isAnalyzing}
              className="flex-1 resize-none bg-transparent px-3 py-2.5 text-white placeholder-zinc-500 outline-none disabled:opacity-50 text-sm"
              style={{ minHeight: '42px', maxHeight: '180px' }}
            />
            <button
              type="submit"
              disabled={(!input.trim() && !pastedImage) || isLoading || isLimitReached || isAnalyzing}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-king-600 text-white shadow-lg shadow-king-900/30 transition-all hover:bg-king-500 disabled:opacity-40 disabled:hover:bg-king-600 active:scale-95"
            >
              {isLoading || isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-zinc-600">
            يمكن أن يرتكب KING2 أخطاء. تحقق من المعلومات المهمة.
            {isGuest && (
              <span>
                {' · '}
                <Link href="/auth/signup" className="text-king-400 underline underline-offset-2 hover:text-king-300">
                  أنشئ حساباً لحفظ المحادثات
                </Link>
              </span>
            )}
          </p>
        </form>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-amber-500/15 px-4 py-2.5 text-sm text-amber-400 ring-1 ring-amber-500/20 backdrop-blur-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest Limit Modal */}
      <AnimatePresence>
        {isLimitReached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md space-y-5 overflow-hidden rounded-2xl border border-zinc-800/50 bg-surface-secondary p-8 text-center shadow-2xl"
            >
              <div className="pointer-events-none absolute -inset-40 bg-gradient-to-br from-king-600/10 via-accent-gold/5 to-transparent blur-3xl" />
              <div className="relative">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-king-600 to-king-700 shadow-2xl shadow-king-900/30">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">استمتعت بالتجربة؟</h3>
                <p className="text-zinc-400">
                  لقد وصلت للحد الأقصى للمحادثات المجانية. قم بإنشاء حساب لحفظ محادثاتك والوصول لكافة الميزات المتقدمة.
                </p>
              </div>
              <div className="relative flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
                <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-king-600 to-king-700 px-8 py-3 font-semibold text-white shadow-lg shadow-king-900/30 transition-all hover:from-king-500 hover:to-king-600 active:scale-[0.98]">
                  <Sparkles className="h-4 w-4" />إنشاء حساب مجاني
                </Link>
                <Link href="/auth/signin" className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-surface-tertiary/50 px-8 py-3 font-medium text-zinc-300 backdrop-blur-sm transition-all hover:bg-surface-tertiary active:scale-[0.98]">
                  تسجيل الدخول
                </Link>
              </div>
              <p className="relative text-xs text-zinc-600">مميزات غير محدودة · أولوية عالية · حفظ المحادثات</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
