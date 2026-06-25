import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Style → extra prompt keywords for the image model.
const STYLE_KEYWORDS: Record<string, string> = {
  'photorealistic': 'photorealistic, ultra realistic, sharp focus',
  '3d-render': '3D render, octane render, cinema4d, soft studio lighting',
  'cinematic': 'cinematic, dramatic lighting, film still, depth of field',
  'anime': 'anime style, studio anime, vibrant colors, clean lines',
  'oil-painting': 'oil painting, classical fine art, textured brush strokes',
  'pixel-art': 'pixel art, 8-bit, retro game sprite',
};
const QUALITY_SUFFIX = 'highly detailed, 4k, high quality';

const ENHANCE_SYSTEM =
  'You convert image requests into a single rich English prompt for a text-to-image ' +
  'model. Translate any Arabic faithfully, keep every detail the user mentioned, then ' +
  'add tasteful descriptive words. Output ONLY the English prompt on one line, no quotes, ' +
  'no explanation.';

function hasArabic(text: string): boolean {
  return /[؀-ۿ]/.test(text);
}

// Translate + enrich the (often Arabic) description into a detailed English prompt.
// Falls back to the original text when no key is set or the call fails.
async function enhancePrompt(prompt: string): Promise<string> {
  if (!hasArabic(prompt)) return prompt;

  const key = process.env.GROQ_API_KEY;
  if (key && key !== 'your_api_key_here') {
    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: ENHANCE_SYSTEM },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 200,
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (resp.ok) {
        const data = await resp.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) return text.replace(/\s+/g, ' ');
      }
    } catch (e) {
      console.error('[Image] enhance error:', e);
    }
  }

  return prompt;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { prompt, style = 'photorealistic' } = await req.json();

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'النص مطلوب' }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    const enhanced = await enhancePrompt(cleanPrompt);
    const styleKeywords = STYLE_KEYWORDS[style] || STYLE_KEYWORDS['photorealistic'];
    const finalPrompt = `${enhanced}, ${styleKeywords}, ${QUALITY_SUFFIX}`;

    // Pollinations generates the image on first fetch of this URL (no API key needed).
    const seed = Math.floor(Math.random() * 1_000_000);
    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}` +
      `?width=1024&height=1024&nologo=true&nofeed=true&seed=${seed}`;

    // The /image page extracts the URL from this markdown and renders the <img>.
    const altText = cleanPrompt.replace(/[[\]()]/g, '');

    return NextResponse.json({
      success: true,
      result: `![${altText}](${imageUrl})`,
      imageUrl,
      prompt: cleanPrompt,
      style,
    });
  } catch (error) {
    console.error('[Image Gen] Error:', error);
    return NextResponse.json({ error: 'حدث خطأ في إنشاء الصورة' }, { status: 500 });
  }
}
