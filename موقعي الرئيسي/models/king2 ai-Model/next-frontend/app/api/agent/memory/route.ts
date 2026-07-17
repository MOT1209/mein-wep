import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveLongTermMemory, getLongTermMemory, searchLongTermMemory } from '@/lib/memory/memory-manager';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const category = searchParams.get('category');

    if (key) {
      const value = await getLongTermMemory(userId, key);
      return NextResponse.json({ key, value });
    }

    const memories = await searchLongTermMemory(userId, category || undefined);
    return NextResponse.json({ memories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { key, value, category } = await req.json();
    if (!key || !value) {
      return NextResponse.json({ error: 'key و value مطلوبان' }, { status: 400 });
    }

    await saveLongTermMemory(userId, key, value, category || 'general');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
