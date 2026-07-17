'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, Heart, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SocialAccount, platformConfig } from '@/lib/mock-social-data';

interface Props {
  account: SocialAccount;
}

export function SocialStatCard({ account }: Props) {
  const config = platformConfig[account.platform];
  const Icon = config.icon;
  const isUp = account.trend.direction === 'up';

  return (
    <div className={cn(
      'glass-card group relative overflow-hidden transition-all duration-300 hover:-translate-y-1',
      'border p-4 cursor-pointer',
      config.border,
      account.isConnected ? 'hover:shadow-lg' : 'opacity-70 saturate-50 hover:opacity-100 hover:saturate-100'
    )}>
      {/* Background Gradient */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        config.color
      )} />

      {!account.isConnected && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gray-800/80 border border-gray-700 text-[10px] text-gray-400 font-bold z-10">
          غير متصل
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={account.avatar} alt={account.username} className="h-10 w-10 rounded-xl bg-gray-800 object-cover border border-white/10" />
              <div className={cn(
                'absolute -bottom-1.5 -right-1.5 p-1 rounded-lg border-2 border-[#0a0a0f]',
                config.bgGlow
              )}>
                <Icon className={cn('h-3 w-3', config.text)} />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">{account.fullname}</p>
              <p className="text-xs text-gray-400 mt-0.5">{account.username}</p>
            </div>
          </div>
        </div>

        {/* Big Stat */}
        <div className="mb-4">
          <div className="flex items-end gap-2">
            <p className={cn('text-3xl font-extrabold tracking-tight', config.text)}>
              {account.metrics.followers}
            </p>
            <span className="mb-1 text-xs text-gray-500 font-medium tracking-wide">متابع</span>
          </div>
          <div className={cn(
            'flex items-center gap-1 mt-1 text-xs font-bold',
            isUp ? 'text-emerald-400' : 'text-rose-400'
          )}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isUp ? '+' : '-'}{account.trend.value}%
          </div>
        </div>

        {/* Small Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
              <Eye className="h-3 w-3" /> مشاهدات
            </span>
            <span className="text-sm font-semibold text-white">{account.metrics.views}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
              <Heart className="h-3 w-3" /> تفاعل
            </span>
            <span className="text-sm font-semibold text-white">{account.metrics.engagement}</span>
          </div>
        </div>

        {/* Action button overlay for disconnected accounts */}
        {!account.isConnected && (
          <div className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg',
                config.bgGlow, config.text
              )}
            >
              <Link2 className="h-4 w-4" />
              ربط الحساب
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
