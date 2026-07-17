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

    const userId = (session.user as any).id;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const plan = subscription?.plan || 'FREE';
    const expiresAt = subscription?.expires_at || null;
    const isActive = expiresAt ? new Date(expiresAt) > new Date() : plan === 'FREE';

    return NextResponse.json({
      plan,
      isActive,
      expiresAt,
    });
  } catch (error) {
    console.error('[KING2 Subscription] Error:', error);
    return NextResponse.json({ plan: 'FREE', isActive: true, expiresAt: null });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { plan } = await req.json();

    if (!plan || !['PRO', 'ROYALTY'].includes(plan)) {
      return NextResponse.json({ error: 'خطة غير صالحة' }, { status: 400 });
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan,
        expires_at: expiryDate.toISOString(),
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      plan: data.plan,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    console.error('[KING2 Subscription] Create error:', error);
    return NextResponse.json({ error: 'حدث خطأ في تفعيل الاشتراك' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);

    return NextResponse.json({ success: true, plan: 'FREE' });
  } catch (error) {
    console.error('[KING2 Subscription] Cancel error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
