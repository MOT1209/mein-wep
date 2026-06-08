#ifndef KINGCRAFT_PLAYER_H
#define KINGCRAFT_PLAYER_H

#include "core/types.h"
#include "world/chunk.h"

// ============================================================
// PLAYER
// ============================================================
class Player {
public:
    Player();
    ~Player() = default;
    
    // الموقع
    Vec3f getPosition() const { return position; }
    Vec3f getFront() const { return front; }
    Vec3f getUp() const { return up; }
    Vec3f getVelocity() const { return velocity; }
    
    void setPosition(const Vec3f& pos) { position = pos; }
    
    // الكاميرا
    float getYaw() const { return yaw; }
    float getPitch() const { return pitch; }
    void setRotation(float y, float p) { yaw = y; pitch = p; recalcVectors(); }
    
    // الحركة (كل frame)
    void update(float delta_time, ChunkManager& world);
    void handleInput(bool w, bool s, bool a, bool d, bool space, bool shift);
    
    // التفاعل
    void clickBlock(ChunkManager& world, bool left_click);  // true=break, false=place
    void setTargetBlock(const RaycastHit& hit) { target = hit; }
    const RaycastHit& getTargetBlock() const { return target; }
    
    // Game mode
    void setGameMode(GameMode mode) { gamemode = mode; }
    GameMode getGameMode() const { return gamemode; }
    
    // الإحصائيات
    float getHealth() const { return health; }
    float getMaxHealth() const { return max_health; }
    float getHunger() const { return hunger; }
    void damage(float amount);
    void heal(float amount);
    
    // المخزون
    ItemStack* getInventory() { return inventory; }
    const ItemStack* getInventory() const { return inventory; }
    int getSelectedSlot() const { return selected_slot; }
    void setSelectedSlot(int slot) { if(slot>=0 && slot<9) selected_slot = slot; }
    ItemStack getSelectedItem() const { return inventory[selected_slot]; }
    
    bool addItem(ItemID id, int count);
    bool removeItem(int slot, int count);
    void dropItem(int slot, int count);

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
    
    // Stats
    float health = 20.0f;
    float max_health = 20.0f;
    float hunger = 20.0f;
    
    // Inventory
    ItemStack inventory[36];  // 0-8 hotbar, 9-35 main
    int selected_slot = 0;    // 0-8
    
    // Game mode
    GameMode gamemode = GameMode::CREATIVE;  // start in creative for testing
    
    void recalcVectors();
    void applyPhysics(float delta_time, ChunkManager& world);
    bool checkCollision(const Vec3f& pos, ChunkManager& world) const;
    RaycastHit raycast(ChunkManager& world, float max_dist);
};

#endif // KINGCRAFT_PLAYER_H
