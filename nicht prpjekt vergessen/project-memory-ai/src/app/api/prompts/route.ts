import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, project, tasks, notes } = body;

    if (!goal || !project) {
      return NextResponse.json({ error: 'Goal and Project data are required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Gemini API key is missing' 
      }, { status: 500 });
    }

    const prompt = `أنت مساعد تقني متخصص في هندسة البرومبتات (Prompt Engineering). 
مهمتك هي تحويل رغبة المستخدم إلى "برومبت" احترافي ومفصل يمكن للمستخدم استخدامه في نماذج الذكاء الاصطناعي (مثل ChatGPT أو Claude) لإنجاز مهمة برمجية محددة بناءً على سياق مشروعه الحالي.

**السياق الحالي للمشروع:**
- اسم المشروع: ${project.name}
- الوصف: ${project.description || 'لا يوجد'}
- المهام الحالية: ${tasks?.slice(0, 10).map((t: any) => t.title).join(', ')}
- أهم الملاحظات: ${notes?.slice(0, 5).map((n: any) => n.content.substring(0, 100)).join(' | ')}

**هدف المستخدم:**
"${goal}"

**المطلوب منك:**
قم بكتابة برومبت طويل واحترافي (باللغة الإنجليزية، لأن النماذج تفهم البرمجة بها أفضل، مع مقدمة بالعربية ترحيبية) يتضمن:
1. شرح مفصل لدور الذكاء الاصطناعي (مثلاً: "You are an expert React developer").
2. سياق المشروع (Tech Stack المتوقع بناءً على الوصف).
3. التفاصيل الدقيقة للهدف المطلوب.
4. تعليمات حول جودة الكود المطلوب (Clean Code, Performance).
5. طلب شرح الكود بعد كتابته.

اجعل النتيجة داخل قالب نصي واضح وسهل النسخ.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ prompt: generatedPrompt });
  } catch (error: any) {
    console.error('Prompt Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
