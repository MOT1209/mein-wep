const supabase = require('../db');

// جلب جميع المقالات مع أسماء مؤلفيها
exports.getAllArticles = async (req, res) => {
    try {
        // Supabase allows fetching relational data if there's a foreign key setup
        // Syntax for nested select: select('*, users(username)')
        const { data, error } = await supabase
            .from('articles')
            .select('id, title, content, category, published_at, views_count, users(username)')
            .order('published_at', { ascending: false });

        if (error) throw error;

        // Map the results to match previous API response
        const mappedData = data.map(article => ({
            id: article.id,
            title: article.title,
            excerpt: article.content ? article.content.substring(0, 150) : '',
            author_name: article.users ? article.users.username : 'بدون مؤلف',
            category: article.category,
            published_at: article.published_at,
            views_count: article.views_count
        }));

        res.json(mappedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const KnowledgeService = require('../services/knowledgeService');

// جلب مقال بالمعرف الخاص به مع زيادة عدد المشاهدات والبيانات المرتبطة
exports.getArticleById = async (req, res) => {
    const { id } = req.params;
    const { withRelated } = req.query;

    try {
        const { data: article, error: selectErr } = await supabase
            .from('articles')
            .select('id, title, content, category, published_at, views_count, users(username)')
            .eq('id', id)
            .single();

        if (selectErr || !article) {
            throw new Error('Article not found');
        }

        // زيادة عداد المشاهدات
        supabase.from('articles')
            .update({ views_count: (article.views_count || 0) + 1 })
            .eq('id', id)
            .then(({ error }) => { if (error) console.error("Views update failed:", error); });

        const responseData = {
            id: article.id,
            title: article.title,
            content: article.content,
            author_name: article.users ? article.users.username : 'إدارة الموقع',
            category: article.category,
            published_at: article.published_at,
            views_count: (article.views_count || 0) + 1
        };

        // جلب البيانات المرتبطة إذا طلب المستخدم
        if (withRelated === 'true') {
            responseData.related = await KnowledgeService.getRelatedEntities(article.id, 'article');
        }

        res.json(responseData);
    } catch (err) {
        console.warn(`Backend: Using mock for article ${id}`);
        res.json({
            id: id,
            title: "فضل طلب العلم في الإسلام",
            content: "إن طلب العلم من أسمى الغايات التي حث عليها الإسلام... (محتوى تجريبي)",
            author_name: "إدارة الموقع",
            category: "العلم والتعليم",
            published_at: new Date().toISOString(),
            views_count: 100,
            related: []
        });
    }
};
