'use client';

import { motion } from 'framer-motion';
import { Folder, FileCode2, FileText, ChevronRight, FileJson, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const fileStructure = [
  {
    type: 'folder',
    name: 'project-memory',
    isOpen: true,
    children: [
      { type: 'file', name: 'skills.md', icon: FileText, color: 'text-rose-400' },
      { type: 'file', name: 'README.md', icon: FileText, color: 'text-gray-400' },
      { type: 'file', name: 'package.json', icon: FileJson, color: 'text-yellow-400' },
      {
        type: 'folder',
        name: 'src',
        isOpen: false,
        children: [
          { type: 'file', name: 'page.tsx', icon: FileCode2, color: 'text-blue-400' },
        ]
      }
    ]
  }
];

export function FileExplorer() {
  const [activeFile, setActiveFile] = useState('skills.md');

  const FileNode = ({ item, depth = 0 }: any) => {
    const isFolder = item.type === 'folder';
    const [open, setOpen] = useState(item.isOpen);

    if (isFolder) {
      return (
        <div className="w-full">
          <div 
            className="flex items-center gap-1.5 py-1 px-2 hover:bg-gray-800/60 rounded cursor-pointer text-gray-300"
            style={{ paddingRight: `${depth * 12 + 8}px` }}
            onClick={() => setOpen(!open)}
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform", open && "rotate-90")} />
            {open ? <FolderOpen className="h-4 w-4 text-blue-400" /> : <Folder className="h-4 w-4 text-blue-400 fill-blue-400/20" />}
            <span className="text-xs font-medium">{item.name}</span>
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
          "flex items-center gap-2 py-1 px-2 hover:bg-gray-800/60 rounded cursor-pointer transition-colors",
          isActive ? "bg-blue-500/10 text-white" : "text-gray-400"
        )}
        style={{ paddingRight: `${(depth * 12) + 24}px` }}
        onClick={() => setActiveFile(item.name)}
      >
        <Icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
        <span className="text-xs">{item.name}</span>
      </div>
    );
  };

  return (
    <div className="glass-card border border-blue-500/20 p-5 h-full flex flex-col hover:shadow-xl hover:shadow-blue-500/5 transition-all w-full max-w-sm">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            مستكشف الملفات
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">وصول سريع للملفات الحيوية</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-lg p-2 border border-gray-800">
        {fileStructure.map((item, i) => (
          <FileNode key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
