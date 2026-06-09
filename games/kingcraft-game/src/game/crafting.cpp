#include "game/crafting.h"
#include <iostream>
#include <cstring>

void CraftingManager::init() {
    recipes.clear();
    
    auto add = [&](const std::string& name, RecipeType type, 
                   ItemID result, int count,
                   const std::vector<ItemID>& ingredients,
                   int gw = 0, int gh = 0) {
        Recipe r;
        r.name = name;
        r.type = type;
        r.result = result;
        r.result_count = count;
        
        if (type == RecipeType::SHAPED) {
            r.grid_width = gw;
            r.grid_height = gh;
            for (size_t i = 0; i < ingredients.size() && i < 9; i++) {
                r.grid[i].item_id = ingredients[i];
                r.grid[i].count = 1;
            }
        } else if (type == RecipeType::SHAPELESS) {
            for (auto id : ingredients) {
                RecipeIngredient ing;
                ing.item_id = id;
                ing.count = 1;
                r.ingredients.push_back(ing);
            }
        }
        
        recipes.push_back(r);
    };
    
    auto addFurnace = [&](const std::string& name, ItemID input, ItemID result, float time, float xp) {
        Recipe r;
        r.name = name;
        r.type = RecipeType::FURNACE;
        r.input_item = input;
        r.result = result;
        r.result_count = 1;
        r.smelt_time = time;
        r.xp_reward = xp;
        recipes.push_back(r);
    };
    
    // =========================================================
    // SHAPED RECIPES (طاولة صياغة) — حسب Minecraft Wiki
    // =========================================================
    
    // --- WOODEN TOOLS ---
    // Wooden Pickaxe: 3 planks top, 2 sticks handle
    add("wooden_pickaxe", RecipeType::SHAPED, ITEM_WOODEN_PICKAXE, 1,
        {ITEM_WOOD_PLANK, ITEM_WOOD_PLANK, ITEM_WOOD_PLANK,
         0, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    // Wooden Axe: 3 planks, 2 sticks
    add("wooden_axe", RecipeType::SHAPED, ITEM_WOODEN_AXE, 1,
        {ITEM_WOOD_PLANK, ITEM_WOOD_PLANK, 0,
         ITEM_WOOD_PLANK, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    // Wooden Shovel: 1 plank, 2 sticks
    add("wooden_shovel", RecipeType::SHAPED, ITEM_WOODEN_SHOVEL, 1,
        {0, ITEM_WOOD_PLANK, 0,
         0, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    // Wooden Sword: 2 planks, 1 stick
    add("wooden_sword", RecipeType::SHAPED, ITEM_WOODEN_SWORD, 1,
        {0, ITEM_WOOD_PLANK, 0,
         0, ITEM_WOOD_PLANK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    // --- STONE TOOLS ---
    add("stone_pickaxe", RecipeType::SHAPED, ITEM_STONE_PICKAXE, 1,
        {ITEM_COBBLESTONE, ITEM_COBBLESTONE, ITEM_COBBLESTONE,
         0, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    add("stone_axe", RecipeType::SHAPED, ITEM_STONE_AXE, 1,
        {ITEM_COBBLESTONE, ITEM_COBBLESTONE, 0,
         ITEM_COBBLESTONE, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    add("stone_shovel", RecipeType::SHAPED, ITEM_STONE_SHOVEL, 1,
        {0, ITEM_COBBLESTONE, 0,
         0, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    add("stone_sword", RecipeType::SHAPED, ITEM_STONE_SWORD, 1,
        {0, ITEM_COBBLESTONE, 0,
         0, ITEM_COBBLESTONE, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    // --- IRON TOOLS ---
    add("iron_pickaxe", RecipeType::SHAPED, ITEM_IRON_PICKAXE, 1,
        {ITEM_IRON_INGOT, ITEM_IRON_INGOT, ITEM_IRON_INGOT,
         0, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    add("iron_axe", RecipeType::SHAPED, ITEM_IRON_AXE, 1,
        {ITEM_IRON_INGOT, ITEM_IRON_INGOT, 0,
         ITEM_IRON_INGOT, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    add("iron_sword", RecipeType::SHAPED, ITEM_IRON_SWORD, 1,
        {0, ITEM_IRON_INGOT, 0,
         0, ITEM_IRON_INGOT, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    // --- DIAMOND TOOLS ---
    add("diamond_pickaxe", RecipeType::SHAPED, ITEM_DIAMOND_PICKAXE, 1,
        {ITEM_DIAMOND, ITEM_DIAMOND, ITEM_DIAMOND,
         0, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    add("diamond_sword", RecipeType::SHAPED, ITEM_DIAMOND_SWORD, 1,
        {0, ITEM_DIAMOND, 0,
         0, ITEM_DIAMOND, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    // --- HOES ---
    // Wooden Hoe: 2 planks, 2 sticks
    add("wooden_hoe", RecipeType::SHAPED, ITEM_WOODEN_HOE, 1,
        {ITEM_WOOD_PLANK, ITEM_WOOD_PLANK, 0,
         0, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    // Stone Hoe: 2 cobblestone, 2 sticks
    add("stone_hoe", RecipeType::SHAPED, ITEM_STONE_HOE, 1,
        {ITEM_COBBLESTONE, ITEM_COBBLESTONE, 0,
         0, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    // Iron Hoe: 2 iron ingots, 2 sticks
    add("iron_hoe", RecipeType::SHAPED, ITEM_IRON_HOE, 1,
        {ITEM_IRON_INGOT, ITEM_IRON_INGOT, 0,
         0, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    // Diamond Hoe: 2 diamonds, 2 sticks
    add("diamond_hoe", RecipeType::SHAPED, ITEM_DIAMOND_HOE, 1,
        {ITEM_DIAMOND, ITEM_DIAMOND, 0,
         0, ITEM_STICK, 0,
         0, ITEM_STICK, 0}, 3, 3);
    
    // --- OTHER ---
    // Crafting Table: 4 planks in 2×2
    add("crafting_table", RecipeType::SHAPED, ITEM_CRAFTING_TABLE, 1,
        {ITEM_WOOD_PLANK, ITEM_WOOD_PLANK,
         ITEM_WOOD_PLANK, ITEM_WOOD_PLANK}, 2, 2);
    
    // Stick: 2 planks
    add("stick", RecipeType::SHAPED, ITEM_STICK, 4,
        {ITEM_WOOD_PLANK, 0,
         ITEM_WOOD_PLANK, 0}, 2, 2);
    
    // Furnace: 8 cobblestone
    add("furnace", RecipeType::SHAPED, ITEM_FURNACE, 1,
        {ITEM_COBBLESTONE, ITEM_COBBLESTONE, ITEM_COBBLESTONE,
         ITEM_COBBLESTONE, 0, ITEM_COBBLESTONE,
         ITEM_COBBLESTONE, ITEM_COBBLESTONE, ITEM_COBBLESTONE}, 3, 3);
    
    // Chest: 8 planks
    add("chest", RecipeType::SHAPED, ITEM_CHEST, 1,
        {ITEM_WOOD_PLANK, ITEM_WOOD_PLANK, ITEM_WOOD_PLANK,
         ITEM_WOOD_PLANK, 0, ITEM_WOOD_PLANK,
         ITEM_WOOD_PLANK, ITEM_WOOD_PLANK, ITEM_WOOD_PLANK}, 3, 3);
    
    // =========================================================
    // SHAPELESS RECIPES
    // =========================================================
    
    // Bread: 3 wheat
    add("bread", RecipeType::SHAPELESS, ITEM_BREAD, 1, {ITEM_WHEAT, ITEM_WHEAT, ITEM_WHEAT});
    
    // =========================================================
    // FURNACE RECIPES — صهر المعادن حسب Minecraft Wiki
    // =========================================================
    addFurnace("cook_porkchop",  ITEM_RAW_PORKCHOP, ITEM_COOKED_PORKCHOP, 10.0f, 0.35f);
    addFurnace("cook_beef",      ITEM_RAW_BEEF, ITEM_COOKED_BEEF, 10.0f, 0.35f);
    addFurnace("cook_chicken",   ITEM_RAW_CHICKEN, ITEM_COOKED_CHICKEN, 10.0f, 0.35f);
    addFurnace("smelt_cobble",   ITEM_COBBLESTONE, ITEM_STONE, 10.0f, 0.1f);  // cobble → stone
    
    std::cout << "[CraftingManager] Loaded " << recipes.size() << " recipes\n";
}

// ============================================================
// RECIPE MATCHING
// ============================================================
bool CraftingManager::matchesShaped(const Recipe& recipe, const ItemID* grid, int w, int h) {
    // Check if grid size matches
    if (w < recipe.grid_width || h < recipe.grid_height) return false;
    
    // Check each position
    for (int ry = 0; ry < recipe.grid_height; ry++) {
        for (int rx = 0; rx < recipe.grid_width; rx++) {
            ItemID required = recipe.grid[ry * 3 + rx].item_id;
            ItemID provided = grid[ry * w + rx];
            
            if (required == 0 && provided != 0) return false;  // should be empty
            if (required != 0 && provided != required) return false;  // wrong item
        }
    }
    
    // Check that there are no extra items outside the recipe grid
    for (int gy = 0; gy < h; gy++) {
        for (int gx = 0; gx < w; gx++) {
            if (gx >= recipe.grid_width || gy >= recipe.grid_height) {
                if (grid[gy * w + gx] != 0) return false;
            }
        }
    }
    
    return true;
}

bool CraftingManager::matchesShapeless(const Recipe& recipe, const ItemID* grid, int grid_size) {
    // Count how many of each ingredient we have
    std::vector<int> ingredient_counts(recipe.ingredients.size(), 0);
    std::vector<bool> grid_used(grid_size, false);
    
    for (size_t i = 0; i < recipe.ingredients.size(); i++) {
        for (int j = 0; j < grid_size; j++) {
            if (!grid_used[j] && grid[j] == recipe.ingredients[i].item_id) {
                ingredient_counts[i]++;
                grid_used[j] = true;
                break;
            }
        }
    }
    
    // Check all ingredients satisfied
    for (size_t i = 0; i < recipe.ingredients.size(); i++) {
        if (ingredient_counts[i] < recipe.ingredients[i].count) return false;
    }
    
    return true;
}

const Recipe* CraftingManager::findCrafting2x2(ItemID grid[4]) const {
    // Convert 2×2 grid to 3×3 grid (top-left)
    ItemID grid3x3[9] = {};
    grid3x3[0] = grid[0];  grid3x3[1] = grid[1];
    grid3x3[3] = grid[2];  grid3x3[4] = grid[3];
    
    for (const auto& recipe : recipes) {
        if (recipe.type != RecipeType::SHAPED && recipe.type != RecipeType::SHAPELESS) continue;
        if (recipe.type == RecipeType::SHAPED) {
            if (matchesShaped(recipe, grid3x3, 3, 3)) {
                return &recipe;
            }
        } else {
            if (matchesShapeless(recipe, grid3x3, 9)) {
                return &recipe;
            }
        }
    }
    return nullptr;
}

const Recipe* CraftingManager::findCrafting3x3(ItemID grid[9]) const {
    for (const auto& recipe : recipes) {
        if (recipe.type != RecipeType::SHAPED && recipe.type != RecipeType::SHAPELESS) continue;
        if (recipe.type == RecipeType::SHAPED) {
            if (matchesShaped(recipe, grid, 3, 3)) {
                return &recipe;
            }
        } else {
            if (matchesShapeless(recipe, grid, 9)) {
                return &recipe;
            }
        }
    }
    return nullptr;
}

const Recipe* CraftingManager::findFurnaceRecipe(ItemID input) const {
    for (const auto& recipe : recipes) {
        if (recipe.type == RecipeType::FURNACE && recipe.input_item == input) {
            return &recipe;
        }
    }
    return nullptr;
}
