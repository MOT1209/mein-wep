import { Music, Youtube, Instagram, Ghost, Link as LinkIcon } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface SocialAccount {
  id: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'snapchat' | 'other';
  username: string;
  fullname: string;
  avatar: string;
  metrics: {
    followers: string;
    views: string;
    engagement: string;
  };
  trend: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  isConnected: boolean;
}

export const platformConfig: Record<string, { icon: LucideIcon; name: string; color: string; border: string; text: string; bgGlow: string }> = {
  tiktok: {
    icon: Music,
    name: 'TikTok',
    color: 'from-pink-500/20 to-rose-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    bgGlow: 'bg-pink-500/20'
  },
  youtube: {
    icon: Youtube,
    name: 'YouTube',
    color: 'from-red-500/20 to-orange-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    bgGlow: 'bg-red-500/20'
  },
  instagram: {
    icon: Instagram,
    name: 'Instagram',
    color: 'from-purple-500/20 to-violet-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    bgGlow: 'bg-purple-500/20'
  },
  snapchat: {
    icon: Ghost,
    name: 'Snapchat',
    color: 'from-yellow-500/20 to-amber-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    bgGlow: 'bg-yellow-500/20'
  },
  other: {
    icon: LinkIcon,
    name: 'Website',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    bgGlow: 'bg-blue-500/20'
  }
};

export const socialAccounts: SocialAccount[] = [
  {
    id: '1',
    platform: 'tiktok',
    username: '@rashed.ai',
    fullname: 'راشد AlKing',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rashed1',
    metrics: { followers: '1.2M', views: '15.4M', engagement: '12%' },
    trend: { value: 18.5, direction: 'up' },
    isConnected: true
  },
  {
    id: '2',
    platform: 'youtube',
    username: '@RashedAlking',
    fullname: 'Rashed Tech',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rashed2',
    metrics: { followers: '840K', views: '22.1M', engagement: '8.5%' },
    trend: { value: 5.2, direction: 'up' },
    isConnected: true
  },
  {
    id: '3',
    platform: 'instagram',
    username: '@rashed_official',
    fullname: 'Rashed.AI',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rashed3',
    metrics: { followers: '450K', views: '8.2M', engagement: '15%' },
    trend: { value: 2.1, direction: 'down' },
    isConnected: true
  },
  {
    id: '4',
    platform: 'snapchat',
    username: 'rashed.snap',
    fullname: 'Rashed Daily',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rashed4',
    metrics: { followers: '200K', views: '5.1M', engagement: '20%' },
    trend: { value: 12.4, direction: 'up' },
    isConnected: false
  }
];
