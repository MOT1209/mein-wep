import { showToast } from './toast.js';

function pad(n, width) {
  return String(n).padStart(width, '0');
}

function dataUrlToBlob(dataUrl) {
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/data:(.*?);/)[1];
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// items: [{ dataUrl, caption, tags }]
export async function downloadPngsWithMetadata(items, { namePrefix = 'stickman' } = {}) {
  if (!items.length) {
    showToast('ما فيه صور محفوظة للتنزيل');
    return;
  }
  const metadata = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const fname = `${namePrefix}_${pad(i, 4)}.png`;
    const blob = dataUrlToBlob(item.dataUrl);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    metadata.push({
      file_name: `images/${fname}`,
      caption: (item.caption && item.caption.trim())
        ? `${item.caption.trim()}, simple black and white stick figure line drawing`
        : 'a stickman illustration, simple black and white stick figure line drawing',
      tags: item.tags || ['stickman', 'stick figure', 'hand-drawn', 'self-drawn'],
      source: 'self_drawn',
      license: 'CC0',
    });
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 180));
  }

  const metaBlob = new Blob(
    [metadata.map((m) => JSON.stringify(m)).join('\n')],
    { type: 'application/json' }
  );
  const metaUrl = URL.createObjectURL(metaBlob);
  const metaA = document.createElement('a');
  metaA.href = metaUrl;
  metaA.download = 'metadata.jsonl';
  document.body.appendChild(metaA);
  metaA.click();
  metaA.remove();
  URL.revokeObjectURL(metaUrl);
}
