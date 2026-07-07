import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const userId = session.user.id;

    // Create admin client to bypass RLS
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { persistSession: false } }
    );

    // Delete in order: sessions → accounts → messages → conversations → user
    await supabase.from('sessions').delete().eq('user_id', userId);
    await supabase.from('accounts').delete().eq('user_id', userId);
    await supabase.from('messages').delete().eq('user_id', userId);
    await supabase.from('conversations').delete().eq('user_id', userId);
    await supabase.from('users').delete().eq('id', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Delete Account] Error:', error);
    return NextResponse.json({ error: 'حدث خطأ في حذف الحساب' }, { status: 500 });
  }
}
