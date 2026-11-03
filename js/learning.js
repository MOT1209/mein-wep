/**
 * Learning Center Script
 * Handles fetching lessons from Supabase and rendering them.
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchLessons();
});

async function fetchLessons() {
    const container = document.getElementById('lessons-container');

    try {
        // Fetch from Supabase
        const { data: lessons, error } = await supabaseClient
            .from('lessons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Clear loading state
        container.textContent = '';

        if (!lessons || lessons.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'lessons-state';
            empty.textContent = 'No lessons yet. Check back soon!';
            container.appendChild(empty);
            return;
        }

        // Render lessons
        lessons.forEach(lesson => {
            const card = createLessonCard(lesson);
            container.appendChild(card);
        });

    } catch (err) {
        console.error('Error fetching lessons:', err);
        container.textContent = '';
        const errText = document.createElement('p');
        errText.className = 'lessons-state';
        errText.textContent = 'Failed to load lessons. Please try again later.';
        container.appendChild(errText);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createLessonCard(lesson) {
    const div = document.createElement('div');
    div.className = 'course-card';

    const tagsHTML = (lesson.tags || []).map(tag => `<span>${escapeHtml(tag)}</span>`).join('');

    div.innerHTML = `
        <i class="${escapeHtml(lesson.icon_class || 'fas fa-book')} course-icon"></i>
        <h2 class="course-title">${escapeHtml(lesson.title)}</h2>
        <div class="course-progress">
            <div class="progress-bar" style="width: ${lesson.progress || 0}%"></div>
        </div>
        <p class="course-desc">${escapeHtml(lesson.description || 'No description provided.')}</p>
        <div class="tags">
            ${tagsHTML}
        </div>
    `;

    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    button.textContent = lesson.progress > 0 ? 'Continue' : 'Start Reading';
    button.addEventListener('click', () => startLesson(lesson.content_url));
    div.appendChild(button);

    return div;
}

function startLesson(url) {
    if (!url || url === '#') {
        alert('This lesson content is not available yet. Stay tuned!');
    } else {
        window.location.href = url;
    }
}
