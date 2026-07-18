import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, display_name, username, avatar_url, phone, bio, created_at, role')
    .eq('email', session.user.email)
    .maybeSingle();

  if (error || !user) {
    return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
  }

  const { count: conversationCount, error: countError } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.display_name || user.name || '',
    username: user.username || '',
    avatarUrl: user.avatar_url || '',
    phone: user.phone || '',
    bio: user.bio || '',
    memberSince: user.created_at,
    role: user.role,
    conversationCount: countError ? 0 : (conversationCount ?? 0),
  });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  const allowedFields = ['name', 'username', 'phone', 'bio'];
  const updates: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field === 'name' ? 'display_name' : field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'لا توجد بيانات للتحديث' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data: user, error } = await supabase
    .from('users')
    .update(updates)
    .eq('email', session.user.email)
    .select('id, email, name, display_name, username, avatar_url, phone, bio, created_at, role')
    .maybeSingle();

  if (error) {
    console.error('[Profile] Update error:', error);
    return NextResponse.json({ error: 'فشل التحديث: ' + error.message }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.display_name || user.name || '',
    username: user.username || '',
    avatarUrl: user.avatar_url || '',
    phone: user.phone || '',
    bio: user.bio || '',
    memberSince: user.created_at,
    role: user.role,
  });
}
