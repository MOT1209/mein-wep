# Content Research — Block World

Purpose: record verified, dated findings about recent voxel/sandbox game content, and how
each finding is **translated into original Block World mechanics** (no copying of protected
assets, code, branding or expressive content).

Classification legend:
- **Released** — shipped in a stable public release (verified against official source).
- **Experimental** — in preview/beta or behind an experimental toggle.
- **Announced** — officially announced, not yet released.
- **Unverified** — community-reported, not confirmed by an official source.

---

## FR-1 — Minecraft "Chaos Cubed" sulfur caves (Released/Experimental)

- **Date checked:** 2026-10-16
- **Source:** minecraft.net — Bedrock 26.20 changelog (published 2026-05-05)
- **Findings (verified):** new cave type "Sulfur caves" with shallow water pools; a mob
  ("Sulfur Cube") that transforms depending on which block it is fed; "Potent Sulfur"
  blocks placed under water create bubble columns and noxious gas clouds causing nausea;
  two new full colour block sets (Cinnabar red, Sulfur yellow) including stairs and bricks.
- **Status in source:** released as "Chaos Cubed" experiment toggle content in 26.20.

**Original translation:** Block World adds **Emberstone Caverns** — deep caves with
**Emberstone** (amber-yellow) and **Rustrock** (deep red) full block sets with bricks and
stairs. **Sour Fume Vents**: a rare block that emits a slow malaise cloud; entities inside
take a "Bloomrot" effect that drains satiation slowly (original effect, distinct name and
behavior — no nausea screen effect). **Bubbling Ember Pool** blocks under water create a
visual bubble column particle effect (decorative only).

## FR-2 — Minecraft ice caves "Drop 4 2026" (Experimental, in preview)

- **Date checked:** 2026-10-16
- **Source:** minecraft.net — Preview 26.60.29 (published 2026-09-30); minecraft.wiki Fourth Drop 2026
- **Findings (verified):** Ice Cave biome under cold biomes made of packed ice and calcite;
  hanging icicles that fall and damage entities (extra damage when landing on them);
  ice crystals as the only light source (placeable in any direction, break if support removed);
  "Frostbite" zombie variant that throws ice balls applying a Freezing effect.
- **Status in source:** experimental preview; announced during Minecraft LIVE Sept 2026.

**Original translation:** Block World adds **Frostmere Hollows** — ice caves that generate
under snowy taiga and mountains, built of **Frostglass** and **Permafrost** blocks.
**Glowcrystals** grow on ceilings as the biome's only natural light source (directional
placement, break when support removed). **Icicles** hang from ceilings and fall when the
block above is disturbed, damaging what they hit. Original creature **Rime Wisp** (a hostile
ranged caster in cold biomes) replaces the referenced mob concept with original visuals,
name and behavior (slows on hit; distinct implementation).

## FR-3 — Abandoned Camp structure (Released)

- **Date checked:** 2026-10-16
- **Source:** minecraft.net — Bedrock 26.50 changelog (published 2026-09-15)
- **Findings (verified):** a new surface structure called "Abandoned Camp" was added as
  part of "Game Drop 3 Features".

**Original translation:** Block World's structure system includes **Abandoned Camps**
(tents made of wool-blocks and sticks, campfire, scattered supply chests) and **Old Spires**
(stone ruins). Loot tables are original and data-driven.

## FR-4 — Valheim 1.0 (Released)

- **Date checked:** 2026-10-16
- **Source:** massivelyop.com report on Valheim 1.0 launch (published 2026-09-09);
  Iron Gate patch notes
- **Findings (verified via report):** full release with a new frozen biome (Deep North),
  40+ new weapons, new armour sets and tools, 10+ creatures, 80+ buildable pieces including
  5 crafting-related build pieces; new mechanics include clearing accumulated snow in some
  regions, "invading jotun" events.

**Original translation:** Block World adopts the *idea* of weather accumulation as an
optional future mechanic (**Snowfall accumulation** — planned, documented in ROADMAP Phase 10+).
Confirmed adopted concepts: expanded buildable block families per material (bricks, slabs
as future work), and hostile raid events are noted as a future challenge mode
(not implemented yet; tracked as planned).

## FR-5 — Enshrouded 1.0 (Released)

- **Date checked:** 2026-10-16
- **Source:** thenerdstash.com review of Enshrouded 1.0 (published 2026-10-14); patched.gg patch history
- **Findings (verified via report):** voxel survival-crafting with base NPC craftspeople
  that unlock crafting by being housed; terrain sculpting; water mechanics overhaul (0.9.0.3).

**Original translation:** Block World tracks **settlement craftspeople** (NPCs that unlock
advanced recipes when housed) as a *planned* Phase 10+ feature. Water is implemented as a
simple block-based fluid with swimming (no flow simulation in v1; documented limitation).

## FR-6 — Genre-wide observations (Released, multiple sources)

- **Date checked:** 2026-10-16
- **Sources:** the above plus genre observation; Minecraft 26.0 (2026-02-10) version-year
  numbering, craftable name tags, baby mob redesigns.
- **Original translation:** Block World includes **name tags** (craftable, renameable item
  applied to animals) and age-scaled baby animals (breeding produces smaller, slower young).

---

## Deliberately NOT copied

- No Minecraft code, textures, sounds, models, names or UI layouts.
- No proprietary asset extraction from any referenced game (no REA analysis of game
  binaries was performed; see `docs/REA_INTEGRATION.md`).
- Mechanics listed above are re-implemented from scratch with original naming, values,
  visuals and behavior where a genre-standard concept (e.g. "caves are dark", "icicles
  can fall") is shared.

## Verification notes

- Every "verified" finding above was cross-checked against the official source listed.
- Preview/experimental content is marked; nothing labelled experimental is relied upon
  as stable behavior.
- This file is append-only: new research is added with date + source.
