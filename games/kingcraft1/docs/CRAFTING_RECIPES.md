# Crafting and smelting recipes

Generated from `src/content/recipes.ts` and `items.ts` on 2026-10-20.

Shaped patterns are written top row first, `/` separates rows and `·` is an empty cell. A shaped
pattern may be placed anywhere in the grid. Recipes marked "crafting table" are refused in the
2×2 inventory grid (`src/ui/slotLogic.ts`, `craftPreview`).

## Crafting (82)

| Result | Count | Where | Pattern |
| ------ | ----- | ----- | ------- |
| Planks | 4 | hand (2×2) | shapeless: log |
| Planks | 4 | hand (2×2) | shapeless: log_pine |
| Planks | 4 | hand (2×2) | shapeless: log_dune |
| Stick | 4 | hand (2×2) | `P / P` (P=planks) |
| Crafting Table | 1 | hand (2×2) | `PP / PP` (P=planks) |
| Furnace | 1 | crafting table (3×3) | `CCC / C·C / CCC` (C=cobblestone) |
| Chest | 1 | crafting table (3×3) | `PPP / P·P / PPP` (P=planks) |
| Oak Door | 3 | crafting table (3×3) | `P·P / PPP / P·P` (P=planks) |
| Torch | 4 | crafting table (3×3) | `C / S` (C=coal, S=stick) |
| Torch | 4 | crafting table (3×3) | `C / S` (C=charcoal, S=stick) |
| Campfire | 1 | crafting table (3×3) | `·S· / SCS / SSS` (S=stick, C=coal) |
| Bed | 1 | crafting table (3×3) | `WWW / PPP` (W=wool, P=planks) |
| Bricks | 1 | crafting table (3×3) | `BB / BB` (B=brick) |
| Stone Bricks | 4 | crafting table (3×3) | `SS / SS` (S=stone) |
| Sandstone Bricks | 4 | crafting table (3×3) | `SS / SS` (S=sandstone) |
| Understone Bricks | 4 | crafting table (3×3) | `SS / SS` (S=understone) |
| Emberstone Bricks | 4 | crafting table (3×3) | `SS / SS` (S=emberstone) |
| Rustrock Bricks | 4 | crafting table (3×3) | `SS / SS` (S=rustrock) |
| Mossy Stone | 1 | hand (2×2) | shapeless: cobblestone + tall_grass |
| Emberlight | 1 | crafting table (3×3) | `·D· / DGD / ·D·` (D=ember_dust, G=glass) |
| Ferro Lantern | 1 | crafting table (3×3) | `I·I / ·T· / I·I` (I=ferrite_ingot, T=torch) |
| Wooden Pickaxe | 1 | crafting table (3×3) | `MMM / ·S· / ·S·` (M=planks, S=stick) |
| Wooden Axe | 1 | crafting table (3×3) | `MM· / MS· / ·S·` (M=planks, S=stick) |
| Wooden Shovel | 1 | hand (2×2) | `·M· / ·S· / ·S·` (M=planks, S=stick) |
| Wooden Hoe | 1 | crafting table (3×3) | `MM· / ·S· / ·S·` (M=planks, S=stick) |
| Wooden Sword | 1 | hand (2×2) | `·M· / ·M· / ·S·` (M=planks, S=stick) |
| Stone Pickaxe | 1 | crafting table (3×3) | `MMM / ·S· / ·S·` (M=cobblestone, S=stick) |
| Stone Axe | 1 | crafting table (3×3) | `MM· / MS· / ·S·` (M=cobblestone, S=stick) |
| Stone Shovel | 1 | hand (2×2) | `·M· / ·S· / ·S·` (M=cobblestone, S=stick) |
| Stone Hoe | 1 | crafting table (3×3) | `MM· / ·S· / ·S·` (M=cobblestone, S=stick) |
| Stone Sword | 1 | hand (2×2) | `·M· / ·M· / ·S·` (M=cobblestone, S=stick) |
| Ferrite Pickaxe | 1 | crafting table (3×3) | `MMM / ·S· / ·S·` (M=ferrite_ingot, S=stick) |
| Ferrite Axe | 1 | crafting table (3×3) | `MM· / MS· / ·S·` (M=ferrite_ingot, S=stick) |
| Ferrite Shovel | 1 | hand (2×2) | `·M· / ·S· / ·S·` (M=ferrite_ingot, S=stick) |
| Ferrite Hoe | 1 | crafting table (3×3) | `MM· / ·S· / ·S·` (M=ferrite_ingot, S=stick) |
| Ferrite Sword | 1 | hand (2×2) | `·M· / ·M· / ·S·` (M=ferrite_ingot, S=stick) |
| Aurum Pickaxe | 1 | crafting table (3×3) | `MMM / ·S· / ·S·` (M=aurum_ingot, S=stick) |
| Aurum Axe | 1 | crafting table (3×3) | `MM· / MS· / ·S·` (M=aurum_ingot, S=stick) |
| Aurum Shovel | 1 | hand (2×2) | `·M· / ·S· / ·S·` (M=aurum_ingot, S=stick) |
| Aurum Hoe | 1 | crafting table (3×3) | `MM· / ·S· / ·S·` (M=aurum_ingot, S=stick) |
| Aurum Sword | 1 | hand (2×2) | `·M· / ·M· / ·S·` (M=aurum_ingot, S=stick) |
| Aetherite Pickaxe | 1 | crafting table (3×3) | `MMM / ·S· / ·S·` (M=aetherite_gem, S=stick) |
| Aetherite Axe | 1 | crafting table (3×3) | `MM· / MS· / ·S·` (M=aetherite_gem, S=stick) |
| Aetherite Shovel | 1 | hand (2×2) | `·M· / ·S· / ·S·` (M=aetherite_gem, S=stick) |
| Aetherite Hoe | 1 | crafting table (3×3) | `MM· / ·S· / ·S·` (M=aetherite_gem, S=stick) |
| Aetherite Sword | 1 | hand (2×2) | `·M· / ·M· / ·S·` (M=aetherite_gem, S=stick) |
| Ferrite Shears | 1 | crafting table (3×3) | `I· / ·I` (I=ferrite_ingot) |
| Shortbow | 1 | crafting table (3×3) | `S·T / S·T / S·T` (S=stick, T=string) |
| Arrow | 4 | crafting table (3×3) | `F / S / H` (F=feather, S=stick, H=stone_shard) |
| Leather Helmet | 1 | crafting table (3×3) | `MMM / M·M` (M=leather) |
| Leather Chestplate | 1 | crafting table (3×3) | `M·M / MMM / MMM` (M=leather) |
| Leather Leggings | 1 | crafting table (3×3) | `MMM / M·M / M·M` (M=leather) |
| Leather Boots | 1 | crafting table (3×3) | `M·M / M·M` (M=leather) |
| Ferrite Helmet | 1 | crafting table (3×3) | `MMM / M·M` (M=ferrite_ingot) |
| Ferrite Chestplate | 1 | crafting table (3×3) | `M·M / MMM / MMM` (M=ferrite_ingot) |
| Ferrite Leggings | 1 | crafting table (3×3) | `MMM / M·M / M·M` (M=ferrite_ingot) |
| Ferrite Boots | 1 | crafting table (3×3) | `M·M / M·M` (M=ferrite_ingot) |
| Aurum Helmet | 1 | crafting table (3×3) | `MMM / M·M` (M=aurum_ingot) |
| Aurum Chestplate | 1 | crafting table (3×3) | `M·M / MMM / MMM` (M=aurum_ingot) |
| Aurum Leggings | 1 | crafting table (3×3) | `MMM / M·M / M·M` (M=aurum_ingot) |
| Aurum Boots | 1 | crafting table (3×3) | `M·M / M·M` (M=aurum_ingot) |
| Aetherite Helmet | 1 | crafting table (3×3) | `MMM / M·M` (M=aetherite_gem) |
| Aetherite Chestplate | 1 | crafting table (3×3) | `M·M / MMM / MMM` (M=aetherite_gem) |
| Aetherite Leggings | 1 | crafting table (3×3) | `MMM / M·M / M·M` (M=aetherite_gem) |
| Aetherite Boots | 1 | crafting table (3×3) | `M·M / M·M` (M=aetherite_gem) |
| Name Tag | 1 | hand (2×2) | shapeless: string + leather |
| Ground Bone | 3 | hand (2×2) | shapeless: bone |
| Bread | 1 | hand (2×2) | `WWW` (W=wheat) |
| Red Wool | 1 | hand (2×2) | shapeless: wool + flower_red |
| Blue Wool | 1 | hand (2×2) | shapeless: wool + flower_blue |
| Yellow Wool | 1 | hand (2×2) | shapeless: wool + flower_yellow |
| Bucket | 1 | crafting table (3×3) | `I·I / ·I·` (I=ferrite_ingot) |
| Coal Block | 1 | crafting table (3×3) | `CCC / CCC / CCC` (C=coal) |
| Coal | 9 | hand (2×2) | shapeless: coal_block |
| Ferrite Block | 1 | crafting table (3×3) | `III / III / III` (I=ferrite_ingot) |
| Ferrite Ingot | 9 | hand (2×2) | shapeless: ferrite_block |
| Aurum Block | 1 | crafting table (3×3) | `III / III / III` (I=aurum_ingot) |
| Aurum Ingot | 9 | hand (2×2) | shapeless: aurum_block |
| Copper Block | 1 | crafting table (3×3) | `III / III / III` (I=copper_ingot) |
| Copper Ingot | 9 | hand (2×2) | shapeless: copper_block |
| Crystal Block | 1 | crafting table (3×3) | `GGG / GGG / GGG` (G=aetherite_gem) |
| Aetherite Gem | 9 | hand (2×2) | shapeless: crystal_block |

## Smelting (11)

The furnace burns one fuel item when it has something it can smelt and room in the output slot
(`src/gameplay/furnace.ts`).

| Input | Output | Count | Time |
| ----- | ------ | ----- | ---- |
| Raw Ferrite | Ferrite Ingot | 1 | 10 s |
| Raw Copper | Copper Ingot | 1 | 10 s |
| Raw Aurum | Aurum Ingot | 1 | 10 s |
| Sand | Glass | 1 | 10 s |
| Clay Ball | Brick | 1 | 10 s |
| Cobblestone | Stone | 1 | 10 s |
| Cobbled Understone | Understone | 1 | 10 s |
| Raw Meat | Cooked Meat | 1 | 12 s |
| Sable Log | Charcoal | 1 | 12 s |
| Pine Log | Charcoal | 1 | 12 s |
| Dune Willow Log | Charcoal | 1 | 12 s |

## Fuels (21)

| Item | Burn time |
| ---- | --------- |
| Sable Log | 15 s |
| Planks | 15 s |
| Tall Grass | 3 s |
| Dead Bush | 5 s |
| Crafting Table | 15 s |
| Chest | 15 s |
| Oak Door | 15 s |
| Pine Log | 15 s |
| Dune Willow Log | 15 s |
| White Wool | 5 s |
| Red Wool | 5 s |
| Blue Wool | 5 s |
| Yellow Wool | 5 s |
| Coal Block | 800 s |
| Sable Sapling | 5 s |
| Pine Sapling | 5 s |
| Dune Willow Sapling | 5 s |
| Stick | 5 s |
| Coal | 80 s |
| Charcoal | 80 s |
| Shortbow | 15 s |
