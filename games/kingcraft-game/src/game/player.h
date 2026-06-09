#ifndef KINGCRAFT_PLAYER_H
#define KINGCRAFT_PLAYER_H

#include "core/types.h"
#include "world/chunk.h"
#include "game/items.h"

// ============================================================
// PLAYER
// ============================================================
class Player {
public:
    Player();
    ~Player() = default;
    
    // === LOCATION ===
    Vec3f getPosition() const { return position; }
    Vec3f getFront() const { return front; }
    Vec3f getUp() const { return up; }
    Vec3f getVelocity() const { return velocity; }
    void setPosition(const Vec3f& pos) { position = pos; }
    
    // === CAMERA ===
    float getYaw() const { return yaw; }
    float getPitch() const { return pitch; }
    void setRotation(float y, float p) { yaw = y; pitch = p; recalcVectors(); }
    
    // === MOVEMENT ===
    void update(float delta_time, ChunkManager& world);
    void handleInput(bool w, bool s, bool a, bool d, bool space, bool shift);
    
    // === INTERACTION ===
    void clickBlock(ChunkManager& world, bool left_click);  // true=break, false=place
    void setTargetBlock(const RaycastHit& hit) { target = hit; }
    const RaycastHit& getTargetBlock() const { return target; }
    
    // === GAME MODE ===
    void setGameMode(GameMode mode) { gamemode = mode; }
    GameMode getGameMode() const { return gamemode; }
    
    // === STATS (Survival) ===
    float getHealth() const { return health; }
    float getMaxHealth() const { return max_health; }
    float getHunger() const { return hunger; }
    float getMaxHunger() const { return max_hunger; }
    float getSaturation() const { return saturation; }
    int getLevel() const { return level; }
    float getXp() const { return xp; }
    
    void damage(float amount);
    void heal(float amount);
    void eat(ItemID food);              // Eat food item
    void addXp(float amount);
    
    // === INVENTORY ===
    ItemStack* getInventory() { return inventory; }
    const ItemStack* getInventory() const { return inventory; }
    int getSelectedSlot() const { return selected_slot; }
    void setSelectedSlot(int slot) { if(slot>=0 && slot<9) selected_slot = slot; }
    ItemStack getSelectedItem() const { return inventory[selected_slot]; }
    void getHotbar(ItemStack out[9]) const { for (int i = 0; i < 9; i++) out[i] = inventory[i]; }
    
    bool addItem(ItemID id, int count);
    bool removeItem(int slot, int count);
    void dropItem(int slot, int count);
    bool hasItems(ItemID id, int count) const;
    int countItem(ItemID id) const;
    
    // === SURVIVAL ===
    bool isSurvival() const { return gamemode == GameMode::SURVIVAL; }
    float getBreakProgress() const { return break_progress; }
    BlockID getBlockBeingBroken(ChunkManager& world) const { 
        if (break_progress > 0 && getTargetBlock().hit) 
            return world.getWorldBlock(
                getTargetBlock().block_pos.x, getTargetBlock().block_pos.y, getTargetBlock().block_pos.z);
        return BLOCK_AIR;
    }

private:
    Vec3f position{0, 80, 0};
    Vec3f front{0, 0, -1};
    Vec3f up{0, 1, 0};
    Vec3f right{1, 0, 0};
    Vec3f velocity{0, 0, 0};
    
    float yaw = 0.0f;
    float pitch = 0.0f;
    
    // Movement
    float speed = 5.0f;
    float sprint_speed = 8.0f;
    float jump_velocity = 8.0f;
    bool on_ground = false;
    bool is_sprinting = false;
    float gravity = -20.0f;
    
    // Interaction
    RaycastHit target;
    float reach_distance = 5.0f;
    float break_progress = 0.0f;
    Vec3i breaking_block{0, -1, 0};
    float break_time_needed = 0.0f;
    
    // Stats
    float health = 20.0f;
    float max_health = 20.0f;
    float hunger = 20.0f;
    float max_hunger = 20.0f;
    float saturation = 5.0f;        // saturation decreases before hunger
    float exhaustion = 0.0f;        // builds up from actions, then decreases saturation
    
    int level = 0;
    float xp = 0.0f;
    float xp_to_next = 7.0f;       // first level needs 7 XP
    
    // Inventory
    ItemStack inventory[36];  // 0-8 hotbar, 9-35 main
    int selected_slot = 0;    // 0-8
    
    // Game mode
    GameMode gamemode = GameMode::CREATIVE;
    
    // Internal helper
    void recalcVectors();
    void applyPhysics(float delta_time, ChunkManager& world);
    bool checkCollision(const Vec3f& pos, ChunkManager& world) const;
    RaycastHit raycast(ChunkManager& world, float max_dist);
    
    // Survival helpers
    void applyExhaustion(float amount);     // walking, mining, jumping = exhaustion
    void breakBlock(ChunkManager& world);   // break block and drop items
    void dropItems(ChunkManager& world, const Vec3i& block_pos, BlockID block);
};

#endif // KINGCRAFT_PLAYER_H
