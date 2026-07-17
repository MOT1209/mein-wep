'use client';

import { motion } from 'framer-motion';
import { Plus, GripVertical, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const mockTasks: Task[] = [
  { id: '1', title: 'مراجعة سيناريو التيك توك', status: 'TODO', priority: 'HIGH' },
  { id: '2', title: 'تحديث شعار يوتيوب', status: 'IN_PROGRESS', priority: 'MEDIUM' },
  { id: '3', title: 'تسجيل مقطع عن الذكاء الاصطناعي', status: 'TODO', priority: 'HIGH' },
  { id: '4', title: 'نشر البوست الأسبوعي', status: 'DONE', priority: 'LOW' },
];

export function TaskManager() {
  const [tasks] = useState<Task[]>(mockTasks);

  const getColTasks = (status: TaskStatus) => tasks.filter(t => t.status === status);

  const Column = ({ title, status, icon: Icon, color }: { title: string, status: TaskStatus, icon: any, color: string }) => (
    <div className="flex-1 bg-gray-900/40 rounded-xl p-3 border border-gray-800 flex flex-col min-h-[250px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-1.5", color)}>
          <Icon className="h-3.5 w-3.5" />
          {title}
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-800 text-[10px] text-gray-400">
            {getColTasks(status).length}
          </span>
        </h4>
        <button className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-800">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {getColTasks(status).map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex gap-2 p-2.5 rounded-lg bg-gray-800/80 border border-gray-700/50 hover:border-blue-500/30 transition-colors cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-600 mt-0.5 shrink-0 group-hover:text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium leading-snug mb-2", 
                status === 'DONE' ? "text-gray-500 line-through" : "text-gray-200"
              )}>
                {t.title}
              </p>
              <div className="flex">
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase",
                  t.priority === 'HIGH' ? "bg-rose-500/20 text-rose-400" :
                  t.priority === 'MEDIUM' ? "bg-amber-500/20 text-amber-400" :
                  "bg-emerald-500/20 text-emerald-400"
                )}>
                  {t.priority}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="glass-card border border-blue-500/20 p-5 h-full flex flex-col hover:shadow-xl hover:shadow-blue-500/5 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            إدارة المهام (Task Manager)
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">أسلوب Notion لتتبع التقدم</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 flex-1">
        <Column title="قيد الانتظار" status="TODO" icon={Circle} color="text-amber-400" />
        <Column title="قيد التنفيذ" status="IN_PROGRESS" icon={Clock} color="text-blue-400" />
        <Column title="مكتملة" status="DONE" icon={CheckCircle2} color="text-emerald-400" />
      </div>
    </div>
  );
}
