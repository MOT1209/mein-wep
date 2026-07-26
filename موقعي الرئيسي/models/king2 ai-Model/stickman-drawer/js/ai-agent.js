import { showToast, showConfirm } from './toast.js';
import { blobToDataUrl, importSingleFrame as utilImportSingleFrame } from './utils.js';
import { generateImage } from './ai-generator.js';

const STORAGE_KEY = 'stickman-agent-state';

const AGENT_TEXT_MODELS = [
  'HuggingFaceH4/zephyr-7b-beta',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'google/gemma-2-2b-it',
];

const IDEA_CATEGORIES = [
  'stick figure poses and actions',
  'stick figure emotions and expressions',
  'stick figure sports and activities',
  'stick figure daily life scenes',
  'stick figure adventures and fantasy',
  'stick figure comedy and funny situations',
  'stick figure animals and creatures',
  'stick figure vehicles and transportation',
];

function getApiKey() {
  return document.getElementById('agentApiKey')?.value || document.getElementById('apiKey')?.value || '';
}

function getProvider() {
  return document.getElementById('agentProvider')?.value || 'huggingface';
}

// ===================== Text Generation (Idea Brain) =====================

async function generateText(prompt, signal, progressEl) {
  const provider = getProvider();

  if (provider === 'huggingface') {
    return generateTextHuggingFace(prompt, signal, progressEl);
  }

  if (provider === 'openai') {
    return generateTextOpenAI(prompt, signal, progressEl);
  }

  if (provider === 'gemini') {
    return generateTextGemini(prompt, signal, progressEl);
  }

  if (provider === 'openrouter') {
    return generateTextOpenRouter(prompt, signal, progressEl);
  }

  if (provider === 'custom') {
    return generateTextCustom(prompt, signal, progressEl);
  }

  throw new Error('provider غير معروف للنصوص');
}

async function generateTextHuggingFace(prompt, signal, progressEl, _retries = 0) {
  for (const model of AGENT_TEXT_MODELS) {
    try {
      if (progressEl) progressEl.textContent = `🧠 جاري التفكير بـ ${model.split('/').pop()}...`;

      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getApiKey() ? { 'Authorization': `Bearer ${getApiKey()}` } : {}),
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 300, temperature: 0.9, return_full_text: false },
        }),
        signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 503 && _retries < 3) {
          const wait = Math.min(err.estimated_time || 30, 60);
          if (progressEl) progressEl.textContent = `الموديل يتحمل... انتظر ${Math.ceil(wait)} ثانية`;
          await new Promise(r => setTimeout(r, wait * 1000));
          return generateTextHuggingFace(prompt, signal, progressEl, _retries + 1);
        }
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = Array.isArray(data) ? (data[0]?.generated_text || '') : (data.generated_text || '');
      return text.trim();
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      continue;
    }
  }
  throw new Error('فشل توليد النص — جرّب موديل ثاني');
}

async function generateTextOpenAI(prompt, signal, progressEl) {
  const key = getApiKey();
  if (!key) throw new Error('ضع OpenAI API Key أولاً');

  if (progressEl) progressEl.textContent = '🧠 جاري التفكير بـ GPT...';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.9,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function generateTextGemini(prompt, signal, progressEl) {
  const key = getApiKey();
  if (!key) throw new Error('ضع Gemini API Key أولاً — مجانٍ من ai.google.dev');

  if (progressEl) progressEl.textContent = '🧠 جاري التفكير بـ Gemini...';

  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 800,
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
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

async function generateTextOpenRouter(prompt, signal, progressEl) {
  const key = getApiKey();
  if (!key) throw new Error('ضع OpenRouter API Key أولاً — من openrouter.ai/keys');

  if (progressEl) progressEl.textContent = '🧠 جاري التفكير بـ OpenRouter...';

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': window.location.href,
      'X-Title': 'Stickman Drawer Agent',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.9,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function generateTextCustom(prompt, signal, progressEl) {
  const key = getApiKey();
  const apiUrl = document.getElementById('agentCustomApiUrl')?.value || document.getElementById('customApiUrl')?.value;
  const model = document.getElementById('agentCustomModel')?.value || document.getElementById('customModel')?.value || 'default';
  if (!apiUrl) throw new Error('ضع رابط الـ API أولاً');
  try {
    const u = new URL(apiUrl);
    if (u.protocol !== 'https:') throw new Error('يجب أن يبدأ الرابط بـ https://');
  } catch (e) {
    if (e.message.includes('https')) throw e;
    throw new Error('رابط غير صالح');
  }

  if (progressEl) progressEl.textContent = `🧠 جاري التفكير بـ ${model}...`;

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'Authorization': `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.9,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Custom API HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ===================== Idea Generation =====================

async function generateIdeas(count, theme, signal, progressEl) {
  const systemPrompt = `You are a creative director for a stick figure animation studio.
Generate exactly ${count} unique stick figure image prompts.
Each prompt must be a single line describing a stick figure doing something specific.
Style: "simple black and white stick figure line drawing, minimal, clean lines, white background"
Theme focus: ${theme || 'random creative ideas'}
Be creative, fun, and diverse. Include actions, emotions, poses, objects.
NO numbering, NO quotes, NO extra text. Just one prompt per line.
Example: a stickman riding a skateboard doing a kickflip, simple black line drawing, white background`;

  const text = await generateText(systemPrompt, signal, progressEl);
  const lines = text.split('\n').map(l => l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').trim()).filter(l => l.length > 10);
  return lines.slice(0, count);
}

// ===================== Image Generation =====================

async function generateImageBlob(prompt, size, signal, progressEl) {
  return generateImage(prompt, size, signal, progressEl);
}

// ===================== Gallery Helpers =====================

async function addToGallery(blob, prompt) {
  const dataUrl = await blobToDataUrl(blob);
  return { id: Date.now() + '_' + Math.random().toString(36).slice(2, 6), dataUrl, prompt, timestamp: new Date().toISOString() };
}

function importSingleFrame(item) {
  try {
    utilImportSingleFrame(item);
  } catch (e) { showToast(e.message); }
}

// ===================== Agent Log =====================

function appendLog(container, type, text, imageUrl) {
  const entry = document.createElement('div');
  entry.className = `agent-log-entry agent-${type}`;

  if (type === 'thinking' || type === 'idea' || type === 'error' || type === 'done') {
    const icon = document.createElement('span');
    icon.className = 'agent-log-icon';
    icon.textContent = type === 'thinking' ? '🧠' : type === 'idea' ? '💡' : type === 'error' ? '❌' : '✅';
    entry.appendChild(icon);
  }

  const msg = document.createElement('span');
  msg.textContent = text;
  entry.appendChild(msg);

  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'agent-log-img';
    img.alt = text;
    entry.appendChild(img);
  }

  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

// ===================== Main Agent Loop =====================

let agentAbort = null;

async function runAgent(count, theme, size, autoImport) {
  const logContainer = document.getElementById('agentLog');
  const startBtn = document.getElementById('agentStartBtn');
  const stopBtn = document.getElementById('agentStopBtn');
  const progressBar = document.getElementById('agentProgressBar');
  const progressFill = document.getElementById('agentProgressFill');
  const progressText = document.getElementById('agentProgressText');

  logContainer.replaceChildren();
  startBtn.style.display = 'none';
  stopBtn.style.display = '';
  progressBar.style.display = '';

  agentAbort = new AbortController();
  const signal = agentAbort.signal;

  // M2: Save snapshot before batch agent generation
  window.dispatchEvent(new CustomEvent('flipbook-batch-start', { detail: { label: 'صور الوكيل الذكي' } }));

  let generated = 0;
  const galleryItems = [];

  try {
    appendLog(logContainer, 'thinking', `أبدأ بـ ${count} فكرة — الثيم: ${theme || 'عشوائي'}`);

    let ideas = [];
    try {
      ideas = await generateIdeas(count, theme, signal, progressText);
    } catch (err) {
      if (signal.aborted) return;
      appendLog(logContainer, 'error', `فشل توليد الأفكار: ${err.message}`);
      appendLog(logContainer, 'thinking', 'سأستخدم أفكاراً محفوظة...');
      ideas = [
        'a stickman riding a bicycle on a tightrope, simple black line drawing, white background',
        'a stickman juggling three balls while balancing on one foot, simple black line drawing, white background',
        'a stickman dancing in the rain with an umbrella, simple black line drawing, white background',
        'a stickman playing basketball and dunking, simple black line drawing, white background',
        'a stickman doing a magic trick with a rabbit, simple black line drawing, white background',
        'a stickman skydiving with a parachute, simple black line drawing, white background',
        'a stickman cooking in the kitchen with a chef hat, simple black line drawing, white background',
        'a stickman riding a skateboard doing a kickflip, simple black line drawing, white background',
      ].slice(0, count);
    }

    for (const idea of ideas) {
      if (signal.aborted) break;

      appendLog(logContainer, 'idea', idea);
      progressFill.style.width = `${(generated / count) * 100}%`;
      progressText.textContent = `صورة ${generated + 1} من ${count}`;

      try {
        const blob = await generateImageBlob(idea, size, signal, progressText);
        const item = await addToGallery(blob, idea);
        galleryItems.push(item);

        if (autoImport) importSingleFrame(item);

        appendLog(logContainer, 'done', `تم توليد الصورة ${generated + 1}`, item.dataUrl);
        generated++;
        progressFill.style.width = `${(generated / count) * 100}%`;
      } catch (err) {
        if (signal.aborted) break;
        appendLog(logContainer, 'error', `فشل الصورة: ${err.message}`);
      }
    }

    if (!signal.aborted) {
      const msg = `✅ انتهيت! تم توليد ${generated} صورة${autoImport ? ' واستيرادها للفليبوك' : ''}`;
      appendLog(logContainer, 'done', msg);
      progressText.textContent = msg;
      showToast(msg);
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      appendLog(logContainer, 'error', `خطأ: ${err.message}`);
    }
  } finally {
    startBtn.style.display = '';
    stopBtn.style.display = 'none';
    if (signal.aborted) {
      progressText.textContent = 'تم الإيقاف';
      appendLog(logContainer, 'thinking', '⏹️ تم إيقاف الوكيل');
    }
  }
}

// ===================== Init =====================

export function initAIAgent() {
  const startBtn = document.getElementById('agentStartBtn');
  const stopBtn = document.getElementById('agentStopBtn');
  const countSlider = document.getElementById('agentCount');
  const countLabel = document.getElementById('agentCountLabel');
  const themeInput = document.getElementById('agentTheme');
  const autoImportCheck = document.getElementById('agentAutoImport');
  const imageSize = document.getElementById('imageSize');

  if (!startBtn) return;

  countSlider?.addEventListener('input', () => { countLabel.textContent = countSlider.value; });

  startBtn.addEventListener('click', async () => {
    const count = Number(countSlider.value);
    const theme = themeInput.value.trim();
    const size = imageSize?.value || '768x768';
    const autoImport = autoImportCheck?.checked ?? true;
    await runAgent(count, theme, size, autoImport);
  });

  stopBtn?.addEventListener('click', () => { if (agentAbort) agentAbort.abort(); });
}
