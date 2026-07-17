// =============================================================================
// KING2 AI — Task Manager
// =============================================================================
// - In-memory task store with optional Supabase persistence
// - Full status tracking (pending → running → completed / failed / cancelled)
// - Step-level progress tracking
// - Per-task timeout with auto-fail
// - Cancellation support
// =============================================================================

import { AgentPlan, AgentStep } from '@/lib/agents/types';

// ── Types ────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Task {
  id: string;
  plan: AgentPlan;
  steps: AgentStep[];
  currentStep: number;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  error?: string;
  /** If set, the task auto-fails after this timestamp */
  timeoutAt?: number;
}

// ── In-Memory Store ──────────────────────────────────────────────────

const tasks = new Map<string, Task>();

// ── ID Generation (Edge-safe) ────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// ── Timeout Management ───────────────────────────────────────────────

const timeoutTimers = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleTimeout(taskId: string, timeoutMs: number) {
  const existing = timeoutTimers.get(taskId);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    const task = tasks.get(taskId);
    if (task && (task.status === 'pending' || task.status === 'running')) {
      task.status = 'failed';
      task.error = 'انتهت مهلة المهمة';
      task.completedAt = new Date().toISOString();
    }
    timeoutTimers.delete(taskId);
  }, timeoutMs);

  timeoutTimers.set(taskId, timer);
}

function clearTaskTimeout(taskId: string) {
  const timer = timeoutTimers.get(taskId);
  if (timer) {
    clearTimeout(timer);
    timeoutTimers.delete(taskId);
  }
}

// ── API ──────────────────────────────────────────────────────────────

/**
 * إنشاء مهمة جديدة من خطة محددة
 */
export function createTask(plan: AgentPlan, timeoutMs?: number): Task {
  const id = generateId();
  const task: Task = {
    id,
    plan,
    steps: plan.steps.map((s, i) => ({
      id: `${id}-step-${i + 1}`,
      type: s.tool ? 'tool_call' : 'reason',
      content: s.action,
      toolName: s.tool || undefined,
      status: 'pending' as const,
    })),
    currentStep: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (timeoutMs && timeoutMs > 0) {
    task.timeoutAt = Date.now() + timeoutMs;
    scheduleTimeout(id, timeoutMs);
  }

  tasks.set(id, task);
  return task;
}

/**
 * استرجاع مهمة حسب المعرف
 */
export function getTask(taskId: string): Task | undefined {
  return tasks.get(taskId);
}

/**
 * بدء تنفيذ مهمة
 */
export function startTask(taskId: string): Task | undefined {
  const task = tasks.get(taskId);
  if (!task) return undefined;
  if (task.status !== 'pending') return task;
  task.status = 'running';
  return task;
}

/**
 * تحديث خطوة في المهمة
 */
export function updateTaskStep(
  taskId: string,
  stepIndex: number,
  updates: Partial<AgentStep>
): Task | undefined {
  const task = tasks.get(taskId);
  if (!task) return undefined;
  if (task.steps[stepIndex]) {
    task.steps[stepIndex] = { ...task.steps[stepIndex], ...updates };
  }
  return task;
}

/**
 * التقدّم إلى الخطوة التالية
 */
export function advanceTask(taskId: string): Task | undefined {
  const task = tasks.get(taskId);
  if (!task) return undefined;

  task.currentStep++;

  if (task.currentStep >= task.steps.length) {
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    clearTaskTimeout(taskId);
  }

  return task;
}

/**
 * وضع علامة فشل على مهمة
 */
export function failTask(taskId: string, error: string): Task | undefined {
  const task = tasks.get(taskId);
  if (!task) return undefined;

  task.status = 'failed';
  task.error = error;
  task.completedAt = new Date().toISOString();
  clearTaskTimeout(taskId);

  return task;
}

/**
 * إلغاء مهمة
 */
export function cancelTask(taskId: string): boolean {
  const task = tasks.get(taskId);
  if (!task) return false;
  if (task.status === 'completed' || task.status === 'cancelled') return false;

  task.status = 'cancelled';
  task.completedAt = new Date().toISOString();
  clearTaskTimeout(taskId);

  return true;
}

/**
 * الحصول على جميع المهام النشطة
 */
export function getActiveTasks(): Task[] {
  return Array.from(tasks.values()).filter(
    (t) => t.status === 'pending' || t.status === 'running'
  );
}

/**
 * الحصول على جميع المهام
 */
export function getAllTasks(): Task[] {
  return Array.from(tasks.values());
}

/**
 * تنظيف المهام القديمة من الذاكرة
 */
export function cleanupOldTasks(maxAgeMs = 3_600_000) {
  const now = Date.now();
  let cleaned = 0;

  Array.from(tasks.entries()).forEach(([id, task]) => {
    const age = now - new Date(task.createdAt).getTime();
    if (age > maxAgeMs) {
      clearTaskTimeout(id);
      tasks.delete(id);
      cleaned++;
    }
  });

  return cleaned;
}

/**
 * الحصول على إحصائيات المهام
 */
export function getTaskStats(): {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
} {
  const all = Array.from(tasks.values());
  return {
    total: all.length,
    pending: all.filter((t) => t.status === 'pending').length,
    running: all.filter((t) => t.status === 'running').length,
    completed: all.filter((t) => t.status === 'completed').length,
    failed: all.filter((t) => t.status === 'failed').length,
    cancelled: all.filter((t) => t.status === 'cancelled').length,
  };
}
