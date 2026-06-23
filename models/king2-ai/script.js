(function () {
  const API_URL = 'https://rashid778-king2-qwen2-5-3b.hf.space/v1/chat/completions';
  const MODEL = 'king2-qwen2.5-3b';

  const chatMessages = document.getElementById('chatMessages');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const statusText = document.querySelector('.status-text');
  const statusDot = document.querySelector('.status-dot');
  const suggestionChips = document.getElementById('suggestionChips');

  let isGenerating = false;

  // ── Status ─────────────────────────────────────

  function setStatus(text, type) {
    statusText.textContent = text;
    statusDot.className = 'status-dot';
    if (type) statusDot.classList.add(type);
  }

  setStatus('جاهز', '');

  // ── Auto-resize textarea ───────────────────────

  userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  // ── Send message ───────────────────────────────

  userInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  // ── Suggestion chips ───────────────────────────

  suggestionChips.addEventListener('click', function (e) {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    userInput.value = chip.dataset.prompt;
    sendMessage();
  });

  // ── Core send function ─────────────────────────

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text || isGenerating) return;

    userInput.value = '';
    userInput.style.height = 'auto';
    hideWelcome();
    addMessage(text, 'user');
    showTyping();
    isGenerating = true;
    sendBtn.disabled = true;
    setStatus('جارٍ الكتابة...', 'loading');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: text }],
          max_tokens: 2048,
          temperature: 0.7,
          top_p: 0.9,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${errData}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'عذراً، لم أستطع فهم سؤالك. حاول مرة أخرى.';
      removeTyping();
      addMessage(reply, 'assistant');
      setStatus('جاهز', '');
    } catch (err) {
      removeTyping();
      const errorMsg = err.name === 'AbortError'
        ? 'عذراً، استغرق الرد وقتاً طويلاً. الموديل على CPU وقد يكون بطيئاً. حاول مرة أخرى.'
        : `عذراً، حدث خطأ في الاتصال: ${err.message}`;
      addMessage(errorMsg, 'error');
      setStatus('خطأ في الاتصال', 'error');
    } finally {
      isGenerating = false;
      sendBtn.disabled = false;
      userInput.focus();
    }
  }

  // ── Helper functions ───────────────────────────

  function hideWelcome() {
    const welcome = chatMessages.querySelector('.welcome-message');
    if (welcome) welcome.style.display = 'none';
  }

  function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '👤' : '👑';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;

    div.appendChild(avatar);
    div.appendChild(content);
    chatMessages.appendChild(div);
    scrollToBottom();
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '👑';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

    div.appendChild(avatar);
    div.appendChild(content);
    chatMessages.appendChild(div);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }
})();
