import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const PIXABAY_API = 'https://pixabay.com/api/videos/';
const FIRECRAWL_API = 'https://api.firecrawl.dev/v1';

interface MontageRequest {
  topic: string;
  duration?: number;
  style?: string;
  narration?: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body: MontageRequest = await req.json();
    const { topic, duration = 30, style = 'cinematic', narration } = body;

    if (!topic) {
      return NextResponse.json({ error: 'الموضوع مطلوب' }, { status: 400 });
    }

    const assetPromises: Promise<{ url: string; type: string; thumbnail: string } | null>[] = [];

    // Pixabay video search
    const pixabayKey = process.env.PIXABAY_API_KEY;
    if (pixabayKey) {
      assetPromises.push(
        fetch(`${PIXABAY_API}?key=${pixabayKey}&q=${encodeURIComponent(topic)}&per_page=5&safesearch=true`)
          .then((r) => r.json())
          .then((data) => {
            const hit = data.hits?.[0];
            if (!hit) return null;
            const video = hit.videos?.medium || hit.videos?.small;
            return video
              ? { url: video.url, type: 'video', thumbnail: hit.pageURL }
              : null;
          })
          .catch(() => null)
      );
    }

    // Firecrawl web research
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (firecrawlKey) {
      assetPromises.push(
        fetch(`${FIRECRAWL_API}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firecrawlKey}`,
          },
          body: JSON.stringify({
            query: `${topic} video footage b-roll`,
            maxResults: 3,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            const result = data.data?.[0];
            return result
              ? { url: result.url, type: 'reference', thumbnail: result.image || '' }
              : null;
          })
          .catch(() => null)
      );
    }

    const assets = (await Promise.all(assetPromises)).filter(Boolean);

    return NextResponse.json({
      success: true,
      montage: {
        topic,
        duration,
        style,
        narration: narration || `تلقائي: ${topic}`,
        assets: assets.length > 0 ? assets : [{ url: '', type: 'placeholder', thumbnail: '' }],
        totalClips: assets.length || 1,
        estimatedRenderTime: `${Math.max(5, assets.length * 3)}s`,
      },
      message: assets.length > 0
        ? `تم العثور على ${assets.length} مصدر للمونتاج حول "${topic}"`
        : 'لم يتم العثور على مصادر خارجية. جرب مواضيع أخرى.',
    });
  } catch (error) {
    console.error('[KING2 Montage Error]:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تجهيز المونتاج' },
      { status: 500 }
    );
  }
}
