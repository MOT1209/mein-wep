import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const BUCKET = 'uploads';
const ALLOWED_PREFIXES = [
  'image/',
  'video/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument', // docx / xlsx / pptx
  'application/vnd.ms-',
  'text/',
  'application/json',
  'application/zip',
];

// POST /api/media/upload — رفع ملف إلى Supabase Storage (يعمل على Vercel)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'حجم الملف كبير جداً (الحد 50 ميجابايت)' }, { status: 400 });
    }

    const type = file.type || 'application/octet-stream';
    if (!ALLOWED_PREFIXES.some((p) => type.startsWith(p))) {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 });
    }

    const userId = (session.user as any).id || 'anon';
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Service-role client bypasses RLS, so no bucket policies needed.
    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: type,
      upsert: false,
    });
    if (error) {
      console.error('[Media Upload] storage error:', error);
      return NextResponse.json({ error: 'فشل رفع الملف إلى التخزين' }, { status: 502 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      filename: file.name,
      type,
      size: file.size,
    });
  } catch (error) {
    console.error('[KING2 Media Upload Error]:', error);
    return NextResponse.json({ error: 'حدث خطأ في رفع الملف' }, { status: 500 });
  }
}

// GET /api/media/upload — فحص جاهزية نظام الرفع
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    return NextResponse.json({ ready: true, bucket: BUCKET });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
