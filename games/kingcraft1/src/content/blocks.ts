import { DEFAULT_STACK_SIZE } from "../config";

export type ToolKind = "pickaxe" | "axe" | "shovel" | "hoe" | "sword" | "shears";
export type MaterialKind =
  | "stone"
  | "dirt"
  | "grass"
  | "sand"
  | "wood"
  | "plant"
  | "glass"
  | "metal"
  | "wool"
  | "snow"
  | "liquid"
  | "gem";
export type RenderKind = "cube" | "cross" | "liquid";
export type InteractionKind = "crafting" | "furnace" | "chest" | "door" | "bed" | "fume" | "lantern";

export interface BlockDrop {
  item: string;
  min: number;
  max: number;
  chance?: number;
}

export interface BlockDef {
  id: number;
  name: string;
  tiles: { all?: string; top?: string; bottom?: string; side?: string; front?: string };
  render: RenderKind;
  solid: boolean;
  opaque: boolean;
  lightFilter: number;
  lightEmit: number;
  hardness: number;
  tool: ToolKind | null;
  tier: number;
  drops: BlockDrop[] | "self" | "none";
  material: MaterialKind;
  stackSize: number;
  liquid?: boolean;
  replaceable?: boolean;
  flammable?: boolean;
  interactive?: InteractionKind;
  growth?: { stage: number; next: number | null; crop: string };
  needsSupport?: boolean;
  climbable?: boolean;
  hidable?: boolean;
  creativeHidden?: boolean;
  fallHazard?: boolean;
  saplingOf?: string;
  plantedOn?: string[];
  particleTile?: string;
  emissiveTint?: [number, number, number];
  soundGroup?: MaterialKind;
}

interface DefOptions {
  tiles?: { all?: string; top?: string; bottom?: string; side?: string; front?: string };
  render?: RenderKind;
  solid?: boolean;
  opaque?: boolean;
  lightFilter?: number;
  lightEmit?: number;
  hardness?: number;
  tool?: ToolKind | null;
  tier?: number;
  drops?: BlockDrop[] | "self" | "none";
  material?: MaterialKind;
  stackSize?: number;
  liquid?: boolean;
  replaceable?: boolean;
  flammable?: boolean;
  interactive?: InteractionKind;
  growth?: { stage: number; next: number | null; crop: string };
  needsSupport?: boolean;
  climbable?: boolean;
  hidable?: boolean;
  creativeHidden?: boolean;
  fallHazard?: boolean;
  saplingOf?: string;
  plantedOn?: string[];
  particleTile?: string;
  emissiveTint?: [number, number, number];
}

export const B = {
  AIR: 0,
  STONE: 1,
  GRASS: 2,
  DIRT: 3,
  COBBLESTONE: 4,
  SAND: 5,
  SANDSTONE: 6,
  GRAVEL: 7,
  WATER: 8,
  LOG: 9,
  LEAVES: 10,
  PLANKS: 11,
  GLASS: 12,
  COAL_ORE: 13,
  COPPER_ORE: 14,
  FERRITE_ORE: 15,
  AURUM_ORE: 16,
  AETHERITE_ORE: 17,
  EMBER_ORE: 18,
  BEDROCK: 19,
  SNOW_BLOCK: 20,
  SNOW_GRASS: 21,
  ICE: 22,
  PERMAFROST: 23,
  FROSTGLASS: 24,
  GLOWCRYSTAL: 25,
  ICICLE: 26,
  CACTUS: 27,
  TALL_GRASS: 28,
  FLOWER_RED: 29,
  FLOWER_YELLOW: 30,
  FLOWER_BLUE: 31,
  MUSHROOM_RED: 32,
  MUSHROOM_BROWN: 33,
  DEAD_BUSH: 34,
  TORCH: 35,
  CRAFTING_TABLE: 36,
  FURNACE: 37,
  FURNACE_LIT: 38,
  CHEST: 39,
  BED: 40,
  DOOR_CLOSED: 41,
  DOOR_OPEN: 42,
  BRICKS: 43,
  STONE_BRICKS: 44,
  MOSSY_STONE: 45,
  SANDSTONE_BRICKS: 46,
  EMBERSTONE: 47,
  EMBERSTONE_BRICKS: 48,
  RUSTROCK: 49,
  RUSTROCK_BRICKS: 50,
  EMBERLIGHT: 51,
  UNDERSTONE: 52,
  UNDERSTONE_BRICKS: 53,
  FUME_VENT: 54,
  FARMLAND: 55,
  FARMLAND_WET: 56,
  WHEAT_0: 57,
  WHEAT_1: 58,
  WHEAT_2: 59,
  WHEAT_3: 60,
  LOG_PINE: 61,
  LEAVES_PINE: 62,
  LOG_DUNE: 63,
  LEAVES_DUNE: 64,
  CLAY: 65,
  VOIDROCK: 66,
  WOOL: 67,
  WOOL_RED: 68,
  WOOL_BLUE: 69,
  WOOL_YELLOW: 70,
  FERRO_LANTERN: 71,
  CAMPFIRE: 72,
  GLOWSHROOM: 73,
  CRYSTAL_BLOCK: 74,
  AURUM_BLOCK: 75,
  FERRITE_BLOCK: 76,
  COPPER_BLOCK: 77,
  COAL_BLOCK: 78,
  SAPLING_SABLE: 79,
  SAPLING_PINE: 80,
  SAPLING_DUNE: 81,
  DEWBERRY_FULL: 82,
  DEWBERRY_EMPTY: 83
} as const;

export type BlockName = string;

const defs: BlockDef[] = [];

function def(
  id: number,
  name: string,
  tiles: { all?: string; top?: string; bottom?: string; side?: string; front?: string },
  opts: DefOptions = {}
): BlockDef {
  const d: BlockDef = {
    id,
    name,
    tiles,
    render: opts.render ?? "cube",
    solid: opts.solid ?? true,
    opaque: opts.opaque ?? true,
    lightFilter: opts.lightFilter ?? (opts.opaque === false ? 0 : 15),
    lightEmit: opts.lightEmit ?? 0,
    hardness: opts.hardness ?? 1,
    tool: opts.tool === undefined ? "pickaxe" : opts.tool,
    tier: opts.tier ?? 0,
    drops: opts.drops ?? "self",
    material: opts.material ?? "stone",
    stackSize: opts.stackSize ?? DEFAULT_STACK_SIZE,
    liquid: opts.liquid,
    replaceable: opts.replaceable,
    flammable: opts.flammable,
    interactive: opts.interactive,
    growth: opts.growth,
    needsSupport: opts.needsSupport,
    climbable: opts.climbable,
    creativeHidden: opts.creativeHidden,
    fallHazard: opts.fallHazard,
    saplingOf: opts.saplingOf,
    plantedOn: opts.plantedOn,
    particleTile: opts.particleTile,
    emissiveTint: opts.emissiveTint
  };
  defs[id] = d;
  return d;
}

def(B.AIR, "air", { all: "air" }, {
  render: "cube",
  solid: false,
  opaque: false,
  lightFilter: 0,
  hardness: 0,
  tool: null,
  drops: "none",
  creativeHidden: true
});

def(B.STONE, "stone", { all: "stone" }, {
  hardness: 1.6,
  tool: "pickaxe",
  tier: 1,
  drops: [{ item: "cobblestone", min: 1, max: 1 }],
  material: "stone"
});

def(B.GRASS, "grass", { top: "grass_top", bottom: "dirt", side: "grass_side" }, {
  hardness: 0.7,
  tool: "shovel",
  drops: [{ item: "dirt", min: 1, max: 1 }],
  material: "grass"
});

def(B.DIRT, "dirt", { all: "dirt" }, { hardness: 0.6, tool: "shovel", material: "dirt" });

def(B.COBBLESTONE, "cobblestone", { all: "cobblestone" }, {
  hardness: 1.8,
  tool: "pickaxe",
  tier: 1,
  material: "stone"
});

def(B.SAND, "sand", { all: "sand" }, {
  hardness: 0.5,
  tool: "shovel",
  material: "sand"
});

def(B.SANDSTONE, "sandstone", { top: "sandstone_top", bottom: "sandstone_top", side: "sandstone_side" }, {
  hardness: 1.4,
  tool: "pickaxe",
  tier: 1,
  material: "stone"
});

def(B.GRAVEL, "gravel", { all: "gravel" }, {
  hardness: 0.65,
  tool: "shovel",
  material: "sand",
  drops: [
    { item: "gravel", min: 1, max: 1, chance: 0.85 },
    { item: "stone_shard", min: 1, max: 1, chance: 0.15 }
  ]
});

def(B.WATER, "water", { all: "water" }, {
  render: "liquid",
  solid: false,
  opaque: false,
  lightFilter: 1,
  hardness: -1,
  tool: null,
  drops: "none",
  liquid: true,
  replaceable: true,
  material: "liquid",
  stackSize: 1,
  creativeHidden: true,
  particleTile: "water"
});

def(B.LOG, "log", { top: "log_top", bottom: "log_top", side: "log_side" }, {
  hardness: 2,
  tool: "axe",
  material: "wood",
  flammable: true
});

def(B.LEAVES, "leaves", { all: "leaves" }, {
  hardness: 0.25,
  tool: "shears",
  opaque: false,
  lightFilter: 2,
  material: "plant",
  flammable: true,
  drops: [
    { item: "sapling_sable", min: 1, max: 1, chance: 0.12 },
    { item: "apple", min: 1, max: 1, chance: 0.05 },
    { item: "stick", min: 1, max: 2, chance: 0.1 }
  ]
});

def(B.PLANKS, "planks", { all: "planks" }, {
  hardness: 1.1,
  tool: "axe",
  material: "wood",
  flammable: true
});

def(B.GLASS, "glass", { all: "glass" }, {
  hardness: 0.4,
  tool: "pickaxe",
  opaque: false,
  lightFilter: 0,
  drops: "none",
  material: "glass"
});

def(B.COAL_ORE, "coal_ore", { all: "coal_ore" }, {
  hardness: 2.2,
  tool: "pickaxe",
  tier: 1,
  drops: [{ item: "coal", min: 1, max: 1 }],
  material: "stone"
});

def(B.COPPER_ORE, "copper_ore", { all: "copper_ore" }, {
  hardness: 2.4,
  tool: "pickaxe",
  tier: 1,
  drops: [{ item: "raw_copper", min: 2, max: 3 }],
  material: "stone"
});

def(B.FERRITE_ORE, "ferrite_ore", { all: "ferrite_ore" }, {
  hardness: 2.8,
  tool: "pickaxe",
  tier: 2,
  drops: [{ item: "raw_ferrite", min: 1, max: 1 }],
  material: "stone"
});

def(B.AURUM_ORE, "aurum_ore", { all: "aurum_ore" }, {
  hardness: 3,
  tool: "pickaxe",
  tier: 3,
  drops: [{ item: "raw_aurum", min: 1, max: 1 }],
  material: "stone"
});

def(B.AETHERITE_ORE, "aetherite_ore", { all: "aetherite_ore" }, {
  hardness: 3.4,
  tool: "pickaxe",
  tier: 3,
  drops: [{ item: "aetherite_gem", min: 1, max: 1 }],
  material: "gem"
});

def(B.EMBER_ORE, "ember_ore", { all: "ember_ore" }, {
  hardness: 2.9,
  tool: "pickaxe",
  tier: 2,
  drops: [{ item: "ember_dust", min: 3, max: 5 }],
  material: "stone",
  lightEmit: 4
});

def(B.BEDROCK, "bedrock", { all: "bedrock" }, {
  hardness: -1,
  tool: "pickaxe",
  tier: 99,
  drops: "none",
  material: "stone",
  creativeHidden: true
});

def(B.SNOW_BLOCK, "snow_block", { all: "snow" }, {
  hardness: 0.4,
  tool: "shovel",
  material: "snow"
});

def(B.SNOW_GRASS, "snow_grass", { top: "snow", bottom: "dirt", side: "snow_grass_side" }, {
  hardness: 0.7,
  tool: "shovel",
  drops: [{ item: "dirt", min: 1, max: 1 }],
  material: "snow"
});

def(B.ICE, "ice", { all: "ice" }, {
  hardness: 0.6,
  tool: "pickaxe",
  tier: 1,
  opaque: false,
  lightFilter: 3,
  drops: "none",
  material: "glass"
});

def(B.PERMAFROST, "permafrost", { all: "permafrost" }, {
  hardness: 2.4,
  tool: "pickaxe",
  tier: 1,
  material: "stone"
});

def(B.FROSTGLASS, "frostglass", { all: "frostglass" }, {
  hardness: 0.7,
  tool: "pickaxe",
  tier: 1,
  opaque: false,
  lightFilter: 2,
  drops: "self",
  material: "glass"
});

def(B.GLOWCRYSTAL, "glowcrystal", { all: "glowcrystal" }, {
  hardness: 0.8,
  tool: "pickaxe",
  tier: 1,
  opaque: false,
  lightFilter: 4,
  lightEmit: 13,
  material: "gem",
  needsSupport: true
});

def(B.ICICLE, "icicle", { all: "icicle" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 0,
  hardness: 0.3,
  tool: "pickaxe",
  drops: "none",
  material: "glass",
  needsSupport: true,
  fallHazard: true
});

def(B.CACTUS, "cactus", { top: "cactus_top", bottom: "cactus_top", side: "cactus_side" }, {
  hardness: 0.6,
  tool: null,
  material: "plant",
  needsSupport: true
});

def(B.TALL_GRASS, "tall_grass", { all: "tall_grass" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 1,
  hardness: 0.1,
  tool: "shears",
  material: "plant",
  flammable: true,
  needsSupport: true,
  drops: [
    { item: "seeds", min: 1, max: 2, chance: 0.3 },
    { item: "tall_grass", min: 1, max: 1, chance: 0.6 }
  ]
});

def(B.FLOWER_RED, "flower_red", { all: "flower_red" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 1,
  hardness: 0.1,
  tool: null,
  material: "plant",
  needsSupport: true
});

def(B.FLOWER_YELLOW, "flower_yellow", { all: "flower_yellow" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 1,
  hardness: 0.1,
  tool: null,
  material: "plant",
  needsSupport: true
});

def(B.FLOWER_BLUE, "flower_blue", { all: "flower_blue" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 1,
  hardness: 0.1,
  tool: null,
  material: "plant",
  needsSupport: true
});

def(B.MUSHROOM_RED, "mushroom_red", { all: "mushroom_red" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 1,
  hardness: 0.1,
  tool: null,
  material: "plant",
  needsSupport: true
});

def(B.MUSHROOM_BROWN, "mushroom_brown", { all: "mushroom_brown" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 1,
  hardness: 0.1,
  tool: null,
  material: "plant",
  needsSupport: true
});

def(B.DEAD_BUSH, "dead_bush", { all: "dead_bush" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 1,
  hardness: 0.1,
  tool: null,
  material: "plant",
  flammable: true,
  needsSupport: true,
  drops: [{ item: "stick", min: 1, max: 2, chance: 0.7 }]
});

def(B.TORCH, "torch", { all: "torch" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 0,
  lightEmit: 14,
  hardness: 0.05,
  tool: null,
  material: "wood",
  needsSupport: true,
  emissiveTint: [1.0, 0.85, 0.5],
  particleTile: "torch"
});

def(B.CRAFTING_TABLE, "crafting_table", { top: "crafting_table_top", bottom: "planks", side: "crafting_table_side", front: "crafting_table_front" }, {
  hardness: 1.6,
  tool: "axe",
  material: "wood",
  interactive: "crafting",
  flammable: true
});

def(B.FURNACE, "furnace", { top: "furnace_top", bottom: "furnace_top", side: "furnace_side", front: "furnace_front" }, {
  hardness: 2.4,
  tool: "pickaxe",
  tier: 1,
  material: "stone",
  interactive: "furnace"
});

def(B.FURNACE_LIT, "furnace_lit", { top: "furnace_top", bottom: "furnace_top", side: "furnace_side", front: "furnace_front_lit" }, {
  hardness: 2.4,
  tool: "pickaxe",
  tier: 1,
  material: "stone",
  interactive: "furnace",
  lightEmit: 12,
  drops: [{ item: "furnace", min: 1, max: 1 }],
  creativeHidden: true,
  emissiveTint: [1.0, 0.7, 0.35]
});

def(B.CHEST, "chest", { top: "chest_top", bottom: "chest_top", side: "chest_side", front: "chest_front" }, {
  hardness: 1.6,
  tool: "axe",
  material: "wood",
  interactive: "chest",
  flammable: true
});

def(B.BED, "bed", { top: "bed_top", bottom: "planks", side: "bed_side" }, {
  render: "cube",
  solid: true,
  hardness: 0.9,
  tool: null,
  material: "wool",
  interactive: "bed",
  opaque: false,
  lightFilter: 0,
  stackSize: 1
});

def(B.DOOR_CLOSED, "door_closed", { all: "door" }, {
  hardness: 1.4,
  tool: "axe",
  material: "wood",
  interactive: "door",
  opaque: false,
  lightFilter: 0,
  drops: [{ item: "door_closed", min: 1, max: 1 }],
  stackSize: 1
});

def(B.DOOR_OPEN, "door_open", { all: "door" }, {
  hardness: 1.4,
  tool: "axe",
  material: "wood",
  interactive: "door",
  solid: false,
  opaque: false,
  lightFilter: 0,
  drops: [{ item: "door_closed", min: 1, max: 1 }],
  creativeHidden: true,
  stackSize: 1
});

def(B.BRICKS, "bricks", { all: "bricks" }, { hardness: 2.1, tool: "pickaxe", tier: 1, material: "stone" });

def(B.STONE_BRICKS, "stone_bricks", { all: "stone_bricks" }, { hardness: 2, tool: "pickaxe", tier: 1, material: "stone" });

def(B.MOSSY_STONE, "mossy_stone", { all: "mossy_stone" }, { hardness: 2, tool: "pickaxe", tier: 1, material: "stone" });

def(B.SANDSTONE_BRICKS, "sandstone_bricks", { all: "sandstone_bricks" }, { hardness: 1.8, tool: "pickaxe", tier: 1, material: "stone" });

def(B.EMBERSTONE, "emberstone", { all: "emberstone" }, { hardness: 2.6, tool: "pickaxe", tier: 2, material: "stone" });

def(B.EMBERSTONE_BRICKS, "emberstone_bricks", { all: "emberstone_bricks" }, { hardness: 2.6, tool: "pickaxe", tier: 2, material: "stone" });

def(B.RUSTROCK, "rustrock", { all: "rustrock" }, { hardness: 2.6, tool: "pickaxe", tier: 2, material: "stone" });

def(B.RUSTROCK_BRICKS, "rustrock_bricks", { all: "rustrock_bricks" }, { hardness: 2.6, tool: "pickaxe", tier: 2, material: "stone" });

def(B.EMBERLIGHT, "emberlight", { all: "emberlight" }, {
  hardness: 1.2,
  tool: "pickaxe",
  tier: 1,
  material: "gem",
  lightEmit: 15,
  emissiveTint: [1.0, 0.75, 0.4]
});

def(B.UNDERSTONE, "understone", { all: "understone" }, {
  hardness: 2.2,
  tool: "pickaxe",
  tier: 1,
  drops: [{ item: "cobbled_understone", min: 1, max: 1 }],
  material: "stone"
});

def(B.UNDERSTONE_BRICKS, "understone_bricks", { all: "understone_bricks" }, { hardness: 2.2, tool: "pickaxe", tier: 1, material: "stone" });

def(B.FUME_VENT, "fume_vent", { all: "fume_vent" }, {
  hardness: 2,
  tool: "pickaxe",
  tier: 1,
  material: "stone",
  interactive: "fume"
});

def(B.FARMLAND, "farmland", { top: "farmland", bottom: "dirt", side: "dirt" }, {
  hardness: 0.6,
  tool: "shovel",
  drops: [{ item: "dirt", min: 1, max: 1 }],
  material: "dirt"
});

def(B.FARMLAND_WET, "farmland_wet", { top: "farmland_wet", bottom: "dirt", side: "dirt" }, {
  hardness: 0.6,
  tool: "shovel",
  drops: [{ item: "dirt", min: 1, max: 1 }],
  material: "dirt",
  creativeHidden: true
});

const wheatTiles = ["wheat_0", "wheat_1", "wheat_2", "wheat_3"];
for (let stage = 0; stage < 4; stage++) {
  def((B.WHEAT_0 + stage) as number, `wheat_${stage}`, { all: wheatTiles[stage] }, {
    render: "cross",
    solid: false,
    opaque: false,
    lightFilter: 0,
    hardness: 0.05,
    tool: null,
    material: "plant",
    needsSupport: true,
    growth: { stage, next: stage < 3 ? B.WHEAT_0 + stage + 1 : null, crop: "wheat" },
    drops:
      stage === 3
        ? [
            { item: "wheat", min: 1, max: 1 },
            { item: "seeds", min: 1, max: 3 }
          ]
        : [{ item: "seeds", min: 1, max: 1 }],
    creativeHidden: stage !== 3,
    stackSize: DEFAULT_STACK_SIZE
  });
}

def(B.LOG_PINE, "log_pine", { top: "log_pine_top", bottom: "log_pine_top", side: "log_pine_side" }, {
  hardness: 2,
  tool: "axe",
  material: "wood",
  flammable: true
});

def(B.LEAVES_PINE, "leaves_pine", { all: "leaves_pine" }, {
  hardness: 0.25,
  tool: "shears",
  opaque: false,
  lightFilter: 2,
  material: "plant",
  flammable: true,
  drops: [
    { item: "sapling_pine", min: 1, max: 1, chance: 0.12 },
    { item: "stick", min: 1, max: 2, chance: 0.08 }
  ]
});

def(B.LOG_DUNE, "log_dune", { top: "log_dune_top", bottom: "log_dune_top", side: "log_dune_side" }, {
  hardness: 2,
  tool: "axe",
  material: "wood",
  flammable: true
});

def(B.LEAVES_DUNE, "leaves_dune", { all: "leaves_dune" }, {
  hardness: 0.25,
  tool: "shears",
  opaque: false,
  lightFilter: 2,
  material: "plant",
  flammable: true,
  drops: [{ item: "sapling_dune", min: 1, max: 1, chance: 0.12 }]
});

def(B.CLAY, "clay", { all: "clay" }, {
  hardness: 0.6,
  tool: "shovel",
  drops: [{ item: "clay_ball", min: 4, max: 4 }],
  material: "dirt"
});

def(B.VOIDROCK, "voidrock", { all: "voidrock" }, {
  hardness: 8,
  tool: "pickaxe",
  tier: 3,
  material: "stone"
});

def(B.WOOL, "wool", { all: "wool_white" }, { hardness: 0.8, tool: null, material: "wool", flammable: true });
def(B.WOOL_RED, "wool_red", { all: "wool_red" }, { hardness: 0.8, tool: null, material: "wool", flammable: true });
def(B.WOOL_BLUE, "wool_blue", { all: "wool_blue" }, { hardness: 0.8, tool: null, material: "wool", flammable: true });
def(B.WOOL_YELLOW, "wool_yellow", { all: "wool_yellow" }, { hardness: 0.8, tool: null, material: "wool", flammable: true });

def(B.FERRO_LANTERN, "ferro_lantern", { all: "ferro_lantern" }, {
  hardness: 1.4,
  tool: "pickaxe",
  tier: 1,
  material: "metal",
  lightEmit: 15,
  emissiveTint: [1.0, 0.9, 0.7]
});

def(B.CAMPFIRE, "campfire", { top: "campfire_top", bottom: "log_top", side: "campfire_side" }, {
  hardness: 1.2,
  tool: "axe",
  material: "wood",
  lightEmit: 13,
  opaque: false,
  lightFilter: 0,
  solid: false,
  emissiveTint: [1.0, 0.6, 0.3]
});

def(B.GLOWSHROOM, "glowshroom", { all: "glowshroom" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 0,
  lightEmit: 7,
  hardness: 0.1,
  tool: null,
  material: "plant",
  needsSupport: true,
  emissiveTint: [0.5, 0.9, 1.0]
});

def(B.CRYSTAL_BLOCK, "crystal_block", { all: "crystal_block" }, {
  hardness: 2.4,
  tool: "pickaxe",
  tier: 3,
  material: "gem",
  opaque: false,
  lightFilter: 3
});

def(B.AURUM_BLOCK, "aurum_block", { all: "aurum_block" }, { hardness: 2.6, tool: "pickaxe", tier: 3, material: "metal" });
def(B.FERRITE_BLOCK, "ferrite_block", { all: "ferrite_block" }, { hardness: 3.2, tool: "pickaxe", tier: 2, material: "metal" });
def(B.COPPER_BLOCK, "copper_block", { all: "copper_block" }, { hardness: 2.8, tool: "pickaxe", tier: 2, material: "metal" });
def(B.COAL_BLOCK, "coal_block", { all: "coal_block" }, { hardness: 2.4, tool: "pickaxe", tier: 1, material: "stone", flammable: true });

def(B.SAPLING_SABLE, "sapling_sable", { all: "sapling_sable" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 0,
  hardness: 0.05,
  tool: null,
  material: "plant",
  needsSupport: true,
  plantedOn: ["grass", "dirt", "farmland"],
  saplingOf: "tree_sable"
});

def(B.SAPLING_PINE, "sapling_pine", { all: "sapling_pine" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 0,
  hardness: 0.05,
  tool: null,
  material: "plant",
  needsSupport: true,
  plantedOn: ["grass", "dirt", "snow_grass", "snow_block", "farmland"],
  saplingOf: "tree_pine"
});

def(B.SAPLING_DUNE, "sapling_dune", { all: "sapling_dune" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 0,
  hardness: 0.05,
  tool: null,
  material: "plant",
  needsSupport: true,
  plantedOn: ["sand", "dirt", "farmland"],
  saplingOf: "tree_dune"
});

def(B.DEWBERRY_FULL, "dewberry_full", { all: "dewberry_full" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 0,
  hardness: 0.1,
  tool: null,
  material: "plant",
  needsSupport: true,
  growth: { stage: 1, next: null, crop: "dewberry" },
  drops: [
    { item: "dewberry", min: 1, max: 2 },
    { item: "dewberry_full", min: 1, max: 1, chance: 0.5 }
  ]
});

def(B.DEWBERRY_EMPTY, "dewberry_empty", { all: "dewberry_empty" }, {
  render: "cross",
  solid: false,
  opaque: false,
  lightFilter: 0,
  hardness: 0.1,
  tool: null,
  material: "plant",
  needsSupport: true,
  growth: { stage: 0, next: B.DEWBERRY_FULL, crop: "dewberry" },
  drops: [{ item: "dewberry_empty", min: 1, max: 1, chance: 0.5 }],
  creativeHidden: true
});

export const BLOCKS: readonly BlockDef[] = defs;

export function blockById(id: number): BlockDef {
  const d = defs[id];
  if (!d) return defs[0];
  return d;
}

const byName = new Map<string, BlockDef>();
for (const d of defs) if (d) byName.set(d.name, d);

export function blockByName(name: string): BlockDef | undefined {
  return byName.get(name);
}

export function blockIdByName(name: string): number {
  return byName.get(name)?.id ?? -1;
}

export function isOpaque(id: number): boolean {
  return defs[id]?.opaque ?? false;
}

export function isSolidBlock(id: number): boolean {
  const d = defs[id];
  return d ? d.solid : false;
}

export function isLiquid(id: number): boolean {
  return defs[id]?.liquid === true;
}

export function blocksLight(id: number): boolean {
  const d = defs[id];
  return d ? d.lightFilter >= 15 : false;
}

export function lightFilterOf(id: number): number {
  const d = defs[id];
  return d ? d.lightFilter : 15;
}

export function lightEmitOf(id: number): number {
  const d = defs[id];
  return d ? d.lightEmit : 0;
}

export const PLACEABLE_BLOCK_ITEM_EXCLUSIONS = new Set(["air", "water", "furnace_lit", "door_open", "farmland_wet"]);

export const CROP_BLOCKS = new Set<number>([
  B.WHEAT_0,
  B.WHEAT_1,
  B.WHEAT_2,
  B.WHEAT_3,
  B.DEWBERRY_EMPTY
]);

export const REPLACEABLE_ON_PLACE = new Set<number>([
  B.AIR,
  B.WATER,
  B.TALL_GRASS,
  B.DEAD_BUSH,
  B.FLOWER_RED,
  B.FLOWER_YELLOW,
  B.FLOWER_BLUE,
  B.MUSHROOM_RED,
  B.MUSHROOM_BROWN,
  B.SNOW_BLOCK
]);
