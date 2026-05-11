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
        container.innerHTML = '';

        if (!lessons || lessons.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No lessons found yet. Check back soon!</p>';
            return;
        }

        // Render lessons
        lessons.forEach(lesson => {
            const card = createLessonCard(lesson);
            container.appendChild(card);
        });

    } catch (err) {
        console.error('Error fetching lessons:', err);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #ff4444;">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem;"></i>
                <p style="margin-top: 15px;">Failed to load lessons. Please try again later.</p>
            </div>
        `;
    }
}

function createLessonCard(lesson) {
    const div = document.createElement('div');
    div.className = 'course-card';

    const tagsHTML = (lesson.tags || []).map(tag => `<span>${tag}</span>`).join('');

    div.innerHTML = `
        <i class="${lesson.icon_class || 'fas fa-book'} course-icon"></i>
        <h2 class="course-title">${lesson.title}</h2>
        <div class="course-progress">
            <div class="progress-bar" style="width: ${lesson.progress || 0}%"></div>
        </div>
        <p class="course-desc">${lesson.description || 'No description provided.'}</p>
        <div class="tags">
            ${tagsHTML}
        </div>
        <button class="btn btn-primary" onclick="startLesson('${lesson.content_url || '#'}')">
            ${lesson.progress > 0 ? 'Continue' : 'Start Reading'}
        </button>
    `;

    return div;
}

window.startLesson = function (url) {
    if (url === '#' || !url) {
        alert('This lesson content is not available yet. Stay tuned!');
    } else {
        window.location.href = url;
    }
};
