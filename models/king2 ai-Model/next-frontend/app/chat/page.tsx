'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ChatPage() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'system', content: 'أهلاً بك في منصة KING2 AI الملكية. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Calling the FastAPI backend via Next.js rewrites
      const response = await fetch('/api/py/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage, username: 'NextUser' }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: data.response || 'عذراً، لم أتمكن من معالجة طلبك.' 
      }]);
    } catch (error) {
      console.error('Error fetching chat:', error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: '⚠️ حدث خطأ في الاتصال بالخادم. تأكد من أن خادم FastAPI يعمل.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0B0C10] text-zinc-300">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <span className="font-bold text-xl">K</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">KING2 AI</h1>
            <p className="text-xs text-zinc-500">مساعدك الذكي الشخصي</p>
          </div>
        </div>
        <a href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">العودة للرئيسية</a>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user' 
                    ? 'bg-[#D4AF37] text-[#0B0C10] rounded-tl-none' 
                    : 'bg-zinc-800/80 text-zinc-200 border border-zinc-700/50 rounded-tr-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-tr-none px-5 py-4 flex gap-2 items-center">
                <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 md:p-6 bg-[#0B0C10] border-t border-zinc-800/60">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
            <div className="relative flex-1 bg-zinc-900/50 border border-zinc-700/50 rounded-2xl overflow-hidden focus-within:border-[#D4AF37]/50 focus-within:ring-1 focus-within:ring-[#D4AF37]/50 transition-all">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="اسأل KING2..."
                className="w-full max-h-32 min-h-[56px] py-4 px-4 bg-transparent border-none focus:ring-0 resize-none text-white placeholder-zinc-500"
                rows={1}
              />
            </div>
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-[56px] w-[56px] shrink-0 rounded-2xl bg-[#D4AF37] text-[#0B0C10] flex items-center justify-center hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m-7 7l7-7 7 7" />
              </svg>
            </button>
          </form>
          <p className="text-center text-xs text-zinc-600 mt-3">
            يمكن لـ KING2 أن يرتكب أخطاء. تحقق من المعلومات المهمة.
          </p>
        </div>
      </footer>
    </div>
  );
}
