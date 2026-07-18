import { fitCanvasToParent } from './canvas-fit.js';
import { downloadPngsWithMetadata } from './gallery-export.js';
import { framesToWebm, downloadBlob } from './recorder.js';
import { showToast, showConfirm, showTextPrompt } from './toast.js';
import { floodFill, pickColor, sprayDab, pathStar, pathArrow } from './tools.js';

const EXPORT_SIZE = 1024;
const STORAGE_KEY = 'stickman-drawer-flipbook-v2';
const DRAG_SHAPE_TOOLS = new Set(['line', 'rect', 'ellipse', 'triangle', 'arrow', 'star']);
const CLICK_TOOLS = new Set(['fill', 'eyedropper', 'text']);

function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2; }

export function initFlipbook(root) {
  const canvas = root.querySelector('#drawCanvas');
  const ctx = canvas.getContext('2d');
  const onionCanvas = root.querySelector('#onionCanvas');
  const onionCtx = onionCanvas.getContext('2d');

  const toolButtons = root.querySelectorAll('[data-tool]');
  const colorInput = root.querySelector('#colorPicker');
  const paletteSwatches = root.querySelectorAll('.swatch');
  const brushSize = root.querySelector('#brushSize');
  const fillToggle = root.querySelector('#fillToggle');
  const onionToggle = root.querySelector('#onionToggle');
  const undoBtn = root.querySelector('#undoBtn');
  const clearBtn = root.querySelector('#clearBtn');
  const saveFrameBtn = root.querySelector('#saveFrameBtn');
  const framesStrip = root.querySelector('#framesStrip');
  const frameCount = root.querySelector('#frameCount');
  const playBtn = root.querySelector('#playBtn');
  const fpsInput = root.querySelector('#fpsInput');
  const downloadPngsBtn = root.querySelector('#downloadPngsBtn');
  const downloadWebmBtn = root.querySelector('#downloadWebmBtn');
  const clearAllBtn = root.querySelector('#clearAllFramesBtn');
  const emptyState = root.querySelector('#framesEmptyState');

  // Shape-tween generator controls
  const tweenShapeButtons = root.querySelectorAll('[data-tween-shape]');
  const tweenColorInput = root.querySelector('#tweenColor');
  const tweenSizeInput = root.querySelector('#tweenSize');
  const tweenFillInput = root.querySelector('#tweenFill');
  const setPointABtn = root.querySelector('#setPointABtn');
  const setPointBBtn = root.querySelector('#setPointBBtn');
  const tweenStatus = root.querySelector('#tweenStatus');
  const rotAInput = root.querySelector('#rotAInput');
  const rotBInput = root.querySelector('#rotBInput');
  const scaleAInput = root.querySelector('#scaleAInput');
  const scaleBInput = root.querySelector('#scaleBInput');
  const durationInput = root.querySelector('#durationInput');
  const tweenFpsInput = root.querySelector('#tweenFpsInput');
  const easingSelect = root.querySelector('#easingSelect');
  const previewTweenBtn = root.querySelector('#previewTweenBtn');
  const generateFramesBtn = root.querySelector('#generateFramesBtn');

  let tool = 'pen';
  let color = '#000000';
  let drawing = false;
  let dragStart = null;
  let dragSnapshotData = null;
  let history = [];
  let frames = []; // { id, dataUrl, caption }
  let activeFrameId = null;
  let playing = false;
  let playTimer = null;

  // Shape-tween generator state
  let tweenShapeType = 'circle';
  let pendingTweenPoint = null; // 'a' | 'b' | null
  let tweenA = null; // { x, y, rot, scale }
  let tweenB = null;
  let tweenPreviewPlaying = false;

  // Move tool state: select a rectangle of the canvas, then drag it around
  // before committing it back into the drawing at its new spot.
  let moveRect = null; // { x, y, w, h } in CSS px — the selection's ORIGINAL bounds
  let moveCanvas = null; // offscreen canvas holding the lifted pixels
  let moveOrigin = null; // { x, y } in CSS px — where the floating content is drawn now
  let moveDragOffset = null;
  let moveDragging = false;
  let moveSelecting = false;

  function setTool(next) {
    if (tool === 'move' && next !== 'move') commitMoveSelection();
    tool = next;
    toolButtons.forEach((b) => b.classList.toggle('toggled', b.dataset.tool === next));
  }

  toolButtons.forEach((btn) => btn.addEventListener('click', () => setTool(btn.dataset.tool)));

  colorInput.addEventListener('input', () => { color = colorInput.value; });
  paletteSwatches.forEach((sw) => {
    sw.style.background = sw.dataset.color;
    sw.addEventListener('click', () => {
      color = sw.dataset.color;
      colorInput.value = color;
    });
  });

  function fillWhite() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  const applyFit = fitCanvasToParent(canvas, ({ resized }) => { if (resized) fillWhite(); });
  const applyOnionFit = fitCanvasToParent(onionCanvas, () => {});

  function pushHistory() {
    history.push(canvas.toDataURL());
    if (history.length > 25) history.shift();
  }

  function restoreSnapshot(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        const cssW = canvas.width / dpr;
        const cssH = canvas.height / dpr;
        fillWhite();
        ctx.drawImage(img, 0, 0, cssW, cssH);
        resolve();
      };
      img.src = dataUrl;
    });
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function strokeStyleFor() {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Number(brushSize.value);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.fillStyle = color;
  }

  function drawShapePreview(from, to) {
    strokeStyleFor();
    const fill = fillToggle.checked;
    ctx.beginPath();
    if (tool === 'line') {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (tool === 'rect') {
      const w = to.x - from.x;
      const h = to.y - from.y;
      if (fill) ctx.fillRect(from.x, from.y, w, h);
      ctx.strokeRect(from.x, from.y, w, h);
    } else if (tool === 'ellipse') {
      const rx = Math.abs(to.x - from.x) / 2;
      const ry = Math.abs(to.y - from.y) / 2;
      const cx = (from.x + to.x) / 2;
      const cy = (from.y + to.y) / 2;
      ctx.ellipse(cx, cy, rx || 1, ry || 1, 0, 0, Math.PI * 2);
      if (fill) ctx.fill();
      ctx.stroke();
    } else if (tool === 'triangle') {
      ctx.moveTo((from.x + to.x) / 2, from.y);
      ctx.lineTo(from.x, to.y);
      ctx.lineTo(to.x, to.y);
      ctx.closePath();
      if (fill) ctx.fill();
      ctx.stroke();
    } else if (tool === 'arrow') {
      const headSize = Math.max(12, Number(brushSize.value) * 2);
      pathArrow(ctx, from, to, headSize);
      ctx.stroke();
    } else if (tool === 'star') {
      const r = Math.hypot(to.x - from.x, to.y - from.y) || 1;
      pathStar(ctx, from.x, from.y, r);
      if (fill) ctx.fill();
      ctx.stroke();
    }
  }

  async function handleClickTool(p) {
    if (tool === 'fill') {
      const dpr = window.devicePixelRatio || 1;
      pushHistory();
      floodFill(ctx, canvas, Math.round(p.x * dpr), Math.round(p.y * dpr), color);
    } else if (tool === 'eyedropper') {
      const dpr = window.devicePixelRatio || 1;
      const picked = pickColor(ctx, Math.round(p.x * dpr), Math.round(p.y * dpr));
      color = picked;
      colorInput.value = picked;
      setTool('pen');
    } else if (tool === 'text') {
      const rect = canvas.getBoundingClientRect();
      const text = await showTextPrompt(rect.left + p.x, rect.top + p.y);
      if (!text) return;
      pushHistory();
      strokeStyleFor();
      ctx.font = `${Math.max(16, Number(brushSize.value) * 3)}px "Segoe UI", Tahoma, Arial, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(text, p.x, p.y);
    }
  }

  // ===================== Move tool (select a rectangle, drag it around) =====================

  function clearOnionCanvas() {
    onionCtx.save();
    onionCtx.setTransform(1, 0, 0, 1, 0, 0);
    onionCtx.clearRect(0, 0, onionCanvas.width, onionCanvas.height);
    onionCtx.restore();
  }

  function renderMoveOverlay() {
    if (!moveCanvas || !moveOrigin) return;
    clearOnionCanvas();
    const dpr = window.devicePixelRatio || 1;
    onionCtx.save();
    onionCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onionCtx.drawImage(moveCanvas, moveOrigin.x, moveOrigin.y, moveRect.w, moveRect.h);
    onionCtx.strokeStyle = '#6c5ce7';
    onionCtx.setLineDash([6, 4]);
    onionCtx.lineWidth = 2;
    onionCtx.strokeRect(moveOrigin.x, moveOrigin.y, moveRect.w, moveRect.h);
    onionCtx.restore();
  }

  function renderSelectionMarquee(from, to) {
    clearOnionCanvas();
    const dpr = window.devicePixelRatio || 1;
    onionCtx.save();
    onionCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onionCtx.strokeStyle = '#6c5ce7';
    onionCtx.setLineDash([6, 4]);
    onionCtx.lineWidth = 2;
    onionCtx.strokeRect(Math.min(from.x, to.x), Math.min(from.y, to.y), Math.abs(to.x - from.x), Math.abs(to.y - from.y));
    onionCtx.restore();
  }

  // Bakes the currently-floating selection (if any) back into the drawing at
  // wherever it's currently sitting, then clears the move state.
  function commitMoveSelection() {
    if (!moveCanvas || !moveOrigin) return;
    ctx.save();
    ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    ctx.drawImage(moveCanvas, moveOrigin.x, moveOrigin.y, moveRect.w, moveRect.h);
    ctx.restore();
    moveCanvas = null;
    moveRect = null;
    moveOrigin = null;
    clearOnionCanvas();
  }

  function pointInMoveSelection(p) {
    if (!moveRect || !moveOrigin) return false;
    return p.x >= moveOrigin.x && p.x <= moveOrigin.x + moveRect.w
      && p.y >= moveOrigin.y && p.y <= moveOrigin.y + moveRect.h;
  }

  function liftSelection(from, to) {
    const x = Math.round(Math.min(from.x, to.x));
    const y = Math.round(Math.min(from.y, to.y));
    const w = Math.round(Math.abs(to.x - from.x));
    const h = Math.round(Math.abs(to.y - from.y));
    if (w < 4 || h < 4) { clearOnionCanvas(); return; } // too small — treat as a stray click, ignore

    const dpr = window.devicePixelRatio || 1;
    pushHistory();
    const devX = Math.round(x * dpr);
    const devY = Math.round(y * dpr);
    const devW = Math.round(w * dpr);
    const devH = Math.round(h * dpr);
    const lifted = ctx.getImageData(devX, devY, devW, devH);

    moveCanvas = document.createElement('canvas');
    moveCanvas.width = devW;
    moveCanvas.height = devH;
    moveCanvas.getContext('2d').putImageData(lifted, 0, 0);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(devX, devY, devW, devH);
    ctx.restore();

    moveRect = { x, y, w, h };
    moveOrigin = { x, y };
    renderMoveOverlay();
  }

  function startDraw(e) {
    if (playing || tweenPreviewPlaying) return;
    const p = getPos(e);

    if (pendingTweenPoint) {
      const which = pendingTweenPoint;
      pendingTweenPoint = null;
      captureTweenPoint(which, p);
      return;
    }

    if (tool === 'move') {
      if (moveRect && pointInMoveSelection(p)) {
        moveDragging = true;
        moveDragOffset = { x: p.x - moveOrigin.x, y: p.y - moveOrigin.y };
      } else {
        commitMoveSelection();
        moveSelecting = true;
        dragStart = p;
      }
      return;
    }

    if (CLICK_TOOLS.has(tool)) {
      handleClickTool(p);
      return;
    }

    drawing = true;
    pushHistory();
    dragStart = p;
    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    } else if (tool === 'spray') {
      sprayDab(ctx, p.x, p.y, Number(brushSize.value), tool === 'eraser' ? '#ffffff' : color);
    } else if (DRAG_SHAPE_TOOLS.has(tool)) {
      dragSnapshotData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  }

  function moveDraw(e) {
    const p = getPos(e);
    if (moveDragging) {
      moveOrigin = { x: p.x - moveDragOffset.x, y: p.y - moveDragOffset.y };
      renderMoveOverlay();
      return;
    }
    if (moveSelecting) {
      renderSelectionMarquee(dragStart, p);
      return;
    }
    if (!drawing) return;
    if (tool === 'pen' || tool === 'eraser') {
      strokeStyleFor();
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if (tool === 'spray') {
      sprayDab(ctx, p.x, p.y, Number(brushSize.value), color);
    } else if (DRAG_SHAPE_TOOLS.has(tool)) {
      ctx.putImageData(dragSnapshotData, 0, 0);
      drawShapePreview(dragStart, p);
    }
  }

  function endDraw(e) {
    if (moveDragging) {
      moveDragging = false;
      return;
    }
    if (moveSelecting) {
      moveSelecting = false;
      liftSelection(dragStart, getPos(e));
      return;
    }
    drawing = false;
    dragSnapshotData = null;
  }

  // For pointercancel/pointerleave: the pointer's final position isn't
  // trustworthy (or the interaction was interrupted), so just stop without
  // trying to finalize a selection lift from possibly-bogus coordinates.
  function abortDraw() {
    if (moveDragging) { moveDragging = false; return; }
    if (moveSelecting) { moveSelecting = false; clearOnionCanvas(); return; }
    drawing = false;
    dragSnapshotData = null;
  }

  canvas.addEventListener('pointerdown', (e) => {
    try { canvas.setPointerCapture(e.pointerId); } catch { /* non-fatal: drawing still works without capture */ }
    startDraw(e);
  });
  canvas.addEventListener('pointermove', moveDraw);
  canvas.addEventListener('pointerup', endDraw);
  canvas.addEventListener('pointercancel', abortDraw);
  canvas.addEventListener('pointerleave', () => { if (drawing || moveDragging || moveSelecting) abortDraw(); });

  undoBtn.addEventListener('click', async () => {
    commitMoveSelection();
    if (!history.length) return;
    await restoreSnapshot(history.pop());
  });

  clearBtn.addEventListener('click', () => {
    commitMoveSelection();
    pushHistory();
    fillWhite();
  });

  function isCanvasBlank() {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) return false;
    }
    return true;
  }

  function exportSquarePng(sourceCanvas = canvas) {
    const off = document.createElement('canvas');
    off.width = EXPORT_SIZE;
    off.height = EXPORT_SIZE;
    const octx = off.getContext('2d');
    octx.fillStyle = '#ffffff';
    octx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
    octx.drawImage(sourceCanvas, 0, 0, EXPORT_SIZE, EXPORT_SIZE);
    return off.toDataURL('image/png');
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(frames));
    } catch (err) {
      console.warn('تعذر حفظ الإطارات محلياً:', err);
    }
  }

  function updateOnionSkin() {
    const dpr = window.devicePixelRatio || 1;
    onionCtx.save();
    onionCtx.setTransform(1, 0, 0, 1, 0, 0);
    onionCtx.clearRect(0, 0, onionCanvas.width, onionCanvas.height);
    onionCtx.restore();
    if (tweenA || tweenB) { renderTweenOverlay(); return; }
    if (!onionToggle.checked || frames.length === 0) return;
    const idx = frames.findIndex((f) => f.id === activeFrameId);
    const prevFrame = idx > 0 ? frames[idx - 1] : frames[frames.length - 1];
    if (!prevFrame || prevFrame.id === activeFrameId) return;
    const img = new Image();
    img.onload = () => {
      const cssW = onionCanvas.width / dpr;
      const cssH = onionCanvas.height / dpr;
      onionCtx.globalAlpha = 0.25;
      onionCtx.drawImage(img, 0, 0, cssW, cssH);
      onionCtx.globalAlpha = 1;
    };
    img.src = prevFrame.dataUrl;
  }

  function renderFrames() {
    framesStrip.replaceChildren();
    frameCount.textContent = String(frames.length);
    emptyState.style.display = frames.length === 0 ? 'block' : 'none';

    frames.forEach((frame, i) => {
      const cell = document.createElement('div');
      cell.className = 'frame-cell' + (frame.id === activeFrameId ? ' active' : '');

      const img = document.createElement('img');
      img.src = frame.dataUrl;
      img.alt = 'إطار ' + (i + 1);
      img.addEventListener('click', () => selectFrame(frame.id));
      cell.appendChild(img);

      const label = document.createElement('span');
      label.className = 'frame-label';
      label.textContent = '#' + (i + 1);
      cell.appendChild(label);

      const actions = document.createElement('div');
      actions.className = 'frame-actions';

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.textContent = '↑';
      upBtn.disabled = i === 0;
      upBtn.addEventListener('click', (ev) => { ev.stopPropagation(); moveFrame(i, -1); });
      actions.appendChild(upBtn);

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.textContent = '↓';
      downBtn.disabled = i === frames.length - 1;
      downBtn.addEventListener('click', (ev) => { ev.stopPropagation(); moveFrame(i, 1); });
      actions.appendChild(downBtn);

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'del';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', (ev) => { ev.stopPropagation(); deleteFrame(frame.id); });
      actions.appendChild(delBtn);

      cell.appendChild(actions);
      framesStrip.appendChild(cell);
    });
  }

  function selectFrame(id) {
    const frame = frames.find((f) => f.id === id);
    if (!frame) return;
    commitMoveSelection();
    activeFrameId = id;
    restoreSnapshot(frame.dataUrl);
    history = [];
    renderFrames();
    updateOnionSkin();
  }

  function moveFrame(index, dir) {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= frames.length) return;
    [frames[index], frames[newIndex]] = [frames[newIndex], frames[index]];
    persist();
    renderFrames();
    updateOnionSkin();
  }

  function deleteFrame(id) {
    frames = frames.filter((f) => f.id !== id);
    if (activeFrameId === id) activeFrameId = null;
    persist();
    renderFrames();
    updateOnionSkin();
  }

  function nextFrameId() {
    return frames.length ? Math.max(...frames.map((f) => f.id)) + 1 : 1;
  }

  saveFrameBtn.addEventListener('click', () => {
    commitMoveSelection();
    if (isCanvasBlank()) {
      showToast('اللوحة فاضية — ارسم شيء أول');
      return;
    }
    const dataUrl = exportSquarePng();
    if (activeFrameId != null && frames.some((f) => f.id === activeFrameId)) {
      const frame = frames.find((f) => f.id === activeFrameId);
      frame.dataUrl = dataUrl;
    } else {
      frames.push({ id: nextFrameId(), dataUrl, caption: '' });
    }
    // Reset so the next save appends a new frame instead of overwriting this
    // one — re-select a thumbnail explicitly to edit an existing frame.
    activeFrameId = null;
    persist();
    renderFrames();
    updateOnionSkin();
  });

  onionToggle.addEventListener('change', updateOnionSkin);

  clearAllBtn.addEventListener('click', async () => {
    if (!frames.length) return;
    if (!(await showConfirm('حذف كل الإطارات؟ هذا الإجراء لا يمكن التراجع عنه.'))) return;
    frames = [];
    activeFrameId = null;
    persist();
    renderFrames();
    updateOnionSkin();
  });

  function loadFrameImages() {
    return Promise.all(frames.map((f) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = f.dataUrl;
    })));
  }

  playBtn.addEventListener('click', async () => {
    if (playing) {
      playing = false;
      clearTimeout(playTimer);
      playBtn.textContent = '▶️ تشغيل';
      if (activeFrameId) selectFrame(activeFrameId);
      return;
    }
    if (frames.length < 2) {
      showToast('تحتاج إطارين على الأقل عشان تشغّل المعاينة');
      return;
    }
    playing = true;
    playBtn.textContent = '⏸️ إيقاف';
    const imgs = await loadFrameImages();
    let i = 0;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;
    function step() {
      if (!playing) return;
      fillWhite();
      ctx.drawImage(imgs[i % imgs.length], 0, 0, cssW, cssH);
      i++;
      const fps = Math.max(1, Number(fpsInput.value) || 8);
      playTimer = setTimeout(step, 1000 / fps);
    }
    step();
  });

  downloadPngsBtn.addEventListener('click', () => {
    downloadPngsWithMetadata(frames, { namePrefix: 'stickman' });
  });

  downloadWebmBtn.addEventListener('click', async () => {
    if (frames.length < 2) {
      showToast('تحتاج إطارين على الأقل عشان تصدّر فيديو');
      return;
    }
    downloadWebmBtn.disabled = true;
    downloadWebmBtn.textContent = '⏳ يصدّر…';
    try {
      const imgs = await loadFrameImages();
      const fps = Math.max(1, Number(fpsInput.value) || 8);
      const blob = await framesToWebm(imgs, { fps, width: 512, height: 512 });
      downloadBlob(blob, 'stickman-animation.webm');
    } catch (err) {
      showToast('فشل تصدير الفيديو: ' + err.message);
    } finally {
      downloadWebmBtn.disabled = false;
      downloadWebmBtn.textContent = '🎬 تصدير فيديو WebM';
    }
  });

  // ===================== Shape-tween generator =====================

  tweenShapeButtons.forEach((btn) => btn.addEventListener('click', () => {
    tweenShapeType = btn.dataset.tweenShape;
    tweenShapeButtons.forEach((b) => b.classList.toggle('toggled', b === btn));
  }));

  function updateTweenStatus() {
    if (pendingTweenPoint === 'a') tweenStatus.textContent = 'اضغط على الكانفاس بالأعلى لتحديد نقطة البداية';
    else if (pendingTweenPoint === 'b') tweenStatus.textContent = 'اضغط على الكانفاس بالأعلى لتحديد نقطة النهاية';
    else if (tweenA && tweenB) tweenStatus.textContent = 'جاهز — اضغط "معاينة" أو "ولّد الإطارات"';
    else if (tweenA) tweenStatus.textContent = 'نقطة البداية محدّدة — حدّد النهاية (B)';
    else tweenStatus.textContent = 'حدّد نقطة البداية (A) أولاً';
  }

  setPointABtn.addEventListener('click', () => {
    pendingTweenPoint = 'a';
    setPointABtn.classList.add('toggled');
    setPointBBtn.classList.remove('toggled');
    updateTweenStatus();
  });

  setPointBBtn.addEventListener('click', () => {
    pendingTweenPoint = 'b';
    setPointBBtn.classList.add('toggled');
    setPointABtn.classList.remove('toggled');
    updateTweenStatus();
  });

  function captureTweenPoint(which, p) {
    const point = { x: p.x, y: p.y, rot: Number((which === 'a' ? rotAInput : rotBInput).value), scale: Number((which === 'a' ? scaleAInput : scaleBInput).value) };
    if (which === 'a') tweenA = point; else tweenB = point;
    setPointABtn.classList.remove('toggled');
    setPointBBtn.classList.remove('toggled');
    updateTweenStatus();
    updateOnionSkin();
  }

  [rotAInput, scaleAInput].forEach((inp) => inp.addEventListener('input', () => {
    if (!tweenA) return;
    tweenA.rot = Number(rotAInput.value);
    tweenA.scale = Number(scaleAInput.value);
    updateOnionSkin();
  }));
  [rotBInput, scaleBInput].forEach((inp) => inp.addEventListener('input', () => {
    if (!tweenB) return;
    tweenB.rot = Number(rotBInput.value);
    tweenB.scale = Number(scaleBInput.value);
    updateOnionSkin();
  }));

  function drawTweenShape(targetCtx, state) {
    targetCtx.save();
    targetCtx.translate(state.x, state.y);
    targetCtx.rotate((state.rot * Math.PI) / 180);
    targetCtx.scale(state.scale, state.scale);
    const r = Number(tweenSizeInput.value);
    const shapeColor = tweenColorInput.value;
    targetCtx.fillStyle = shapeColor;
    targetCtx.strokeStyle = shapeColor;
    targetCtx.lineWidth = 4;
    targetCtx.beginPath();
    if (tweenShapeType === 'circle') {
      targetCtx.arc(0, 0, r, 0, Math.PI * 2);
    } else if (tweenShapeType === 'rect') {
      targetCtx.rect(-r, -r, r * 2, r * 2);
    } else if (tweenShapeType === 'triangle') {
      targetCtx.moveTo(0, -r);
      targetCtx.lineTo(-r, r);
      targetCtx.lineTo(r, r);
      targetCtx.closePath();
    } else if (tweenShapeType === 'star') {
      pathStar(targetCtx, 0, 0, r);
    } else if (tweenShapeType === 'line') {
      targetCtx.moveTo(-r, 0);
      targetCtx.lineTo(r, 0);
    }
    if (tweenShapeType === 'line') {
      targetCtx.stroke();
    } else if (tweenFillInput.checked) {
      targetCtx.fill();
      targetCtx.stroke();
    } else {
      targetCtx.stroke();
    }
    targetCtx.restore();
  }

  function renderTweenOverlay() {
    const dpr = window.devicePixelRatio || 1;
    onionCtx.save();
    onionCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (tweenA && tweenB) {
      onionCtx.save();
      onionCtx.strokeStyle = '#ffffff88';
      onionCtx.setLineDash([6, 6]);
      onionCtx.lineWidth = 2;
      onionCtx.beginPath();
      onionCtx.moveTo(tweenA.x, tweenA.y);
      onionCtx.lineTo(tweenB.x, tweenB.y);
      onionCtx.stroke();
      onionCtx.restore();
    }
    onionCtx.globalAlpha = 0.85;
    if (tweenA) drawTweenShape(onionCtx, tweenA);
    if (tweenB) drawTweenShape(onionCtx, tweenB);
    onionCtx.globalAlpha = 1;
    onionCtx.restore();
  }

  previewTweenBtn.addEventListener('click', () => {
    if (!tweenA || !tweenB || tweenPreviewPlaying) {
      if (!tweenA || !tweenB) showToast('حدّد نقطتي البداية والنهاية أولاً');
      return;
    }
    tweenPreviewPlaying = true;
    previewTweenBtn.disabled = true;
    const duration = Number(durationInput.value) * 1000;
    const start = performance.now();
    const dpr = window.devicePixelRatio || 1;
    function finish() {
      if (!tweenPreviewPlaying) return;
      tweenPreviewPlaying = false;
      previewTweenBtn.disabled = false;
      updateOnionSkin();
    }
    function step(now) {
      if (!tweenPreviewPlaying) return;
      const raw = Math.min(1, (now - start) / duration);
      const t = easingSelect.value === 'ease' ? easeInOut(raw) : raw;
      onionCtx.save();
      onionCtx.setTransform(1, 0, 0, 1, 0, 0);
      onionCtx.clearRect(0, 0, onionCanvas.width, onionCanvas.height);
      onionCtx.restore();
      onionCtx.save();
      onionCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawTweenShape(onionCtx, {
        x: lerp(tweenA.x, tweenB.x, t),
        y: lerp(tweenA.y, tweenB.y, t),
        rot: lerp(tweenA.rot, tweenB.rot, t),
        scale: lerp(tweenA.scale, tweenB.scale, t),
      });
      onionCtx.restore();
      if (raw < 1) requestAnimationFrame(step); else finish();
    }
    requestAnimationFrame(step);
    setTimeout(finish, duration + 800);
  });

  generateFramesBtn.addEventListener('click', () => {
    if (!tweenA || !tweenB) {
      showToast('حدّد نقطتي البداية والنهاية أولاً');
      return;
    }
    const duration = Number(durationInput.value);
    const fps = Math.max(1, Number(tweenFpsInput.value) || 10);
    const total = Math.max(2, Math.round(duration * fps));
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;

    let nid = nextFrameId();
    for (let i = 0; i < total; i++) {
      const raw = i / (total - 1);
      const t = easingSelect.value === 'ease' ? easeInOut(raw) : raw;
      const off = document.createElement('canvas');
      off.width = cssW;
      off.height = cssH;
      const octx = off.getContext('2d');
      octx.fillStyle = '#ffffff';
      octx.fillRect(0, 0, cssW, cssH);
      drawTweenShape(octx, {
        x: lerp(tweenA.x, tweenB.x, t),
        y: lerp(tweenA.y, tweenB.y, t),
        rot: lerp(tweenA.rot, tweenB.rot, t),
        scale: lerp(tweenA.scale, tweenB.scale, t),
      });
      frames.push({ id: nid++, dataUrl: exportSquarePng(off), caption: 'إطار حركة شكل متولّد' });
    }

    tweenA = null;
    tweenB = null;
    persist();
    renderFrames();
    updateOnionSkin();
    showToast(`تم توليد ${total} إطار وإضافته للفليبوك`);
  });

  function loadPersisted() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) frames = JSON.parse(raw);
    } catch (err) {
      console.warn('تعذرت قراءة الإطارات المحفوظة:', err);
    }
    renderFrames();
  }

  loadPersisted();
  setTool('pen');

  return {
    refit() {
      applyFit();
      applyOnionFit();
      updateOnionSkin();
    },
  };
}
