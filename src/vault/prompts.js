const FALLBACK_PROMPTS = [
  { title: 'Code Review Assistant', content: 'Review the following code for bugs, performance issues, and best practices. Provide specific suggestions for improvement.' },
  { title: 'API Design Pattern', content: 'Design a RESTful API for {resource} with CRUD operations, pagination, filtering, sorting, and authentication.' },
  { title: 'Debug Mode', content: 'Analyze this error log and identify the root cause. Suggest a fix and explain why the error occurred.' },
  { title: 'Unit Test Generator', content: 'Generate comprehensive unit tests for the following function using {testing_framework}. Include edge cases.' },
  { title: 'Refactoring Expert', content: 'Refactor this code to improve readability, maintainability, and performance while preserving functionality.' },
  { title: 'Database Schema', content: 'Design a normalized database schema for {use_case} with proper indexes, constraints, and relationships.' },
];

export const initSection = async (cached) => {
  const { qs, qsa } = cached;
  const container = qs('#vault-prompts');
  if (!container) return;

  const showToast = (msg) => {
    const existing = qs('.toast-container');
    const toastRoot = existing || (() => {
      const el = document.createElement('div');
      el.className = 'toast-container';
      document.body.appendChild(el);
      return el;
    })();
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = msg;
    toastRoot.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2500);
  };

  const render = (prompts) => {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'vault-section-grid';
    prompts.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'vault-card';
      card.innerHTML = `
        <div class="vault-card-body">
          <h4>${escapeHtml(p.title)}</h4>
          <p>${escapeHtml(p.content)}</p>
          <button class="vault-copy-btn" data-copy="${escapeHtml(p.content)}">
            <i class="fas fa-copy"></i> Copy Prompt
          </button>
        </div>`;
      grid.appendChild(card);
    });
    container.appendChild(grid);
    qsa('.vault-copy-btn', container).forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.copy;
        try {
          await navigator.clipboard.writeText(text);
          btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy Prompt'; }, 2000);
        } catch {
          showToast('Could not copy – clipboard access denied');
        }
      });
    });
  };

  try {
    const { data, error } = await window.__supabase.fetchPublic('prompts', {
      order: { column: 'sort_order', ascending: true }
    });
    if (error || !data?.length) {
      render(FALLBACK_PROMPTS);
      return;
    }
    render(data);
  } catch {
    render(FALLBACK_PROMPTS);
  }
};

function escapeHtml(str) {
  return str.replace(/[&<>"']/g,
    (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[m]));
}
