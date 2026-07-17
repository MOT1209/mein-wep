'use client';

import {
  Folder,
  FileCode2,
  FileText,
  ChevronRight,
  FileJson,
  FolderOpen,
  History,
  Search,
  Plus,
  MoreVertical,
  Clock,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fileStructure = [
  {
    type: 'folder',
    name: 'project-memory-ai',
    isOpen: true,
    children: [
      { type: 'file', name: 'next.config.ts', icon: FileCode2, color: 'text-blue-400' },
      { type: 'file', name: 'package.json', icon: FileJson, color: 'text-yellow-400' },
      {
        type: 'folder',
        name: 'src',
        isOpen: true,
        children: [
          {
            type: 'folder',
            name: 'app',
            isOpen: true,
            children: [
              { type: 'file', name: 'layout.tsx', icon: FileCode2, color: 'text-blue-400' },
              { type: 'file', name: 'page.tsx', icon: FileCode2, color: 'text-blue-400' },
            ]
          },
          {
            type: 'folder',
            name: 'components',
            isOpen: false,
            children: [
              { type: 'file', name: 'button.tsx', icon: FileCode2, color: 'text-blue-400' },
            ]
          }
        ]
      }
    ]
  }
];

const projectHistory = [
  { id: '1', name: 'تحليل المتجر الإلكتروني', date: 'منذ 2 ساعة', status: 'completed' },
  { id: '2', name: 'نظام إدارة المحتوى', date: 'أمس', status: 'completed' },
  { id: '3', name: 'تطبيق التراسل الفوري', date: 'منذ 3 أيام', status: 'error' },
];

export function LeftSidebar() {
  const [activeFile, setActiveFile] = useState('page.tsx');
  const [activeTab, setActiveTab] = useState<'explorer' | 'history'>('explorer');

  const FileNode = ({ item, depth = 0 }: any) => {
    const isFolder = item.type === 'folder';
    const [open, setOpen] = useState(item.isOpen);

    if (isFolder) {
      return (
        <div className="w-full">
          <div 
            className="flex items-center gap-1.5 py-1 px-2 hover:bg-white/5 rounded cursor-pointer text-gray-300"
            style={{ paddingRight: `${depth * 12 + 8}px` }}
            onClick={() => setOpen(!open)}
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform", open && "rotate-90")} />
            {open ? <FolderOpen className="h-4 w-4 text-blue-400" /> : <Folder className="h-4 w-4 text-blue-400 fill-blue-400/20" />}
            <span className="text-xs font-medium truncate">{item.name}</span>
          </div>
          {open && item.children && (
            <div>
              {item.children.map((child: any, i: number) => (
                <FileNode key={i} item={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    const isActive = activeFile === item.name;
    const Icon = item.icon;

    return (
      <div 
        className={cn(
          "flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors group",
          isActive ? "bg-blue-500/10 text-white" : "text-gray-400"
        )}
        style={{ paddingRight: `${(depth * 12) + 24}px` }}
        onClick={() => setActiveFile(item.name)}
      >
        <Icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
        <span className="text-xs truncate flex-1">{item.name}</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="hidden lg:flex h-full w-64 flex-col glass-sidebar border-l border-blue-500/15 relative z-20"
    >
      {/* ─── Search & Actions ─── */}
      <div className="p-4 space-y-3 border-b border-blue-500/10">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="بحث في الملفات..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 py-1.5 rounded-lg text-[10px] font-bold transition-all">
            <Plus className="h-3 w-3" />
            رفع مشروع
          </button>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex px-4 pt-4 gap-4 border-b border-blue-500/10">
        <button 
          onClick={() => setActiveTab('explorer')}
          className={cn(
            "pb-2 text-xs font-bold transition-all relative",
            activeTab === 'explorer' ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
          )}
        >
          مستكشف الملفات
          {activeTab === 'explorer' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "pb-2 text-xs font-bold transition-all relative",
            activeTab === 'history' ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
          )}
        >
          سجل المشاريع
          {activeTab === 'history' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
          )}
        </button>
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'explorer' ? (
            <motion.div
              key="explorer"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-1"
            >
              {fileStructure.map((item, i) => (
                <FileNode key={i} item={item} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {projectHistory.map((project) => (
                <div key={project.id} className="group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                      <History className="h-4 w-4 text-blue-400" />
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
                      <MoreVertical className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>
                  <h4 className="text-[11px] font-bold text-gray-200 mb-1">{project.name}</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-600" />
                    <span className="text-[9px] text-gray-500">{project.date}</span>
                    <span className={cn(
                      "text-[8px] px-1.5 py-0.5 rounded-full",
                      project.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                      {project.status === 'completed' ? 'ناجح' : 'خطأ'}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom Actions ─── */}
      <div className="p-4 border-t border-blue-500/10 bg-black/20">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow shadow-emerald-400/50" />
            <span className="text-[10px] text-gray-400">تزامن السحابة نشط</span>
          </div>
          <button className="text-gray-500 hover:text-white transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
