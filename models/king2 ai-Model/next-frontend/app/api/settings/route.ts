import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
  }

  const { data: settings } = await supabase
    .from('user_settings')
    .select('language, theme, email_notifications, push_notifications')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({
    language: settings?.language || 'ar',
    theme: settings?.theme || 'DARK',
    emailNotifications: settings?.email_notifications ?? true,
    pushNotifications: settings?.push_notifications ?? true,
  });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
  }

  const allowedFields = ['language', 'theme', 'email_notifications', 'push_notifications'];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const { error } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: user.id, ...updates },
      { onConflict: 'user_id' }
    );

  if (error) {
    return NextResponse.json({ error: 'فشل حفظ الإعدادات: ' + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
