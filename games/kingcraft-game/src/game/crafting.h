#ifndef KINGCRAFT_CRAFTING_H
#define KINGCRAFT_CRAFTING_H

#include "core/types.h"
#include "game/items.h"
#include <vector>

// ============================================================
// CRAFTING SYSTEM — نظام الصياغة
// مصدر البيانات: Minecraft Wiki (minecraft.wiki)
// ============================================================

// === RECIPE TYPES ===
enum class RecipeType {
    SHAPED,     // 3×3 shaped crafting (طاولة صياغة)
    SHAPELESS,  // أي ترتيب (any arrangement)
    FURNACE     // فرن (smelting)
};

// === RECIPE INGREDIENT ===
struct RecipeIngredient {
    ItemID item_id = 0;     // 0 = empty/any
    int count = 1;
    bool is_tag = false;    // true = matches any item with that tag
};

// === RECIPE ===
struct Recipe {
    std::string name;               // recipe name
    RecipeType type = RecipeType::SHAPED;
    
    // For shaped recipes: the 3×3 grid (row-major, empty = no ingredient)
    RecipeIngredient grid[9] = {};
    int grid_width = 3;             // actual width (1-3)
    int grid_height = 3;            // actual height (1-3)
    
    // For shapeless recipes
    std::vector<RecipeIngredient> ingredients;
    
    // For furnace recipes
    ItemID input_item = 0;
    
    // Output
    ItemID result = 0;
    int result_count = 1;
    float smelt_time = 10.0f;       // seconds for furnace
    float xp_reward = 0.1f;         // XP from smelting
};

// === CRAFTING MANAGER ===
class CraftingManager {
public:
    static CraftingManager& instance() {
        static CraftingManager inst;
        return inst;
    }
    
    void init();        // Load all recipes
    
    // Find matching recipe for a 2×2 grid (inventory crafting)
    // Returns nullptr if no match
    const Recipe* findCrafting2x2(ItemID grid[4]) const;
    
    // Find matching recipe for a 3×3 grid (crafting table)
    const Recipe* findCrafting3x3(ItemID grid[9]) const;
    
    // Find furnace recipe
    const Recipe* findFurnaceRecipe(ItemID input) const;
    
    // Get all recipes
    const std::vector<Recipe>& getRecipes() const { return recipes; }

private:
    CraftingManager() = default;
    std::vector<Recipe> recipes;
    
    // Check if a shaped recipe matches the given grid
    static bool matchesShaped(const Recipe& recipe, const ItemID* grid, int w, int h);
    
    // Check if a shapeless recipe matches
    static bool matchesShapeless(const Recipe& recipe, const ItemID* grid, int grid_size);
};

#endif // KINGCRAFT_CRAFTING_H
