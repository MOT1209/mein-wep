#include "world/block_registry.h"
#include <fstream>
#include <iostream>
#include <nlohmann/json.hpp>
using json = nlohmann::json;

void BlockRegistry::init() {
    blocks.clear();
    name_to_id.clear();
    id_to_name.clear();
    
    // ---- BLOCK 0: AIR ----
    BlockProperties air;
    air.name_id = "minecraft:air";
    air.numeric_id = 0;
    air.hardness = 0;
    air.resistance = 0;
    air.is_solid = false;
    air.is_transparent = true;
    air.opacity = 0;
    blocks.push_back(air);
    name_to_id["minecraft:air"] = 0;
    id_to_name[0] = "minecraft:air";
    
    // ---- BLOCK 1: STONE ----
    BlockProperties stone;
    stone.name_id = "minecraft:stone";
    stone.numeric_id = 1;
    stone.hardness = 1.5f;
    stone.resistance = 6.0f;
    stone.tool_type = "pickaxe";
    stone.min_tier = 0;
    stone.drop_item = "minecraft:cobblestone";
    stone.sound = "stone";
    stone.top_tex = 0;
    stone.side_tex = 1;
    stone.bottom_tex = 1;
    blocks.push_back(stone);
    name_to_id["minecraft:stone"] = 1;
    id_to_name[1] = "minecraft:stone";
    
    // ---- BLOCK 2: DIRT ----
    BlockProperties dirt;
    dirt.name_id = "minecraft:dirt";
    dirt.numeric_id = 2;
    dirt.hardness = 0.5f;
    dirt.resistance = 0.5f;
    dirt.tool_type = "shovel";
    dirt.drop_item = "minecraft:dirt";
    dirt.sound = "gravel";
    dirt.top_tex = 2;
    dirt.side_tex = 2;
    dirt.bottom_tex = 2;
    blocks.push_back(dirt);
    name_to_id["minecraft:dirt"] = 2;
    id_to_name[2] = "minecraft:dirt";
    
    // ---- BLOCK 3: GRASS ----
    BlockProperties grass;
    grass.name_id = "minecraft:grass_block";
    grass.numeric_id = 3;
    grass.hardness = 0.6f;
    grass.resistance = 0.6f;
    grass.tool_type = "shovel";
    grass.drop_item = "minecraft:dirt";
    grass.sound = "grass";
    grass.top_tex = 3;
    grass.side_tex = 4;
    grass.bottom_tex = 2;
    blocks.push_back(grass);
    name_to_id["minecraft:grass_block"] = 3;
    id_to_name[3] = "minecraft:grass_block";
    
    // ---- BLOCK 4: SAND ----
    BlockProperties sand;
    sand.name_id = "minecraft:sand";
    sand.numeric_id = 4;
    sand.hardness = 0.5f;
    sand.resistance = 0.5f;
    sand.tool_type = "shovel";
    sand.drop_item = "minecraft:sand";
    sand.sound = "sand";
    sand.top_tex = 5;
    sand.side_tex = 5;
    sand.bottom_tex = 5;
    blocks.push_back(sand);
    name_to_id["minecraft:sand"] = 4;
    id_to_name[4] = "minecraft:sand";
    
    // ---- BLOCK 5: WATER ----
    BlockProperties water;
    water.name_id = "minecraft:water";
    water.numeric_id = 5;
    water.hardness = 100.0f;
    water.resistance = 100.0f;
    water.is_solid = false;
    water.is_transparent = true;
    water.is_fluid = true;
    water.opacity = 0.3f;
    water.luminance = 0;
    water.top_tex = 31;
    water.side_tex = 31;
    water.sound = "water";
    blocks.push_back(water);
    name_to_id["minecraft:water"] = 5;
    id_to_name[5] = "minecraft:water";
    
    // ---- BLOCK 6: OAK LOG ----
    BlockProperties log;
    log.name_id = "minecraft:oak_log";
    log.numeric_id = 6;
    log.hardness = 2.0f;
    log.resistance = 2.0f;
    log.tool_type = "axe";
    log.drop_item = "minecraft:oak_log";
    log.sound = "wood";
    log.top_tex = 7;
    log.side_tex = 8;
    log.bottom_tex = 7;
    blocks.push_back(log);
    name_to_id["minecraft:oak_log"] = 6;
    id_to_name[6] = "minecraft:oak_log";
    
    // ---- BLOCK 7: OAK PLANKS ----
    BlockProperties planks;
    planks.name_id = "minecraft:oak_planks";
    planks.numeric_id = 7;
    planks.hardness = 2.0f;
    planks.resistance = 3.0f;
    planks.tool_type = "axe";
    planks.drop_item = "minecraft:oak_planks";
    planks.sound = "wood";
    planks.top_tex = 9;
    planks.side_tex = 9;
    planks.bottom_tex = 9;
    blocks.push_back(planks);
    name_to_id["minecraft:oak_planks"] = 7;
    id_to_name[7] = "minecraft:oak_planks";
    
    // ---- BLOCK 8: OAK LEAVES ----
    BlockProperties leaves;
    leaves.name_id = "minecraft:oak_leaves";
    leaves.numeric_id = 8;
    leaves.hardness = 0.2f;
    leaves.resistance = 0.2f;
    leaves.is_solid = true;
    leaves.is_transparent = true;
    leaves.opacity = 0.5f;
    leaves.tool_type = "shears";
    leaves.drop_item = "minecraft:oak_leaves";
    leaves.drop_min = 0;  // Sometimes drops nothing
    leaves.drop_max = 0;
    leaves.sound = "grass";
    leaves.top_tex = 10;
    leaves.side_tex = 10;
    leaves.bottom_tex = 10;
    blocks.push_back(leaves);
    name_to_id["minecraft:oak_leaves"] = 8;
    id_to_name[8] = "minecraft:oak_leaves";
    
    // ---- BLOCK 9: COBBLESTONE ----
    BlockProperties cobble;
    cobble.name_id = "minecraft:cobblestone";
    cobble.numeric_id = 9;
    cobble.hardness = 2.0f;
    cobble.resistance = 6.0f;
    cobble.tool_type = "pickaxe";
    cobble.drop_item = "minecraft:cobblestone";
    cobble.sound = "stone";
    cobble.top_tex = 11;
    cobble.side_tex = 11;
    cobble.bottom_tex = 11;
    blocks.push_back(cobble);
    name_to_id["minecraft:cobblestone"] = 9;
    id_to_name[9] = "minecraft:cobblestone";
    
    // ---- BLOCK 10: BEDROCK ----
    BlockProperties bedrock;
    bedrock.name_id = "minecraft:bedrock";
    bedrock.numeric_id = 10;
    bedrock.hardness = -1.0f;  // unbreakable
    bedrock.resistance = 18000000.0f;
    bedrock.tool_type = "none";
    bedrock.drop_item = "";
    bedrock.sound = "stone";
    bedrock.top_tex = 12;
    bedrock.side_tex = 12;
    bedrock.bottom_tex = 12;
    blocks.push_back(bedrock);
    name_to_id["minecraft:bedrock"] = 10;
    id_to_name[10] = "minecraft:bedrock";
    
    // ---- BLOCK 11: SNOW (top block) ----
    BlockProperties snow;
    snow.name_id = "minecraft:snow";
    snow.numeric_id = 11;
    snow.hardness = 0.1f;
    snow.resistance = 0.1f;
    snow.is_solid = false;
    snow.is_transparent = true;
    snow.opacity = 0.2f;
    snow.tool_type = "shovel";
    snow.drop_item = "";
    snow.sound = "snow";
    snow.top_tex = 13;
    snow.side_tex = 13;
    snow.bottom_tex = 13;
    blocks.push_back(snow);
    name_to_id["minecraft:snow"] = 11;
    id_to_name[11] = "minecraft:snow";
    
    std::cout << "[BlockRegistry] Loaded " << blocks.size() << " blocks\n";
}

void BlockRegistry::loadFromJson(const std::string& json_path) {
    std::ifstream file(json_path);
    if (!file.is_open()) {
        std::cerr << "[BlockRegistry] Could not open " << json_path << "\n";
        init();  // fallback to defaults
        return;
    }
    
    try {
        json j;
        file >> j;
        
        for (const auto& [key, val] : j.items()) {
            BlockProperties bp;
            bp.name_id = key;
            bp.numeric_id = val["numeric_id"];
            bp.hardness = val.value("hardness", 1.0f);
            bp.resistance = val.value("resistance", 1.0f);
            bp.luminance = val.value("luminance", 0.0f);
            bp.opacity = val.value("opacity", 1.0f);
            bp.is_solid = val.value("is_solid", true);
            bp.is_transparent = val.value("is_transparent", false);
            bp.is_fluid = val.value("is_fluid", false);
            bp.is_plant = val.value("is_plant", false);
            bp.requires_tool = val.value("requires_tool", false);
            bp.tool_type = val.value("tool_type", "");
            bp.min_tier = val.value("min_tier", 0);
            bp.drop_item = val.value("drop", "");
            bp.sound = val.value("sound", "stone");
            
            // Texture
            bp.top_tex = val.value("texture_top", bp.numeric_id);
            bp.side_tex = val.value("texture_side", bp.numeric_id);
            bp.bottom_tex = val.value("texture_bottom", bp.numeric_id);
            
            blocks.push_back(bp);
            name_to_id[key] = bp.numeric_id;
            id_to_name[bp.numeric_id] = key;
        }
    } catch (const std::exception& e) {
        std::cerr << "[BlockRegistry] JSON parse error: " << e.what() << "\n";
        init();
    }
    
    std::cout << "[BlockRegistry] Loaded " << blocks.size() << " blocks from " << json_path << "\n";
}

const BlockProperties* BlockRegistry::get(BlockID id) const {
    if (id >= blocks.size()) return nullptr;
    return &blocks[id];
}

const BlockProperties* BlockRegistry::getByName(const std::string& name_id) const {
    auto it = name_to_id.find(name_id);
    if (it == name_to_id.end()) return nullptr;
    return get(it->second);
}

BlockID BlockRegistry::getIdByName(const std::string& name_id) const {
    auto it = name_to_id.find(name_id);
    if (it == name_to_id.end()) return 0;
    return it->second;
}

float BlockRegistry::getMiningTime(BlockID block_id, const std::string& tool_type, int tool_tier) const {
    auto* bp = get(block_id);
    if (!bp || bp->hardness < 0) return -1;  // unbreakable
    
    float speed = 1.0f;  // hand speed
    
    // Tool speed multiplier
    if (tool_type == bp->tool_type) {
        switch (tool_tier) {
            case 0: speed = 1.0f; break;   // hand
            case 1: speed = 2.0f; break;   // wood
            case 2: speed = 4.0f; break;   // stone
            case 3: speed = 6.0f; break;   // iron
            case 4: speed = 8.0f; break;   // diamond
            case 5: speed = 10.0f; break;  // netherite
            default: speed = 4.0f;
        }
    } else if (bp->requires_tool) {
        speed = 0.2f;  // wrong tool = 5x slower
    }
    
    float time = bp->hardness * 1.5f / speed;
    return std::max(0.05f, time);
}

void BlockRegistry::getDrops(BlockID block_id, std::vector<ItemStack>& drops, 
                              const std::string& tool_type, int tool_tier) const {
    auto* bp = get(block_id);
    if (!bp || bp->drop_item.empty()) return;
    
    // Check if we can mine it
    if (bp->requires_tool) {
        if (tool_type != bp->tool_type) return;  // wrong tool = no drop
        if (tool_tier < bp->min_tier) return;    // wrong tier = no drop
    }
    
    ItemStack stack;
    // TODO: resolve item name → item ID
    
    stack.count = bp->drop_min;
    drops.push_back(stack);
}
