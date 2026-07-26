export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

const FLIPBOOK_KEY = 'stickman-drawer-flipbook-v2';

export function importSingleFrame(item) {
  let frames = [];
  try { frames = JSON.parse(localStorage.getItem(FLIPBOOK_KEY) || '[]'); } catch {}
  const id = frames.length ? Math.max(...frames.map(f => f.id)) + 1 : 1;
  frames.push({ id, dataUrl: item.dataUrl, caption: item.prompt });
  try {
    localStorage.setItem(FLIPBOOK_KEY, JSON.stringify(frames));
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      throw new Error('الذاكرة ممتلئة — احذف بعض الإطارات القديمة');
    }
    throw err;
  }
  window.dispatchEvent(new CustomEvent('flipbook-frames-updated'));
  return id;
}

export function importAllFrames(items) {
  let frames = [];
  try { frames = JSON.parse(localStorage.getItem(FLIPBOOK_KEY) || '[]'); } catch {}
  let nid = frames.length ? Math.max(...frames.map(f => f.id)) + 1 : 1;
  for (const item of items) {
    frames.push({ id: nid++, dataUrl: item.dataUrl, caption: item.prompt });
  }
  try {
    localStorage.setItem(FLIPBOOK_KEY, JSON.stringify(frames));
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      throw new Error('الذاكرة ممتلئة — احذف بعض الإطارات القديمة');
    }
    throw err;
  }
  window.dispatchEvent(new CustomEvent('flipbook-frames-updated'));
  return nid - 1;
}

export function loadPersistedGallery(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function persistGallery(storageKey, gallery) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(gallery));
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      throw new Error('الذاكرة ممتلئة — احذف بعض الصور');
    }
    throw err;
  }
}
