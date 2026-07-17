const API_URL = (window.location.protocol === 'file:')
    ? 'http://localhost:5000/api'
    : (window.API_BASE_URL || 'http://localhost:5000/api');

document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
});

async function loadArticles() {
    const grid = document.getElementById('articles-grid');
    const loader = document.getElementById('loader');

    try {
        const response = await fetch(`${API_URL}/articles`);
        if (!response.ok) throw new Error('Network response was not ok');
        const articles = await response.json();

        loader.style.display = 'none';

        if (articles.length === 0) {
            grid.innerHTML = `
                <div class="glass-panel" style="grid-column: 1/-1; text-align:center; padding: 40px;">
                    <i class="fa-solid fa-book-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 20px; display: block;"></i>
                    <p>لا توجد مقالات مضافة حالياً. كن أول من يضيف معرفة!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'glass-panel article-card';

            const date = new Date(article.published_at).toLocaleDateString('ar-EG');

            card.innerHTML = `
                <div class="article-category">${article.category}</div>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${article.excerpt}...</p>
                <div class="article-meta">
                    <span><i class="fa-solid fa-user-pen"></i> ${article.author_name || 'إدارة الموقع'}</span>
                    <span><i class="fa-solid fa-eye"></i> ${article.views_count}</span>
                </div>
            `;

            card.onclick = () => openArticle(article.id);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching articles:', error);
        loader.innerHTML = `
            <div class="glass-panel" style="padding: 30px; border-color: red;">
                <p style="color:red;">حدث خطأ أثناء تحميل المقالات. يرجى التأكد من تشغيل السيرفر.</p>
                <button class="btn btn-secondary" onclick="loadArticles()" style="margin-top:15px;">إعادة المحاولة</button>
            </div>
        `;
    }
}

async function openArticle(id) {
    const listView = document.getElementById('articles-list-view');
    const reader = document.getElementById('article-reader');

    listView.style.opacity = '0';
    setTimeout(() => {
        listView.style.display = 'none';
        reader.style.display = 'block';
        reader.style.opacity = '1';
    }, 300);

    const contentArea = document.getElementById('reader-content');
    contentArea.innerHTML = `
        <div style="text-align:center; padding: 50px;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
            <p style="margin-top:15px;">جاري تحميل المعرفة...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/articles/${id}?withRelated=true`);
        if (!response.ok) throw new Error('Article not found');
        const article = await response.json();

        document.getElementById('reader-category').innerText = article.category;
        document.getElementById('reader-title').innerText = article.title;
        document.getElementById('reader-author').innerHTML = `<i class="fa-solid fa-user-edit"></i> ${article.author_name}`;
        document.getElementById('reader-date').innerHTML = `<i class="fa-regular fa-calendar-days"></i> ${new Date(article.published_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        document.getElementById('reader-views').innerHTML = `<i class="fa-solid fa-eye"></i> ${article.views_count} مشاهدة`;

        // Render content with proper paragraphs
        contentArea.innerHTML = article.content.split('\n\n').map(p => `<p class="article-p">${p}</p>`).join('');

        // عرض المعارف المرتبطة بتصميم "بريميوم"
        if (article.related && article.related.length > 0) {
            const knowledgeNode = document.createElement('div');
            knowledgeNode.className = 'knowledge-panel glass-panel';
            knowledgeNode.innerHTML = `
                <h4 class="knowledge-header"><i class="fa-solid fa-link"></i> مراجع ومعارف مرتبطة</h4>
                <div class="knowledge-grid-mini">
                    ${article.related.map(rel => `
                        <div class="knowledge-card-mini">
                            <span class="knowledge-type-badge">${rel.target_type.name === 'ayah' ? 'آية قرآنية' : 'حديث نبوي'}</span>
                            <p class="knowledge-relation">${rel.relation_type === 'explains' ? 'شرح للمصدر' : 'ارتباط موضوعي'}</p>
                            <a href="${rel.target_type.name === 'ayah' ? 'quran.html' : 'hadith.html'}" class="knowledge-link">
                                انتقل للمصدر <i class="fa-solid fa-chevron-left"></i>
                            </a>
                        </div>
                    `).join('')}
                </div>
            `;
            contentArea.appendChild(knowledgeNode);
        }

    } catch (error) {
        contentArea.innerHTML = `
            <div class="glass-panel" style="padding: 40px; text-align:center; border-color: red;">
                <p style="color:red;">عذراً، فشل تحميل المقال.</p>
                <button class="btn btn-secondary" onclick="backToArticles()">عودة للقائمة</button>
            </div>
        `;
    }
}

function backToArticles() {
    const listView = document.getElementById('articles-list-view');
    const reader = document.getElementById('article-reader');

    reader.style.opacity = '0';
    setTimeout(() => {
        reader.style.display = 'none';
        listView.style.display = 'block';
        listView.style.opacity = '1';
    }, 300);
}
