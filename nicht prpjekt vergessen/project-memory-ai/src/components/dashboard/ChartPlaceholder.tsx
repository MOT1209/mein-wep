'use client';

import { motion } from 'framer-motion';
import { TrendingUp, BarChart2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const WEEKLY_DATA = [
  { day: 'السبت',  value: 42, tasks: 12 },
  { day: 'الأحد',  value: 68, tasks: 21 },
  { day: 'الاثنين', value: 55, tasks: 17 },
  { day: 'الثلاثاء', value: 87, tasks: 30 },
  { day: 'الأربعاء', value: 73, tasks: 25 },
  { day: 'الخميس', value: 91, tasks: 33 },
  { day: 'الجمعة', value: 64, tasks: 19 },
];

const ACTIVITY_DOTS = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  active: Math.random() > 0.35,
  intensity: Math.random(),
}));

export function WeeklyActivityChart() {
  const maxVal = Math.max(...WEEKLY_DATA.map(d => d.value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-card border border-blue-500/20 hover:border-blue-400/40 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-400" />
            نشاط الأسبوع
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">إجمالي المهام المنجزة هذا الأسبوع</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400">+18.4%</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-2 h-36 mb-2">
        {WEEKLY_DATA.map((item, i) => {
          const heightPct = (item.value / maxVal) * 100;
          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-1 group">
              <motion.div
                className="relative w-full"
                style={{ height: '100%' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.05 * i + 0.4, duration: 0.6, ease: 'backOut' }}
              >
                <div className="absolute bottom-0 w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                  <div
                    className={cn(
                      'w-full rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-300 relative overflow-hidden',
                      'shadow-lg shadow-blue-500/20 group-hover:shadow-blue-400/40'
                    )}
                    style={{ height: `${heightPct}%` }}
                  >
                    {/* Shine */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                    {/* Tooltip */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 border border-blue-500/40 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.value}%
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between gap-2">
        {WEEKLY_DATA.map(item => (
          <div key={item.day} className="flex-1 text-center text-[10px] text-gray-500 font-medium">
            {item.day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow shadow-blue-400" />
          <span className="text-xs text-gray-400">الإنجاز اليومي</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-400" />
          <span className="text-xs text-gray-400">الهدف المستهدف</span>
        </div>
      </div>
    </motion.div>
  );
}

export function ActivityHeatmap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="glass-card border border-violet-500/20 hover:border-violet-400/40 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-violet-400" />
            خريطة النشاط
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">آخر 35 يوم</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {ACTIVITY_DOTS.map((dot, i) => (
          <motion.div
            key={dot.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.01 * i + 0.6, duration: 0.3 }}
            className={cn(
              'h-5 w-full rounded transition-all duration-300 cursor-pointer hover:scale-110',
              dot.active
                ? 'shadow-sm'
                : 'bg-gray-800/50 border border-gray-700/30'
            )}
            style={
              dot.active
                ? {
                    background: `rgba(${59 + dot.intensity * 100}, ${130}, ${246}, ${0.3 + dot.intensity * 0.7})`,
                    boxShadow: `0 0 8px rgba(59, 130, 246, ${dot.intensity * 0.4})`,
                    border: `1px solid rgba(96, 165, 250, ${dot.intensity * 0.5})`,
                  }
                : undefined
            }
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>أقل نشاطاً</span>
        <div className="flex items-center gap-1">
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((op) => (
            <div
              key={op}
              className="h-3 w-3 rounded"
              style={{
                background: `rgba(59, 130, 246, ${op})`,
                border: `1px solid rgba(96, 165, 250, ${op * 0.6})`,
              }}
            />
          ))}
        </div>
        <span>أكثر نشاطاً</span>
      </div>
    </motion.div>
  );
}
