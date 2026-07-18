// ═══════════════════════════════════════════════════════════════════════════════
// Drawing Canvas Utilities — extracted from DrawingScreen
// ═══════════════════════════════════════════════════════════════════════════════

export type Tool = 'pencil' | 'brush' | 'marker' | 'eraser' | 'fill'

export const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FF5722', '#795548',
  '#9E9E9E', '#607D8B', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688',
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107',
  '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B',
]

export const BRUSH_SIZES = [2, 4, 8, 12, 20, 30]

// ── Pixel Helpers ────────────────────────────────────────────────────────────

function getPixelColor(data: Uint8ClampedArray, x: number, y: number, width: number): number[] {
  const index = (y * width + x) * 4
  return [data[index], data[index + 1], data[index + 2], data[index + 3]]
}

function setPixelColor(data: Uint8ClampedArray, x: number, y: number, width: number, color: number[]): void {
  const index = (y * width + x) * 4
  data[index] = color[0]
  data[index + 1] = color[1]
  data[index + 2] = color[2]
  data[index + 3] = 255
}

function colorsMatch(a: number[], b: number[]): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}

function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

// ── Flood Fill ───────────────────────────────────────────────────────────────

export function floodFill(ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string): void {
  const canvas = ctx.canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  const targetColor = getPixelColor(data, startX, startY, canvas.width)
  const fill = hexToRgb(fillColor)

  if (colorsMatch(targetColor, fill)) return

  const stack: [number, number][] = [[startX, startY]]

  while (stack.length > 0) {
    const [x, y] = stack.pop()!

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue

    const currentColor = getPixelColor(data, x, y, canvas.width)
    if (!colorsMatch(currentColor, targetColor)) continue

    setPixelColor(data, x, y, canvas.width, fill)

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }

  ctx.putImageData(imageData, 0, 0)
}

// ── Canvas Coordinate Calculation ────────────────────────────────────────────

export function getCanvasCoordinates(
  e: React.TouchEvent | React.MouseEvent,
  container: HTMLDivElement,
  canvas: HTMLCanvasElement,
  zoom: number
): { x: number; y: number } {
  const containerRect = container.getBoundingClientRect()

  let clientX: number, clientY: number
  if ('touches' in e) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }

  const relX = clientX - containerRect.left
  const relY = clientY - containerRect.top

  const scaleX = canvas.width / containerRect.width
  const scaleY = canvas.height / containerRect.height

  return {
    x: (relX / zoom) * scaleX + ((zoom - 1) * canvas.width / 2 / zoom) * (1 / scaleX),
    y: (relY / zoom) * scaleY + ((zoom - 1) * canvas.height / 2 / zoom) * (1 / scaleY),
  }
}

// ── Drawing Style Setup ──────────────────────────────────────────────────────

export function applyToolStyle(
  ctx: CanvasRenderingContext2D,
  tool: Tool,
  color: string,
  brushSize: number
): void {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (tool) {
    case 'pencil':
      ctx.lineWidth = brushSize
      ctx.globalAlpha = 1
      ctx.strokeStyle = color
      break
    case 'brush':
      ctx.lineWidth = brushSize * 1.5
      ctx.globalAlpha = 0.7
      ctx.strokeStyle = color
      break
    case 'marker':
      ctx.lineWidth = brushSize * 2
      ctx.globalAlpha = 0.8
      ctx.strokeStyle = color
      break
    case 'eraser':
      ctx.lineWidth = brushSize * 3
      ctx.globalAlpha = 1
      ctx.strokeStyle = '#FFFFFF'
      break
  }
}
