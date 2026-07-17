'use client';

import {
  MessageSquare,
  Zap,
  ChevronDown,
  ChevronUp,
  Brain,
  Sparkles,
  Search,
  Mic2,
  Scissors,
  Users,
  Layout,
  UserCircle,
  Globe,
  Image,
  TrendingUp,
  DollarSign,
  Send,
  LogOut,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const agentTools = [
  { id: 'trend', label: 'رادار الترندات', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'voice', label: 'محطة الصوت', icon: Mic2, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { id: 'clipper', label: 'المقص الذكي', icon: Scissors, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'engagement', label: 'بوت التفاعل', icon: Users, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { id: 'live', label: 'مركز التحكم', icon: Layout, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'persona', label: 'الشخصية الرقمية', icon: UserCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { id: 'competitors', label: 'رادار المنافسين', icon: Search, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { id: 'dubber', label: 'المترجم العالمي', icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'thumbnail', label: 'استوديو الصور', icon: Image, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'revenue', label: 'لوحة الأرباح', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
];

interface RightSidebarProps {
  onSignOut?: () => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function RightSidebar({
  onSignOut,
  userName = 'راشد AlKing',
  userEmail = 'rashed@alking.com',
  userAvatar,
}: RightSidebarProps) {
  const [chatInput, setChatInput] = useState('');
  const [isToolsExpanded, setIsToolsExpanded] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'مرحباً! أنا وكيلك الذكي. كيف يمكنني مساعدتك في تحليل مشروعك اليوم؟ 🚀' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    setChatInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'جاري تنفيذ طلبك... سأقوم بتحليل الكود وتقديم تقرير مفصل خلال لحظات. ⚙️' 
      }]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="hidden lg:flex h-full w-80 flex-col glass-sidebar border-r border-blue-500/15 relative z-20"
    >
      {/* ─── Header ─── */}
      <div className="p-5 border-b border-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white">AI Agent Suite</h2>
            <p className="text-[10px] text-blue-400 font-medium">الوكيل المستقل</p>
          </div>
        </div>
      </div>

      {/* ─── AI Agent Chat ─── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex flex-col gap-1 max-w-[85%]",
              msg.role === 'user' ? "mr-auto items-end" : "ml-auto items-start"
            )}>
              <div className={cn(
                "px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-blue-600 text-white rounded-br-none" 
                  : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* ─── Chat Input ─── */}
        <div className="p-4 border-t border-blue-500/10 bg-black/10">
          <div className="relative group">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اطلب من الوكيل (مثلاً: حلل الكود)..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            <button 
              onClick={handleSend}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 hover:bg-blue-400 rounded-lg text-white transition-all shadow-lg shadow-blue-500/20"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tools Suite ─── */}
      <div className="border-t border-blue-500/10">
        <button 
          onClick={() => setIsToolsExpanded(!isToolsExpanded)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-gray-200">الأدوات الذكية (10)</span>
          </div>
          {isToolsExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronUp className="h-4 w-4 text-gray-500" />}
        </button>

        <AnimatePresence initial={false}>
          {isToolsExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 p-4 pt-0">
                {agentTools.map((tool) => (
                  <button 
                    key={tool.id}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                  >
                    <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", tool.bg)}>
                      <tool.icon className={cn("h-4 w-4", tool.color)} />
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 group-hover:text-white transition-colors">
                      {tool.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── User Profile ─── */}
      <div className="p-4 border-t border-blue-500/10 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-blue-500/30 overflow-hidden bg-blue-500/10 flex items-center justify-center">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-blue-400 font-bold text-sm">{userName[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-gray-500 truncate">{userEmail}</p>
          </div>
          <button 
            onClick={onSignOut}
            className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
