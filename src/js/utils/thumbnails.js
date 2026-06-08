const THUMBNAILS = {
  'Alking': { bg: ['#6366f1', '#8b5cf6'], emoji: '🌐', pattern: 'dots' },
  'FromLiten': { bg: ['#0ea5e9', '#38bdf8'], emoji: '💻', pattern: 'grid' },
  'Gem-PRO': { bg: ['#ec4899', '#f472b6'], emoji: '💎', pattern: 'circles' },
  'islams-wep': { bg: ['#059669', '#10b981'], emoji: '🕌', pattern: 'waves' },
  'BOTTIKTOK2': { bg: ['#ea580c', '#f97316'], emoji: '🤖', pattern: 'dots' },
  'nicht-projekt-vergessen': { bg: ['#8b5cf6', '#a78bfa'], emoji: '✅', pattern: 'grid' },
  'RashidClaw': { bg: ['#f59e0b', '#fbbf24'], emoji: '🔧', pattern: 'circles' },
  'bara-Alsalfhe': { bg: ['#ec4899', '#f43f5e'], emoji: '🎨', pattern: 'waves' },
  'Rust Construction': { bg: ['#ea580c', '#dc2626'], emoji: '🏗️', pattern: 'grid' },
  'Farm Empire': { bg: ['#16a34a', '#22c55e'], emoji: '🌾', pattern: 'waves' },
  'Rashid AI': { bg: ['#6366f1', '#38bdf8'], emoji: '🧠', pattern: 'dots' },
  'Quran Pro': { bg: ['#059669', '#047857'], emoji: '📖', pattern: 'waves' },
  'Calculator Vault': { bg: ['#0ea5e9', '#0284c7'], emoji: '🔒', pattern: 'grid' },
  'Quiz Master': { bg: ['#8b5cf6', '#6d28d9'], emoji: '❓', pattern: 'circles' }
};

const CACHE = new Map();

function drawPattern(ctx, w, h, pattern) {
  ctx.globalAlpha = 0.08;
  switch (pattern) {
    case 'dots':
      for (let x = 0; x < w; x += 30)
        for (let y = 0; y < h; y += 30) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      break;
    case 'grid':
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 35) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 35) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      break;
    case 'circles':
      for (let i = 0; i < 6; i++) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        const r = 20 + Math.random() * 60;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      break;
    case 'waves':
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const offset = i * 40;
        for (let x = 0; x < w; x += 5) {
          const y = Math.sin((x + offset) * 0.03) * 30 + h * 0.5 + offset - 40;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
  }
  ctx.globalAlpha = 1;
}

export function generateThumbnail(title, size = 600) {
  const key = `${title}_${size}`;
  if (CACHE.has(key)) return CACHE.get(key);

  const config = THUMBNAILS[title] || { bg: ['#38bdf8', '#6366f1'], emoji: '🚀', pattern: 'dots' };

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round(size * 0.6);
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, size, canvas.height);
  grad.addColorStop(0, config.bg[0]);
  grad.addColorStop(1, config.bg[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, canvas.height);

  drawPattern(ctx, size, canvas.height, config.pattern);

  ctx.globalAlpha = 0.12;
  const rectX = size * 0.05;
  const rectY = canvas.height * 0.1;
  const rectW = size * 0.9;
  const rectH = canvas.height * 0.5;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(rectX, rectY, rectW, rectH, 12);
  } else {
    const r = 12;
    ctx.moveTo(rectX + r, rectY);
    ctx.lineTo(rectX + rectW - r, rectY);
    ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + r);
    ctx.lineTo(rectX + rectW, rectY + rectH - r);
    ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - r, rectY + rectH);
    ctx.lineTo(rectX + r, rectY + rectH);
    ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - r);
    ctx.lineTo(rectX, rectY + r);
    ctx.quadraticCurveTo(rectX, rectY, rectX + r, rectY);
    ctx.closePath();
  }
  ctx.fill();

  ctx.globalAlpha = 0.9;
  ctx.font = `${size * 0.12}px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.emoji, size * 0.2, rectY + rectH * 0.5);

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.font = `600 ${size * 0.065}px 'Outfit', 'Segoe UI', sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const textX = size * 0.35;
  const lines = wrapText(ctx, title, textX, size * 0.9);
  lines.forEach((line, i) => {
    ctx.fillText(line, textX, rectY + rectH * 0.4 + i * (size * 0.085));
  });

  ctx.globalAlpha = 0.5;
  ctx.font = `${size * 0.035}px 'Outfit', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('Rashid Web', size * 0.05, canvas.height - size * 0.04);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  CACHE.set(key, dataUrl);
  return dataUrl;
}

function wrapText(ctx, text, maxX, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth - maxX && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function getThumbnailData(title) {
  return THUMBNAILS[title] || { bg: ['#38bdf8', '#6366f1'], emoji: '🚀', pattern: 'dots' };
}
