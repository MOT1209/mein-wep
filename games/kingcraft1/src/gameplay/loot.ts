import type { ItemStack } from "../content/items";
import type { Rng } from "../core/rng";

interface LootEntry {
  item: string;
  min: number;
  max: number;
  chance: number;
}

export const CAMP_CHEST_LOOT: readonly LootEntry[] = [
  { item: "bread", min: 1, max: 3, chance: 0.9 },
  { item: "coal", min: 2, max: 6, chance: 0.8 },
  { item: "stick", min: 3, max: 8, chance: 0.7 },
  { item: "arrow", min: 4, max: 10, chance: 0.5 },
  { item: "leather", min: 1, max: 2, chance: 0.4 },
  { item: "ferrite_ingot", min: 1, max: 2, chance: 0.25 },
  { item: "apple", min: 1, max: 2, chance: 0.35 },
  { item: "torch", min: 2, max: 4, chance: 0.3 }
];

export function campChestLoot(rng: Rng): ItemStack[] {
  const out: ItemStack[] = [];
  for (const entry of CAMP_CHEST_LOOT) {
    if (rng.next() >= entry.chance) continue;
    const count = rng.intRange(entry.min, entry.max);
    if (count > 0) out.push({ item: entry.item, count });
  }
  return out;
}
