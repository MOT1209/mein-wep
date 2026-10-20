# World generation

Source: `src/voxels/worldgen.ts`, `src/voxels/biomes.ts`, `src/core/noise.ts`, `src/config.ts`.
Everything is deterministic for a seed (`?seed=` in the URL, default 271828).

## Dimensions

- Chunks are 16 × 96 × 16 blocks (`CHUNK_SX/SY/SZ`), stored as one `Uint8Array` of block ids.
- Sea level is y = 34; y = 0 is bedrock.
- Chunks are generated on demand when the streamer loads them (`World.ensureChunk`).

## Terrain height

`columnHeight` combines seeded Perlin noise:

- a continental fBm (frequency 0.0016, 4 octaves) for broad land and sea, ±12 blocks;
- a mountain mask (low-frequency fBm through a smoothstep) that blends in ridged noise for up to
  about 34 blocks of relief;
- a small detail fBm (±2.5 blocks).

Heights are clamped to 3 … 84.

## Biomes

`biomeAtColumn` picks one of seven biomes from height, the mountain mask, temperature (drops with
altitude) and humidity:

| Biome | Rule | Surface | Trees |
| ----- | ---- | ------- | ----- |
| ocean | height below sea level − 1 | sand, deep floors sand or gravel | none |
| beach | within 1 block of sea level | sand | none |
| mountains | high (sea level + 26) or masked and above sea level + 12 | stone, snow caps above sea level + 16 | pine |
| desert | warm and dry | sand over sandstone | dune willow, cactus, dead bush |
| snow taiga | cold | snow grass | pine |
| forest | humid | grass | sable (dense) |
| plains | everything else | grass | sable (sparse) |

## Underground

- Below the filler layer the column is stone; deeper parts switch to understone along a noisy
  boundary around y = 15.
- Caves are carved where 3D noise passes a threshold; a second, finer cave noise adds tunnels below
  y = 40. Caves never break through the floor right under water.
- Ore veins per chunk (count, y range, vein size): coal 10 (6–58, 8), copper 6 (6–46, 7),
  ferrite 5 (4–40, 6), ember 3 (4–30, 5), aurum 2 (2–24, 5), aetherite 1 (2–15, 4). Veins only
  replace stone or understone.
- Cave decorations: glowshrooms on cave floors, glowcrystals and fume vents on understone deep
  down, icicles under snowy ceilings.

## Surface decoration

- Grass and snow grass get tall grass, red/yellow/blue flowers and the occasional dewberry bush,
  with per-biome densities.
- Deserts get cacti (1–3 tall) and dead bushes.
- Trees are written inside the chunk with the biome's tree shape.
- Structures: boulders of stone and mossy stone, and small camps (a plank floor, a campfire, two
  logs and a chest). Camp chests currently open empty — there are no loot tables yet.

## Lighting

Sky light floods down from the top and spreads sideways; block light spreads from emitters
(torches, lanterns, emberlight, lit furnaces …). Editing a block re-lights the affected area
(`src/voxels/lighting.ts`).

## Player edits

Generated chunks are not saved. Only chunks the player changed are kept: in memory when the
streamer unloads them (`World.storedChunks`) and in the save file (see `SAVE_SYSTEM.md`). A
reloaded chunk is regenerated from the seed and then overwritten with the stored blocks.
