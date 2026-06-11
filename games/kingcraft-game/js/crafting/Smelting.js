// الصهر في الفرن: المُدخل → الناتج + الزمن (ثوانٍ). والوقود وقيمه.
export const SMELTING = {
  iron_ore: { out: "iron_ingot", time: 10 },
  gold_ore: { out: "gold_ingot", time: 10 },
  cobble:   { out: "stone", time: 8 },
  sand:     { out: "glass", time: 6 },
  wood:     { out: "charcoal", time: 8 },
  beef:     { out: "cooked_beef", time: 6 },
  porkchop: { out: "cooked_porkchop", time: 6 },
  chicken:  { out: "cooked_chicken", time: 6 },
  mutton:   { out: "cooked_mutton", time: 6 },
};

// قيمة الوقود = عدد الثواني التي يحترقها كل عنصر
export const FUEL = {
  coal: 80,
  charcoal: 80,
  wood: 15,
  planks: 15,
  stick: 5,
  crafting_table: 15,
};

export function smeltResult(id) { return SMELTING[id] || null; }
export function fuelValue(id) { return FUEL[id] || 0; }
