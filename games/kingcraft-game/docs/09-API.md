# API Design

> **Web API:** REST over HTTPS (for backend services)  
> **Plugin API:** Lua 5.4 sandboxed runtime  
> **RPC API:** WebSocket for real-time server management

---

## 1. REST API (HTTP/HTTPS)

### 1.1 Base URL

```
Production:  https://api.kingcraft.game/v1
Development: http://localhost:8080/v1
```

### 1.2 Authentication

```
Header: Authorization: Bearer <jwt_token>

JWT Payload:
{
  "sub": "player_id",
  "steam_id": "76561198000000000",
  "username": "PlayerName",
  "role": "user",           // user, mod, admin, console
  "iat": 1234567890,
  "exp": 1234568490
}
```

### 1.3 Endpoints

#### Players

```
GET    /v1/players/:id                    Get player profile
GET    /v1/players/search?q=username      Search players
PATCH  /v1/players/:id                    Update profile (display name, settings)
GET    /v1/players/:id/stats              Get player statistics
GET    /v1/players/:id/inventory          Get offline inventory snapshot
GET    /v1/players/:id/skills             Get skill data

POST   /v1/players/:id/ban                Ban player (admin)
POST   /v1/players/:id/mute               Mute player (mod)
POST   /v1/players/:id/kick               Kick player (mod)
DELETE /v1/players/:id/ban                Unban player (admin)
```

#### Servers

```
GET    /v1/servers                        List all servers
GET    /v1/servers/:id                    Get server details
POST   /v1/servers                        Register new server (console)
PATCH  /v1/servers/:id                    Update server status
DELETE /v1/servers/:id                    Deregister server
POST   /v1/servers/:id/command            Execute console command
GET    /v1/servers/:id/logs               Get server logs (query: ?lines=100)
GET    /v1/servers/:id/players            Get online players
```

#### Clans

```
GET    /v1/clans                          List clans (query: ?page=1&limit=20)
GET    /v1/clans/:id                      Get clan details
POST   /v1/clans                          Create clan
PATCH  /v1/clans/:id                      Update clan (leader only)
DELETE /v1/clans/:id                      Disband clan (leader only)
POST   /v1/clans/:id/invite               Invite player
POST   /v1/clans/:id/kick/:player_id      Kick member (officer+)
POST   /v1/clans/:id/promote/:player_id   Promote member (leader)
POST   /v1/clans/:id/demote/:player_id    Demote member (leader)
GET    /v1/clans/:id/bank                 Get clan bank balance
POST   /v1/clans/:id/bank/deposit         Deposit to clan bank
POST   /v1/clans/:id/bank/withdraw        Withdraw from clan bank
```

#### Economy

```
GET    /v1/economy/balance/:player_id     Get player balance
POST   /v1/economy/transfer               Transfer currency between players
POST   /v1/economy/reward                 Issue reward (admin)
GET    /v1/economy/market/listings        Browse market
POST   /v1/economy/market/listings        Create listing
DELETE /v1/economy/market/listings/:id    Cancel listing
POST   /v1/economy/market/listings/:id/buy  Buy listing
GET    /v1/economy/transactions/:player_id  Get transaction history
```

#### Quests

```
GET    /v1/quests                         List all quests
GET    /v1/quests/:id                     Get quest details
GET    /v1/players/:id/quests             Get player quest progress
POST   /v1/players/:id/quests/:quest_id/claim  Claim quest rewards
GET    /v1/players/:id/achievements       Get player achievements
```

#### Moderation

```
GET    /v1/moderation/reports             List reports (query: ?status=pending)
POST   /v1/moderation/reports             Submit report
PATCH  /v1/moderation/reports/:id         Update report status (mod)
GET    /v1/moderation/bans                List bans
GET    /v1/moderation/bans/:id            Get ban details
POST   /v1/moderation/bans                Create ban (admin)
DELETE /v1/moderation/bans/:id            Remove ban (admin)
```

#### Admin

```
POST   /v1/admin/announce                 Send global announcement
POST   /v1/admin/save-all                 Force save all worlds
POST   /v1/admin/restart/:server_id       Restart server
POST   /v1/admin/backup                   Create world backup
POST   /v1/admin/restore                  Restore from backup
GET    /v1/admin/metrics                  Get server metrics
GET    /v1/admin/logs                     Get admin action logs
```

### 1.4 Response Format

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": 1717000000,
    "version": "1.0.0"
  }
}
```

### 1.5 Error Format

```json
{
  "success": false,
  "error": {
    "code": "PLAYER_NOT_FOUND",
    "message": "Player with ID 12345 was not found.",
    "details": {
      "player_id": 12345
    }
  },
  "meta": {
    "request_id": "req_def456",
    "timestamp": 1717000000
  }
}
```

---

## 2. Plugin/Lua API

### 2.1 API Namespaces

```lua
-- Global API table
kingcraft = {
    -- Core
    log = function(level, message) end,
    
    -- Blocks
    blocks = {
        register = function(block_def) end,
        get = function(block_id) end,
        set = function(pos, block_id, state) end,
        get_block = function(pos) end,
        set_block_state = function(pos, state, value) end,
        get_block_state = function(pos, state) end,
        is_loaded = function(pos) end,
    },
    
    -- Items
    items = {
        register = function(item_def) end,
        get = function(item_id) end,
        give = function(player, item_id, count, components) end,
        take = function(player, item_id, count) end,
        has = function(player, item_id, count) end,
    },
    
    -- Entities
    entities = {
        create = function(entity_type, pos, data) end,
        remove = function(entity_id) end,
        get = function(entity_id) end,
        find = function(filter) end,
        spawn = function(entity_type, pos) end,
    },
    
    -- Players
    players = {
        get = function(player_id) end,
        get_by_name = function(name) end,
        get_nearby = function(pos, radius) end,
        message = function(player, message) end,
        kick = function(player, reason) end,
        ban = function(player, reason, duration) end,
        teleport = function(player, pos) end,
        damage = function(player, amount, cause) end,
        heal = function(player, amount) end,
        set_health = function(player, health) end,
        get_inventory = function(player) end,
    },
    
    -- World
    world = {
        get_time = function() end,
        set_time = function(time) end,
        get_seed = function() end,
        get_biome = function(pos) end,
        is_night = function() end,
        is_raining = function() end,
        set_weather = function(weather_type) end,
        find_spawn = function(biome) end,
        spawn_particle = function(pos, particle_type, count) end,
        play_sound = function(sound_id, pos, volume, pitch) end,
    },
    
    -- Events
    events = {
        on = function(event_name, callback) end,
        off = function(event_name, callback) end,
        emit = function(event_name, ...) end,
    },
    
    -- Commands
    commands = {
        register = function(name, callback, permission) end,
        unregister = function(name) end,
    },
    
    -- Scheduler
    scheduler = {
        delay = function(delay_ms, callback) end,
        repeat = function(interval_ms, callback, times) end,
        cancel = function(task_id) end,
    },
    
    -- Storage (key-value persistence)
    storage = {
        set = function(key, value) end,
        get = function(key) end,
        delete = function(key) end,
        exists = function(key) end,
        keys = function(pattern) end,
    },
    
    -- HTTP
    http = {
        get = function(url, headers, callback) end,
        post = function(url, headers, body, callback) end,
    },
    
    -- Database (SQL)
    db = {
        query = function(sql, params, callback) end,
        execute = function(sql, params, callback) end,
    },
    
    -- Permissions
    permissions = {
        has = function(player, permission) end,
        add = function(player, permission) end,
        remove = function(player, permission) end,
        group_add = function(group, permission) end,
    }
}
```

### 2.2 Event System

```lua
-- Available events
kingcraft.events.on("player_join", function(player)
    kingcraft.log.info(player.name .. " joined the game!")
    kingcraft.players.message(player, "Welcome to KingCraft!")
end)

kingcraft.events.on("player_leave", function(player)
    kingcraft.log.info(player.name .. " left the game.")
end)

kingcraft.events.on("player_death", function(player, cause, killer)
    if killer then
        kingcraft.broadcast(player.name .. " was killed by " .. killer.name)
    end
end)

kingcraft.events.on("block_break", function(player, pos, block_id)
    if block_id == "kingcraft:titanium_ore" then
        kingcraft.broadcast(player.name .. " found titanium at " .. pos.x .. ", " .. pos.z .. "!")
    end
end)

kingcraft.events.on("block_place", function(player, pos, block_id)
    -- Check for griefing
    if block_id == "minecraft:tnt" and not kingcraft.permissions.has(player, "can.place.tnt") then
        kingcraft.blocks.set(pos, "minecraft:air")
        kingcraft.players.message(player, "You don't have permission to place TNT!")
        return false  -- cancel event
    end
end)

kingcraft.events.on("player_chat", function(player, message)
    -- Filter profanity
    if contains_bad_word(message) then
        return false  -- cancel message
    end
end)

kingcraft.events.on("damage_taken", function(entity, damage, damage_type)
    -- Custom damage logic
    if damage_type == "fall" and entity:has_item("kingcraft:parachute") then
        return 0  -- negate fall damage
    end
end)
```

### 2.3 Command Registration

```lua
kingcraft.commands.register("heal", function(sender, args)
    if #args == 0 then
        kingcraft.players.heal(sender, 20.0)
        kingcraft.players.message(sender, "You have been healed!")
    else
        local target = kingcraft.players.get_by_name(args[1])
        if target then
            kingcraft.players.heal(target, 20.0)
            kingcraft.players.message(sender, "Healed " .. target.name)
        end
    end
end, "kingcraft.command.heal")

kingcraft.commands.register("gamemode", function(sender, args)
    if #args < 1 then
        kingcraft.players.message(sender, "Usage: /gamemode <survival|creative> [player]")
        return
    end
    
    local target = sender
    if #args >= 2 then
        target = kingcraft.players.get_by_name(args[2])
    end
    
    if not target then
        kingcraft.players.message(sender, "Player not found!")
        return
    end
    
    target:set_gamemode(args[1])
end, "kingcraft.command.gamemode")
```

---

## 3. WebSocket API (Real-time)

```
ws://api.kingcraft.game/v1/ws?token=<jwt_token>

MESSAGES:

Server → Client:
  {
    "type": "server_status",
    "data": {
      "server_id": "eu-01",
      "players": 45,
      "max_players": 100,
      "tps": 20.0,
      "uptime": 12345
    }
  }

  {
    "type": "player_joined",
    "data": {
      "player_id": 12345,
      "username": "Player",
      "server_id": "eu-01"
    }
  }

  {
    "type": "player_left",
    "data": {
      "player_id": 12345,
      "username": "Player",
      "server_id": "eu-01"
    }
  }

  {
    "type": "console_output",
    "data": {
      "server_id": "eu-01",
      "line": "[INFO] Player placed block at (123, 64, -456)",
      "timestamp": 1717000000
    }
  }

Client → Server:
  {
    "type": "execute_command",
    "data": {
      "server_id": "eu-01",
      "command": "/say Hello!"
    }
  }

  {
    "type": "subscribe_events",
    "data": {
      "events": ["player_join", "player_leave", "server_status"]
    }
  }
```

---

*End of API Design Document*

Next: [Development Roadmap →](./10-ROADMAP.md)
