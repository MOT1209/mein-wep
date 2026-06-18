'use client';

import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Simple Markdown renderer for basic formatting.
 * Supports: bold, italic, inline code, code blocks, lists, links, headers, blockquotes.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => {
    let result = content
      // Escape HTML first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Code blocks (must come before inline code)
      .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
        const langClass = lang ? ` class="lang-${lang}"` : '';
        return `<pre class="my-3 overflow-x-auto rounded-xl bg-surface-elevated/80 p-4 text-sm leading-6 ring-1 ring-zinc-800/50"${langClass}><code class="text-zinc-200">${code.trim()}</code></pre>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="rounded-md bg-surface-elevated/80 px-1.5 py-0.5 text-sm text-king-300 font-mono">$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em class="italic text-zinc-200">$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-king-400 underline decoration-king-500/30 underline-offset-2 hover:text-king-300 transition-colors">$1</a>')
      // Blockquotes
      .replace(/^&gt;\s?(.*)$/gm, '<blockquote class="my-2 border-r-2 border-king-500/50 pr-4 text-zinc-400 italic">$1</blockquote>')
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li class="mr-5 list-disc text-zinc-300 leading-7">$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.+)$/gm, '<li class="mr-5 list-decimal text-zinc-300 leading-7">$1</li>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3 class="mt-4 mb-2 text-lg font-bold text-white">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="mt-5 mb-2 text-xl font-bold text-white">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="mt-5 mb-3 text-2xl font-bold text-white">$1</h1>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="my-4 border-zinc-800/50" />')
      // Double line breaks = paragraph
      .replace(/\n\n/g, '</p><p class="mb-3 leading-7">')
      // Single line break
      .replace(/\n/g, '<br />');

    // Wrap in paragraph if not already wrapped
    if (!result.startsWith('<')) {
      result = `<p class="mb-3 leading-7">${result}</p>`;
    }

    return result;
  }, [content]);

  return (
    <div
      className="markdown-content leading-7"
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
