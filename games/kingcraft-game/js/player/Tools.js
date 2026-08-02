// تعريف الأدوات: السرعة، المستوى (tier)، المتانة، الضرر.
export const TOOLS = {
  fist: { id: "fist", label: "يد", kind: "fist", speed: 1, tier: 0, durability: Infinity },

  // خشب (tier 1)
  wooden_pickaxe: { id: "wooden_pickaxe", label: "معول خشبي", kind: "pickaxe", speed: 2, tier: 1, durability: 60 },
  wooden_axe:     { id: "wooden_axe",     label: "فأس خشبي",  kind: "axe",     speed: 2, tier: 1, durability: 60 },
  wooden_shovel:  { id: "wooden_shovel",  label: "مجرفة خشبية", kind: "shovel", speed: 2, tier: 1, durability: 60 },
  wooden_sword:   { id: "wooden_sword",   label: "سيف خشبي",  kind: "sword",   speed: 1, tier: 1, durability: 60, damage: 4 },

  // حجر (tier 2)
  stone_pickaxe:  { id: "stone_pickaxe",  label: "معول حجري", kind: "pickaxe", speed: 4, tier: 2, durability: 132 },
  stone_axe:      { id: "stone_axe",      label: "فأس حجري",  kind: "axe",     speed: 4, tier: 2, durability: 132 },
  stone_shovel:   { id: "stone_shovel",   label: "مجرفة حجرية", kind: "shovel", speed: 4, tier: 2, durability: 132 },
  stone_sword:    { id: "stone_sword",    label: "سيف حجري",  kind: "sword",   speed: 1, tier: 2, durability: 132, damage: 5 },

  // حديد (tier 3)
  iron_pickaxe:   { id: "iron_pickaxe",   label: "معول حديدي", kind: "pickaxe", speed: 6, tier: 3, durability: 251 },
  iron_axe:       { id: "iron_axe",       label: "فأس حديدي",  kind: "axe",     speed: 6, tier: 3, durability: 251 },
  iron_shovel:    { id: "iron_shovel",    label: "مجرفة حديدية", kind: "shovel", speed: 6, tier: 3, durability: 251 },
  iron_sword:     { id: "iron_sword",     label: "سيف حديدي",  kind: "sword",   speed: 1, tier: 3, durability: 251, damage: 6 },

  // ذهب (tier 3 سرعة عالية، متانة منخفضة)
  golden_pickaxe: { id: "golden_pickaxe", label: "معول ذهبي", kind: "pickaxe", speed: 12, tier: 3, durability: 33 },
  golden_axe:     { id: "golden_axe",     label: "فأس ذهبي",  kind: "axe",     speed: 12, tier: 3, durability: 33 },
  golden_shovel:  { id: "golden_shovel",  label: "مجرفة ذهبية", kind: "shovel", speed: 12, tier: 3, durability: 33 },
  golden_sword:   { id: "golden_sword",   label: "سيف ذهبي",  kind: "sword",   speed: 1, tier: 3, durability: 33, damage: 4 },

  // ألماس (tier 4)
  diamond_pickaxe:{ id: "diamond_pickaxe", label: "معول ألماسي", kind: "pickaxe", speed: 8, tier: 4, durability: 1562 },
  diamond_axe:    { id: "diamond_axe",    label: "فأس ألماسي", kind: "axe",     speed: 8, tier: 4, durability: 1562 },
  diamond_shovel: { id: "diamond_shovel", label: "مجرفة ألماسية", kind: "shovel", speed: 8, tier: 4, durability: 1562 },
  diamond_sword:  { id: "diamond_sword",  label: "سيف ألماسي", kind: "sword",   speed: 1, tier: 4, durability: 1562, damage: 7 },

  // معازق (hoes) — السرعة هنا = كفاءة الحرث
  wooden_hoe:   { id: "wooden_hoe",   label: "معزقة خشبية",   kind: "hoe", speed: 2, tier: 1, durability: 60 },
  stone_hoe:    { id: "stone_hoe",    label: "معزقة حجرية",   kind: "hoe", speed: 4, tier: 2, durability: 132 },
  iron_hoe:     { id: "iron_hoe",     label: "معزقة حديدية",  kind: "hoe", speed: 6, tier: 3, durability: 251 },
  golden_hoe:   { id: "golden_hoe",   label: "معزقة ذهبية",   kind: "hoe", speed: 12, tier: 3, durability: 33 },
  diamond_hoe:  { id: "diamond_hoe",  label: "معزقة ألماسية", kind: "hoe", speed: 8, tier: 4, durability: 1562 },
};

// الأداة الفعّالة لكل بلوك + المستوى المطلوب للحصول على نَقْع.
// kind: نوع الأداة المناسب. minTier: أقل مستوى أداة يُسقط البلوك (0 = أي شيء).
export const BLOCK_TOOL = {
  grass:  { kind: "shovel",  minTier: 0 },
  dirt:   { kind: "shovel",  minTier: 0 },
  sand:   { kind: "shovel",  minTier: 0 },
  snow:   { kind: "shovel",  minTier: 0 },
  wood:   { kind: "axe",     minTier: 0 },
  planks: { kind: "axe",     minTier: 0 },
  leaves: { kind: "sword",   minTier: 0 },
  stone:  { kind: "pickaxe", minTier: 1 },
  cobble: { kind: "pickaxe", minTier: 1 },
  coal_ore:    { kind: "pickaxe", minTier: 1 },
  iron_ore:    { kind: "pickaxe", minTier: 2 },
  gold_ore:    { kind: "pickaxe", minTier: 3 },
  diamond_ore: { kind: "pickaxe", minTier: 3 },
  furnace:        { kind: "pickaxe", minTier: 1 },
  crafting_table: { kind: "axe",     minTier: 0 },
  iron_block:     { kind: "pickaxe", minTier: 2 },
  gold_block:     { kind: "pickaxe", minTier: 3 },
  diamond_block:  { kind: "pickaxe", minTier: 3 },
  glass:  { kind: "any", minTier: 0 },
};

export function getTool(id) { return TOOLS[id] || TOOLS.fist; }
