'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, CalendarClock, Bot, UploadCloud, Settings2, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ContentScheduler() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card border border-blue-500/20 p-6 flex flex-col lg:flex-row gap-6 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/10 transition-all"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* ─── Video Player Area ─── */}
      <div className="w-full lg:w-5/12 flex flex-col gap-3 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Play className="h-4 w-4 text-cyan-400" />
            معاينة المحتوى
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold">جاهز للنشر</span>
        </div>

        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-700/50 group/player cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop" 
            alt="Video Thumbnail" 
            className={cn("w-full h-full object-cover transition-transform duration-700", isPlaying && "scale-105")}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity group-hover/player:bg-black/50">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center justify-center h-14 w-14 rounded-full bg-cyan-500/80 text-white backdrop-blur-md shadow-lg shadow-cyan-500/30 hover:scale-110 transition-transform"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <div className="h-1 bg-gray-600/50 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: isPlaying ? '100%' : '0%' }} 
                transition={{ duration: 15, ease: "linear" }}
                className="h-full bg-cyan-400"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-300 mt-1">
              <span>00:14 / 01:00</span>
              <span>1080p - 60fps</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
          <p className="text-sm font-semibold text-white truncate">كيف تبني علامة تجارية قوية في 2024 🚀</p>
          <p className="text-xs text-gray-400 mt-1">المحور: تطوير الذات • المدة: 1 دقيقة</p>
        </div>
      </div>

      {/* ─── Scheduler Interface ─── */}
      <div className="w-full lg:w-7/12 flex flex-col gap-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-violet-400" />
              منظومة الجدولة والأتمتة
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">تحكم بمتى وأين ينشر المحتوى الخاص بك</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-violet-500/30 transition-colors cursor-pointer">
            <p className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><CalendarClock className="h-3 w-3" /> تاريخ النشر</p>
            <p className="text-sm font-bold text-white">الخميس، 14 نوفمبر</p>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-violet-500/30 transition-colors cursor-pointer">
            <p className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> وقت النشر</p>
            <p className="text-sm font-bold text-white">08:00 مساءً (وقت الذروة)</p>
          </div>
        </div>

        <div className="flex-1 rounded-xl bg-gradient-to-br from-violet-500/10 to-blue-500/5 border border-violet-500/20 p-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Settings2 className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">النشر التلقائي الذكي</p>
                <p className="text-xs text-gray-400 mt-0.5">جدولة دورية بدون تدخل بشري</p>
              </div>
            </div>
            
            <button 
              onClick={() => setAutoSchedule(!autoSchedule)}
              className={cn("w-10 h-5 rounded-full relative transition-colors", autoSchedule ? "bg-violet-500" : "bg-gray-700")}
            >
              <motion.div 
                animate={{ x: autoSchedule ? 20 : 2 }} 
                className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow"
              />
            </button>
          </div>

          <div className={cn("space-y-3 transition-all", autoSchedule ? "opacity-100" : "opacity-30 pointer-events-none")}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">معدل التكرار</span>
              <span className="bg-gray-800 px-3 py-1 rounded border border-gray-700 font-semibold text-white">كل يومين</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Sparkles className="h-3 w-3 text-amber-500" />
              الذكاء الاصطناعي سيقوم بتنويع الأوقات واختيار أفضل الهاشتاقات.
            </div>
          </div>
        </div>

        {/* AI Action Button */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-auto flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
          <Bot className="h-5 w-5 animate-pulse" />
          جدولة آلية بالذكاء الاصطناعي
          <UploadCloud className="h-4 w-4 ml-auto opacity-50" />
        </motion.button>
      </div>
    </motion.div>
  );
}
