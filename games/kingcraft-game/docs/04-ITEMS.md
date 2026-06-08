# Item System — Complete Registry

> **Total Items:** 1024+  
> **ID Range:** 0–1023 (items), 1024–2047 (blocks registered as items)

---

## 1. Item Registry Schema

```json
{
  "$schema": "https://kingcraft.game/schemas/item_schema.json",
  "type": "object",
  "required": ["item_id", "numeric_id", "max_stack_size", "rarity"],
  "properties": {
    "item_id": { "type": "string", "pattern": "^[a-z_]+:[a-z_]+$" },
    "numeric_id": { "type": "integer", "minimum": 0, "maximum": 2047 },
    "max_stack_size": { "type": "integer", "minimum": 1, "maximum": 99 },
    "rarity": { "type": "string", "enum": ["common", "uncommon", "rare", "epic", "legendary", "mythic"] },
    "durability": { "type": "integer" },
    "food": {
      "type": "object",
      "properties": {
        "hunger": { "type": "integer" },
        "saturation": { "type": "number" },
        "effects": { "type": "array" }
      }
    },
    "tool": {
      "type": "object",
      "properties": {
        "tier": { "type": "integer" },
        "speed": { "type": "number" },
        "tool_type": { "type": "string" },
        "rules": { "type": "array" }
      }
    },
    "weapon": {
      "type": "object",
      "properties": {
        "damage": { "type": "number" },
        "speed": { "type": "number" },
        "range": { "type": "number" },
        "weapon_type": { "type": "string" }
      }
    },
    "armor": {
      "type": "object",
      "properties": {
        "slot": { "type": "string" },
        "protection": { "type": "integer" },
        "toughness": { "type": "number" },
        "knockback_resistance": { "type": "number" }
      }
    },
    "component": { "type": "object" },
    "attributes": { "type": "array" },
    "enchantments": { "type": "array" }
  }
}
```

---

## 2. Complete Item ID Table

### 2.1 Materials & Resources (ID 0–127)

| ID | Item | Namespaced ID | Max Stack | Rarity | Notes |
|----|------|---------------|-----------|--------|-------|
| 0 | Air | minecraft:air | 0 | — | Placeholder, no item |
| 1 | Stone | minecraft:stone | 64 | Common | |
| 2 | Cobblestone | minecraft:cobblestone | 64 | Common | |
| 3 | Dirt | minecraft:dirt | 64 | Common | |
| 4 | Wood Plank (Oak) | minecraft:oak_planks | 64 | Common | |
| 5 | Stick | minecraft:stick | 64 | Common | |
| 6 | Wooden Log (Oak) | minecraft:oak_log | 64 | Common | |
| 7 | Cobbled Deepslate | minecraft:cobbled_deepslate | 64 | Common | |
| 8 | Iron Ingot | minecraft:iron_ingot | 64 | Common | |
| 9 | Gold Ingot | minecraft:gold_ingot | 64 | Common | |
| 10 | Diamond | minecraft:diamond | 64 | Rare | |
| 11 | Emerald | minecraft:emerald | 64 | Rare | |
| 12 | Netherite Ingot | minecraft:netherite_ingot | 64 | Epic | |
| 13 | Copper Ingot | minecraft:copper_ingot | 64 | Common | |
| 14 | Raw Iron | minecraft:raw_iron | 64 | Common | |
| 15 | Raw Gold | minecraft:raw_gold | 64 | Common | |
| 16 | Raw Copper | minecraft:raw_copper | 64 | Common | |
| 17 | Coal | minecraft:coal | 64 | Common | |
| 18 | Charcoal | minecraft:charcoal | 64 | Common | |
| 19 | Redstone Dust | minecraft:redstone | 64 | Common | |
| 20 | Lapis Lazuli | minecraft:lapis_lazuli | 64 | Common | |
| 21 | Nether Quartz | minecraft:quartz | 64 | Common | |
| 22 | Flint | minecraft:flint | 64 | Common | |
| 23 | Clay Ball | minecraft:clay_ball | 64 | Common | |
| 24 | Brick | minecraft:brick | 64 | Common | |
| 25 | Nether Brick | minecraft:nether_brick | 64 | Common | |
| 26 | Nether Wart | minecraft:nether_wart | 64 | Common | |
| 27 | Glowstone Dust | minecraft:glowstone_dust | 64 | Common | |
| 28 | Gunpowder | minecraft:gunpowder | 64 | Common | |
| 29 | Paper | minecraft:paper | 64 | Common | |
| 30 | Book | minecraft:book | 64 | Common | |
| 31 | Leather | minecraft:leather | 64 | Common | |
| 32 | String | minecraft:string | 64 | Common | |
| 33 | Feather | minecraft:feather | 64 | Common | |
| 34 | Bone | minecraft:bone | 64 | Common | |
| 35 | Slimeball | minecraft:slime_ball | 64 | Uncommon | |
| 36 | Honeycomb | minecraft:honeycomb | 64 | Common | |
| 37 | Blaze Rod | minecraft:blaze_rod | 64 | Uncommon | |
| 38 | Blaze Powder | minecraft:blaze_powder | 64 | Common | |
| 39 | Ender Pearl | minecraft:ender_pearl | 16 | Rare | |
| 40 | Eye of Ender | minecraft:eye_of_ender | 16 | Rare | |
| 41 | Ghast Tear | minecraft:ghast_tear | 64 | Rare | |
| 42 | Magma Cream | minecraft:magma_cream | 64 | Uncommon | |
| 43 | Phantom Membrane | minecraft:phantom_membrane | 64 | Uncommon | |
| 44 | Shulker Shell | minecraft:shulker_shell | 64 | Rare | |
| 45 | Nautilus Shell | minecraft:nautilus_shell | 64 | Uncommon | |
| 46 | Heart of the Sea | minecraft:heart_of_the_sea | 64 | Epic | |
| 47 | Rabbit Hide | minecraft:rabbit_hide | 64 | Common | |
| 48 | Scute (Turtle) | minecraft:scute | 64 | Uncommon | |
| 49 | Armadillo Scute | minecraft:armadillo_scute | 64 | Uncommon | |
| 50 | Raw Silver | kingcraft:raw_silver | 64 | Uncommon | |
| 51 | Silver Ingot | kingcraft:silver_ingot | 64 | Uncommon | |
| 52 | Raw Tin | kingcraft:raw_tin | 64 | Common | |
| 53 | Tin Ingot | kingcraft:tin_ingot | 64 | Common | |
| 54 | Bronze Ingot | kingcraft:bronze_ingot | 64 | Uncommon | |
| 55 | Steel Ingot | kingcraft:steel_ingot | 64 | Uncommon | |
| 56 | Raw Titanium | kingcraft:raw_titanium | 64 | Rare | |
| 57 | Titanium Ingot | kingcraft:titanium_ingot | 64 | Epic | |
| 58 | Raw Uranium | kingcraft:raw_uranium | 64 | Rare | |
| 59 | Uranium Rod | kingcraft:uranium_rod | 64 | Epic | |
| 60 | Sulfur | kingcraft:sulfur | 64 | Common | |
| 61 | Saltpeter | kingcraft:saltpeter | 64 | Common | |
| 62 | Ruby | kingcraft:ruby | 64 | Rare | |
| 63 | Sapphire | kingcraft:sapphire | 64 | Rare | |
| 64 | Platinum Ingot | kingcraft:platinum_ingot | 64 | Epic | |
| 65 | Aluminum Ingot | kingcraft:aluminum_ingot | 64 | Common | |
| 66 | Silica | kingcraft:silica | 64 | Common | |
| 67 | Rubber | kingcraft:rubber | 64 | Common | |
| 68 | Circuit Board | kingcraft:circuit_board | 64 | Uncommon | |
| 69 | Advanced Circuit | kingcraft:advanced_circuit | 64 | Rare | |
| 70 | Gear (Iron) | kingcraft:iron_gear | 64 | Common | |
| 71 | Gear (Steel) | kingcraft:steel_gear | 64 | Uncommon | |
| 72 | Spring | kingcraft:spring | 64 | Common | |
| 73 | Pipe | kingcraft:pipe | 64 | Common | |
| 74 | Glass Pane Item | minecraft:glass_pane | 64 | Common | |
| 75 | Rope | kingcraft:rope | 64 | Common | |
| 76 | Canvas | kingcraft:canvas | 64 | Common | |
| 77 | Cloth | kingcraft:cloth | 64 | Common | |
| 78 | Scrap Metal | kingcraft:scrap_metal | 64 | Common | |
| 79 | Explosives | kingcraft:explosives | 64 | Rare | |
| 80 | Oil Bucket | kingcraft:oil_bucket | 16 | Common | |
| 81 | Gasoline | kingcraft:gasoline | 64 | Common | |
| 82 | Jet Fuel | kingcraft:jet_fuel | 64 | Uncommon | |
| 83 | Battery Cell | kingcraft:battery_cell | 64 | Common | |

### 2.2 Food & Consumables (ID 128–191)

| ID | Item | Namespaced ID | Hunger | Saturation | Rarity | Effects |
|----|------|---------------|--------|------------|--------|---------|
| 128 | Apple | minecraft:apple | 4 | 2.4 | Common | None |
| 129 | Golden Apple | minecraft:golden_apple | 4 | 9.6 | Rare | Regeneration II (5s), Absorption (2min) |
| 130 | Enchanted Golden Apple | minecraft:enchanted_golden_apple | 4 | 9.6 | Epic | Regeneration V (30s), Resistance (5min), Fire Resist (5min), Absorption IV (2min) |
| 131 | Bread | minecraft:bread | 5 | 6.0 | Common | None |
| 132 | Cooked Porkchop | minecraft:cooked_porkchop | 8 | 12.8 | Common | None |
| 133 | Raw Porkchop | minecraft:porkchop | 3 | 1.8 | Common | None |
| 134 | Cooked Beef | minecraft:cooked_beef | 8 | 12.8 | Common | None |
| 135 | Raw Beef | minecraft:beef | 3 | 1.8 | Common | None |
| 136 | Cooked Chicken | minecraft:cooked_chicken | 6 | 7.2 | Common | None |
| 137 | Raw Chicken | minecraft:chicken | 2 | 1.2 | Common | Hunger (30s, 30% chance) |
| 138 | Cooked Mutton | minecraft:cooked_mutton | 6 | 9.6 | Common | None |
| 139 | Raw Mutton | minecraft:mutton | 2 | 1.2 | Common | None |
| 140 | Cooked Cod | minecraft:cooked_cod | 5 | 6.0 | Common | None |
| 141 | Raw Cod | minecraft:cod | 2 | 0.4 | Common | None |
| 142 | Cooked Salmon | minecraft:cooked_salmon | 6 | 9.6 | Common | None |
| 143 | Raw Salmon | minecraft:salmon | 2 | 0.4 | Common | None |
| 144 | Tropical Fish | minecraft:tropical_fish | 1 | 0.2 | Common | None |
| 145 | Pufferfish | minecraft:pufferfish | 1 | 0.2 | Common | Poison III (60s), Hunger III (30s), Nausea II (15s) |
| 146 | Baked Potato | minecraft:baked_potato | 5 | 6.0 | Common | None |
| 147 | Poisonous Potato | minecraft:poisonous_potato | 2 | 1.2 | Common | Poison (5s, 60% chance) |
| 148 | Carrot | minecraft:carrot | 3 | 3.6 | Common | None |
| 149 | Golden Carrot | minecraft:golden_carrot | 6 | 14.4 | Rare | None |
| 150 | Beetroot | minecraft:beetroot | 1 | 1.2 | Common | None |
| 151 | Beetroot Soup | minecraft:beetroot_soup | 6 | 7.2 | Common | None |
| 152 | Mushroom Stew | minecraft:mushroom_stew | 6 | 7.2 | Common | None |
| 153 | Suspicious Stew | minecraft:suspicious_stew | 6 | 7.2 | Uncommon | Random effect |
| 154 | Cookie | minecraft:cookie | 2 | 0.4 | Common | None |
| 155 | Pumpkin Pie | minecraft:pumpkin_pie | 8 | 4.8 | Common | None |
| 156 | Melon Slice | minecraft:melon_slice | 2 | 1.2 | Common | None |
| 157 | Glistering Melon | minecraft:glistering_melon_slice | 2 | 1.2 | Uncommon | Potion ingredient |
| 158 | Sweet Berries | minecraft:sweet_berries | 2 | 0.4 | Common | None |
| 159 | Glow Berries | minecraft:glow_berries | 2 | 0.4 | Common | Light when placed |
| 160 | Chorus Fruit | minecraft:chorus_fruit | 4 | 2.4 | Uncommon | Random teleport |
| 161 | Dried Kelp | minecraft:dried_kelp | 1 | 0.6 | Common | Eats fast |
| 162 | Honey Bottle | minecraft:honey_bottle | 6 | 1.2 | Common | Antidote (cures poison) |
| 163 | Cooked Egg | kingcraft:cooked_egg | 3 | 4.0 | Common | None |
| 164 | Cooked Rabbit | minecraft:cooked_rabbit | 5 | 6.0 | Common | None |
| 165 | Rabbit Stew | minecraft:rabbit_stew | 10 | 12.0 | Common | None |
| 166 | Canned Beans | kingcraft:canned_beans | 6 | 8.0 | Common | None |
| 167 | MRE | kingcraft:mre | 12 | 15.0 | Uncommon | Full hunger bar |
| 168 | Protein Bar | kingcraft:protein_bar | 8 | 10.0 | Common | +5 stamina |
| 169 | Coffee | kingcraft:coffee | 3 | 2.0 | Common | Speed I (60s) |
| 170 | Energy Drink | kingcraft:energy_drink | 2 | 1.0 | Common | Speed II (30s) |
| 171 | Bandage | kingcraft:bandage | 0 | 0 | Common | Heals 10 HP |
| 172 | Medkit | kingcraft:medkit | 0 | 0 | Uncommon | Heals 40 HP |
| 173 | Antidote | kingcraft:antidote | 0 | 0 | Uncommon | Cures poison/radiation |
| 174 | Vitamin Pack | kingcraft:vitamin_pack | 0 | 0 | Common | +20% disease resist |

### 2.3 Tools (ID 192–255)

| ID | Item | Namespaced ID | Durability | Speed | Tier | Tool Type | Notes |
|----|------|---------------|------------|-------|------|-----------|-------|
| 192 | Wooden Pickaxe | minecraft:wooden_pickaxe | 60 | 2.0 | 1 | Pickaxe | |
| 193 | Wooden Axe | minecraft:wooden_axe | 60 | 2.0 | 1 | Axe | |
| 194 | Wooden Shovel | minecraft:wooden_shovel | 60 | 2.0 | 1 | Shovel | |
| 195 | Wooden Hoe | minecraft:wooden_hoe | 60 | 2.0 | 1 | Hoe | |
| 196 | Stone Pickaxe | minecraft:stone_pickaxe | 132 | 4.0 | 2 | Pickaxe | |
| 197 | Stone Axe | minecraft:stone_axe | 132 | 4.0 | 2 | Axe | |
| 198 | Stone Shovel | minecraft:stone_shovel | 132 | 4.0 | 2 | Shovel | |
| 199 | Stone Hoe | minecraft:stone_hoe | 132 | 4.0 | 2 | Hoe | |
| 200 | Iron Pickaxe | minecraft:iron_pickaxe | 251 | 6.0 | 3 | Pickaxe | |
| 201 | Iron Axe | minecraft:iron_axe | 251 | 6.0 | 3 | Axe | |
| 202 | Iron Shovel | minecraft:iron_shovel | 251 | 6.0 | 3 | Shovel | |
| 203 | Iron Hoe | minecraft:iron_hoe | 251 | 6.0 | 3 | Hoe | |
| 204 | Golden Pickaxe | minecraft:golden_pickaxe | 33 | 12.0 | 1 | Pickaxe | Fast but weak |
| 205 | Golden Axe | minecraft:golden_axe | 33 | 12.0 | 1 | Axe | |
| 206 | Golden Shovel | minecraft:golden_shovel | 33 | 12.0 | 1 | Shovel | |
| 207 | Golden Hoe | minecraft:golden_hoe | 33 | 12.0 | 1 | Hoe | |
| 208 | Diamond Pickaxe | minecraft:diamond_pickaxe | 1562 | 8.0 | 4 | Pickaxe | |
| 209 | Diamond Axe | minecraft:diamond_axe | 1562 | 8.0 | 4 | Axe | |
| 210 | Diamond Shovel | minecraft:diamond_shovel | 1562 | 8.0 | 4 | Shovel | |
| 211 | Diamond Hoe | minecraft:diamond_hoe | 1562 | 8.0 | 4 | Hoe | |
| 212 | Netherite Pickaxe | minecraft:netherite_pickaxe | 2032 | 9.0 | 5 | Pickaxe | |
| 213 | Netherite Axe | minecraft:netherite_axe | 2032 | 9.0 | 5 | Axe | |
| 214 | Netherite Shovel | minecraft:netherite_shovel | 2032 | 9.0 | 5 | Shovel | |
| 215 | Netherite Hoe | minecraft:netherite_hoe | 2032 | 9.0 | 5 | Hoe | |
| 216 | Bronze Pickaxe | kingcraft:bronze_pickaxe | 200 | 5.0 | 2 | Pickaxe | |
| 217 | Bronze Axe | kingcraft:bronze_axe | 200 | 5.0 | 2 | Axe | |
| 218 | Bronze Shovel | kingcraft:bronze_shovel | 200 | 5.0 | 2 | Shovel | |
| 219 | Bronze Hoe | kingcraft:bronze_hoe | 200 | 5.0 | 2 | Hoe | |
| 220 | Steel Pickaxe | kingcraft:steel_pickaxe | 500 | 7.0 | 4 | Pickaxe | |
| 221 | Steel Axe | kingcraft:steel_axe | 500 | 7.0 | 4 | Axe | |
| 222 | Steel Shovel | kingcraft:steel_shovel | 500 | 7.0 | 4 | Shovel | |
| 223 | Steel Hoe | kingcraft:steel_hoe | 500 | 7.0 | 4 | Hoe | |
| 224 | Titanium Pickaxe | kingcraft:titanium_pickaxe | 4000 | 10.0 | 6 | Pickaxe | Top tier |
| 225 | Titanium Axe | kingcraft:titanium_axe | 4000 | 10.0 | 6 | Axe | |
| 226 | Titanium Shovel | kingcraft:titanium_shovel | 4000 | 10.0 | 6 | Shovel | |
| 227 | Titanium Hoe | kingcraft:titanium_hoe | 4000 | 10.0 | 6 | Hoe | |
| 228 | Flint and Steel | minecraft:flint_and_steel | 65 | — | — | — | Ignites blocks |
| 229 | Shears | minecraft:shears | 238 | — | — | Shears | Cuts leaves/wool |
| 230 | Fishing Rod | minecraft:fishing_rod | 64 | — | — | — | Fishing |
| 231 | Carrot on a Stick | minecraft:carrot_on_a_stick | 25 | — | — | — | Controls pig mount |
| 232 | Warped Fungus on Stick | minecraft:warped_fungus_on_a_stick | 100 | — | — | — | Controls strider |
| 233 | Brush | minecraft:brush | 64 | — | — | — | Archaeology |
| 234 | Spyglass | minecraft:spyglass | — | — | — | — | Zoom (10×) |
| 235 | Wire Cutters | kingcraft:wire_cutters | 100 | — | — | — | Cut wires |
| 236 | Hammer | kingcraft:hammer | 200 | — | — | — | Build/upgrade |
| 237 | Wrench | kingcraft:wrench | 200 | — | — | — | Rotate/configure |
| 238 | Salvage Hammer | kingcraft:salvage_hammer | 100 | — | — | — | Deconstruct |
| 239 | Jackhammer | kingcraft:jackhammer | 500 | 15.0 | 4 | Pickaxe | Fast mining |
| 240 | Chainsaw | kingcraft:chainsaw | 500 | 15.0 | 4 | Axe | Fast chopping |

### 2.4 Weapons (ID 256–319)

| ID | Item | Namespaced ID | Damage | Speed | Range | Durability | Weapon Type |
|----|------|---------------|--------|-------|-------|------------|-------------|
| 256 | Wooden Sword | minecraft:wooden_sword | 4 | 1.6 | 3 | 60 | Melee |
| 257 | Stone Sword | minecraft:stone_sword | 5 | 1.6 | 3 | 132 | Melee |
| 258 | Iron Sword | minecraft:iron_sword | 6 | 1.6 | 3 | 251 | Melee |
| 259 | Golden Sword | minecraft:golden_sword | 4 | 1.6 | 3 | 33 | Melee |
| 260 | Diamond Sword | minecraft:diamond_sword | 7 | 1.6 | 3 | 1562 | Melee |
| 261 | Netherite Sword | minecraft:netherite_sword | 8 | 1.6 | 3 | 2032 | Melee |
| 262 | Bronze Sword | kingcraft:bronze_sword | 5 | 1.6 | 3 | 200 | Melee |
| 263 | Steel Sword | kingcraft:steel_sword | 7 | 1.6 | 3 | 500 | Melee |
| 264 | Titanium Sword | kingcraft:titanium_sword | 9 | 1.6 | 3 | 4000 | Melee |
| 265 | Wooden Axe (Weapon) | minecraft:wooden_axe | 7 | 1.0 | 3 | 60 | Melee (axe) |
| 266 | Stone Axe (Weapon) | minecraft:stone_axe | 9 | 1.0 | 3 | 132 | Melee (axe) |
| 267 | Iron Axe (Weapon) | minecraft:iron_axe | 9 | 0.9 | 3 | 251 | Melee (axe) |
| 268 | Diamond Axe (Weapon) | minecraft:diamond_axe | 9 | 1.0 | 3 | 1562 | Melee (axe) |
| 269 | Netherite Axe (Weapon) | minecraft:netherite_axe | 10 | 1.0 | 3 | 2032 | Melee (axe) |
| 270 | Spear (Wood) | kingcraft:wooden_spear | 5 | 1.1 | 5 | 40 | Melee/Throw |
| 271 | Spear (Stone) | kingcraft:stone_spear | 6 | 1.1 | 5 | 80 | Melee/Throw |
| 272 | Spear (Iron) | kingcraft:iron_spear | 7 | 1.1 | 5 | 160 | Melee/Throw |
| 273 | Spear (Diamond) | kingcraft:diamond_spear | 9 | 1.1 | 5 | 800 | Melee/Throw |
| 274 | Bow | minecraft:bow | 2–15 | 0.5~3.5s charge | 50 | 385 | Ranged |
| 275 | Crossbow | minecraft:crossbow | 6–11 | 1.5s reload | 40 | 465 | Ranged |
| 276 | Arrow | minecraft:arrow | 2–10 | — | — | — | Ammo |
| 277 | Spectral Arrow | minecraft:spectral_arrow | 2–10 | — | — | — | Glowing effect |
| 278 | Tipped Arrow | minecraft:tipped_arrow | 2–10 | — | — | — | Status effects |
| 279 | Trident | minecraft:trident | 9 | 1.1 | — | 250 | Melee/Throw |
| 280 | Mace | minecraft:mace | 6 | 0.8 | 3 | 500 | Melee (wind burst) |
| 281 | Wooden Shield | minecraft:shield | 5 | 1.33x dmg reduction | — | 336 | Shield |
| 282 | Iron Shield | kingcraft:iron_shield | 7 | 1.5x dmg reduction | — | 500 | Shield |
| 283 | Steel Shield | kingcraft:steel_shield | 8 | 1.75x dmg reduction | — | 800 | Shield |
| 284 | Pistol | kingcraft:pistol | 8 | 0.3 (semi) | 30 | 400 | Ranged |
| 285 | Pistol Bullet | kingcraft:pistol_bullet | 8 | — | — | — | Ammo |
| 286 | Revolver | kingcraft:revolver | 15 | 0.6 | 40 | 300 | Ranged |
| 287 | Revolver Bullet | kingcraft:revolver_bullet | 15 | — | — | — | Ammo |
| 288 | Rifle | kingcraft:rifle | 25 | 1.0 (bolt) | 80 | 500 | Ranged |
| 289 | Rifle Bullet | kingcraft:rifle_bullet | 25 | — | — | — | Ammo |
| 290 | Assault Rifle | kingcraft:assault_rifle | 10 | 0.1 (auto) | 50 | 600 | Ranged |
| 291 | Assault Rifle Bullet | kingcraft:assault_rifle_bullet | 10 | — | — | — | Ammo |
| 292 | Shotgun | kingcraft:shotgun | 5×8 | 0.8 (pump) | 15 | 400 | Ranged |
| 293 | Shell | kingcraft:shell | 5×8 | — | — | — | Ammo |
| 294 | SMG | kingcraft:smg | 6 | 0.08 (auto) | 25 | 500 | Ranged |
| 295 | SMG Bullet | kingcraft:smg_bullet | 6 | — | — | — | Ammo |
| 296 | Rocket Launcher | kingcraft:rocket_launcher | 100 | 2.0 (reload) | 60 | 50 | Ranged |
| 297 | Rocket | kingcraft:rocket | 100 | — | — | — | Ammo (AoE 5m) |
| 298 | Grenade (F1) | kingcraft:f1_grenade | 80 | — | Throw | — | Throwable |
| 299 | Smoke Grenade | kingcraft:smoke_grenade | 0 | — | Throw | — | Throwable |
| 300 | Flashbang | kingcraft:flashbang | 0 | — | Throw | — | Blind + deafen |
| 301 | Molotov Cocktail | kingcraft:molotov | 3/sec | — | Throw | — | Fire AoE |
| 302 | Meat Cleaver | kingcraft:meat_cleaver | 5 | 1.5 | 3 | 200 | Melee |
| 303 | Knife | kingcraft:knife | 4 | 2.0 | 2 | 150 | Melee (fast) |
| 304 | Baton | kingcraft:baton | 3 | 1.8 | 4 | 100 | Melee (stun) |
| 305 | Machete | kingcraft:machete | 6 | 1.3 | 3 | 300 | Melee |
| 306 | Compound Bow | kingcraft:compound_bow | 3–20 | 0.5~4.0s charge | 60 | 500 | Ranged |
| 307 | Hunting Bow | kingcraft:hunting_bow | 2–18 | 0.5~3.0s charge | 45 | 400 | Ranged |
| 308 | Crossbow (Steel) | kingcraft:steel_crossbow | 8–15 | 1.2s reload | 50 | 600 | Ranged |

### 2.5 Armor (ID 320–383)

| ID | Item | Namespaced ID | Protection | Toughness | Knockback Resist | Durability | Slot |
|----|------|---------------|------------|-----------|-----------------|------------|------|
| 320 | Leather Helmet | minecraft:leather_helmet | 1 | 0 | 0 | 56 | Head |
| 321 | Leather Chestplate | minecraft:leather_chestplate | 3 | 0 | 0 | 81 | Chest |
| 322 | Leather Leggings | minecraft:leather_leggings | 2 | 0 | 0 | 76 | Legs |
| 323 | Leather Boots | minecraft:leather_boots | 1 | 0 | 0 | 66 | Feet |
| 324 | Chainmail Helmet | minecraft:chainmail_helmet | 2 | 0 | 0 | 166 | Head |
| 325 | Chainmail Chestplate | minecraft:chainmail_chestplate | 5 | 0 | 0 | 241 | Chest |
| 326 | Chainmail Leggings | minecraft:chainmail_leggings | 4 | 0 | 0 | 226 | Legs |
| 327 | Chainmail Boots | minecraft:chainmail_boots | 1 | 0 | 0 | 196 | Feet |
| 328 | Iron Helmet | minecraft:iron_helmet | 2 | 0 | 0 | 166 | Head |
| 329 | Iron Chestplate | minecraft:iron_chestplate | 6 | 0 | 0 | 241 | Chest |
| 330 | Iron Leggings | minecraft:iron_leggings | 5 | 0 | 0 | 226 | Legs |
| 331 | Iron Boots | minecraft:iron_boots | 2 | 0 | 0 | 196 | Feet |
| 332 | Golden Helmet | minecraft:golden_helmet | 2 | 0 | 0 | 78 | Head |
| 333 | Golden Chestplate | minecraft:golden_chestplate | 5 | 0 | 0 | 113 | Chest |
| 334 | Golden Leggings | minecraft:golden_leggings | 3 | 0 | 0 | 106 | Legs |
| 335 | Golden Boots | minecraft:golden_boots | 1 | 0 | 0 | 92 | Feet |
| 336 | Diamond Helmet | minecraft:diamond_helmet | 3 | 2 | 0 | 364 | Head |
| 337 | Diamond Chestplate | minecraft:diamond_chestplate | 8 | 2 | 0 | 529 | Chest |
| 338 | Diamond Leggings | minecraft:diamond_leggings | 6 | 2 | 0 | 496 | Legs |
| 339 | Diamond Boots | minecraft:diamond_boots | 3 | 2 | 0 | 430 | Feet |
| 340 | Netherite Helmet | minecraft:netherite_helmet | 3 | 3 | 0.1 | 408 | Head |
| 341 | Netherite Chestplate | minecraft:netherite_chestplate | 8 | 3 | 0.1 | 593 | Chest |
| 342 | Netherite Leggings | minecraft:netherite_leggings | 6 | 3 | 0.1 | 556 | Legs |
| 343 | Netherite Boots | minecraft:netherite_boots | 3 | 3 | 0.1 | 482 | Feet |
| 344 | Bronze Helmet | kingcraft:bronze_helmet | 2 | 0 | 0 | 150 | Head |
| 345 | Bronze Chestplate | kingcraft:bronze_chestplate | 5 | 0 | 0 | 220 | Chest |
| 346 | Bronze Leggings | kingcraft:bronze_leggings | 4 | 0 | 0 | 200 | Legs |
| 347 | Bronze Boots | kingcraft:bronze_boots | 2 | 0 | 0 | 180 | Feet |
| 348 | Steel Helmet | kingcraft:steel_helmet | 3 | 1 | 0 | 300 | Head |
| 349 | Steel Chestplate | kingcraft:steel_chestplate | 8 | 1 | 0 | 450 | Chest |
| 350 | Steel Leggings | kingcraft:steel_leggings | 6 | 1 | 0 | 420 | Legs |
| 351 | Steel Boots | kingcraft:steel_boots | 3 | 1 | 0 | 380 | Feet |
| 352 | Titanium Helmet | kingcraft:titanium_helmet | 4 | 4 | 0.2 | 600 | Head |
| 353 | Titanium Chestplate | kingcraft:titanium_chestplate | 10 | 4 | 0.2 | 900 | Chest |
| 354 | Titanium Leggings | kingcraft:titanium_leggings | 8 | 4 | 0.2 | 850 | Legs |
| 355 | Titanium Boots | kingcraft:titanium_boots | 4 | 4 | 0.2 | 750 | Feet |
| 356 | Hazmat Helmet | kingcraft:hazmat_helmet | 1 | 0 | 0 | 100 | Head (rad resist) |
| 357 | Hazmat Suit | kingcraft:hazmat_suit | 2 | 0 | 0 | 200 | Chest (rad resist) |
| 358 | Hazmat Leggings | kingcraft:hazmat_leggings | 1 | 0 | 0 | 150 | Legs (rad resist) |
| 359 | Hazmat Boots | kingcraft:hazmat_boots | 1 | 0 | 0 | 100 | Feet (rad resist) |
| 360 | Winter Jacket | kingcraft:winter_jacket | 2 | 0 | 0 | 150 | Chest (cold resist) |
| 361 | Snow Pants | kingcraft:snow_pants | 1 | 0 | 0 | 120 | Legs (cold resist) |
| 362 | Snow Boots | kingcraft:snow_boots | 1 | 0 | 0 | 100 | Feet (cold resist) |
| 363 | Combat Vest | kingcraft:combat_vest | 4 | 0 | 0 | 300 | Chest |
| 364 | Tactical Helmet | kingcraft:tactical_helmet | 3 | 0 | 0 | 200 | Head |

### 2.6 Potions & Enchanted Items (ID 384–447)

| ID | Item | Namespaced ID | Max Stack | Rarity | Notes |
|----|------|---------------|-----------|--------|-------|
| 384 | Glass Bottle | minecraft:glass_bottle | 64 | Common | |
| 385 | Water Bottle | minecraft:potion | 1 | Common | Base potion |
| 386 | Awkward Potion | minecraft:awkward_potion | 1 | Common | Nether wart base |
| 387 | Potion of Healing | minecraft:healing_potion | 1 | Common | Instant Health |
| 388 | Potion of Regeneration | minecraft:regeneration_potion | 1 | Uncommon | Regeneration |
| 389 | Potion of Strength | minecraft:strength_potion | 1 | Uncommon | Strength |
| 390 | Potion of Swiftness | minecraft:swiftness_potion | 1 | Common | Speed |
| 391 | Potion of Fire Resistance | minecraft:fire_resistance_potion | 1 | Uncommon | Fire Resist |
| 392 | Potion of Night Vision | minecraft:night_vision_potion | 1 | Common | Night Vision |
| 393 | Potion of Invisibility | minecraft:invisibility_potion | 1 | Rare | Invisibility |
| 394 | Potion of Water Breathing | minecraft:water_breathing_potion | 1 | Uncommon | Water Breathing |
| 395 | Potion of Leaping | minecraft:leaping_potion | 1 | Common | Jump Boost |
| 396 | Potion of Slow Falling | minecraft:slow_falling_potion | 1 | Uncommon | Slow Falling |
| 397 | Potion of the Turtle | minecraft:turtle_master_potion | 1 | Rare | Slowness + Resistance |
| 398 | Potion of Luck | minecraft:luck_potion | 1 | Rare | Luck |
| 399 | Splash Potion | minecraft:splash_potion | 1 | Common | Throwable |
| 400 | Lingering Potion | minecraft:lingering_potion | 1 | Uncommon | Area effect |
| 401 | Dragon's Breath | minecraft:dragons_breath | 64 | Epic | |
| 402 | Enchanted Book | minecraft:enchanted_book | 1 | Rare | |
| 403 | Bottle o' Enchanting | minecraft:experience_bottle | 64 | Uncommon | Throw for XP |
| 404 | Potion of True Sight | kingcraft:true_sight_potion | 1 | Epic | See invisible |
| 405 | Potion of Adrenaline | kingcraft:adrenaline_potion | 1 | Uncommon | +200% stamina |
| 406 | Antidote Potion | kingcraft:antidote_potion | 1 | Uncommon | Cure all poison |
| 407 | Radiation Resistance | kingcraft:anti_radiation_potion | 1 | Rare | 5min rad resist |

### 2.7 Miscellaneous & Special Items (ID 448–511)

| ID | Item | Namespaced ID | Max Stack | Rarity | Notes |
|----|------|---------------|-----------|--------|-------|
| 448 | Bucket | minecraft:bucket | 16 | Common | |
| 449 | Water Bucket | minecraft:water_bucket | 1 | Common | |
| 450 | Lava Bucket | minecraft:lava_bucket | 1 | Common | |
| 451 | Milk Bucket | minecraft:milk_bucket | 1 | Common | |
| 452 | Powder Snow Bucket | minecraft:powder_snow_bucket | 1 | Common | |
| 453 | Compass | minecraft:compass | 64 | Common | |
| 454 | Recovery Compass | minecraft:recovery_compass | 64 | Rare | Points to last death |
| 455 | Clock | minecraft:clock | 64 | Common | |
| 456 | Map (Empty) | minecraft:map | 64 | Common | |
| 457 | Map (Filled) | minecraft:filled_map | 64 | Common | |
| 458 | Name Tag | minecraft:name_tag | 64 | Common | |
| 459 | Lead | minecraft:lead | 64 | Common | |
| 460 | Saddle | minecraft:saddle | 1 | Uncommon | |
| 461 | Elytra | minecraft:elytra | 1 | Epic | Glide |
| 462 | Totem of Undying | minecraft:totem_of_undying | 1 | Epic | Save from death |
| 463 | Spyglass | minecraft:spyglass | 1 | Common | Zoom |
| 464 | Brush | minecraft:brush | 1 | Common | Archaeology |
| 465 | Music Disc | minecraft:music_disc | 1 | Rare | 16 variants |
| 466 | Goat Horn | minecraft:goat_horn | 1 | Uncommon | Summon sound |
| 467 | Firework Rocket | minecraft:firework_rocket | 64 | Common | Elytra boost |
| 468 | Firework Star | minecraft:firework_star | 64 | Common | Custom effects |
| 469 | Minecraft (Debug) | minecraft:debug_stick | 1 | Epic | Dev tool |
| 470 | Knowledge Book | minecraft:knowledge_book | 1 | Epic | Unlock recipes |
| 471 | Code Lock | kingcraft:code_lock | 64 | Uncommon | Lock doors/containers |
| 472 | Key Lock | kingcraft:key_lock | 64 | Uncommon | Lock with key |
| 473 | Key | kingcraft:key | 1 | Common | Unlocks key lock |
| 474 | Lock Pick | kingcraft:lock_pick | 1 | Uncommon | Pick locks (consumable) |
| 475 | Tool Cupboard | kingcraft:tool_cupboard | 1 | Rare | Building privilege |
| 476 | C4 Charge | kingcraft:c4_charge | 1 | Rare | Placeable explosive |
| 477 | Satchel Charge | kingcraft:satchel_charge | 1 | Uncommon | Throwable explosive |
| 478 | Timer | kingcraft:crafted_timer | 64 | Uncommon | Crafted component |
| 479 | Blueprint (Empty) | kingcraft:empty_blueprint | 64 | Common | Learn recipes |
| 480 | Blueprint (Filled) | kingcraft:blueprint | 1 | Rare | One-time use |
| 481 | Scrap | kingcraft:scrap | 99 | Common | Server currency |
| 482 | Gold Coin | kingcraft:gold_coin | 99 | Uncommon | Currency |
| 483 | Silver Coin | kingcraft:silver_coin | 99 | Common | Currency |
| 484 | Radio | kingcraft:radio | 1 | Common | Voice chat device |
| 485 | Binoculars | kingcraft:binoculars | 1 | Common | Zoom (5×) |
| 486 | Night Vision Goggles | kingcraft:night_vision_goggles | 1 | Rare | Night vision |
| 487 | Gas Mask | kingcraft:gas_mask | 1 | Uncommon | Gas protection |
| 488 | Scuba Gear | kingcraft:scuba_gear | 1 | Uncommon | Extended underwater |
| 489 | Parachute | kingcraft:parachute | 1 | Uncommon | Slow fall |
| 490 | Space Suit | kingcraft:space_suit | 1 | Epic | Void dimension |
| 491 | Repair Kit | kingcraft:repair_kit | 8 | Uncommon | Repair items |
| 492 | Weapon Mod (Scope) | kingcraft:scope_mod | 1 | Rare | Weapon attachment |
| 493 | Weapon Mod (Silencer) | kingcraft:silencer_mod | 1 | Rare | Silent shots |
| 494 | Weapon Mod (Extended Mag) | kingcraft:extended_mag_mod | 1 | Rare | +50% ammo |
| 495 | Weapon Mod (Laser Sight) | kingcraft:laser_sight_mod | 1 | Rare | +accuracy |

---

## 3. Item Component Definitions

### 3.1 Tool Component

```json
{
  "type": "tool",
  "tier": 4,
  "speed": 8.0,
  "tool_type": "pickaxe",
  "rules": [
    {
      "blocks": "mineable/pickaxe",
      "speed": 8.0,
      "correct_for_drops": true
    }
  ]
}
```

### 3.2 Weapon Component

```json
{
  "type": "weapon",
  "damage": 7.0,
  "speed": 1.6,
  "reach": 3.0,
  "category": "sword",
  "sweep": true,
  "sweep_damage": 1.0
}
```

### 3.3 Food Component

```json
{
  "type": "food",
  "nutrition": 8,
  "saturation": 12.8,
  "can_always_eat": false,
  "effects": [
    {
      "effect": "regeneration",
      "duration": 100,
      "amplifier": 1,
      "chance": 1.0
    }
  ]
}
```

### 3.4 Armor Component

```json
{
  "type": "armor",
  "slot": "chestplate",
  "protection": 8,
  "toughness": 2.0,
  "knockback_resistance": 0.0,
  "durability": 529
}
```

### 3.5 Block Item Component (for block items)

```json
{
  "type": "block",
  "block_id": "minecraft:stone",
  "block_state": {}
}
```

---

## 4. Item Registration Example (JSON)

```json
{
  "registry": {
    "kingcraft:steel_pickaxe": {
      "numeric_id": 220,
      "max_stack_size": 1,
      "rarity": "uncommon",
      "durability": 500,
      "tool": {
        "tier": 4,
        "speed": 7.0,
        "tool_type": "pickaxe",
        "rules": [
          {
            "blocks": "#mineable/pickaxe",
            "speed": 7.0,
            "correct_for_drops": true
          }
        ]
      },
      "components": {
        "repair": {
          "ingredient": "kingcraft:steel_ingot",
          "repair_amount": 125
        },
        "enchantable": {
          "value": 10
        },
        "attribute_modifiers": {
          "mainhand": [
            {
              "attribute": "attack_damage",
              "amount": 4.0,
              "operation": "addition"
            },
            {
              "attribute": "attack_speed",
              "amount": -2.4,
              "operation": "addition"
            }
          ]
        }
      }
    }
  }
}
```

---

*End of Item System Document*

Next: [Entity System →](./05-ENTITIES.md)
