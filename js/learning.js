/**
 * Learning Center: lists the public lessons.
 *
 * Reads public.lessons straight from Supabase PostgREST with the publishable
 * key (Row Level Security returns Public rows only). One small fetch instead
 * of loading the full supabase-js library (218 KB) for a single read.
 */

const LESSONS_TIMEOUT_MS = 8000;

document.addEventListener('DOMContentLoaded', () => {
    fetchLessons();
});

function showState(container, text) {
    container.textContent = '';
    const p = document.createElement('p');
    p.className = 'lessons-state';
    p.textContent = text;
    container.appendChild(p);
}

async function fetchLessons() {
    const container = document.getElementById('lessons-container');
    if (!container) return;
    const cfg = window.RASHID_SUPABASE;
    if (!cfg || !cfg.url || !cfg.anonKey) {
        console.error('Learning Center: Supabase config missing (js/supabase-config.js)');
        showState(container, 'Failed to load lessons. Please try again later.');
        return;
    }

    try {
        const response = await fetch(`${cfg.url}/rest/v1/lessons?select=*&order=created_at.desc`, {
            headers: { apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}`, Accept: 'application/json' },
            signal: AbortSignal.timeout ? AbortSignal.timeout(LESSONS_TIMEOUT_MS) : undefined,
        });
        if (!response.ok) throw new Error(`lessons request failed (${response.status})`);
        const lessons = await response.json();

        if (!Array.isArray(lessons) || lessons.length === 0) {
            showState(container, 'No lessons yet. Check back soon!');
            return;
        }

        container.textContent = '';
        lessons.forEach((lesson) => container.appendChild(createLessonCard(lesson)));
    } catch (err) {
        console.error('Error fetching lessons:', err);
        showState(container, 'Failed to load lessons. Please try again later.');
    }
}

/** A lesson link the page may open: https:// or a site-relative path only. */
function safeLessonUrl(url) {
    if (typeof url !== 'string' || !url || url === '#') return null;
    if (/^https:\/\//i.test(url)) return url;
    if (/^\/(?!\/)/.test(url) && !url.includes(':')) return url;
    return null;
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function createLessonCard(lesson) {
    const card = el('div', 'course-card');

    const icon = el('i');
    icon.className = `${String(lesson.icon_class || 'fas fa-book').replace(/[^a-z0-9 -]/gi, '')} course-icon`;
    card.appendChild(icon);
    card.appendChild(el('h2', 'course-title', lesson.title || ''));

    const progress = Math.min(100, Math.max(0, Number(lesson.progress) || 0));
    const track = el('div', 'course-progress');
    const bar = el('div', 'progress-bar');
    bar.style.width = `${progress}%`;
    track.appendChild(bar);
    card.appendChild(track);

    card.appendChild(el('p', 'course-desc', lesson.description || 'No description provided.'));

    const tags = el('div', 'tags');
    (Array.isArray(lesson.tags) ? lesson.tags : []).forEach((tag) => tags.appendChild(el('span', '', String(tag))));
    card.appendChild(tags);

    const button = el('button', 'btn btn-primary', progress > 0 ? 'Continue' : 'Start Reading');
    button.type = 'button';
    button.addEventListener('click', () => startLesson(lesson.content_url));
    card.appendChild(button);

    return card;
}

function startLesson(url) {
    const target = safeLessonUrl(url);
    if (!target) {
        alert('This lesson content is not available yet. Stay tuned!');
    } else {
        window.location.href = target;
    }
}
