// =============================================================================
// KING2 AI — File Reader Tool
// =============================================================================
// - Reads text content from URLs
// - Content-type detection with smart truncation
// - Timeout handling
// =============================================================================

import { ToolDefinition } from '@/lib/agents/types';

const FILE_TIMEOUT = 15_000; // 15s
const MAX_FILE_SIZE = 50_000; // 50KB max read

// Text-like MIME types we can handle
const TEXT_MIME_PATTERNS = [
  /^text\//,
  /^application\/json/,
  /^application\/xml/,
  /^application\/javascript/,
  /^application\/typescript/,
  /^application\/yaml/,
  /^application\/toml/,
  /^application\/csv/,
  /^application\/rtf/,
  /^application\/x-www-form-urlencoded/,
];

// File extensions we can handle
const TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.mdx', '.json', '.xml', '.html', '.htm', '.css',
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
  '.rb', '.php', '.go', '.rs', '.swift', '.kt', '.scala', '.yaml',
  '.yml', '.toml', '.ini', '.cfg', '.conf', '.log', '.csv', '.env',
  '.sh', '.bash', '.zsh', '.sql', '.r', '.lua', '.dart', '.vue',
  '.svelte', '.astro', '.prisma', '.graphql', '.svg',
]);

function isTextContent(contentType: string): boolean {
  return TEXT_MIME_PATTERNS.some((p) => p.test(contentType));
}

function isTextExtension(url: string): boolean {
  try {
    const parsed = new URL(url);
    const ext = parsed.pathname.toLowerCase().split('.').pop();
    return ext ? TEXT_EXTENSIONS.has(`.${ext}`) : false;
  } catch {
    return false;
  }
}

export const fileReaderTool: ToolDefinition = {
  name: 'file_reader',
  description: 'قراءة محتوى الملفات النصية من روابط الويب (يدعم txt, md, json, html, كود برمجي)',
  parameters: [
    {
      name: 'url',
      type: 'string',
      description: 'الرابط الكامل للملف المراد قراءته',
      required: true,
    },
  ],
  parallelSafe: true,
  timeout: 20_000,
  execute: async (args: { url: string }) => {
    const url = args.url?.trim();
    if (!url) return 'يرجى توفير رابط الملف';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return '❌ الرابط يجب أن يبدأ بـ http:// أو https://';
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FILE_TIMEOUT);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`فشل تحميل الملف: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);

      // Check if it looks like a text file
      if (!isTextContent(contentType) && !isTextExtension(url)) {
        return `⚠️ الملف ليس ملفاً نصياً (Content-Type: ${contentType}). استخدم أداة pdf_parser للملفات النصية.`;
      }

      // Check size
      if (contentLength > MAX_FILE_SIZE * 5) {
        return `⚠️ الملف كبير جداً (${(contentLength / 1024).toFixed(0)}KB). الحد الأقصى ${(MAX_FILE_SIZE / 1024).toFixed(0)}KB`;
      }

      const text = await response.text();

      if (text.length > MAX_FILE_SIZE) {
        return (
          text.slice(0, MAX_FILE_SIZE) +
          `\n\n... [تم اقتطاع النص. الحجم الكلي: ${text.length} حرف، المعروض: ${MAX_FILE_SIZE} حرف]`
        );
      }

      return text || '(الملف فارغ)';
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return '⏱️ انتهت مهلة تحميل الملف';
      }
      return `❌ خطأ في قراءة الملف: ${error.message}`;
    } finally {
      clearTimeout(timer);
    }
  },
};
