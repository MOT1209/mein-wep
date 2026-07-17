import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // استخدام الرابط الأصلي للموقع بشكل آمن
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }
    console.error('Auth callback error:', error);
  }

  // في حال حدوث خطأ، العودة لصفحة تسجيل الدخول
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
