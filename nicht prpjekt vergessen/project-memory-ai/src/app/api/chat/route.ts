import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request)
  const { allowed, remaining, resetTime } = checkRateLimit(clientId, {
    windowMs: 60 * 1000,
    maxRequests: 10,
  })

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
        },
      }
    )
  }

  try {
    const body = await request.json();
    const { message, projects, tasks, notes } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        response: 'عذراً، مفتاح Gemini API غير متاح للذكاء الاصطناعي الشامل. يرجى إضافته في الإعدادات أو المتغيرات.', 
        source: 'system' 
      });
    }

    // Prepare context context
    const activeProjects = projects?.filter((p: any) => p.status === 'ACTIVE') || [];
    const pendingTasks = tasks?.filter((t: any) => t.status !== 'DONE') || [];
    
    const contextPrompt = `أنت مساعد ذكي للمبرمجين داخل تطبيق "Memory AI".
تمتلك الآن سياقاً يضم جميع مشاريع ومهام المستخدم الحالية.

**مشاريع المستخدم النشطة (${activeProjects.length}):**
${activeProjects.map((p: any) => `- ${p.name}: ${p.description || 'بدون وصف'}`).join('\n')}

**أهم المهام قيد الانتظار أو التنفيذ:**
${pendingTasks.slice(0, 15).map((t: any) => `- [${t.priority}] ${t.title} (تابع لمشروع: ${projects?.find((p:any)=>p.id===t.project_id)?.name || 'غير معروف'})`).join('\n')}

المستخدم يسألك السؤال التالي:
"${message}"

أجب على سؤاله بناءً على السياق أعلاه باللغة العربية. كن احترافياً، مباشراً، وساعده في تنظيم وقته ومقترحات للمشاريع إن أمكن.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: contextPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من توليد رد.';

    return NextResponse.json({ response: aiResponse, source: 'gemini' });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
