export const CHUNK_SX = 16;
export const CHUNK_SY = 96;
export const CHUNK_SZ = 16;
export const CHUNK_VOLUME = CHUNK_SX * CHUNK_SY * CHUNK_SZ;

export const SEA_LEVEL = 34;
export const BEDROCK_LEVEL = 0;

export const SAVE_FORMAT_VERSION = 1;

export const DAY_LENGTH_SECONDS = 600;
export const TICKS_PER_SECOND = 20;
export const TICK_MS = 1000 / TICKS_PER_SECOND;

export const PLAYER_HEIGHT = 1.8;
export const PLAYER_EYE_HEIGHT = 1.62;
export const PLAYER_WIDTH = 0.6;
export const PLAYER_REACH = 5.5;
export const CREATIVE_REACH = 6.5;

export const GRAVITY = -28;
export const TERMINAL_VELOCITY = -60;
export const WALK_SPEED = 4.3;
export const RUN_SPEED = 5.9;
export const FLY_SPEED = 11;
export const JUMP_VELOCITY = 8.6;
export const SWIM_SPEED = 3.2;
export const WATER_DRAG = 0.82;
export const AIR_DRAG = 0.995;
export const GROUND_FRICTION = 0.72;
export const STEP_HEIGHT = 0.55;

export const FALL_DAMAGE_THRESHOLD = 3.5;
export const FALL_DAMAGE_PER_BLOCK = 1;
export const RESPAWN_HEALTH = 20;
export const MAX_HEALTH = 20;
export const MAX_HUNGER = 20;
export const MAX_AIR = 10;

export const INVENTORY_COLS = 9;
export const HOTBAR_ROWS = 1;
export const INVENTORY_ROWS = 4;
export const INVENTORY_SLOT_COUNT = INVENTORY_COLS * (INVENTORY_ROWS + HOTBAR_ROWS);
export const HOTBAR_SIZE = INVENTORY_COLS;
export const DEFAULT_STACK_SIZE = 64;
export const TOOL_STACK_SIZE = 1;
export const ARMOR_SLOT_COUNT = 4;

export const DEFAULT_RENDER_DISTANCE = 6;
export const MIN_RENDER_DISTANCE = 2;
export const MAX_RENDER_DISTANCE = 12;
export const FOG_START_FACTOR = 0.55;

export const MAX_ENTITIES = 160;
export const HOSTILE_CAP_NIGHT = 24;
export const PASSIVE_CAP = 20;
export const ITEM_DROP_DESPAWN_SECONDS = 300;
export const ITEM_PICKUP_RADIUS = 1.6;

export const MAX_LIGHT_LEVEL = 15;
export const WATER_LIGHT_ATTENUATION = 1;

export const AUTOSAVE_INTERVAL_SECONDS = 60;

export const CHUNK_UNLOAD_MARGIN = 2;

export const QUALITY_PRESETS = {
  low: {
    renderDistance: 4,
    pixelRatioCap: 1,
    particles: 60,
    entityShadows: false,
    clouds: false,
    fogDensity: 1.35
  },
  medium: {
    renderDistance: 6,
    pixelRatioCap: 1.5,
    particles: 160,
    entityShadows: false,
    clouds: true,
    fogDensity: 1
  },
  high: {
    renderDistance: 9,
    pixelRatioCap: 2,
    particles: 320,
    entityShadows: true,
    clouds: true,
    fogDensity: 0.85
  }
} as const;

export type QualityLevel = keyof typeof QUALITY_PRESETS;
