import { B } from "../content/blocks";

export const BIOME = {
  OCEAN: 0,
  BEACH: 1,
  PLAINS: 2,
  FOREST: 3,
  DESERT: 4,
  MOUNTAINS: 5,
  SNOW_TAIGA: 6
} as const;

export type BiomeId = (typeof BIOME)[keyof typeof BIOME];

export type TreeKind = "none" | "sable" | "pine" | "dune";

export interface BiomeDef {
  id: BiomeId;
  name: string;
  topBlock: number;
  fillerBlock: number;
  fillerDepth: number;
  tree: TreeKind;
  treeAttempts: number;
  grassDensity: number;
  flowerDensity: number;
  cactusDensity: number;
  boulderChance: number;
  campChance: number;
  snow: boolean;
}

export const BIOMES: BiomeDef[] = [
  {
    id: BIOME.OCEAN,
    name: "ocean",
    topBlock: B.SAND,
    fillerBlock: B.SAND,
    fillerDepth: 3,
    tree: "none",
    treeAttempts: 0,
    grassDensity: 0,
    flowerDensity: 0,
    cactusDensity: 0,
    boulderChance: 0,
    campChance: 0,
    snow: false
  },
  {
    id: BIOME.BEACH,
    name: "beach",
    topBlock: B.SAND,
    fillerBlock: B.SAND,
    fillerDepth: 3,
    tree: "none",
    treeAttempts: 0,
    grassDensity: 0,
    flowerDensity: 0,
    cactusDensity: 0,
    boulderChance: 0.01,
    campChance: 0.004,
    snow: false
  },
  {
    id: BIOME.PLAINS,
    name: "plains",
    topBlock: B.GRASS,
    fillerBlock: B.DIRT,
    fillerDepth: 3,
    tree: "sable",
    treeAttempts: 2,
    grassDensity: 0.14,
    flowerDensity: 0.02,
    cactusDensity: 0,
    boulderChance: 0.006,
    campChance: 0.006,
    snow: false
  },
  {
    id: BIOME.FOREST,
    name: "forest",
    topBlock: B.GRASS,
    fillerBlock: B.DIRT,
    fillerDepth: 3,
    tree: "sable",
    treeAttempts: 11,
    grassDensity: 0.18,
    flowerDensity: 0.03,
    cactusDensity: 0,
    boulderChance: 0.01,
    campChance: 0.005,
    snow: false
  },
  {
    id: BIOME.DESERT,
    name: "desert",
    topBlock: B.SAND,
    fillerBlock: B.SAND,
    fillerDepth: 4,
    tree: "dune",
    treeAttempts: 1,
    grassDensity: 0,
    flowerDensity: 0,
    cactusDensity: 0.012,
    boulderChance: 0.004,
    campChance: 0.008,
    snow: false
  },
  {
    id: BIOME.MOUNTAINS,
    name: "mountains",
    topBlock: B.STONE,
    fillerBlock: B.STONE,
    fillerDepth: 3,
    tree: "pine",
    treeAttempts: 2,
    grassDensity: 0.03,
    flowerDensity: 0.004,
    cactusDensity: 0,
    boulderChance: 0.03,
    campChance: 0.002,
    snow: true
  },
  {
    id: BIOME.SNOW_TAIGA,
    name: "snow_taiga",
    topBlock: B.SNOW_GRASS,
    fillerBlock: B.DIRT,
    fillerDepth: 3,
    tree: "pine",
    treeAttempts: 6,
    grassDensity: 0.04,
    flowerDensity: 0.004,
    cactusDensity: 0,
    boulderChance: 0.012,
    campChance: 0.003,
    snow: true
  }
];

export function biomeById(id: number): BiomeDef {
  return BIOMES[id] ?? BIOMES[BIOME.PLAINS];
}

export function biomeIdByName(name: string): number {
  const found = BIOMES.find((b) => b.name === name);
  return found ? found.id : BIOME.PLAINS;
}
