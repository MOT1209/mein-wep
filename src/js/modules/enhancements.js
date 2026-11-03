import { qs, qsa, on, escapeHTML } from '../utils/dom.js?v=1.1';
import { getSupabaseClient } from '../services/supabase.js?v=1.5';

// ----------------------------------------------------
// 1. Toast Notifications Utility
// ----------------------------------------------------
export class Toast {
    static init() {
        if (!qs('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    static show(message, type = 'info', duration = 3500) {
        this.init();
        const container = qs('.toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="toast-content" style="flex-grow: 1;">
                <p style="margin: 0; font-weight: 500; font-size: 0.9rem;">${escapeHTML(message)}</p>
            </div>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);
        
        // Trigger show animation
        setTimeout(() => toast.classList.add('show'), 50);

        // Hide and remove toast
        setTimeout(() => {
            toast.classList.add('hide');
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);
    }
}

// ----------------------------------------------------
// 2. Typewriter Effect
// ----------------------------------------------------
export function initTypewriter() {
    const heroTitle = qs('#hero h1');
    if (!heroTitle) return;

    // Create typewriter container inside heading
    const textSpan = document.createElement('span');
    textSpan.className = 'typewriter-wrapper';
    const typewriterText = document.createElement('span');
    typewriterText.className = 'typewriter-text';
    textSpan.appendChild(typewriterText);

    // Replace the specific text gradient part or append it
    const textGradient = qs('#hero h1 .text-gradient');
    if (textGradient) {
        textGradient.textContent = '';
        textGradient.appendChild(textSpan);
    } else {
        heroTitle.appendChild(textSpan);
    }

    const words = ['AI Workspace', 'Game Studio', 'Creative Hub', 'Tech Vault', 'Rashid OS'];
    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    const targetElement = qs('.typewriter-text');
    if (!targetElement) return;

    function type() {
        const currentWord = words[wordIdx];
        if (isDeleting) {
            targetElement.textContent = currentWord.substring(0, charIdx - 1);
            charIdx--;
        } else {
            targetElement.textContent = currentWord.substring(0, charIdx + 1);
            charIdx++;
        }

        let speed = isDeleting ? 40 : 80;

        if (!isDeleting && charIdx === currentWord.length) {
            speed = 2000; // Wait at full word
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            speed = 300; // Pause before typing next word
        }

        setTimeout(type, speed);
    }

    type();
}

// ----------------------------------------------------
// 3. Tech Stack Marquee Section
// ----------------------------------------------------
export function initTechStackMarquee() {
    const targetSection = qs('#models');
    if (!targetSection) return;

    // Create a new tech stack section and insert it BEFORE the models section
    const techSection = document.createElement('section');
    techSection.className = 'tech-stack-section';
    
    const techItems = [
        { name: 'JavaScript', icon: 'fab fa-js' },
        { name: 'Rust WASM', icon: 'fab fa-rust' },
        { name: 'Three.js', icon: 'fas fa-cube' },
        { name: 'Supabase', icon: 'fas fa-database' },
        { name: 'Gemini AI', icon: 'fas fa-brain' },
        { name: 'PWA WebApps', icon: 'fas fa-mobile-alt' },
        { name: 'HTML5/CSS3', icon: 'fab fa-css3-alt' },
        { name: 'Vite/Node', icon: 'fab fa-node-js' },
        { name: 'Git/GitHub', icon: 'fab fa-github' },
        { name: 'WebSockets', icon: 'fas fa-network-wired' }
    ];

    // Double the array to make the marquee smooth and seamless
    const marqueeList = [...techItems, ...techItems, ...techItems];

    const container = document.createElement('div');
    container.className = 'container';
    
    const track = document.createElement('div');
    track.className = 'marquee-track';

    track.textContent = '';
    marqueeList.forEach(tech => {
        const item = document.createElement('div');
        item.className = 'tech-item';
        const icon = document.createElement('i');
        icon.className = tech.icon;
        item.appendChild(icon);
        const span = document.createElement('span');
        span.textContent = tech.name;
        item.appendChild(span);
        track.appendChild(item);
    });

    container.appendChild(track);
    techSection.appendChild(container);
    
    // Insert before models
    targetSection.parentNode.insertBefore(techSection, targetSection);
}

// ----------------------------------------------------
// 4. Live Stats Counter
// ----------------------------------------------------
export async function initLiveStats() {
    const statsGrid = qs('.hero-stats');
    if (!statsGrid) return;

    // Add a live visitor count stat
    const liveStatItem = document.createElement('div');
    liveStatItem.className = 'stat live-stat';
    liveStatItem.textContent = '';
    const statNum = document.createElement('span');
    statNum.className = 'stat-num counting';
    statNum.id = 'live-visitors';
    statNum.textContent = '1';
    liveStatItem.appendChild(statNum);
    const statLabel = document.createElement('span');
    statLabel.className = 'stat-label';
    const liveDot = document.createElement('span');
    liveDot.className = 'live-dot';
    statLabel.appendChild(liveDot);
    statLabel.appendChild(document.createTextNode('Visitors'));
    liveStatItem.appendChild(statLabel);
    statsGrid.appendChild(liveStatItem);

    // Dynamic number counting animation
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.textContent = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.textContent = end;
            }
        };
        window.requestAnimationFrame(step);
    }

    // Try reading Supabase visitor stats
    let totalVisits = 1420; // Default nice mock number
    try {
        const client = getSupabaseClient();
        if (client) {
            const { data } = await client.from('site_stats').select('visitor_count').eq('id', 1).single();
            if (data && data.visitor_count) {
                totalVisits = data.visitor_count;
            }
        }
    } catch (e) {
        console.warn('Could not read real-time visitor counts, fallback enabled.', e);
    }

    // Animate stats
    const visitorObj = qs('#live-visitors');
    if (visitorObj) {
        animateValue(visitorObj, 1, totalVisits, 2500);
    }

    // Animate system count stat as well
    const stats = qsa('.stat-num');
    stats.forEach(stat => {
        if (stat.id === 'live-visitors') return;
        const targetVal = parseInt(stat.textContent, 10);
        if (!isNaN(targetVal)) {
            animateValue(stat, 0, targetVal, 2000);
        }
    });

    // Simulate realtime hits every 10-20 seconds
    setInterval(() => {
        if (visitorObj) {
            const current = parseInt(visitorObj.textContent, 10);
            if (!isNaN(current)) {
                visitorObj.textContent = current + Math.floor(Math.random() * 2) + 1;
                // Subtle scale bounce
                visitorObj.style.transform = 'scale(1.2)';
                visitorObj.style.color = '#38bdf8';
                setTimeout(() => {
                    visitorObj.style.transform = 'scale(1)';
                    visitorObj.style.color = '';
                }, 300);
            }
        }
    }, 15000);
}

// ----------------------------------------------------
// 7. PWA Custom Install Button
// ----------------------------------------------------
export function initCustomPwaInstall() {
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        return; // Already installed as PWA
    }

    // Add custom install button to navbar nav-controls
    const navControls = qs('.nav-controls');
    if (!navControls) return;

    const installBtn = document.createElement('button');
    installBtn.className = 'pwa-install-btn';
    installBtn.innerHTML = '<i class="fas fa-download"></i> <span>Install App</span>';
    
    // Insert before the hamburger button
    const hamburger = qs('.hamburger');
    if (hamburger) {
        navControls.insertBefore(installBtn, hamburger);
    } else {
        navControls.appendChild(installBtn);
    }

    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default mini-infobar from showing on mobile
        e.preventDefault();
        deferredPrompt = e;
        // Show our install button
        installBtn.classList.add('visible');
        Toast.show('Rashid Workspace is ready for offline install!', 'success');
    });

    on(installBtn, 'click', async () => {
        if (!deferredPrompt) return;
        
        installBtn.classList.remove('visible');
        deferredPrompt.prompt();
        
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            Toast.show('Installation started! Thank you.', 'success');
        } else {
            Toast.show('Installation cancelled.', 'warning');
        }
        deferredPrompt = null;
    });

    window.addEventListener('appinstalled', () => {
        installBtn.classList.remove('visible');
        deferredPrompt = null;
        Toast.show('Rashid Workspace installed successfully!', 'success');
    });
}

// ----------------------------------------------------
// 8. Scroll Progress Indicator
// ----------------------------------------------------
export function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = scrollPercent + '%';
  }, { passive: true });
}
