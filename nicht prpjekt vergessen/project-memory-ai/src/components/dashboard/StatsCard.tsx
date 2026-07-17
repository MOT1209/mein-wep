'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' };
  accentColor?: 'blue' | 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  delay?: number;
}

const colorMap = {
  blue: {
    bg: 'from-blue-500/20 to-blue-700/10',
    border: 'border-blue-500/30 hover:border-blue-400/60',
    icon: 'from-blue-500 to-blue-700',
    iconGlow: 'shadow-blue-500/40',
    glow: 'hover:shadow-blue-500/20',
    text: 'text-blue-400',
    bar: 'from-blue-500 to-cyan-400',
    topLine: 'from-blue-500/80 via-blue-400 to-cyan-400/80',
  },
  cyan: {
    bg: 'from-cyan-500/20 to-cyan-700/10',
    border: 'border-cyan-500/30 hover:border-cyan-400/60',
    icon: 'from-cyan-500 to-blue-600',
    iconGlow: 'shadow-cyan-500/40',
    glow: 'hover:shadow-cyan-500/20',
    text: 'text-cyan-400',
    bar: 'from-cyan-500 to-blue-500',
    topLine: 'from-cyan-500/80 via-cyan-400 to-blue-400/80',
  },
  violet: {
    bg: 'from-violet-500/20 to-violet-700/10',
    border: 'border-violet-500/30 hover:border-violet-400/60',
    icon: 'from-violet-500 to-purple-700',
    iconGlow: 'shadow-violet-500/40',
    glow: 'hover:shadow-violet-500/20',
    text: 'text-violet-400',
    bar: 'from-violet-500 to-purple-400',
    topLine: 'from-violet-500/80 via-violet-400 to-purple-400/80',
  },
  emerald: {
    bg: 'from-emerald-500/20 to-emerald-700/10',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    icon: 'from-emerald-500 to-teal-700',
    iconGlow: 'shadow-emerald-500/40',
    glow: 'hover:shadow-emerald-500/20',
    text: 'text-emerald-400',
    bar: 'from-emerald-500 to-teal-400',
    topLine: 'from-emerald-500/80 via-emerald-400 to-teal-400/80',
  },
  amber: {
    bg: 'from-amber-500/20 to-amber-700/10',
    border: 'border-amber-500/30 hover:border-amber-400/60',
    icon: 'from-amber-500 to-orange-600',
    iconGlow: 'shadow-amber-500/40',
    glow: 'hover:shadow-amber-500/20',
    text: 'text-amber-400',
    bar: 'from-amber-500 to-orange-400',
    topLine: 'from-amber-500/80 via-amber-400 to-orange-400/80',
  },
  rose: {
    bg: 'from-rose-500/20 to-rose-700/10',
    border: 'border-rose-500/30 hover:border-rose-400/60',
    icon: 'from-rose-500 to-pink-700',
    iconGlow: 'shadow-rose-500/40',
    glow: 'hover:shadow-rose-500/20',
    text: 'text-rose-400',
    bar: 'from-rose-500 to-pink-400',
    topLine: 'from-rose-500/80 via-rose-400 to-pink-400/80',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'cyan',
  delay = 0,
}: StatsCardProps) {
  const colors = colorMap[accentColor];

  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
      ? TrendingDown
      : Minus;

  const trendColorClass =
    trend?.direction === 'up'
      ? 'text-emerald-400'
      : trend?.direction === 'down'
      ? 'text-rose-400'
      : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={cn(
        'stat-card glass-card group relative overflow-hidden cursor-default',
        'border transition-all duration-300',
        colors.border,
        'hover:shadow-2xl',
        colors.glow,
        'p-5'
      )}
    >
      {/* Animated top gradient line */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          colors.topLine
        )}
      />

      {/* Ambient background gradient */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
          colors.bg
        )}
      />

      {/* Glowing orb behind icon */}
      <div
        className={cn(
          'absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500',
          `bg-gradient-to-br ${colors.icon}`
        )}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -5, 0] }}
          transition={{ duration: 0.5 }}
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
            colors.icon,
            colors.iconGlow
          )}
        >
          <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
        </motion.div>

        {/* Trend */}
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-semibold', trendColorClass)}>
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 mt-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className={cn('text-3xl font-extrabold tracking-tight', colors.text)}
        >
          {value}
        </motion.div>
        <p className="mt-1 text-sm font-semibold text-white/80">{title}</p>
        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
        )}
      </div>

      {/* Mini sparkline placeholder */}
      <div className="relative z-10 mt-4 flex items-end gap-[3px] h-8">
        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: delay + 0.1 * i, duration: 0.4, ease: 'backOut' }}
            className={cn('flex-1 rounded-sm bg-gradient-to-t opacity-50 group-hover:opacity-80 transition-opacity origin-bottom', colors.bar)}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}
