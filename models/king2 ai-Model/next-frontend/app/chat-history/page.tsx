'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  MessageSquare,
  Clock,
  Check,
  X,
} from 'lucide-react';

interface ChatEntry {
  id: string;
  title: string;
  preview: string;
  date: string;
  pinned: boolean;
  model: string;
  messageCount: number;
}

const MOCK_CHATS: ChatEntry[] = [
  { id: '1', title: 'مساعدة في كود React', preview: 'كيف يمكنني تحسين أداء تطبيق React الخاص بي؟', date: '2026-06-04', pinned: true, model: 'KING2 AI', messageCount: 12 },
  { id: '2', title: 'شرح خوارزميات التعلم الآلي', preview: 'اشرح لي الفرق بين supervised و unsupervised learning', date: '2026-06-03', pinned: true, model: 'Gemini', messageCount: 8 },
  { id: '3', title: 'تحليل ملف PDF', preview: 'ارفع ملف PDF وحلل محتواه واستخرج المعلومات', date: '2026-06-02', pinned: false, model: 'KING2 AI', messageCount: 5 },
  { id: '4', title: 'كتابة قصة قصيرة', preview: 'اكتب قصة خيال علمي عن مستقبل الذكاء الاصطناعي', date: '2026-06-01', pinned: false, model: 'Gemma 4', messageCount: 3 },
  { id: '5', title: 'ترجمة نص ألماني', preview: 'ترجم هذه الفقرة من الألمانية إلى العربية', date: '2026-05-30', pinned: false, model: 'GPT', messageCount: 7 },
  { id: '6', title: 'حل مسألة حسابية', preview: 'كيف أحسب التكامل لـ ∫x²sin(x)dx؟', date: '2026-05-28', pinned: false, model: 'KING2 AI', messageCount: 4 },
];

export default function ChatHistoryPage() {
  const [chats, setChats] = useState<ChatEntry[]>(MOCK_CHATS);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return chats;
    const q = search.toLowerCase();
    return chats.filter(c =>
      c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)
    );
  }, [chats, search]);

  const sorted = useMemo(() => {
    const pinned = filtered.filter(c => c.pinned);
    const rest = filtered.filter(c => !c.pinned);
    return [...pinned, ...rest];
  }, [filtered]);

  const togglePin = useCallback((id: string) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  }, []);

  const startEdit = useCallback((chat: ChatEntry) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId && editTitle.trim()) {
      setChats(prev => prev.map(c => c.id === editingId ? { ...c, title: editTitle.trim() } : c));
    }
    setEditingId(null);
    setEditTitle('');
  }, [editingId, editTitle]);

  const deleteChat = useCallback((id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    setShowDeleteConfirm(null);
  }, []);

  return (
    <div className="h-full bg-surface-primary overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-king-500 to-king-700 shadow-lg shadow-king-900/30 ring-1 ring-white/10">
            <History className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">سجل الدردشات</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{chats.length} محادثة</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المحادثات..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-surface-tertiary border border-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:border-king-500/50 focus:ring-2 focus:ring-king-500/20 transition-all text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Chat List */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-tertiary mb-4">
              <Search className="h-8 w-8 text-zinc-600" />
            </div>
            <p className="text-zinc-400 text-lg mb-1">لا توجد محادثات</p>
            <p className="text-zinc-600 text-sm">{
              search ? 'لا توجد نتائج تطابق بحثك' : 'ابدأ محادثة جديدة من صفحة المحادثات'
            }</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {sorted.map((chat, i) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="group relative rounded-xl border border-zinc-800/40 bg-surface-secondary/50 p-4 hover:border-zinc-700/60 hover:bg-surface-tertiary/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tertiary group-hover:bg-king-600/10 transition-colors">
                      <MessageSquare className="h-4 w-4 text-zinc-400 group-hover:text-king-400 transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {editingId === chat.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                            className="flex-1 bg-surface-elevated border border-king-500/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-king-500/20"
                            autoFocus
                          />
                          <button onClick={saveEdit} className="p-1 text-emerald-400 hover:text-emerald-300">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-zinc-500 hover:text-zinc-300">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-sm font-medium text-white truncate group-hover:text-king-300 transition-colors">
                          {chat.title}
                        </h3>
                      )}
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{chat.preview}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                          <Clock className="w-3 h-3" />
                          {chat.date}
                        </span>
                        <span className="text-[10px] text-zinc-600">{chat.model}</span>
                        <span className="text-[10px] text-zinc-600">{chat.messageCount} رسالة</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => togglePin(chat.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          chat.pinned
                            ? 'text-amber-400 hover:bg-amber-500/10'
                            : 'text-zinc-600 hover:text-zinc-300 hover:bg-surface-elevated'
                        }`}
                        title={chat.pinned ? 'إلغاء التثبيت' : 'تثبيت'}
                      >
                        {chat.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => startEdit(chat)}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-surface-elevated transition-colors"
                        title="إعادة تسمية"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(chat.id)}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {showDeleteConfirm === chat.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-red-500/20 flex items-center justify-between"
                    >
                      <span className="text-xs text-red-400">تأكيد حذف هذه المحادثة؟</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteChat(chat.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors"
                        >
                          حذف
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1.5 rounded-lg bg-surface-tertiary text-zinc-400 text-xs hover:text-zinc-300 transition-colors"
                        >
                          إلغاء
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
