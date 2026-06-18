import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'يُقبل فقط ملفات PDF' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'الملف كبير جداً (الحد الأقصى 10MB)' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'مفتاح API غير مهيأ' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'اقرأ هذا المستند PDF واستخرج منه النص الكامل بالعربية أو بالإنجليزية كما هو. لا تلخص، فقط استخرج كل النص.' },
              {
                inline_data: {
                  mime_type: 'application/pdf',
                  data: base64,
                },
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('[KING2 PDF] Gemini API error:', err);
      return NextResponse.json({ error: 'فشل في معالجة PDF' }, { status: 502 });
    }

    const data = await response.json();
    const extractedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({
      success: true,
      text: extractedText,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('[KING2 PDF Error]:', error);
    return NextResponse.json({ error: 'حدث خطأ في معالجة الملف' }, { status: 500 });
  }
}
