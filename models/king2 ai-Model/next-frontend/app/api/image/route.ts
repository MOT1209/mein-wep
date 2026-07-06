import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

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

// Generate with the custom KING2-IMAGE model (SDXL LoRA) via the HF Inference
// Providers router. Returns a data URI, or null on any failure so the caller
// can fall back to Pollinations.
const KING2_LORA_URL =
  'https://huggingface.co/RASHID778/king2-image/resolve/main/pytorch_lora_weights.safetensors';

async function fetchAsDataUri(url: string): Promise<string | null> {
  if (url.startsWith('data:')) return url;
  const resp = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!resp.ok) return null;
  const type = resp.headers.get('content-type') || 'image/png';
  const buf = Buffer.from(await resp.arrayBuffer());
  return `data:${type};base64,${buf.toString('base64')}`;
}

async function generateWithKing2(prompt: string): Promise<string | null> {
  const key = process.env.HF_TOKEN;
  if (!key) return null;
  const model = process.env.KING2_IMAGE_MODEL || 'RASHID778/king2-image';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  };

  // 1) OpenAI-compatible images endpoint on the HF router (provider-agnostic).
  try {
    const resp = await fetch('https://router.huggingface.co/v1/images/generations', {
      method: 'POST',
      headers,
      body: JSON.stringify({ model, prompt, response_format: 'b64_json' }),
      signal: AbortSignal.timeout(55_000),
    });
    if (resp.ok) {
      const data = await resp.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (b64) return `data:image/png;base64,${b64}`;
      const url = data?.data?.[0]?.url;
      if (url) return await fetchAsDataUri(url);
    } else {
      console.error('[Image] king2 router error:', resp.status, await resp.text());
    }
  } catch (e) {
    console.error('[Image] king2 router error:', e);
  }

  // 2) Provider-direct: fal-ai serves the LoRA on top of fast-sdxl
  //    (mapping from https://huggingface.co/api/models/RASHID778/king2-image).
  try {
    const resp = await fetch('https://router.huggingface.co/fal-ai/fal-ai/fast-sdxl', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        loras: [{ path: KING2_LORA_URL, scale: 1 }],
        image_size: 'square_hd',
        num_inference_steps: 28,
        guidance_scale: 7,
        sync_mode: true,
      }),
      signal: AbortSignal.timeout(55_000),
    });
    if (resp.ok) {
      const data = await resp.json();
      const url = data?.images?.[0]?.url;
      if (url) return await fetchAsDataUri(url);
    } else {
      console.error('[Image] king2 fal error:', resp.status, await resp.text());
    }
  } catch (e) {
    console.error('[Image] king2 fal error:', e);
  }

  return null;
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

    // The /image page extracts the URL from this markdown and renders the <img>.
    const altText = cleanPrompt.replace(/[[\]()]/g, '');

    // Prefer the custom KING2-IMAGE model when enabled; fall back to Pollinations.
    const preferKing2 = (process.env.IMAGE_PROVIDER || '').toLowerCase() === 'king2';
    if (preferKing2) {
      const dataUri = await generateWithKing2(finalPrompt);
      if (dataUri) {
        return NextResponse.json({
          success: true,
          result: `![${altText}](${dataUri})`,
          imageUrl: dataUri,
          prompt: cleanPrompt,
          style,
          model: 'king2-image',
        });
      }
      // fall through to Pollinations on failure
    }

    // Pollinations generates the image on first fetch of this URL (no API key needed).
    const seed = Math.floor(Math.random() * 1_000_000);
    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}` +
      `?width=1024&height=1024&nologo=true&nofeed=true&seed=${seed}`;

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
