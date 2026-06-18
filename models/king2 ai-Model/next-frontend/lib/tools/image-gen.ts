// =============================================================================
// KING2 AI — Image Generation Tool
// =============================================================================
// - Calls internal /api/image endpoint which supports multiple backends
// - Returns markdown image with URL
// - Timeout handling
// =============================================================================

import { ToolDefinition } from '@/lib/agents/types';

const IMAGE_TIMEOUT = 60_000; // 60s for image generation

export const imageGenTool: ToolDefinition = {
  name: 'image_generation',
  description: 'إنشاء صور باستخدام الذكاء الاصطناعي بناءً على وصف نصي',
  parameters: [
    {
      name: 'prompt',
      type: 'string',
      description: 'وصف دقيق للصورة المراد إنشاؤها (بالإنجليزية أو العربية)',
      required: true,
    },
    {
      name: 'size',
      type: 'string',
      description: 'حجم الصورة (مثال: 1024x1024، 1792x1024، 768x768)',
      required: false,
    },
  ],
  timeout: 90_000,
  execute: async (args: { prompt: string; size?: string }) => {
    const prompt = args.prompt?.trim();
    if (!prompt) return 'يرجى توفير وصف للصورة';

    const size = args.size || '1024x1024';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT);

    try {
      const response = await fetch(`${baseUrl}/api/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt,
          size,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `فشل إنشاء الصورة (${response.status}): ${errorText || response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        return `❌ خطأ في إنشاء الصورة: ${data.error}`;
      }

      const imageUrl = data.url || data.imageUrl || data.data?.[0]?.url;
      if (!imageUrl) {
        return '❌ لم يتم استلام رابط الصورة من الخادم';
      }

      return `✅ تم إنشاء الصورة بنجاح!\n\n![${prompt}](${imageUrl})\n\n🔗 [فتح الصورة](${imageUrl})`;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return '⏱️ انتهت مهلة إنشاء الصورة. حاول مرة أخرى مع وصف أقصر';
      }
      return `❌ خطأ في إنشاء الصورة: ${error.message}`;
    } finally {
      clearTimeout(timer);
    }
  },
};
