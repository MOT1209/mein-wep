const express = require('express');
const router = express.Router();
const KnowledgeService = require('../services/knowledgeService');

/**
 * @route GET /api/knowledge/related/:type/:id
 * @desc جلب العناصر المرتبطة بكيان معين
 */
router.get('/related/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const related = await KnowledgeService.getRelatedEntities(id, type);
    res.json(related);
});

/**
 * @route GET /api/knowledge/topic/:name
 * @desc جلب كل الكيانات المرتبطة بموضوع معين (مثل الصبر)
 */
router.get('/topic/:name', async (req, res) => {
    const { name } = req.params;
    const entities = await KnowledgeService.getEntitiesByTopic(name);
    res.json(entities);
});

module.exports = router;
