import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllTasks } from '@/lib/tasks/task-manager';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const tasks = getAllTasks().map((t) => ({
      id: t.id,
      goal: t.plan.goal,
      currentStep: t.currentStep,
      totalSteps: t.steps.length,
      status: t.status,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
      error: t.error,
      steps: t.steps.map((s) => ({
        id: s.id,
        content: s.content,
        toolName: s.toolName,
        status: s.status,
      })),
    }));

    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
