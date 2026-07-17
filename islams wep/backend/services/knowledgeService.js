const supabase = require('../db');

/**
 * Knowledge Graph Service
 * مسئول عن جلب الروابط والعلاقات بين الكيانات المختلفة
 */
const KnowledgeService = {
    /**
     * جلب العناصر المرتبطة بكيان معين (آية، حديث، إلخ)
     * @param {number} entityId - المعرف الفريد للكيان
     * @param {string} entityTypeName - نوع الكيان (ayah, hadith, article, zekr)
     */
    async getRelatedEntities(entityId, entityTypeName) {
        try {
            // 1. جلب النوع ID
            const { data: typeData } = await supabase
                .from('entity_types')
                .select('id')
                .eq('name', entityTypeName)
                .single();

            if (!typeData) return [];

            // 2. جلب الروابط المباشرة (العلاقات)
            const { data: links, error } = await supabase
                .from('entity_links')
                .select(`
                    relation_type,
                    target_entity_id,
                    target_type:entity_types!target_type_id (name)
                `)
                .eq('source_entity_id', entityId)
                .eq('source_type_id', typeData.id);

            if (error) throw error;
            return links;
        } catch (err) {
            console.error('Error in KnowledgeService:', err.message);
            return [];
        }
    },

    /**
     * جلب العناصر المرتبطة بموضوع معين (Topic)
     * @param {string} topicName - اسم الموضوع (مثل: الصبر)
     */
    async getEntitiesByTopic(topicName) {
        try {
            const { data: topicData } = await supabase
                .from('topics')
                .select('id')
                .eq('name', topicName)
                .single();

            if (!topicData) return [];

            const { data: entities, error } = await supabase
                .from('entity_topic_links')
                .select(`
                    entity_id,
                    relevance_score,
                    type:entity_types!entity_type_id (name)
                `)
                .eq('topic_id', topicData.id)
                .order('relevance_score', { ascending: false });

            if (error) throw error;
            return entities;
        } catch (err) {
            console.error('Error in KnowledgeService (Topic):', err.message);
            return [];
        }
    }
};

module.exports = KnowledgeService;
