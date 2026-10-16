export type CreatureCategory = "passive" | "neutral" | "hostile";
export type CreatureModel = "quadruped" | "bird" | "wisp" | "crawler" | "biped";

export interface CreatureDrop {
  item: string;
  min: number;
  max: number;
  chance?: number;
}

export interface CreatureDef {
  id: string;
  category: CreatureCategory;
  model: CreatureModel;
  health: number;
  speed: number;
  hostileSpeed: number;
  damage: number;
  size: { w: number; h: number };
  drops: CreatureDrop[];
  xpDrop: number;
  spawnLightMax: number;
  spawnBiome: string[];
  spawnSurface: boolean;
  spawnUnderground: boolean;
  minY: number;
  maxY: number;
  burnsInDaylight: boolean;
  ranged?: { damage: number; speed: number; cooldown: number; range: number };
  slowsOnHit?: boolean;
  colors: { body: number; head: number; accent: number; legs: number };
  babyScale: number;
  breedItem?: string;
  breedCooldownSeconds?: number;
  shearDrop?: { item: string; min: number; max: number };
  fleeRadius?: number;
}

export const FALLBACK_CREATURE: CreatureDef = {
  id: "unknown",
  category: "passive",
  model: "quadruped",
  health: 10,
  speed: 2.2,
  hostileSpeed: 3.2,
  damage: 0,
  size: { w: 0.8, h: 1.2 },
  drops: [],
  xpDrop: 0,
  spawnLightMax: 15,
  spawnBiome: ["*"],
  spawnSurface: true,
  spawnUnderground: false,
  minY: 0,
  maxY: 200,
  burnsInDaylight: false,
  colors: { body: 0xffffff, head: 0xffffff, accent: 0xcccccc, legs: 0x999999 },
  babyScale: 0.55
};

export const CREATURES: CreatureDef[] = [
  {
    id: "bramblehog",
    category: "passive",
    model: "quadruped",
    health: 10,
    speed: 2.1,
    hostileSpeed: 2.1,
    damage: 0,
    size: { w: 0.9, h: 1.05 },
    drops: [
      { item: "raw_meat", min: 1, max: 2 },
      { item: "leather", min: 0, max: 1 }
    ],
    xpDrop: 2,
    spawnLightMax: 15,
    spawnBiome: ["plains", "forest", "beach"],
    spawnSurface: true,
    spawnUnderground: false,
    minY: 28,
    maxY: 90,
    burnsInDaylight: false,
    colors: { body: 0xb06a56, head: 0xc07f68, accent: 0x8a4a3a, legs: 0x7a4034 },
    babyScale: 0.55,
    breedItem: "wheat",
    breedCooldownSeconds: 45,
    fleeRadius: 8
  },
  {
    id: "woolback",
    category: "passive",
    model: "quadruped",
    health: 10,
    speed: 2,
    hostileSpeed: 2,
    damage: 0,
    size: { w: 1, h: 1.25 },
    drops: [{ item: "wool", min: 1, max: 2 }],
    xpDrop: 2,
    spawnLightMax: 15,
    spawnBiome: ["plains", "forest", "mountains"],
    spawnSurface: true,
    spawnUnderground: false,
    minY: 28,
    maxY: 90,
    burnsInDaylight: false,
    colors: { body: 0xe8e2d4, head: 0xd8cfba, accent: 0xc0b8a4, legs: 0xb0a894 },
    babyScale: 0.55,
    breedItem: "wheat",
    breedCooldownSeconds: 45,
    shearDrop: { item: "wool", min: 1, max: 3 },
    fleeRadius: 8
  },
  {
    id: "cluckhen",
    category: "passive",
    model: "bird",
    health: 4,
    speed: 2.2,
    hostileSpeed: 2.2,
    damage: 0,
    size: { w: 0.5, h: 0.75 },
    drops: [
      { item: "feather", min: 1, max: 2 },
      { item: "raw_meat", min: 1, max: 1 }
    ],
    xpDrop: 1,
    spawnLightMax: 15,
    spawnBiome: ["plains", "forest"],
    spawnSurface: true,
    spawnUnderground: false,
    minY: 28,
    maxY: 90,
    burnsInDaylight: false,
    colors: { body: 0xf5f2ea, head: 0xfafaf5, accent: 0xd84a2a, legs: 0xd8a030 },
    babyScale: 0.5,
    breedItem: "seeds",
    breedCooldownSeconds: 30,
    fleeRadius: 7
  },
  {
    id: "hornbleat",
    category: "passive",
    model: "quadruped",
    health: 10,
    speed: 2,
    hostileSpeed: 2,
    damage: 0,
    size: { w: 0.95, h: 1.3 },
    drops: [
      { item: "raw_meat", min: 1, max: 2 },
      { item: "leather", min: 1, max: 2 }
    ],
    xpDrop: 2,
    spawnLightMax: 15,
    spawnBiome: ["mountains", "plains"],
    spawnSurface: true,
    spawnUnderground: false,
    minY: 30,
    maxY: 95,
    burnsInDaylight: false,
    colors: { body: 0x8a6a4a, head: 0x7a5c3e, accent: 0xe8dcc8, legs: 0x5e4530 },
    babyScale: 0.55,
    breedItem: "wheat",
    breedCooldownSeconds: 45,
    fleeRadius: 8
  },
  {
    id: "cave_crawler",
    category: "neutral",
    model: "crawler",
    health: 12,
    speed: 3.1,
    hostileSpeed: 4.4,
    damage: 2,
    size: { w: 1.1, h: 0.8 },
    drops: [{ item: "string", min: 1, max: 2 }],
    xpDrop: 4,
    spawnLightMax: 7,
    spawnBiome: ["*"],
    spawnSurface: false,
    spawnUnderground: true,
    minY: 2,
    maxY: 50,
    burnsInDaylight: false,
    colors: { body: 0x4a4a52, head: 0x3a3a42, accent: 0x8a2a2a, legs: 0x2e2e34 },
    babyScale: 0.6,
    fleeRadius: 0
  },
  {
    id: "shadewisp",
    category: "hostile",
    model: "wisp",
    health: 16,
    speed: 2.4,
    hostileSpeed: 3.6,
    damage: 3,
    size: { w: 0.7, h: 1.8 },
    drops: [{ item: "ember_dust", min: 0, max: 1, chance: 0.3 }],
    xpDrop: 5,
    spawnLightMax: 7,
    spawnBiome: ["*"],
    spawnSurface: true,
    spawnUnderground: true,
    minY: 2,
    maxY: 90,
    burnsInDaylight: true,
    colors: { body: 0x3a2e52, head: 0x4a3a68, accent: 0x9a4ad8, legs: 0x2a2040 },
    babyScale: 0.9
  },
  {
    id: "rattler",
    category: "hostile",
    model: "biped",
    health: 14,
    speed: 2.3,
    hostileSpeed: 3.1,
    damage: 2,
    size: { w: 0.7, h: 1.8 },
    drops: [
      { item: "bone", min: 1, max: 2 },
      { item: "string", min: 1, max: 1, chance: 0.5 }
    ],
    xpDrop: 5,
    spawnLightMax: 7,
    spawnBiome: ["*"],
    spawnSurface: true,
    spawnUnderground: true,
    minY: 2,
    maxY: 90,
    burnsInDaylight: true,
    ranged: { damage: 3, speed: 26, cooldown: 2.2, range: 16 },
    colors: { body: 0xd8d4c8, head: 0xe4e0d4, accent: 0x8a8878, legs: 0xc4c0b0 },
    babyScale: 0.9
  },
  {
    id: "rime_wisp",
    category: "hostile",
    model: "wisp",
    health: 18,
    speed: 2.2,
    hostileSpeed: 3.2,
    damage: 3,
    size: { w: 0.7, h: 1.8 },
    drops: [
      { item: "frostglass", min: 1, max: 1, chance: 0.4 },
      { item: "aetherite_gem", min: 1, max: 1, chance: 0.04 }
    ],
    xpDrop: 7,
    spawnLightMax: 7,
    spawnBiome: ["snow_taiga", "mountains"],
    spawnSurface: true,
    spawnUnderground: true,
    minY: 2,
    maxY: 95,
    burnsInDaylight: false,
    slowsOnHit: true,
    colors: { body: 0xcfe8f0, head: 0xe0f4fa, accent: 0x70c8e8, legs: 0xa8d8e8 },
    babyScale: 0.9
  }
];

const byId = new Map<string, CreatureDef>();
for (const c of CREATURES) byId.set(c.id, c);

export function creatureById(id: string): CreatureDef {
  return byId.get(id) ?? FALLBACK_CREATURE;
}

export function hostileCreatures(): CreatureDef[] {
  return CREATURES.filter((c) => c.category === "hostile");
}

export function passiveCreatures(): CreatureDef[] {
  return CREATURES.filter((c) => c.category === "passive");
}
