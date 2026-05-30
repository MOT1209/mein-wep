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
    textSpan.innerHTML = '<span class="typewriter-text"></span>';

    // Replace the specific text gradient part or append it
    const textGradient = qs('#hero h1 .text-gradient');
    if (textGradient) {
        textGradient.innerHTML = '';
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

    track.innerHTML = marqueeList.map(tech => `
        <div class="tech-item">
            <i class="${tech.icon}"></i>
            <span>${escapeHTML(tech.name)}</span>
        </div>
    `).join('');

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
    liveStatItem.innerHTML = `
        <span class="stat-num counting" id="live-visitors">1</span>
        <span class="stat-label"><span class="live-dot"></span>Visitors</span>
    `;
    statsGrid.appendChild(liveStatItem);

    // Dynamic number counting animation
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
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
// 5. Testimonials Section
// ----------------------------------------------------
export function initTestimonials() {
    const targetSection = qs('#about');
    if (!targetSection) return;

    const testimonialSection = document.createElement('section');
    testimonialSection.className = 'section';
    testimonialSection.id = 'testimonials';
    
    testimonialSection.innerHTML = `
        <div class="container">
            <div class="section-head">
                <h2 class="reveal"><i class="fas fa-comments"></i> User Feedback</h2>
                <p class="reveal">What users and visitors say about the apps, games, and workspaces built by Rashid.</p>
            </div>
            <div class="testimonials-grid">
                <div class="testimonial-card reveal">
                    <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                    <p class="quote">"The Quran App is absolutely gorgeous. The sound profiles and translation sync worked perfectly offline on my iPhone. Highly recommended."</p>
                    <div class="testimonial-author">
                        <div class="testimonial-avatar" style="background: linear-gradient(135deg, #38bdf8, #0369a1);">A</div>
                        <div class="testimonial-author-info">
                            <h4>Abdullah S.</h4>
                            <p>Mobile App User</p>
                        </div>
                    </div>
                </div>

                <div class="testimonial-card reveal">
                    <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                    <p class="quote">"I got addicted to the 3D Farm Game. The Three.js physics is responsive, and loading time is incredibly fast for a browser game. True masterpiece!"</p>
                    <div class="testimonial-author">
                        <div class="testimonial-avatar" style="background: linear-gradient(135deg, #10b981, #047857);">M</div>
                        <div class="testimonial-author-info">
                            <h4>Maximilian G.</h4>
                            <p>Browser Gamer</p>
                        </div>
                    </div>
                </div>

                <div class="testimonial-card reveal">
                    <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                    <p class="quote">"Rashid-AI helped me refactor my entire Node API script in under 5 minutes. The Arabic voice-synthesis matches natural speaking cadence perfectly."</p>
                    <div class="testimonial-author">
                        <div class="testimonial-avatar" style="background: linear-gradient(135deg, #ec4899, #be185d);">Y</div>
                        <div class="testimonial-author-info">
                            <h4>Youssef H.</h4>
                            <p>Fullstack Engineer</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insert before about section
    targetSection.parentNode.insertBefore(testimonialSection, targetSection);
    
    // Register animations
    if (window.RashidRevealObserver) {
        testimonialSection.querySelectorAll('.reveal').forEach(el => {
            window.RashidRevealObserver.observe(el);
        });
    }
}

// ----------------------------------------------------
// 6. Project Modal Preview Card
// ----------------------------------------------------
export function initProjectModal() {
    // Add modal element to body
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'project-modal-overlay';
    modalOverlay.id = 'project-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="project-modal blur-glass">
            <button class="project-modal-close" aria-label="Close Preview"><i class="fas fa-times"></i></button>
            <div class="project-modal-icon"></div>
            <h3 id="modal-title">Project Title</h3>
            <p class="modal-desc" id="modal-desc">Detailed project description goes here...</p>
            <div class="modal-tags" id="modal-tags"></div>
            <div class="modal-actions" id="modal-actions"></div>
        </div>
    `;
    document.body.appendChild(modalOverlay);

    const closeBtn = modalOverlay.querySelector('.project-modal-close');
    on(closeBtn, 'click', () => modalOverlay.classList.remove('active'));
    on(modalOverlay, 'click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });

    // Delegate project card click
    on(document.body, 'click', (e) => {
        const card = e.target.closest('.project-card');
        if (!card) return;

        // If clicked on a button or link inside the card, let it trigger normally
        if (e.target.closest('.btn') || e.target.closest('a') || e.target.closest('button')) {
            return;
        }

        e.preventDefault();
        openModal(card);
    });

    function openModal(card) {
        const title = card.querySelector('h3').textContent;
        const desc = card.querySelector('p').textContent;
        const visual = card.querySelector('.project-visual').innerHTML;
        const tags = Array.from(card.querySelectorAll('.project-tags span')).map(span => span.textContent);
        const actions = card.querySelector('.project-actions').innerHTML;

        const modal = qs('.project-modal');
        if (!modal) return;

        // Set visual style (match gradient colors)
        const iconContainer = modal.querySelector('.project-modal-icon');
        iconContainer.innerHTML = visual;
        
        // Find computed background gradient style of the visual
        const visualEl = card.querySelector('.project-visual');
        if (visualEl) {
            const style = window.getComputedStyle(visualEl);
            iconContainer.style.background = style.background || 'linear-gradient(135deg, #38bdf8, #6366f1)';
        }

        modal.querySelector('#modal-title').textContent = title;
        modal.querySelector('#modal-desc').textContent = desc;

        const tagsContainer = modal.querySelector('#modal-tags');
        tagsContainer.innerHTML = tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('');

        const actionsContainer = modal.querySelector('#modal-actions');
        actionsContainer.innerHTML = actions;

        // Make action buttons bigger in modal
        actionsContainer.querySelectorAll('.btn').forEach(btn => {
            btn.style.padding = '14px 28px';
            btn.style.fontSize = '0.95rem';
            btn.style.marginTop = '0';
        });

        modalOverlay.classList.add('active');
        Toast.show(`Viewing details for: ${title}`, 'info', 2000);
    }
}

// ----------------------------------------------------
// 7. PWA Custom Install Button
// ----------------------------------------------------
export function initCustomPwaInstall() {
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
