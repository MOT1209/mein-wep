// Records a sequence of already-rendered canvas frames into a WebM video by
// replaying them onto an offscreen canvas at a fixed FPS and capturing that
// canvas's MediaStream with MediaRecorder — no hand-rolled video/GIF
// encoding, the browser does the real encoding work.
export async function framesToWebm(frames, { fps = 8, width = 512, height = 512 } = {}) {
  if (!frames.length) throw new Error('لا توجد إطارات للتصدير');
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('هذا المتصفح لا يدعم تسجيل الفيديو (MediaRecorder)');
  }

  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  const octx = off.getContext('2d');

  const stream = off.captureStream(fps);
  const mimeCandidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || '';

  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const done = new Promise((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));
    recorder.onerror = reject;
  });

  recorder.start();

  const frameDelay = 1000 / fps;
  for (const frame of frames) {
    octx.fillStyle = '#ffffff';
    octx.fillRect(0, 0, width, height);
    octx.drawImage(frame, 0, 0, width, height);
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, frameDelay));
  }
  // Hold the last frame briefly so the recorder captures it before stopping.
  await new Promise((r) => setTimeout(r, frameDelay));

  recorder.stop();
  return done;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
