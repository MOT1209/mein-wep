import { qs, qsa, on } from '../utils/dom.js?v=1.1';

export function initLatestUpdates() {
  const targetSection = qs('#vault');
  if (!targetSection) return;

  const updatesSection = document.createElement('section');
  updatesSection.className = 'section';
  updatesSection.id = 'updates';
  
  const updates = [
    { date: 'May 2026', title: 'AdSense Integration Complete', desc: 'All pages optimized with verification scripts, SEO tags, and policy pages for monetization approval.' },
    { date: 'Apr 2026', title: 'Vault System Revamp', desc: 'Knowledge vault expanded with API reference, documentation, and media archives.' },
    { date: 'Mar 2026', title: '3D Game Engine Update', desc: 'Rust Construction and Farm Empire games upgraded with improved physics and WebGL rendering.' },
    { date: 'Feb 2026', title: 'Rashid AI v3.0 Launch', desc: 'Multilingual AI assistant with voice synthesis, 3D avatar, and Gemini API integration.' }
  ];

  updatesSection.innerHTML = `
    <div class="container">
      <div class="section-head">
        <h2 class="reveal"><i class="fas fa-clock-rotate"></i> Latest Updates</h2>
        <p class="reveal">Recent milestones and improvements to the Rashid ecosystem.</p>
      </div>
      <div class="updates-grid">
        ${updates.map((u, i) => `
          <div class="update-card reveal" style="animation-delay: ${i * 0.1}s">
            <div class="update-date">${u.date}</div>
            <h3>${u.title}</h3>
            <p>${u.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  targetSection.parentNode.insertBefore(updatesSection, targetSection);

  if (window.RashidRevealObserver) {
    updatesSection.querySelectorAll('.reveal').forEach(el => {
      window.RashidRevealObserver.observe(el);
    });
  }
}
