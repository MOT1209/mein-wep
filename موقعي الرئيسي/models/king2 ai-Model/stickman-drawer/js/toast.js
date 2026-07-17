// Non-blocking replacements for alert()/confirm(). Native dialogs freeze the
// whole page's JS thread until dismissed — bad UX (especially on mobile) and
// breaks anything driving the page programmatically. These build small DOM
// overlays instead and never block execution.

function ensureHost() {
  let host = document.getElementById('toastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  return host;
}

export function showToast(message, { duration = 3200 } = {}) {
  const host = ensureHost();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 220);
  }, duration);
}

// Non-blocking replacement for prompt(): small inline input, resolves with
// the typed text or null if cancelled/blurred empty.
export function showTextPrompt(x, y) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'text-prompt';
    wrap.style.left = `${x}px`;
    wrap.style.top = `${y}px`;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'اكتب النص…';

    let settled = false;
    function done(value) {
      if (settled) return;
      settled = true;
      wrap.remove();
      resolve(value);
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') done(input.value.trim() || null);
      if (e.key === 'Escape') done(null);
    });
    input.addEventListener('blur', () => done(input.value.trim() || null));

    wrap.appendChild(input);
    document.body.appendChild(wrap);
    input.focus();
  });
}

export function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    const box = document.createElement('div');
    box.className = 'confirm-box';
    const text = document.createElement('p');
    text.textContent = message;
    box.appendChild(text);

    const actions = document.createElement('div');
    actions.className = 'confirm-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'إلغاء';
    cancelBtn.addEventListener('click', () => { overlay.remove(); resolve(false); });

    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = 'danger';
    okBtn.textContent = 'تأكيد';
    okBtn.addEventListener('click', () => { overlay.remove(); resolve(true); });

    actions.appendChild(cancelBtn);
    actions.appendChild(okBtn);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
}
