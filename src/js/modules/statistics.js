import { qs, qsa } from '../utils/dom.js';

export function initStatistics() {
  const target = qs('#updates');
  if (!target) return;

  const statsSection = document.createElement('section');
  statsSection.className = 'section alt-bg';
  statsSection.id = 'statistics';

  statsSection.innerHTML = `
    <div class="container">
      <div class="section-head">
        <h2 class="reveal"><i class="fas fa-chart-simple"></i> Platform Statistics</h2>
        <p class="reveal">Real-time metrics from the Rashid ecosystem.</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card reveal">
          <div class="stat-number" data-target="0">0</div>
          <div class="stat-label">Projects Deployed</div>
        </div>
        <div class="stat-card reveal">
          <div class="stat-number" data-target="0">0</div>
          <div class="stat-label">Vault Categories</div>
        </div>
        <div class="stat-card reveal">
          <div class="stat-number" data-target="0">0</div>
          <div class="stat-label">Tech Stacks</div>
        </div>
        <div class="stat-card reveal">
          <div class="stat-number" data-target="100">0</div>
          <div class="stat-label">% Uptime</div>
        </div>
      </div>
    </div>
  `;

  target.parentNode.insertBefore(statsSection, target.nextSibling);

  if (window.RashidRevealObserver) {
    statsSection.querySelectorAll('.reveal').forEach(el => {
      window.RashidRevealObserver.observe(el);
    });
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statsSection.querySelectorAll('.stat-number').forEach(el => {
    counterObserver.observe(el);
  });

  loadStats();
}

async function loadStats() {
  let projectsCount = 15;
  let vaultCount = 6;
  let techCount = 10;

  try {
    const client = window.supabaseClient;

    if (client) {
      const { count: pCount, error: pErr } = await client
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'Public');
      if (!pErr && pCount) projectsCount = pCount;
    }

    if (client) {
      const { count: vCount, error: vErr } = await client
        .from('vault_items')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'Public');
      if (!vErr && vCount) vaultCount = vCount;
    }
  } catch (err) {
    console.warn('Could not fetch real-time stats, using defaults:', err.message);
  }

  const el = qs('#statistics');
  if (!el) return;

  const numbers = el.querySelectorAll('.stat-number');
  if (numbers[0]) numbers[0].dataset.target = projectsCount;
  if (numbers[1]) numbers[1].dataset.target = vaultCount;
  if (numbers[2]) numbers[2].dataset.target = techCount;
}

function animateCounter(el, target) {
  let current = 0;
  const step = Math.max(1, Math.floor(target / 60));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current;
  }, 25);
}
