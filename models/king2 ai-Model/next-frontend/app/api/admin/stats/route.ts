import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const username = (session.user as any).username;
    if (username !== 'Rashid2010') {
      return NextResponse.json({ error: 'غير مصرح - للمدير فقط' }, { status: 403 });
    }

    const [
      totalUsers,
      totalConversations,
      totalMessages,
      totalKnowledgeBase,
      todayMessages,
      recentActivity,
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true)
        .then(r => r.count ?? 0),
      supabase.from('conversations').select('*', { count: 'exact', head: true })
        .then(r => r.count ?? 0),
      supabase.from('messages').select('*', { count: 'exact', head: true })
        .then(r => r.count ?? 0),
      supabase.from('knowledge_base').select('*', { count: 'exact', head: true }).eq('is_published', true)
        .then(r => {
          if (r.error && r.error.code === '42703') {
            return supabase.from('knowledge_base').select('*', { count: 'exact', head: true }).then(r2 => r2.count ?? 0);
          }
          return r.count ?? 0;
        }),
      supabase.from('messages').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .then(r => r.count ?? 0),
      supabase.from('users')
        .select('id, email, username, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
        .then(r => r.data || []),
    ]);

    const apiUsage = {
      gemini: {
        used: totalMessages * 150,
        limit: 1000000,
      },
      groq: {
        used: totalMessages * 100,
        limit: 5000000,
      },
    };

    let systemHealth: Record<string, string> = {
      database: 'healthy',
      api: 'healthy',
      storage: 'healthy',
    };

    try {
      const { error } = await supabase.from('users').select('id', { count: 'exact', head: true }).limit(1);
      if (error) systemHealth.database = 'unhealthy';
    } catch {
      systemHealth.database = 'unhealthy';
    }

    const formattedActivity = (recentActivity as any[]).map((user) => ({
      id: user.id,
      type: 'user_signup' as const,
      description: `مستخدم جديد: ${user.username || user.email}`,
      timestamp: user.created_at,
    }));

    return NextResponse.json({
      totalUsers,
      totalConversations,
      totalMessages,
      todayMessages,
      totalKnowledgeBase,
      apiUsage,
      systemHealth,
      recentActivity: formattedActivity,
    });
  } catch (error) {
    console.error('[KING2 Admin Stats Error]:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}
