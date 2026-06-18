import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { knowledgeBase } from '@/lib/knowledge';

export async function DELETE() {
  const session = await auth();
  const username = (session?.user as any)?.username;

  // Only admin (Rashid2010) can clear the knowledge base
  if (!username || username !== 'Rashid2010') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  try {
    await knowledgeBase.clearAll();
    return NextResponse.json({ success: true, message: 'تم حذف جميع المعرفة' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'فشل حذف المعرفة' },
      { status: 500 },
    );
  }
}
