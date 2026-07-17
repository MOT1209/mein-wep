import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: totalConversations, error: convError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    if (usersError || convError) {
      return NextResponse.json(
        { error: 'فشل جلب الإحصائيات' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalUsers: totalUsers ?? 0,
      totalConversations: totalConversations ?? 0,
      supportedLanguages: 15,
      avgResponseTime: 500,
    });
  } catch {
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}
