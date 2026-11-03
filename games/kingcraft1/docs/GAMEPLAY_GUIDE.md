# Gameplay guide

This describes the game as it is implemented today. See `CONTROLS.md` for keys and
`BLOCKS_AND_ITEMS.md` / `CRAFTING_RECIPES.md` for full data tables.

## Modes

- **Survival** (default): you start with an empty inventory, take damage, get hungry and can die.
- **Creative** (`?mode=creative`): blocks break instantly and drop nothing, you can fly (F),
  placing does not use up items, creatures ignore you, and the inventory has an **All items**
  palette to take any item from.

## First minutes in survival

1. Break grass and dirt by hand and punch a tree. Logs need an axe to break quickly but can be
   broken by hand slowly.
2. Open the inventory (E) and turn logs into planks in the 2×2 grid, planks into sticks, and four
   planks into a crafting table.
3. Place the crafting table and right-click it for the 3×3 grid: wooden pickaxe, then stone tools.
4. Stone and most ores need a pickaxe. A pickaxe of too low a tier cannot break a tiered block at
   all (the game tells you it needs a stronger tool). Ferrite ore needs a stone pickaxe or better.
5. Eight cobblestone make a furnace. Put something smeltable on top and fuel below (coal,
   charcoal, wood). Raw ferrite becomes ferrite ingots, sand becomes glass, raw meat becomes
   cooked meat.
6. Coal and a stick make torches (at a crafting table). Light keeps hostile creatures from
   spawning nearby.

## Day and night

A full day lasts 10 minutes. At night, and in dark places, hostile creatures spawn 24–48 blocks
away and come for you once they see you within 32 blocks. Some burn in direct sunlight. Passive
animals spawn by day on grass. Sleeping in a bed at night skips to morning; using a bed at any
time sets your respawn point.

## Survival stats

- **Health** 20. Lost to creatures, falls (more than 3.5 blocks), drowning and starvation.
- **Food** 20. Walking and especially sprinting use it up. Above 17 food you slowly regenerate
  health; at 0 you start to starve. Right-click food to eat it (not at full food).
- **Air** 10 seconds underwater, then 2 damage per second.
- When you die, everything in your inventory drops where you fell. Respawn returns you to your bed
  or the world spawn.

## Farming

Till grass or dirt with a hoe to make farmland. Farmland within 4 blocks of water becomes wet;
wheat only grows on wet farmland. Plant seeds (tall grass drops them 30% of the time; wheat
also drops them), wait for the four stages and break ripe wheat for wheat and seeds. Ground bone (bone meal) speeds crops up by 1–2 stages and
can make saplings grow into trees.

## Containers and blocks you can use

- **Chest**: 27 slots. Contents drop when the chest is broken.
- **Furnace**: input, fuel and output slots; glows while burning.
- **Door**: right-click to open and close.
- **Crafting table**: opens the 3×3 grid.
- **Bed**: sets the spawn point; sleep at night.
- Sneak + right-click places a block against these instead of using them.

## Creatures

Eight kinds are defined. Passive animals flee when hurt and drop meat, leather, wool or feathers.
The cave crawler is neutral until attacked. Hostiles (shadewisp, rattler, rime wisp) attack at
night or in the dark; the rattler attacks from up to 16 blocks away. Hit creatures with the left
mouse button; swords do the most damage.

## Saving

The world saves automatically every minute and when you leave the tab. **Save now** and
**New world** are in the pause menu. See `SAVE_SYSTEM.md`.

## Encyclopedia

Press J (or use the pause menu) to browse every block, item, creature and recipe with its real
stats, in English or Arabic.

## Not in the game yet

Ruins and loot in camp chests, exploration rewards, difficulty settings, door orientation, fume
vent and lantern interactions, visible projectiles, armor equipping, and native app packages. See
`ROADMAP.md`.
