#ifndef KINGCRAFT_ITEMS_H
#define KINGCRAFT_ITEMS_H

#include "core/types.h"
#include <unordered_map>
#include <vector>
#include <string>

// ============================================================
// ITEM IDs — معرفات العناصر (حسب Minecraft Wiki)
// ============================================================
// Item IDs start at 256 to avoid conflict with block IDs

// --- مواد خام (Materials) ---
constexpr ItemID ITEM_STICK         = 256;
constexpr ItemID ITEM_COBBLESTONE   = 257;
constexpr ItemID ITEM_IRON_INGOT    = 258;
constexpr ItemID ITEM_GOLD_INGOT    = 259;
constexpr ItemID ITEM_DIAMOND       = 260;
constexpr ItemID ITEM_COAL          = 261;
constexpr ItemID ITEM_WOOD_PLANK    = 262;
constexpr ItemID ITEM_STRING        = 263;
constexpr ItemID ITEM_FEATHER       = 264;
constexpr ItemID ITEM_FLINT         = 265;
constexpr ItemID ITEM_LEATHER       = 266;
constexpr ItemID ITEM_BONE          = 267;
constexpr ItemID ITEM_REDSTONE      = 268;
constexpr ItemID ITEM_STONE         = 269;
constexpr ItemID ITEM_DIRT          = 270;
constexpr ItemID ITEM_SAND          = 271;
constexpr ItemID ITEM_GLASS         = 272;
constexpr ItemID ITEM_SANDSTONE     = 273;

// --- أدوات (Tools) ---
constexpr ItemID ITEM_WOODEN_PICKAXE  = 300;
constexpr ItemID ITEM_STONE_PICKAXE   = 301;
constexpr ItemID ITEM_IRON_PICKAXE    = 302;
constexpr ItemID ITEM_DIAMOND_PICKAXE = 303;
constexpr ItemID ITEM_WOODEN_AXE      = 304;
constexpr ItemID ITEM_STONE_AXE       = 305;
constexpr ItemID ITEM_IRON_AXE        = 306;
constexpr ItemID ITEM_DIAMOND_AXE     = 307;
constexpr ItemID ITEM_WOODEN_SHOVEL   = 308;
constexpr ItemID ITEM_STONE_SHOVEL    = 309;
constexpr ItemID ITEM_IRON_SHOVEL     = 310;
constexpr ItemID ITEM_DIAMOND_SHOVEL  = 311;

// --- أدوات الزراعة (Hoes) ---
constexpr ItemID ITEM_WOODEN_HOE      = 312;
constexpr ItemID ITEM_STONE_HOE       = 313;
constexpr ItemID ITEM_IRON_HOE        = 314;
constexpr ItemID ITEM_DIAMOND_HOE     = 315;

// --- أسلحة (Weapons) ---
constexpr ItemID ITEM_WOODEN_SWORD    = 320;
constexpr ItemID ITEM_STONE_SWORD     = 321;
constexpr ItemID ITEM_IRON_SWORD      = 322;
constexpr ItemID ITEM_DIAMOND_SWORD   = 323;
constexpr ItemID ITEM_BOW             = 324;
constexpr ItemID ITEM_ARROW           = 325;

// --- طعام + زراعة (Food + Farming) ---
constexpr ItemID ITEM_APPLE           = 340;
constexpr ItemID ITEM_BREAD           = 341;
constexpr ItemID ITEM_COOKED_PORKCHOP = 342;
constexpr ItemID ITEM_COOKED_BEEF     = 343;
constexpr ItemID ITEM_COOKED_CHICKEN  = 344;
constexpr ItemID ITEM_RAW_PORKCHOP    = 345;
constexpr ItemID ITEM_RAW_BEEF        = 346;
constexpr ItemID ITEM_RAW_CHICKEN     = 347;
constexpr ItemID ITEM_WHEAT           = 348;
constexpr ItemID ITEM_WHEAT_SEEDS     = 349;

// --- كتل قابلة للوضع (Placeable) ---
constexpr ItemID ITEM_CRAFTING_TABLE  = 360;
constexpr ItemID ITEM_FURNACE         = 361;
constexpr ItemID ITEM_CHEST           = 362;
constexpr ItemID ITEM_TORCH           = 363;

// ============================================================
// TOOL TIERS (according to Minecraft Wiki)
// ============================================================
enum class ToolTier : uint8_t {
    NONE    = 0,
    WOOD    = 1,
    STONE   = 2,
    IRON    = 3,
    DIAMOND = 4
};

enum class ToolType : uint8_t {
    NONE    = 0,
    PICKAXE = 1,
    AXE     = 2,
    SHOVEL  = 3,
    SWORD   = 4,
    HOE     = 5
};

// ============================================================
// ITEM PROPERTIES
// ============================================================
struct ItemProperties {
    std::string name_id;        // e.g., "minecraft:iron_pickaxe"
    ItemID numeric_id = 0;
    int max_stack = 64;         // max count per stack
    int max_damage = 0;         // 0 = unbreakable (blocks/materials)
    float attack_damage = 1.0f;
    float attack_speed = 4.0f;
    
    // Tool properties (if applicable)
    ToolType tool_type = ToolType::NONE;
    ToolTier tool_tier = ToolTier::NONE;
    float mining_speed = 1.0f;  // multiplier for correct block type
    
    // Food properties (if applicable)
    float food_restore = 0.0f;  // hunger points restored (half-shanks)
    float saturation = 0.0f;    // saturation modifier
    
    // Block to place when using this item (0 = none)
    BlockID place_block = 0;
    
    // Texture
    uint32_t texture_index = 0;
};

// ============================================================
// ITEM REGISTRY
// ============================================================
class ItemRegistry {
public:
    static ItemRegistry& instance() {
        static ItemRegistry inst;
        return inst;
    }
    
    void init();
    
    const ItemProperties* get(ItemID id) const;
    const ItemProperties* getByName(const std::string& name_id) const;
    ItemID getIdByName(const std::string& name_id) const;
    
    int itemCount() const { return (int)items.size(); }

private:
    ItemRegistry() = default;
    std::vector<ItemProperties> items;          // index = numeric_id
    std::unordered_map<std::string, ItemID> name_to_id;
};

// Utility functions
namespace Items {
    // Get mining speed for a tool against a block (values from Minecraft Wiki)
    float getMiningSpeed(ItemID tool, BlockID block);
    bool isCorrectTool(ItemID tool, BlockID block);  // check if tool can harvest
    ToolType getToolType(ItemID tool);
    ToolTier getToolTier(ItemID tool);
    float getAttackDamage(ItemID weapon);
    float getFoodRestore(ItemID food);
    
    // Get item that drops from a block
    ItemID getBlockDrop(BlockID block);
    int getDropCount(BlockID block);
    
    // Block → Item mapping
    ItemID blockToItem(BlockID block);   // get item form of a block
}

#endif // KINGCRAFT_ITEMS_H
