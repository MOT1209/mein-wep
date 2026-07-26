import { showToast, showConfirm } from './toast.js';
import { blobToDataUrl, importSingleFrame as utilImportSingleFrame, importAllFrames as utilImportAllFrames } from './utils.js';

const STORAGE_KEY = 'stickman-generated-gallery';
const API_KEY_STORAGE = 'stickman-ai-api-key';

const ENHANCED_PREFIX = 'simple black and white stick figure line drawing, minimal, clean lines, white background, ';

const SEQUENCE_PATTERNS = {
  walk: (base, i, total) => `${base} walking frame ${i + 1} of ${total}, walk cycle animation, side view`,
  run: (base, i, total) => `${base} running fast frame ${i + 1} of ${total}, run cycle, motion lines, side view`,
  jump: (base, i, total) => {
    const phases = ['preparing to jump', 'jumping up', 'at the peak', 'falling down', 'landing', 'standing up'];
    return `${base} ${phases[i % phases.length]} frame ${i + 1}`;
  },
  wave: (base, i, total) => `${base} waving hand frame ${i + 1} of ${total}, waving animation cycle`,
  dance: (base, i, total) => `${base} dancing frame ${i + 1} of ${total}, dance move, energetic`,
  custom: (base, i, total) => `${base} frame ${i + 1} of ${total}`,
};

function getApiKey() {
  return document.getElementById('apiKey')?.value || '';
}

// ===================== API Providers =====================

async function generateHuggingFace(prompt, size, signal, progressEl, _retries = 0) {
  const [w, h] = size.split('x').map(Number);
  const models = [
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
    'runwayml/stable-diffusion-v1-5',
  ];

  let lastError;
  for (const model of models) {
    try {
      if (progressEl) progressEl.textContent = `جاري التوليد بـ ${model.split('/').pop()}...`;

      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getApiKey() ? { 'Authorization': `Bearer ${getApiKey()}` } : {}),
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { width: w, height: h },
        }),
        signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 503 && _retries < 3) {
          const wait = Math.min(err.estimated_time || 30, 60);
          if (progressEl) progressEl.textContent = `الموديل يتحمل... انتظر ${Math.ceil(wait)} ثانية`;
          await new Promise(r => setTimeout(r, wait * 1000));
          return generateHuggingFace(prompt, size, signal, progressEl, _retries + 1);
        }
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) throw new Error('الرد ليس صورة — جرّب موديل ثاني');
      return blob;
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') throw err;
      continue;
    }
  }
  throw lastError || new Error('فشل التوليد — جرّب موديل ثاني أو تحقق من الاتصال');
}

async function generateOpenAI(prompt, size, signal, progressEl) {
  const key = getApiKey();
  if (!key) throw new Error('ضع OpenAI API Key أولاً في الإعدادات');

  if (progressEl) progressEl.textContent = 'جاري التوليد بـ DALL-E 3...';

  const sizeMap = { '512x512': '1024x1024', '768x768': '1024x1024', '1024x1024': '1024x1024' };
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: sizeMap[size] || '1024x1024',
      response_format: 'b64_json',
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI HTTP ${res.status}`);
  }

  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: 'image/png' });
}

async function generateStability(prompt, size, signal, progressEl) {
  const key = getApiKey();
  if (!key) throw new Error('ضع Stability AI API Key أولاً في الإعدادات');

  if (progressEl) progressEl.textContent = 'جاري التوليد بـ Stability AI...';

  const [w, h] = size.split('x').map(Number);
  const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Accept': 'image/*',
    },
    body: (() => {
      const fd = new FormData();
      fd.append('prompt', prompt);
      fd.append('output_format', 'png');
      fd.append('aspect_ratio', '1:1');
      return fd;
    })(),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Stability HTTP ${res.status}`);
  }

  return await res.blob();
}

async function generateGemini(prompt, size, signal, progressEl) {
  const key = getApiKey();
  if (!key) throw new Error('ضع Gemini API Key أولاً — مجانٍ من ai.google.dev');

  if (progressEl) progressEl.textContent = '🎨 جاري التوليد بـ Gemini...';

  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
        generationConfig: {
          responseModalities: ['image', 'text'],
        },
      }),
      signal,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini HTTP ${res.status}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      const bin = atob(part.inlineData.data);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return new Blob([arr], { type: part.inlineData.mimeType || 'image/png' });
    }
  }
  throw new Error('Gemini لم يُرجع صورة');
}

async function generateOpenRouter(prompt, size, signal, progressEl) {
  const key = getApiKey();
  if (!key) throw new Error('ضع OpenRouter API Key أولاً — من openrouter.ai/keys');

  if (progressEl) progressEl.textContent = '🎨 جاري التوليد بـ OpenRouter...';

  const res = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': window.location.href,
      'X-Title': 'Stickman Drawer',
    },
    body: JSON.stringify({
      prompt,
      model: 'black-forest-labs/flux.1-schnell',
      response_format: 'b64_json',
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter HTTP ${res.status}`);
  }

  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: 'image/png' });
}

async function generateCustom(prompt, size, signal, progressEl) {
  const key = getApiKey();
  const apiUrl = document.getElementById('customApiUrl')?.value;
  const model = document.getElementById('customModel')?.value || 'default';
  if (!apiUrl) throw new Error('ضع رابط الـ API أولاً في الإعدادات');
  try {
    const u = new URL(apiUrl);
    if (u.protocol !== 'https:') throw new Error('يجب أن يبدأ الرابط بـ https://');
  } catch (e) {
    if (e.message.includes('https')) throw e;
    throw new Error('رابط غير صالح');
  }

  if (progressEl) progressEl.textContent = `🎨 جاري التوليد بـ ${model}...`;

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'Authorization': `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: size,
      response_format: 'b64_json',
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Custom API HTTP ${res.status}`);
  }

  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('الرد لا يحتوي على صورة b64_json');
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: 'image/png' });
}

export async function generateImage(prompt, size, signal, progressEl) {
  const provider = document.getElementById('apiProvider').value;
  if (provider === 'huggingface') return generateHuggingFace(prompt, size, signal, progressEl);
  if (provider === 'openai') return generateOpenAI(prompt, size, signal, progressEl);
  if (provider === 'stability') return generateStability(prompt, size, signal, progressEl);
  if (provider === 'gemini') return generateGemini(prompt, size, signal, progressEl);
  if (provider === 'openrouter') return generateOpenRouter(prompt, size, signal, progressEl);
  if (provider === 'custom') return generateCustom(prompt, size, signal, progressEl);
  throw new Error('provider غير معروف');
}

// ===================== Gallery =====================

async function addToGallery(blob, prompt) {
  const dataUrl = await blobToDataUrl(blob);
  const item = {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    dataUrl,
    prompt,
    timestamp: new Date().toISOString(),
  };
  gallery.push(item);
  persistGallery();
  renderGallery();
  return item;
}

let gallery = [];
let abortController = null;

function persistGallery() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      showToast('الذاكرة ممتلئة — احذف بعض الصور من المعرض');
    }
  }
}

function loadGallery() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) gallery = JSON.parse(raw);
  } catch {}
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  const countEl = document.getElementById('genCount');
  const emptyEl = document.getElementById('galleryEmpty');
  if (!grid) return;

  grid.replaceChildren();
  countEl.textContent = String(gallery.length);
  emptyEl.style.display = gallery.length === 0 ? 'block' : 'none';

  gallery.forEach((item) => {
    const cell = document.createElement('div');
    cell.className = 'frame-cell';
    cell.style.width = '140px';

    const img = document.createElement('img');
    img.src = item.dataUrl;
    img.alt = item.prompt;
    img.title = item.prompt;
    img.onerror = () => { img.style.display = 'none'; };
    cell.appendChild(img);

    const label = document.createElement('span');
    label.className = 'frame-label';
    label.textContent = item.prompt.slice(0, 30) + (item.prompt.length > 30 ? '…' : '');
    cell.appendChild(label);

    const actions = document.createElement('div');
    actions.className = 'frame-actions';

    const importBtn = document.createElement('button');
    importBtn.type = 'button';
    importBtn.textContent = '📥';
    importBtn.title = 'استيراد للفليبوك';
    importBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      try {
        utilImportSingleFrame(item);
        showToast(`تم استيراد الإطار للفليبوك 🎉`);
      } catch (e) { showToast(e.message); }
    });
    actions.appendChild(importBtn);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'del';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      gallery = gallery.filter(g => g.id !== item.id);
      persistGallery();
      renderGallery();
    });
    actions.appendChild(delBtn);

    cell.appendChild(actions);
    grid.appendChild(cell);
  });
}

// ===================== Generation Flow =====================

async function generateFromPrompt(prompt, size, count) {
  const generateBtn = document.getElementById('generateBtn');
  const stopBtn = document.getElementById('stopBtn');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  abortController = new AbortController();
  const signal = abortController.signal;

  generateBtn.style.display = 'none';
  stopBtn.style.display = '';
  progressBar.style.display = '';
  let done = 0;

  try {
    for (let i = 0; i < count; i++) {
      if (signal.aborted) break;
      progressFill.style.width = `${(done / count) * 100}%`;
      progressText.textContent = `جاري توليد الصورة ${done + 1} من ${count}...`;

      const blob = await generateImage(prompt, size, signal, progressText);
      await addToGallery(blob, prompt);
      done++;
      progressFill.style.width = `${(done / count) * 100}%`;
    }

    if (!signal.aborted) {
      progressText.textContent = `تم توليد ${done} صورة بنجاح! 🎉`;
      showToast(`تم توليد ${done} صورة`);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      progressText.textContent = 'تم الإيقاف';
    } else {
      progressText.textContent = 'فشل: ' + err.message;
      showToast('خطأ: ' + err.message);
    }
  } finally {
    generateBtn.style.display = '';
    stopBtn.style.display = 'none';
    setTimeout(() => { progressBar.style.display = 'none'; }, 3000);
  }
}

// ===================== Init =====================

export function initAIGenerator() {
  const apiProvider = document.getElementById('apiProvider');
  const apiKeyInput = document.getElementById('apiKey');
  const saveApiKeyCheck = document.getElementById('saveApiKey');
  const customApiRow = document.getElementById('customApiRow');
  const promptInput = document.getElementById('promptInput');
  const batchCount = document.getElementById('batchCount');
  const batchLabel = document.getElementById('batchLabel');
  const enhancePrompt = document.getElementById('enhancePrompt');
  const imageSize = document.getElementById('imageSize');
  const generateBtn = document.getElementById('generateBtn');
  const stopBtn = document.getElementById('stopBtn');
  const importAllBtn = document.getElementById('importAllBtn');
  const downloadAllGenBtn = document.getElementById('downloadAllGenBtn');
  const clearGalleryBtn = document.getElementById('clearGalleryBtn');
  const sequenceBase = document.getElementById('sequenceBase');
  const sequenceCount = document.getElementById('sequenceCount');
  const sequenceLabel = document.getElementById('sequenceLabel');
  const sequenceType = document.getElementById('sequenceType');
  const sequenceCustomSuffix = document.getElementById('sequenceCustomSuffix');
  const generateSequenceBtn = document.getElementById('generateSequenceBtn');

  if (!generateBtn) return;

  // Load saved API key (sessionStorage for security — cleared on tab close)
  try {
    const saved = sessionStorage.getItem(API_KEY_STORAGE);
    if (saved && apiKeyInput) apiKeyInput.value = saved;
  } catch {}

  // Save API key on change
  apiKeyInput?.addEventListener('change', () => {
    if (saveApiKeyCheck?.checked) {
      try { sessionStorage.setItem(API_KEY_STORAGE, apiKeyInput.value); } catch {}
    }
  });

  apiProvider?.addEventListener('change', () => {
    customApiRow.style.display = apiProvider.value === 'custom' ? '' : 'none';
    if (apiProvider.value === 'huggingface') {
      apiKeyInput.placeholder = 'API Key (اختياري — يسرّع التوليد)';
    } else if (apiProvider.value === 'openai') {
      apiKeyInput.placeholder = 'OpenAI API Key (مطلوب)';
    } else if (apiProvider.value === 'stability') {
      apiKeyInput.placeholder = 'Stability AI API Key (مطلوب)';
    } else if (apiProvider.value === 'gemini') {
      apiKeyInput.placeholder = 'Gemini API Key (مجاني — ai.google.dev)';
    } else if (apiProvider.value === 'openrouter') {
      apiKeyInput.placeholder = 'OpenRouter API Key (من openrouter.ai)';
    } else if (apiProvider.value === 'custom') {
      apiKeyInput.placeholder = 'API Key (إن وجد)';
    }
  });

  batchCount?.addEventListener('input', () => { batchLabel.textContent = batchCount.value; });
  sequenceCount?.addEventListener('input', () => { sequenceLabel.textContent = sequenceCount.value; });
  sequenceType?.addEventListener('change', () => {
    sequenceCustomSuffix.style.display = sequenceType.value === 'custom' ? '' : 'none';
  });

  document.querySelectorAll('.quick-prompt').forEach(btn => {
    btn.addEventListener('click', () => { promptInput.value = btn.dataset.prompt; });
  });

  generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) { showToast('اكتب وصفاً للصورة أولاً'); return; }
    const finalPrompt = enhancePrompt?.checked ? ENHANCED_PREFIX + prompt : prompt;
    await generateFromPrompt(finalPrompt, imageSize.value, Number(batchCount.value));
  });

  stopBtn?.addEventListener('click', () => { if (abortController) abortController.abort(); });

  generateSequenceBtn?.addEventListener('click', async () => {
    const base = sequenceBase.value.trim();
    if (!base) { showToast('اكتب الوصف الأساسي أولاً'); return; }

    const count = Number(sequenceCount.value);
    const type = sequenceType.value;
    const size = imageSize.value;
    const patternFn = SEQUENCE_PATTERNS[type];
    const prompts = [];
    for (let i = 0; i < count; i++) {
      const suffix = type === 'custom' ? ` ${sequenceCustomSuffix.value}` : '';
      prompts.push(ENHANCED_PREFIX + patternFn(base, i, count) + suffix);
    }

    abortController = new AbortController();
    const signal = abortController.signal;
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    generateBtn.style.display = 'none';
    stopBtn.style.display = '';
    progressBar.style.display = '';
    let done = 0;

    try {
      for (const prompt of prompts) {
        if (signal.aborted) break;
        progressFill.style.width = `${(done / count) * 100}%`;
        progressText.textContent = `إطار ${done + 1} من ${count}...`;
        const blob = await generateImage(prompt, size, signal, progressText);
        await addToGallery(blob, prompt);
        done++;
      }
      if (!signal.aborted) {
        progressText.textContent = `تم توليد سلسلة ${done} إطارات! 🎬`;
        showToast(`تم توليد ${done} إطارات — استوردها للفليبوك`);
      }
    } catch (err) {
      progressText.textContent = err.name === 'AbortError' ? 'تم الإيقاف' : 'فشل: ' + err.message;
      showToast('خطأ: ' + err.message);
    } finally {
      generateBtn.style.display = '';
      stopBtn.style.display = 'none';
      setTimeout(() => { progressBar.style.display = 'none'; }, 3000);
    }
  });

  importAllBtn?.addEventListener('click', async () => {
    if (!gallery.length) { showToast('ما فيه صور للاستيراد'); return; }
    if (!(await showConfirm(`استيراد ${gallery.length} صورة للفليبوك؟`))) return;
    try {
      utilImportAllFrames(gallery);
      showToast(`تم استيراد ${gallery.length} صورة للفليبوك 🎉`);
    } catch (e) { showToast(e.message); }
  });

  downloadAllGenBtn?.addEventListener('click', async () => {
    if (!gallery.length) { showToast('ما فيه صور للتنزيل'); return; }
    for (let i = 0; i < gallery.length; i++) {
      const a = document.createElement('a');
      a.href = gallery[i].dataUrl;
      a.download = `stickman_ai_${String(i).padStart(3, '0')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      await new Promise(r => setTimeout(r, 150));
    }
    showToast(`تم تنزيل ${gallery.length} صورة`);
  });

  clearGalleryBtn?.addEventListener('click', async () => {
    if (!gallery.length) return;
    if (!(await showConfirm('مسح كل الصور المتولّدة؟'))) return;
    gallery = [];
    persistGallery();
    renderGallery();
    showToast('تم مسح المعرض');
  });

  loadGallery();
}
