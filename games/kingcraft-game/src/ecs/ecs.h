#ifndef KINGCRAFT_ECS_H
#define KINGCRAFT_ECS_H

#include "core/types.h"
#include <cstdint>
#include <vector>
#include <unordered_map>
#include <bitset>
#include <memory>
#include <cassert>
#include <algorithm>
#include <functional>

// ============================================================
// ECS — Entity Component System
// ============================================================
// Architecture: archetype Sparse Set (نمط EnTT)
// Entity = uint32_t ID + version
// Component = struct
// System = function

using EntityID = uint32_t;
constexpr EntityID INVALID_ENTITY = 0xFFFFFFFF;
constexpr uint8_t MAX_COMPONENTS = 32;

using ComponentMask = std::bitset<MAX_COMPONENTS>;

// === ENTITY ===
struct Entity {
    EntityID id = INVALID_ENTITY;
    uint16_t version = 0;
    
    bool valid() const { return id != INVALID_ENTITY; }
    bool operator==(const Entity& o) const { return id == o.id && version == o.version; }
    bool operator!=(const Entity& o) const { return !(*this == o); }
};

// === COMPONENT TYPE ID ===
// نحصل على ID فريد لكل Component باستخدام static local
inline uint8_t getNextComponentTypeID() {
    static uint8_t counter = 0;
    return counter++;
}

template<typename T>
uint8_t getComponentTypeID() {
    static uint8_t id = getNextComponentTypeID();
    return id;
}

// === COMPONENT POOL ===
class IComponentPool {
public:
    virtual ~IComponentPool() = default;
    virtual void remove(size_t index) = 0;
    virtual void clear() = 0;
    virtual size_t size() const = 0;
};

template<typename T>
class ComponentPool : public IComponentPool {
public:
    T& get(size_t index) { return data[index]; }
    const T& get(size_t index) const { return data[index]; }
    
    size_t add(const T& component) {
        size_t idx = data.size();
        data.push_back(component);
        return idx;
    }
    
    void remove(size_t index) override {
        if (index < data.size() - 1) {
            data[index] = data.back();
        }
        data.pop_back();
    }
    
    void clear() override { data.clear(); }
    size_t size() const override { return data.size(); }

private:
    std::vector<T> data;
};

// === ENTITY MANAGER ===
class EntityManager {
public:
    Entity createEntity() {
        EntityID id;
        uint16_t version;
        
        if (!free_list.empty()) {
            id = free_list.back();
            free_list.pop_back();
            version = entities[id].version;
        } else {
            id = next_id++;
            if (id >= MAX_ENTITIES) {
                // Pool exhausted, reuse oldest
                id = 0;
                while (id < MAX_ENTITIES && entities[id].valid) id++;
                version = entities[id].version + 1;
            } else {
                version = 0;
            }
        }
        
        auto& entry = entities[id];
        entry.id = id;
        entry.version = version;
        entry.valid = true;
        entry.mask.reset();
        
        Entity entity;
        entity.id = id;
        entity.version = version;
        return entity;
    }
    
    void destroyEntity(Entity entity) {
        if (!isValid(entity)) return;
        
        auto& entry = entities[entity.id];
        // Remove all components
        for (uint8_t i = 0; i < MAX_COMPONENTS; i++) {
            if (entry.mask.test(i) && i < pools.size() && pools[i]) {
                pools[i]->remove(entry.indices[i]);
            }
        }
        
        entry.valid = false;
        entry.mask.reset();
        free_list.push_back(entity.id);
    }
    
    bool isValid(Entity entity) const {
        if (entity.id >= MAX_ENTITIES) return false;
        const auto& entry = entities[entity.id];
        return entry.valid && entry.version == entity.version;
    }
    
    // === COMPONENTS ===
    template<typename T>
    T& addComponent(Entity entity, const T& component = T()) {
        assert(isValid(entity));
        uint8_t tid = getComponentTypeID<T>();
        ensurePool<T>();
        
        auto& pool = *static_cast<ComponentPool<T>*>(pools[tid].get());
        size_t idx = pool.add(component);
        
        auto& entry = entities[entity.id];
        entry.mask.set(tid);
        entry.indices[tid] = idx;
        
        return pool.get(idx);
    }
    
    template<typename T>
    void removeComponent(Entity entity) {
        if (!isValid(entity)) return;
        uint8_t tid = getComponentTypeID<T>();
        auto& entry = entities[entity.id];
        if (!entry.mask.test(tid) || tid >= pools.size() || !pools[tid]) return;
        
        auto& pool = *static_cast<ComponentPool<T>*>(pools[tid].get());
        size_t idx = entry.indices[tid];
        size_t last = pool.size() - 1;
        
        if (idx < last) {
            // Update the entity whose component was at the end
            for (auto& e : entities) {
                if (e.valid && e.mask.test(tid) && e.indices[tid] == last) {
                    e.indices[tid] = idx;
                    break;
                }
            }
        }
        
        pool.remove(idx);
        entry.mask.reset(tid);
    }
    
    template<typename T>
    T* getComponent(Entity entity) {
        if (!isValid(entity)) return nullptr;
        uint8_t tid = getComponentTypeID<T>();
        auto& entry = entities[entity.id];
        if (!entry.mask.test(tid) || tid >= pools.size() || !pools[tid]) return nullptr;
        
        auto& pool = *static_cast<ComponentPool<T>*>(pools[tid].get());
        return &pool.get(entry.indices[tid]);
    }
    
    template<typename T>
    const T* getComponent(Entity entity) const {
        if (!isValid(entity)) return nullptr;
        uint8_t tid = getComponentTypeID<T>();
        const auto& entry = entities[entity.id];
        if (!entry.mask.test(tid) || tid >= pools.size() || !pools[tid]) return nullptr;
        
        const auto& pool = *static_cast<const ComponentPool<T>*>(pools[tid].get());
        return &pool.get(entry.indices[tid]);
    }
    
    template<typename T>
    bool hasComponent(Entity entity) const {
        if (!isValid(entity)) return false;
        uint8_t tid = getComponentTypeID<T>();
        return entities[entity.id].mask.test(tid);
    }
    
    // === QUERY ===
    template<typename... Ts, typename F>
    void each(F&& callback) {
        ComponentMask mask;
        ((mask.set(getComponentTypeID<Ts>()), ...));
        
        for (auto& entry : entities) {
            if (!entry.valid) continue;
            if ((entry.mask & mask) != mask) continue;
            
            Entity e;
            e.id = entry.id;
            e.version = entry.version;
            
            callback(e, 
                static_cast<ComponentPool<Ts>*>(pools[getComponentTypeID<Ts>()].get())
                    ->get(entry.indices[getComponentTypeID<Ts>()])...);
        }
    }
    
    template<typename... Ts, typename F>
    void each(F&& callback) const {
        ComponentMask mask;
        ((mask.set(getComponentTypeID<Ts>()), ...));
        
        for (const auto& entry : entities) {
            if (!entry.valid) continue;
            if ((entry.mask & mask) != mask) continue;
            
            Entity e;
            e.id = entry.id;
            e.version = entry.version;
            
            callback(e, 
                static_cast<const ComponentPool<Ts>*>(pools[getComponentTypeID<Ts>()].get())
                    ->get(entry.indices[getComponentTypeID<Ts>()])...);
        }
    }
    
    void clear();
    
    size_t entityCount() const { 
        size_t count = 0;
        for (const auto& e : entities) if (e.valid) count++;
        return count;
    }
    
private:
    static constexpr size_t MAX_ENTITIES = 65536;
    
    struct EntityEntry {
        uint32_t id = INVALID_ENTITY;
        uint16_t version = 0;
        bool valid = false;
        ComponentMask mask;
        size_t indices[MAX_COMPONENTS] = {0};
    };
    
    EntityEntry entities[MAX_ENTITIES];
    std::vector<EntityID> free_list;
    EntityID next_id = 0;
    
    std::vector<std::unique_ptr<IComponentPool>> pools;
    
    template<typename T>
    void ensurePool() {
        uint8_t tid = getComponentTypeID<T>();
        while (pools.size() <= tid) {
            pools.push_back(nullptr);
        }
        if (!pools[tid]) {
            pools[tid] = std::make_unique<ComponentPool<T>>();
        }
    }
};

#endif // KINGCRAFT_ECS_H
