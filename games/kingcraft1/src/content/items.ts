import { BLOCKS, PLACEABLE_BLOCK_ITEM_EXCLUSIONS, blockById } from "./blocks";
import type { ToolKind } from "./blocks";

export type ItemKind = "block" | "material" | "food" | "tool" | "armor" | "misc";
export type ArmorSlot = "head" | "chest" | "legs" | "feet";

export interface ToolStats {
  kind: ToolKind;
  tier: number;
  efficiency: number;
  damage: number;
  durability: number;
}

export interface ArmorStats {
  slot: ArmorSlot;
  points: number;
  durability: number;
  toughness: number;
}

export interface ItemDef {
  id: string;
  kind: ItemKind;
  blockId: number;
  stackSize: number;
  food?: { hunger: number; saturation: number };
  tool?: ToolStats;
  armor?: ArmorStats;
  fuelSeconds?: number;
  useAction?: "eat" | "plant" | "bone_meal" | "name_tag" | "shears" | "bow";
  projectile?: { damage: number; speed: number };
}

const items = new Map<string, ItemDef>();

function item(id: string, kind: ItemKind, extra: Partial<ItemDef> = {}): ItemDef {
  const def: ItemDef = {
    id,
    kind,
    blockId: extra.blockId ?? -1,
    stackSize: extra.stackSize ?? 64,
    ...extra
  };
  items.set(id, def);
  return def;
}

for (const b of BLOCKS) {
  if (!b) continue;
  if (PLACEABLE_BLOCK_ITEM_EXCLUSIONS.has(b.name)) continue;
  item(b.name, "block", { blockId: b.id, stackSize: b.stackSize });
}

export const ITEM_MATERIALS = [
  "stick",
  "coal",
  "charcoal",
  "raw_ferrite",
  "ferrite_ingot",
  "raw_copper",
  "copper_ingot",
  "raw_aurum",
  "aurum_ingot",
  "aetherite_gem",
  "ember_dust",
  "clay_ball",
  "brick",
  "stone_shard",
  "string",
  "leather",
  "feather",
  "bone",
  "ground_bone",
  "wheat",
  "seeds",
  "cobbled_understone"
] as const;

for (const m of ITEM_MATERIALS) {
  item(m, "material", {
    fuelSeconds: m === "coal" || m === "charcoal" ? 80 : m === "stick" ? 5 : undefined
  });
}

export const ITEM_FOODS: { id: string; hunger: number; saturation: number }[] = [
  { id: "apple", hunger: 4, saturation: 2.4 },
  { id: "bread", hunger: 6, saturation: 3.6 },
  { id: "dewberry", hunger: 2, saturation: 1.2 },
  { id: "raw_meat", hunger: 3, saturation: 1.2 },
  { id: "cooked_meat", hunger: 8, saturation: 6.4 }
];

for (const f of ITEM_FOODS) {
  item(f.id, "food", { food: { hunger: f.hunger, saturation: f.saturation }, useAction: "eat" });
}

export interface ToolTierDef {
  name: string;
  tier: number;
  efficiency: number;
  durability: number;
  swordDamage: number;
  materialItem: string;
}

export const TOOL_TIERS: ToolTierDef[] = [
  { name: "wood", tier: 1, efficiency: 2, durability: 60, swordDamage: 4, materialItem: "planks" },
  { name: "stone", tier: 2, efficiency: 4, durability: 132, swordDamage: 5, materialItem: "cobblestone" },
  { name: "ferrite", tier: 3, efficiency: 6, durability: 260, swordDamage: 6, materialItem: "ferrite_ingot" },
  { name: "aurum", tier: 4, efficiency: 10, durability: 40, swordDamage: 4, materialItem: "aurum_ingot" },
  { name: "aetherite", tier: 5, efficiency: 12, durability: 1600, swordDamage: 8, materialItem: "aetherite_gem" }
];

export const TOOL_KINDS: ToolKind[] = ["pickaxe", "axe", "shovel", "hoe", "sword"];

for (const t of TOOL_TIERS) {
  for (const kind of TOOL_KINDS) {
    item(`${t.name}_${kind}`, "tool", {
      stackSize: 1,
      tool: {
        kind,
        tier: t.tier,
        efficiency: t.efficiency,
        damage: kind === "sword" ? t.swordDamage : 1 + t.tier * 0.5,
        durability: t.durability
      }
    });
  }
}

item("ferrite_shears", "tool", {
  stackSize: 1,
  useAction: "shears",
  tool: { kind: "shears", tier: 3, efficiency: 5, damage: 1, durability: 238 }
});

export interface ArmorTierDef {
  name: string;
  points: { head: number; chest: number; legs: number; feet: number };
  durability: number;
  toughness: number;
  materialItem: string;
}

export const ARMOR_TIERS: ArmorTierDef[] = [
  { name: "leather", points: { head: 1, chest: 3, legs: 2, feet: 1 }, durability: 80, toughness: 0, materialItem: "leather" },
  { name: "ferrite", points: { head: 2, chest: 6, legs: 5, feet: 2 }, durability: 240, toughness: 0, materialItem: "ferrite_ingot" },
  { name: "aurum", points: { head: 2, chest: 5, legs: 3, feet: 1 }, durability: 112, toughness: 0, materialItem: "aurum_ingot" },
  { name: "aetherite", points: { head: 3, chest: 8, legs: 6, feet: 3 }, durability: 528, toughness: 2, materialItem: "aetherite_gem" }
];

export const ARMOR_SLOTS: ArmorSlot[] = ["head", "chest", "legs", "feet"];

for (const a of ARMOR_TIERS) {
  for (const slot of ARMOR_SLOTS) {
    item(`${a.name}_${slot}`, "armor", {
      stackSize: 1,
      armor: {
        slot,
        points: a.points[slot],
        durability: a.durability,
        toughness: a.toughness
      }
    });
  }
}

item("bow", "misc", {
  stackSize: 1,
  useAction: "bow",
  projectile: { damage: 5, speed: 34 },
  fuelSeconds: 15
});

item("arrow", "misc", { stackSize: 64 });

item("name_tag", "misc", { stackSize: 16, useAction: "name_tag" });
item("ground_bone", "misc", { stackSize: 64, useAction: "bone_meal" });

item("bucket", "misc", { stackSize: 1 });
item("water_bucket", "misc", { stackSize: 1, blockId: -99 });

const FUEL_BLOCKS: Record<string, number> = {
  planks: 15,
  log: 15,
  log_pine: 15,
  log_dune: 15,
  coal_block: 800,
  sapling_sable: 5,
  sapling_pine: 5,
  sapling_dune: 5,
  dead_bush: 5,
  tall_grass: 3,
  wool: 5,
  wool_red: 5,
  wool_blue: 5,
  wool_yellow: 5,
  crafting_table: 15,
  chest: 15,
  door_closed: 15
};

for (const [name, seconds] of Object.entries(FUEL_BLOCKS)) {
  const def = items.get(name);
  if (def) def.fuelSeconds = seconds;
}

export function itemById(id: string): ItemDef | undefined {
  return items.get(id);
}

export function allItems(): ItemDef[] {
  return [...items.values()];
}

export function stackSizeOf(id: string): number {
  return items.get(id)?.stackSize ?? 64;
}

export function maxDurability(id: string): number {
  const def = items.get(id);
  if (!def) return 0;
  if (def.tool) return def.tool.durability;
  if (def.armor) return def.armor.durability;
  return 0;
}

export function isTool(id: string): boolean {
  return items.get(id)?.kind === "tool";
}

export function isArmor(id: string): boolean {
  return items.get(id)?.kind === "armor";
}

export function toolStats(id: string): ToolStats | undefined {
  return items.get(id)?.tool;
}

export function armorStats(id: string): ArmorStats | undefined {
  return items.get(id)?.armor;
}

export function fuelSeconds(id: string): number {
  return items.get(id)?.fuelSeconds ?? 0;
}

export function foodValue(id: string): { hunger: number; saturation: number } | undefined {
  return items.get(id)?.food;
}

export function blockIdOfItem(id: string): number {
  return items.get(id)?.blockId ?? -1;
}

export function displayNameOf(id: string): string {
  const def = items.get(id);
  if (!def) return id;
  return def.id;
}

export function isBlockItem(id: string): boolean {
  return items.get(id)?.kind === "block";
}

export function itemForBlock(blockId: number): string | undefined {
  const b = blockById(blockId);
  if (!b) return undefined;
  if (PLACEABLE_BLOCK_ITEM_EXCLUSIONS.has(b.name)) return undefined;
  return b.name;
}
