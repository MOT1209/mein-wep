import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST /api/media/upload - رفع ملف وسائط
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'video' | 'image'

    if (!file) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 });
    }

    // التحقق من نوع الملف
    const allowedTypes = type === 'video' 
      ? ['video/mp4', 'video/webm', 'video/quicktime']
      : ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 });
    }

    // إنشاء مجلد الرفع إذا لم يكن موجوداً
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // توليد اسم فريد للملف
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    // حفظ الملف
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
      type,
      size: file.size,
    });
  } catch (error) {
    console.error('[KING2 Media Upload Error]:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في رفع الملف' },
      { status: 500 }
    );
  }
}

// GET /api/media - قائمة الملفات المرفوعة
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // يمكن إضافة منطق لجلب قائمة الملفات من قاعدة البيانات
    return NextResponse.json({
      files: [],
      message: 'تم تفعيل نظام الرفع',
    });
  } catch (error) {
    console.error('[KING2 Media List Error]:', error);
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    );
  }
}