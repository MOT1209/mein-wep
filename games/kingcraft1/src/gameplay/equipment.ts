import { armorStats, maxDurability, type ArmorSlot, type ItemStack } from "../content/items";

export const ARMOR_SLOT_ORDER: readonly ArmorSlot[] = ["head", "chest", "legs", "feet"];
export const MAX_ARMOR_POINTS = 20;

export interface EquipmentSave {
  slots: (ItemStack | null)[];
}

export function armorAbsorb(points: number, toughness: number, damage: number): number {
  if (points <= 0 || damage <= 0) return 0;
  const effective = Math.max(points / 5, points - damage / (toughness + 8));
  return damage * (Math.max(0, Math.min(MAX_ARMOR_POINTS, effective)) / 25);
}

export class Equipment {
  slots: (ItemStack | null)[] = ARMOR_SLOT_ORDER.map(() => null);

  get points(): number {
    let total = 0;
    for (const stack of this.slots) {
      if (stack) total += armorStats(stack.item)?.points ?? 0;
    }
    return total;
  }

  get toughness(): number {
    let total = 0;
    for (const stack of this.slots) {
      if (stack) total += armorStats(stack.item)?.toughness ?? 0;
    }
    return total;
  }

  accepts(index: number, stack: ItemStack): boolean {
    return armorStats(stack.item)?.slot === ARMOR_SLOT_ORDER[index];
  }

  wear(): void {
    for (let i = 0; i < this.slots.length; i++) {
      const stack = this.slots[i];
      if (!stack) continue;
      const max = maxDurability(stack.item);
      if (max <= 0) continue;
      const left = (stack.durability ?? max) - 1;
      this.slots[i] = left <= 0 ? null : { item: stack.item, count: 1, durability: left };
    }
  }

  clear(): void {
    for (let i = 0; i < this.slots.length; i++) this.slots[i] = null;
  }

  toJSON(): EquipmentSave {
    return {
      slots: this.slots.map((stack) => {
        if (!stack) return null;
        return stack.durability === undefined
          ? { item: stack.item, count: 1 }
          : { item: stack.item, count: 1, durability: stack.durability };
      })
    };
  }

  static fromJSON(raw: unknown): Equipment {
    const equipment = new Equipment();
    if (!raw || typeof raw !== "object") return equipment;
    const slots = (raw as Partial<EquipmentSave>).slots;
    if (!Array.isArray(slots)) return equipment;
    for (let i = 0; i < equipment.slots.length; i++) {
      const stack = slots[i];
      if (!stack || typeof stack.item !== "string") continue;
      const stats = armorStats(stack.item);
      if (!stats || stats.slot !== ARMOR_SLOT_ORDER[i]) continue;
      const durability =
        typeof stack.durability === "number" && Number.isFinite(stack.durability)
          ? Math.max(1, Math.min(stats.durability, Math.floor(stack.durability)))
          : undefined;
      equipment.slots[i] = durability === undefined ? { item: stack.item, count: 1 } : { item: stack.item, count: 1, durability };
    }
    return equipment;
  }
}
