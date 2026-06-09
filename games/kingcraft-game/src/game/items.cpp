#include "game/items.h"
#include "world/block_registry.h"
#include <iostream>
#include <unordered_map>

// Static lookup tables
static std::unordered_map<BlockID, ItemID> block_to_item;
static std::unordered_map<BlockID, int> block_drop_count;

void ItemRegistry::init() {
    items.clear();
    name_to_id.clear();
    block_to_item.clear();
    block_drop_count.clear();
    
    // Helper lambda to add an item safely
    auto add = [&](const std::string& name, ItemID id, int stack, int dur,
                    float dmg, float spd,
                    ToolType tt = ToolType::NONE, ToolTier tier = ToolTier::NONE, float mine = 1.0f,
                    float food = 0.0f, float sat = 0.0f,
                    BlockID place = 0, uint32_t tex = 0) {
        if (id >= items.size()) items.resize(id + 1);
        ItemProperties& p = items[id];
        p.name_id = name;
        p.numeric_id = id;
        p.max_stack = stack;
        p.max_damage = dur;
        p.attack_damage = dmg;
        p.attack_speed = spd;
        p.tool_type = tt;
        p.tool_tier = tier;
        p.mining_speed = mine;
        p.food_restore = food;
        p.saturation = sat;
        p.place_block = place;
        p.texture_index = tex;
        name_to_id[name] = id;
    };
    
    // =========================================================
    // MATERIALS — مواد خام
    // =========================================================
    add("minecraft:stick",         ITEM_STICK,         64, 0, 0.5f, 4.0f);
    add("minecraft:cobblestone",   ITEM_COBBLESTONE,   64, 0, 1.0f, 4.0f);
    add("minecraft:iron_ingot",    ITEM_IRON_INGOT,    64, 0, 1.0f, 4.0f);
    add("minecraft:gold_ingot",    ITEM_GOLD_INGOT,    64, 0, 1.0f, 4.0f);
    add("minecraft:diamond",       ITEM_DIAMOND,       64, 0, 1.0f, 4.0f);
    add("minecraft:coal",          ITEM_COAL,          64, 0, 1.0f, 4.0f);
    add("minecraft:oak_planks",    ITEM_WOOD_PLANK,    64, 0, 1.0f, 4.0f);
    add("minecraft:string",        ITEM_STRING,        64, 0, 1.0f, 4.0f);
    add("minecraft:feather",       ITEM_FEATHER,       64, 0, 1.0f, 4.0f);
    add("minecraft:flint",         ITEM_FLINT,         64, 0, 1.0f, 4.0f);
    add("minecraft:leather",       ITEM_LEATHER,       64, 0, 1.0f, 4.0f);
    add("minecraft:bone",          ITEM_BONE,          64, 0, 1.0f, 4.0f);
    add("minecraft:redstone",      ITEM_REDSTONE,      64, 0, 1.0f, 4.0f);
    add("minecraft:stone",         ITEM_STONE,         64, 0, 1.0f, 4.0f);
    add("minecraft:dirt",          ITEM_DIRT,          64, 0, 1.0f, 4.0f);
    add("minecraft:sand",          ITEM_SAND,          64, 0, 1.0f, 4.0f);
    add("minecraft:glass",         ITEM_GLASS,         64, 0, 1.0f, 4.0f);
    add("minecraft:sandstone",     ITEM_SANDSTONE,     64, 0, 1.0f, 4.0f);
    
    // =========================================================
    // TOOLS — أدوات حسب Minecraft Wiki
    // =========================================================
    // Wood tier: durability 60, mining speed 2.0
    add("minecraft:wooden_pickaxe",  ITEM_WOODEN_PICKAXE,  1, 60,  2.0f, 2.4f, ToolType::PICKAXE, ToolTier::WOOD, 2.0f);
    add("minecraft:wooden_axe",      ITEM_WOODEN_AXE,      1, 60,  3.0f, 0.8f, ToolType::AXE,     ToolTier::WOOD, 2.0f);
    add("minecraft:wooden_shovel",   ITEM_WOODEN_SHOVEL,   1, 60,  1.5f, 1.0f, ToolType::SHOVEL,  ToolTier::WOOD, 2.0f);
    add("minecraft:wooden_sword",    ITEM_WOODEN_SWORD,    1, 60,  4.0f, 1.6f, ToolType::SWORD,  ToolTier::WOOD, 1.5f);
    
    // Stone tier: durability 132, mining speed 4.0
    add("minecraft:stone_pickaxe",   ITEM_STONE_PICKAXE,   1, 132, 3.0f, 2.4f, ToolType::PICKAXE, ToolTier::STONE, 4.0f);
    add("minecraft:stone_axe",       ITEM_STONE_AXE,       1, 132, 4.0f, 0.8f, ToolType::AXE,     ToolTier::STONE, 4.0f);
    add("minecraft:stone_shovel",    ITEM_STONE_SHOVEL,    1, 132, 2.5f, 1.0f, ToolType::SHOVEL,  ToolTier::STONE, 4.0f);
    add("minecraft:stone_sword",     ITEM_STONE_SWORD,     1, 132, 5.0f, 1.6f, ToolType::SWORD,  ToolTier::STONE, 1.5f);
    
    // Hoe tier: same durability as other tools
    add("minecraft:wooden_hoe",      ITEM_WOODEN_HOE,      1, 60,  1.0f, 2.0f, ToolType::HOE,    ToolTier::WOOD, 1.0f);
    add("minecraft:stone_hoe",       ITEM_STONE_HOE,       1, 132, 1.0f, 2.0f, ToolType::HOE,    ToolTier::STONE, 1.0f);
    add("minecraft:iron_hoe",        ITEM_IRON_HOE,        1, 251, 1.0f, 2.0f, ToolType::HOE,    ToolTier::IRON, 1.0f);
    add("minecraft:diamond_hoe",     ITEM_DIAMOND_HOE,     1, 1562, 1.0f, 2.0f, ToolType::HOE,  ToolTier::DIAMOND, 1.0f);
    
    // Iron tier: durability 251, mining speed 6.0
    add("minecraft:iron_pickaxe",    ITEM_IRON_PICKAXE,    1, 251, 4.0f, 2.4f, ToolType::PICKAXE, ToolTier::IRON, 6.0f);
    add("minecraft:iron_axe",        ITEM_IRON_AXE,        1, 251, 5.0f, 0.8f, ToolType::AXE,     ToolTier::IRON, 6.0f);
    add("minecraft:iron_shovel",     ITEM_IRON_SHOVEL,     1, 251, 3.5f, 1.0f, ToolType::SHOVEL,  ToolTier::IRON, 6.0f);
    add("minecraft:iron_sword",      ITEM_IRON_SWORD,      1, 251, 6.0f, 1.6f, ToolType::SWORD,  ToolTier::IRON, 1.5f);
    
    // Diamond tier: durability 1562, mining speed 8.0
    add("minecraft:diamond_pickaxe", ITEM_DIAMOND_PICKAXE, 1, 1562, 5.0f, 2.4f, ToolType::PICKAXE, ToolTier::DIAMOND, 8.0f);
    add("minecraft:diamond_axe",     ITEM_DIAMOND_AXE,     1, 1562, 6.0f, 0.8f, ToolType::AXE,     ToolTier::DIAMOND, 8.0f);
    add("minecraft:diamond_shovel",  ITEM_DIAMOND_SHOVEL,  1, 1562, 4.5f, 1.0f, ToolType::SHOVEL,  ToolTier::DIAMOND, 8.0f);
    add("minecraft:diamond_sword",   ITEM_DIAMOND_SWORD,   1, 1562, 7.0f, 1.6f, ToolType::SWORD,  ToolTier::DIAMOND, 1.5f);
    
    // Bow
    add("minecraft:bow",             ITEM_BOW,             1, 385, 2.0f, 4.0f);
    add("minecraft:arrow",           ITEM_ARROW,          64, 0,  1.0f, 4.0f);
    
    // =========================================================
    // FOOD — طعام حسب Minecraft Wiki
    // =========================================================
    add("minecraft:apple",           ITEM_APPLE,           64, 0, 1.0f, 4.0f, ToolType::NONE, ToolTier::NONE, 0, 4.0f, 2.4f);
    add("minecraft:bread",           ITEM_BREAD,           64, 0, 1.0f, 4.0f, ToolType::NONE, ToolTier::NONE, 0, 5.0f, 6.0f);
    add("minecraft:wheat",           ITEM_WHEAT,           64, 0, 1.0f, 4.0f, ToolType::NONE, ToolTier::NONE, 0, 0, 0);
    add("minecraft:wheat_seeds",     ITEM_WHEAT_SEEDS,     64, 0, 0.5f, 4.0f);
    add("minecraft:cooked_porkchop", ITEM_COOKED_PORKCHOP, 64, 0, 1.0f, 4.0f, ToolType::NONE, ToolTier::NONE, 0, 8.0f, 12.8f);
    add("minecraft:cooked_beef",     ITEM_COOKED_BEEF,     64, 0, 1.0f, 4.0f, ToolType::NONE, ToolTier::NONE, 0, 8.0f, 12.8f);
    add("minecraft:cooked_chicken",  ITEM_COOKED_CHICKEN,  64, 0, 1.0f, 4.0f, ToolType::NONE, ToolTier::NONE, 0, 6.0f, 7.2f);
    add("minecraft:porkchop",        ITEM_RAW_PORKCHOP,    64, 0, 1.0f, 4.0f, ToolType::NONE, ToolTier::NONE, 0, 3.0f, 1.8f);
    add("minecraft:beef",            ITEM_RAW_BEEF,        64, 0, 1.0f, 4.0f, ToolType::NONE, ToolTier::NONE, 0, 3.0f, 1.8f);
    add("minecraft:chicken",         ITEM_RAW_CHICKEN,     64, 0, 1.0f, 4.0f, ToolType::NONE, ToolTier::NONE, 0, 2.0f, 1.2f);
    
    // =========================================================
    // PLACEABLE ITEMS
    // =========================================================
    add("minecraft:crafting_table",  ITEM_CRAFTING_TABLE,  64, 0, 1.0f, 4.0f);
    add("minecraft:furnace",         ITEM_FURNACE,         64, 0, 1.0f, 4.0f);
    add("minecraft:chest",           ITEM_CHEST,           64, 0, 1.0f, 4.0f);
    add("minecraft:torch",           ITEM_TORCH,           64, 0, 1.0f, 4.0f);
    
    std::cout << "[ItemRegistry] Loaded " << items.size() << " items\n";
    
    // =========================================================
    // BLOCK DROP MAPPING (حسب Minecraft Wiki)
    // =========================================================
    block_to_item[BLOCK_STONE]       = ITEM_COBBLESTONE;
    block_to_item[BLOCK_GRASS]       = ITEM_DIRT;
    block_to_item[BLOCK_DIRT]        = ITEM_DIRT;
    block_to_item[BLOCK_SAND]        = ITEM_SAND;
    block_to_item[BLOCK_SANDSTONE]   = ITEM_SANDSTONE;
    block_to_item[BLOCK_COBBLESTONE] = ITEM_COBBLESTONE;
    block_to_item[BLOCK_PLANKS]      = ITEM_WOOD_PLANK;
    
    // Farming drops
    block_to_item[BLOCK_WHEAT_CROP]  = ITEM_WHEAT_SEEDS;
    block_to_item[BLOCK_FARMLAND]    = ITEM_DIRT;
    
    // Drop counts
    block_drop_count[BLOCK_WHEAT_CROP] = 1;  // seeds
}

const ItemProperties* ItemRegistry::get(ItemID id) const {
    if (id >= items.size()) return nullptr;
    return &items[id];
}

const ItemProperties* ItemRegistry::getByName(const std::string& name_id) const {
    auto it = name_to_id.find(name_id);
    if (it == name_to_id.end()) return nullptr;
    return get(it->second);
}

ItemID ItemRegistry::getIdByName(const std::string& name_id) const {
    auto it = name_to_id.find(name_id);
    if (it == name_to_id.end()) return 0;
    return it->second;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
namespace Items {

float getMiningSpeed(ItemID tool, BlockID block) {
    (void)block;
    auto* prop = ItemRegistry::instance().get(tool);
    if (!prop) return 1.0f;
    return prop->mining_speed;
}

bool isCorrectTool(ItemID tool, BlockID block) {
    auto* prop = ItemRegistry::instance().get(tool);
    if (!prop) return false;
    
    auto* bp = BlockRegistry::instance().get(block);
    if (!bp) return false;
    if (bp->tool_type.empty()) return true;
    
    std::string tool_str;
    switch (prop->tool_type) {
        case ToolType::PICKAXE: tool_str = "pickaxe"; break;
        case ToolType::AXE:     tool_str = "axe"; break;
        case ToolType::SHOVEL:  tool_str = "shovel"; break;
        case ToolType::SWORD:   tool_str = "sword"; break;
        case ToolType::HOE:     tool_str = "hoe"; break;
        default: return false;
    }
    
    return tool_str == bp->tool_type;
}

ToolType getToolType(ItemID tool) {
    auto* prop = ItemRegistry::instance().get(tool);
    if (!prop) return ToolType::NONE;
    return prop->tool_type;
}

ToolTier getToolTier(ItemID tool) {
    auto* prop = ItemRegistry::instance().get(tool);
    if (!prop) return ToolTier::NONE;
    return prop->tool_tier;
}

float getAttackDamage(ItemID weapon) {
    auto* prop = ItemRegistry::instance().get(weapon);
    if (!prop) return 1.0f;
    return prop->attack_damage;
}

float getFoodRestore(ItemID food) {
    auto* prop = ItemRegistry::instance().get(food);
    if (!prop) return 0;
    return prop->food_restore;
}

ItemID getBlockDrop(BlockID block) {
    auto it = block_to_item.find(block);
    if (it != block_to_item.end()) return it->second;
    // Default: cobblestone for stone, dirt for dirt, etc.
    if (block == BLOCK_STONE) return ITEM_COBBLESTONE;
    if (block == BLOCK_DIRT || block == BLOCK_GRASS) return ITEM_DIRT;
    if (block == BLOCK_SAND) return ITEM_SAND;
    return 0;
}

int getDropCount(BlockID block) {
    auto it = block_drop_count.find(block);
    if (it != block_drop_count.end()) return it->second;
    return 1;
}

ItemID blockToItem(BlockID block) {
    switch (block) {
        case BLOCK_STONE:       return ITEM_STONE;
        case BLOCK_DIRT:        return ITEM_DIRT;
        case BLOCK_GRASS:       return ITEM_DIRT;
        case BLOCK_SAND:        return ITEM_SAND;
        case BLOCK_SANDSTONE:   return ITEM_SANDSTONE;
        case BLOCK_COBBLESTONE: return ITEM_COBBLESTONE;
        case BLOCK_PLANKS:      return ITEM_WOOD_PLANK;
        default: return 0;
    }
}

} // namespace Items
