#ifndef KINGCRAFT_BLOCK_REGISTRY_H
#define KINGCRAFT_BLOCK_REGISTRY_H

#include "core/types.h"
#include <unordered_map>
#include <vector>
#include <string>

class BlockRegistry {
public:
    static BlockRegistry& instance() {
        static BlockRegistry inst;
        return inst;
    }
    
    void init();
    void loadFromJson(const std::string& json_path);
    
    const BlockProperties* get(BlockID id) const;
    const BlockProperties* getByName(const std::string& name_id) const;
    BlockID getIdByName(const std::string& name_id) const;
    
    int blockCount() const { return (int)blocks.size(); }
    const std::vector<BlockProperties>& allBlocks() const { return blocks; }
    
    // Mining time calculation
    float getMiningTime(BlockID block, const std::string& tool_type, int tool_tier) const;
    
    // Drops
    void getDrops(BlockID block, std::vector<ItemStack>& drops, const std::string& tool_type, int tool_tier) const;

private:
    BlockRegistry() = default;
    std::vector<BlockProperties> blocks;          // index = numeric_id
    std::unordered_map<std::string, BlockID> name_to_id;
    std::unordered_map<BlockID, std::string> id_to_name;
};

// ============================================================
// BLOCK STATE HELPERS
// ============================================================
namespace BlockStateHelper {
    inline uint8_t getRotation(BlockState state) { return state & 0x000F; }
    inline uint8_t getVariant(BlockState state) { return (state >> 4) & 0x000F; }
    inline bool isWaterlogged(BlockState state) { return state & STATE_WATERLOGGED; }
    inline bool isLit(BlockState state) { return state & STATE_LIT; }
    inline bool isPowered(BlockState state) { return state & STATE_POWERED; }
    inline bool isLocked(BlockState state) { return state & STATE_LOCKED; }
    
    inline BlockState setRotation(BlockState s, uint8_t v) { return (s & ~STATE_ROTATION_BITS) | (v & 0x0F); }
    inline BlockState setVariant(BlockState s, uint8_t v) { return (s & ~STATE_VARIANT_BITS) | ((v & 0x0F) << 4); }
    inline BlockState setWaterlogged(BlockState s, bool v) { return v ? (s | STATE_WATERLOGGED) : (s & ~STATE_WATERLOGGED); }
    inline BlockState setLit(BlockState s, bool v) { return v ? (s | STATE_LIT) : (s & ~STATE_LIT); }
    inline BlockState setPowered(BlockState s, bool v) { return v ? (s | STATE_POWERED) : (s & ~STATE_POWERED); }
    inline BlockState setLocked(BlockState s, bool v) { return v ? (s | STATE_LOCKED) : (s & ~STATE_LOCKED); }
}

#endif // KINGCRAFT_BLOCK_REGISTRY_H
