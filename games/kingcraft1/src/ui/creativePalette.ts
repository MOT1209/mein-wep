import { blockById } from "../content/blocks";
import { allItems, stackSizeOf, type ItemStack } from "../content/items";
import type { ExtraSection } from "./inventoryScreen";

export function paletteItems(): string[] {
  return allItems()
    .filter((def) => def.kind !== "block" || !blockById(def.blockId).creativeHidden)
    .map((def) => def.id);
}

export function createPaletteSection(): ExtraSection {
  const items = paletteItems();
  const fill = (): ItemStack[] => items.map((item) => ({ item, count: stackSizeOf(item) }));
  const section: ExtraSection = {
    title: "All items",
    slots: fill(),
    accepts: () => false,
    onChange: () => {
      const fresh = fill();
      for (let i = 0; i < fresh.length; i++) section.slots[i] = fresh[i];
    }
  };
  return section;
}
