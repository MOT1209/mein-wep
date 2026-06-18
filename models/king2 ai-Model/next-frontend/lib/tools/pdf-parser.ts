// =============================================================================
// KING2 AI — PDF Parser Tool
// =============================================================================
// - Extracts text from PDF files via internal API
// - Smart truncation for large documents
// - Timeout handling
// =============================================================================

import { ToolDefinition } from '@/lib/agents/types';

const PDF_TIMEOUT = 30_000; // 30s
const MAX_PDF_TEXT = 50_000; // 50KB

export const pdfParserTool: ToolDefinition = {
  name: 'pdf_parser',
  description: 'استخراج النص من ملفات PDF (يدعم الروابط المباشرة للملفات)',
  parameters: [
    {
      name: 'url',
      type: 'string',
      description: 'الرابط المباشر لملف PDF',
      required: true,
    },
  ],
  timeout: 45_000,
  execute: async (args: { url: string }) => {
    const url = args.url?.trim();
    if (!url) return 'يرجى توفير رابط ملف PDF';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return '❌ الرابط يجب أن يبدأ بـ http:// أو https://';
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PDF_TIMEOUT);

    try {
      const response = await fetch(`${baseUrl}/api/media/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `فشل تحليل PDF (${response.status}): ${errorText || response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        return `❌ خطأ في تحليل PDF: ${data.error}`;
      }

      const text = data.text || data.content || '';
      if (!text) return 'لم يتم استخراج نص من ملف PDF';

      const cleanText = text.trim();

      if (cleanText.length > MAX_PDF_TEXT) {
        return (
          cleanText.slice(0, MAX_PDF_TEXT) +
          `\n\n... [تم اقتطاع النص. الحجم الكلي: ${cleanText.length} حرف، المعروض: ${MAX_PDF_TEXT} حرف]`
        );
      }

      // Add metadata if available
      let output = cleanText;
      if (data.metadata) {
        const meta = data.metadata;
        const metaLines: string[] = [];
        if (meta.title) metaLines.push(`📄 العنوان: ${meta.title}`);
        if (meta.author) metaLines.push(`✍️ المؤلف: ${meta.author}`);
        if (meta.pages) metaLines.push(`📑 عدد الصفحات: ${meta.pages}`);
        if (metaLines.length > 0) {
          output = metaLines.join('\n') + '\n\n---\n\n' + output;
        }
      }

      return output;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return '⏱️ انتهت مهلة تحليل PDF. حاول مع ملف أصغر';
      }
      return `❌ خطأ في تحليل PDF: ${error.message}`;
    } finally {
      clearTimeout(timer);
    }
  },
};
