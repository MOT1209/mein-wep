// Pixel/geometry helpers shared by the toolbar's extra tools.

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Scanline flood fill starting at (x, y) in device-pixel coordinates.
export function floodFill(ctx, canvas, x, y, hexColor, tolerance = 32) {
  const w = canvas.width;
  const h = canvas.height;
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const startIdx = (y * w + x) * 4;
  const startR = data[startIdx];
  const startG = data[startIdx + 1];
  const startB = data[startIdx + 2];
  const fill = hexToRgb(hexColor);

  if (Math.abs(startR - fill.r) <= tolerance && Math.abs(startG - fill.g) <= tolerance
    && Math.abs(startB - fill.b) <= tolerance) {
    return; // already effectively this color
  }

  const matches = (idx) => Math.abs(data[idx] - startR) <= tolerance
    && Math.abs(data[idx + 1] - startG) <= tolerance
    && Math.abs(data[idx + 2] - startB) <= tolerance;

  const stack = [[x, y]];
  const visited = new Uint8Array(w * h);

  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
    const pixelPos = cy * w + cx;
    if (visited[pixelPos]) continue;
    const idx = pixelPos * 4;
    if (!matches(idx)) continue;
    visited[pixelPos] = 1;
    data[idx] = fill.r;
    data[idx + 1] = fill.g;
    data[idx + 2] = fill.b;
    data[idx + 3] = 255;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }

  ctx.putImageData(imgData, 0, 0);
}

export function pickColor(ctx, x, y) {
  const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function sprayDab(ctx, x, y, radius, color, density = 18) {
  ctx.fillStyle = color;
  for (let i = 0; i < density; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radius;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    ctx.fillRect(px, py, 1.5, 1.5);
  }
}

function starPoints(cx, cy, outerR, innerR, spikes = 5) {
  const points = [];
  const step = Math.PI / spikes;
  let rot = -Math.PI / 2;
  for (let i = 0; i < spikes; i++) {
    points.push([cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR]);
    rot += step;
    points.push([cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR]);
    rot += step;
  }
  return points;
}

export function pathStar(ctx, cx, cy, outerR) {
  const pts = starPoints(cx, cy, outerR, outerR * 0.45);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

export function pathArrow(ctx, from, to, headSize) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - headSize * Math.cos(angle - Math.PI / 6), to.y - headSize * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - headSize * Math.cos(angle + Math.PI / 6), to.y - headSize * Math.sin(angle + Math.PI / 6));
}
