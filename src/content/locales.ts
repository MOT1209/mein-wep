import { BLOCKS, PLACEABLE_BLOCK_ITEM_EXCLUSIONS } from "./blocks";
import { ARMOR_SLOTS, ARMOR_TIERS, TOOL_KINDS, TOOL_TIERS, ITEM_FOODS, ITEM_MATERIALS } from "./items";
import { CREATURES } from "./creatures";

export type Locale = "en" | "ar";
export const LOCALES: Locale[] = ["en", "ar"];
export const RTL_LOCALES = new Set<Locale>(["ar"]);

type Dict = Map<string, string>;

const en: Dict = new Map();
const ar: Dict = new Map();

function humanize(name: string): string {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const EN_BLOCK_OVERRIDES: Record<string, string> = {
  wool: "White Wool",
  wool_red: "Red Wool",
  wool_blue: "Blue Wool",
  wool_yellow: "Yellow Wool",
  flower_red: "Red Flower",
  flower_yellow: "Yellow Flower",
  flower_blue: "Blue Flower",
  mushroom_red: "Red Mushroom",
  mushroom_brown: "Brown Mushroom",
  ferro_lantern: "Ferro Lantern",
  furnace_lit: "Furnace (Lit)",
  door_closed: "Oak Door",
  door_open: "Oak Door (Open)",
  farmland_wet: "Wet Farmland",
  dewberry_full: "Dewberry Bush",
  dewberry_empty: "Dewberry Bush (Empty)",
  emberlight: "Emberlight",
  glowshroom: "Glowshroom",
  understone: "Understone",
  understone_bricks: "Understone Bricks",
  permafrost: "Permafrost",
  frostglass: "Frostglass",
  ice: "Ice",
  cactus: "Cactus",
  wheat_0: "Wheat Sprout",
  wheat_1: "Young Wheat",
  wheat_2: "Growing Wheat",
  wheat_3: "Ripe Wheat",
  sapling_sable: "Sable Sapling",
  sapling_pine: "Pine Sapling",
  sapling_dune: "Dune Willow Sapling",
  log: "Sable Log",
  leaves: "Sable Leaves",
  log_pine: "Pine Log",
  leaves_pine: "Pine Leaves",
  log_dune: "Dune Willow Log",
  leaves_dune: "Dune Willow Leaves",
  stone_shard: "Stone Shard",
  cobbled_understone: "Cobbled Understone"
};

const AR_BLOCKS: Record<string, string> = {
  air: "الهواء",
  stone: "حجر",
  grass: "عشب",
  dirt: "تراب",
  cobblestone: "حجر مكسر",
  sand: "رمل",
  sandstone: "حجر رملي",
  gravel: "حصى",
  water: "ماء",
  log: "جذع سابل",
  leaves: "أوراق سابل",
  planks: "ألواح خشبية",
  glass: "زجاج",
  coal_ore: "خام الفحم",
  copper_ore: "خام النحاس",
  ferrite_ore: "خام الفيريت",
  aurum_ore: "خام الأوروم",
  aetherite_ore: "خام الإيثريت",
  ember_ore: "خام الجمر",
  bedrock: "صخر الأساس",
  snow_block: "كتلة ثلج",
  snow_grass: "عشب ثلجي",
  ice: "جليد",
  permafrost: "أرض متجمدة",
  frostglass: "زجاج صقيعي",
  glowcrystal: "بلورة مضيئة",
  icicle: "دلاية جليدية",
  cactus: "صبار",
  tall_grass: "عشب طويل",
  flower_red: "زهرة حمراء",
  flower_yellow: "زهرة صفراء",
  flower_blue: "زهرة زرقاء",
  mushroom_red: "فطر أحمر",
  mushroom_brown: "فطر بني",
  dead_bush: "شجيرة يابسة",
  torch: "مشعل",
  crafting_table: "طاولة صناعة",
  furnace: "فرن",
  furnace_lit: "فرن موقَد",
  chest: "صندوق",
  bed: "سرير",
  door_closed: "باب خشبي",
  door_open: "باب خشبي (مفتوح)",
  bricks: "طوب",
  stone_bricks: "طوب حجري",
  mossy_stone: "حجر مطحلب",
  sandstone_bricks: "طوب رملي",
  emberstone: "حجر الجمر",
  emberstone_bricks: "طوب الجمر",
  rustrock: "صخر الصدأ",
  rustrock_bricks: "طوب الصدأ",
  emberlight: "ضوء الجمر",
  understone: "حجر الأعماق",
  understone_bricks: "طوب الأعماق",
  fume_vent: "فتحة أبخرة",
  farmland: "أرض زراعية",
  farmland_wet: "أرض زراعية مبللة",
  wheat_0: "شتلة قمح",
  wheat_1: "قمح صغير",
  wheat_2: "قمح متوسط",
  wheat_3: "قمح ناضج",
  log_pine: "جذع صنوبر",
  leaves_pine: "أوراق صنوبر",
  log_dune: "جذع صفصاف الدون",
  leaves_dune: "أوراق صفصاف الدون",
  clay: "طين",
  voidrock: "صخر العدم",
  wool: "صوف أبيض",
  wool_red: "صوف أحمر",
  wool_blue: "صوف أزرق",
  wool_yellow: "صوف أصفر",
  ferro_lantern: "فانوس فيريتي",
  campfire: "نار مخيم",
  glowshroom: "فطر مضيء",
  crystal_block: "كتلة بلورية",
  aurum_block: "كتلة أوروم",
  ferrite_block: "كتلة فيريت",
  copper_block: "كتلة نحاس",
  coal_block: "كتلة فحم",
  sapling_sable: "شتلة سابل",
  sapling_pine: "شتلة صنوبر",
  sapling_dune: "شتلة صفصاف الدون",
  dewberry_full: "نبتة توت الندى",
  dewberry_empty: "نبتة توت الندى (فارغة)"
};

const AR_MATERIALS: Record<string, string> = {
  stick: "عصا",
  coal: "فحم",
  charcoal: "فحم نباتي",
  raw_ferrite: "فيريت خام",
  ferrite_ingot: "سبيكة فيريت",
  raw_copper: "نحاس خام",
  copper_ingot: "سبيكة نحاس",
  raw_aurum: "أوروم خام",
  aurum_ingot: "سبيكة أوروم",
  aetherite_gem: "جوهرة إيثريت",
  ember_dust: "غبار الجمر",
  clay_ball: "كرة طين",
  brick: "طوبة",
  stone_shard: "شظية حجر",
  string: "خيط",
  leather: "جلد",
  feather: "ريشة",
  bone: "عظم",
  ground_bone: "عظم مطحون",
  wheat: "قمح",
  seeds: "بذور",
  cobbled_understone: "حجر أعماق مكسر"
};

const AR_FOODS: Record<string, string> = {
  apple: "تفاحة",
  bread: "خبز",
  dewberry: "توت الندى",
  raw_meat: "لحم نيء",
  cooked_meat: "لحم مشوي"
};

const AR_TOOL_KINDS: Record<string, string> = {
  pickaxe: "معول",
  axe: "فأس",
  shovel: "مجرفة",
  hoe: "معزقة",
  sword: "سيف"
};

const AR_ARMOR_SLOTS: Record<string, string> = {
  head: "خوذة",
  chest: "درع صدر",
  legs: "بنطال",
  feet: "حذاء"
};

const TIER_EN: Record<string, string> = {
  wood: "Wooden",
  stone: "Stone",
  ferrite: "Ferrite",
  aurum: "Aurum",
  aetherite: "Aetherite"
};

const TIER_AR: Record<string, string> = {
  wood: "خشبي",
  stone: "حجري",
  ferrite: "فيريتي",
  aurum: "أورومي",
  aetherite: "إيثريتي"
};

const ARMOR_EN: Record<string, string> = {
  head: "Helmet",
  chest: "Chestplate",
  legs: "Leggings",
  feet: "Boots"
};

for (const d of BLOCKS) {
  if (!d) continue;
  en.set(`block.${d.name}`, EN_BLOCK_OVERRIDES[d.name] ?? humanize(d.name));
  ar.set(`block.${d.name}`, AR_BLOCKS[d.name] ?? EN_BLOCK_OVERRIDES[d.name] ?? humanize(d.name));
}

for (const d of BLOCKS) {
  if (!d) continue;
  if (PLACEABLE_BLOCK_ITEM_EXCLUSIONS.has(d.name)) continue;
  en.set(`item.${d.name}`, EN_BLOCK_OVERRIDES[d.name] ?? humanize(d.name));
  ar.set(`item.${d.name}`, AR_BLOCKS[d.name] ?? humanize(d.name));
}

for (const m of ITEM_MATERIALS) {
  en.set(`item.${m}`, EN_BLOCK_OVERRIDES[m] ?? humanize(m));
  ar.set(`item.${m}`, AR_MATERIALS[m] ?? humanize(m));
}

for (const f of ITEM_FOODS) {
  en.set(`item.${f.id}`, humanize(f.id));
  ar.set(`item.${f.id}`, AR_FOODS[f.id] ?? humanize(f.id));
}

en.set("item.bow", "Shortbow");
ar.set("item.bow", "قوس قصير");
en.set("item.arrow", "Arrow");
ar.set("item.arrow", "سهم");
en.set("item.name_tag", "Name Tag");
ar.set("item.name_tag", "بطاقة تسمية");
en.set("item.bucket", "Bucket");
ar.set("item.bucket", "دلو");
en.set("item.water_bucket", "Water Bucket");
ar.set("item.water_bucket", "دلو ماء");

for (const t of TOOL_TIERS) {
  for (const kind of TOOL_KINDS) {
    en.set(`item.${t.name}_${kind}`, `${TIER_EN[t.name]} ${humanize(kind)}`);
    ar.set(`item.${t.name}_${kind}`, `${AR_TOOL_KINDS[kind] ?? humanize(kind)} ${TIER_AR[t.name]}`);
  }
}

en.set("item.ferrite_shears", "Ferrite Shears");
ar.set("item.ferrite_shears", "مقص فيريتي");

for (const a of ARMOR_TIERS) {
  for (const slot of ARMOR_SLOTS) {
    en.set(`item.${a.name}_${slot}`, `${humanize(a.name)} ${ARMOR_EN[slot]}`);
    ar.set(`item.${a.name}_${slot}`, `${AR_ARMOR_SLOTS[slot]} ${TIER_AR[a.name] ?? humanize(a.name)}`);
  }
}

const CREATURE_EN: Record<string, string> = {
  bramblehog: "Bramblehog",
  woolback: "Woolback",
  cluckhen: "Cluckhen",
  hornbleat: "Hornbleat",
  cave_crawler: "Cave Crawler",
  shadewisp: "Shadewisp",
  rattler: "Rattler",
  rime_wisp: "Rime Wisp"
};

const CREATURE_AR: Record<string, string> = {
  bramblehog: "شوكي",
  woolback: "صوفان",
  cluckhen: "دجاجة",
  hornbleat: "قرنان",
  cave_crawler: "زاحف الكهوف",
  shadewisp: "وهج الظل",
  rattler: "قعقع",
  rime_wisp: "وهج الصقيع"
};

for (const c of CREATURES) {
  en.set(`creature.${c.id}`, CREATURE_EN[c.id] ?? humanize(c.id));
  ar.set(`creature.${c.id}`, CREATURE_AR[c.id] ?? humanize(c.id));
}

const BIOME_EN: Record<string, string> = {
  ocean: "Ocean",
  beach: "Beach",
  plains: "Plains",
  forest: "Forest",
  desert: "Desert",
  mountains: "Mountains",
  snow_taiga: "Snowy Taiga"
};

const BIOME_AR: Record<string, string> = {
  ocean: "محيط",
  beach: "شاطئ",
  plains: "سهول",
  forest: "غابة",
  desert: "صحراء",
  mountains: "جبال",
  snow_taiga: "تايغا ثلجية"
};

for (const [id, name] of Object.entries(BIOME_EN)) {
  en.set(`biome.${id}`, name);
  ar.set(`biome.${id}`, BIOME_AR[id] ?? name);
}

const UI_EN: Record<string, string> = {
  "ui.play": "Play",
  "ui.new_world": "New World",
  "ui.continue": "Continue",
  "ui.world_name": "World Name",
  "ui.seed": "Seed",
  "ui.seed_placeholder": "leave empty for random",
  "ui.game_mode": "Game Mode",
  "ui.survival": "Survival",
  "ui.creative": "Creative",
  "ui.create": "Create",
  "ui.load": "Load",
  "ui.delete": "Delete",
  "ui.back": "Back",
  "ui.resume": "Resume",
  "ui.settings": "Settings",
  "ui.save_and_quit": "Save and Quit",
  "ui.paused": "Paused",
  "ui.inventory": "Inventory",
  "ui.crafting": "Crafting",
  "ui.creative_inventory": "Creative Inventory",
  "ui.encyclopedia": "Encyclopedia",
  "ui.health": "Health",
  "ui.hunger": "Hunger",
  "ui.breath": "Breath",
  "ui.xp": "Experience",
  "ui.level": "Level",
  "ui.day": "Day",
  "ui.time": "Time",
  "ui.death_title": "You Died",
  "ui.respawn": "Respawn",
  "ui.time_survived": "Time survived",
  "ui.drops_lost": "Your items dropped where you died",
  "ui.language": "Language",
  "ui.render_distance": "Render Distance",
  "ui.fov": "Field of View",
  "ui.mouse_sensitivity": "Mouse Sensitivity",
  "ui.volume_master": "Master Volume",
  "ui.volume_music": "Music Volume",
  "ui.volume_sfx": "Effects Volume",
  "ui.invert_y": "Invert Y Axis",
  "ui.quality": "Graphics Quality",
  "ui.quality_low": "Low",
  "ui.quality_medium": "Medium",
  "ui.quality_high": "High",
  "ui.fullscreen": "Fullscreen",
  "ui.vsync": "VSync",
  "ui.on": "On",
  "ui.off": "Off",
  "ui.keybinds": "Controls",
  "ui.move_forward": "Move Forward",
  "ui.move_back": "Move Back",
  "ui.move_left": "Move Left",
  "ui.move_right": "Move Right",
  "ui.jump": "Jump",
  "ui.sneak": "Sneak",
  "ui.sprint": "Sprint",
  "ui.inventory_key": "Inventory",
  "ui.drop": "Drop Item",
  "ui.attack": "Attack / Mine",
  "ui.use": "Use / Place",
  "ui.pick_block": "Pick Block",
  "ui.toggle_fly": "Toggle Flight (Creative)",
  "ui.encyclopedia_key": "Encyclopedia",
  "ui.recipe_hint": "Recipes you can make are highlighted",
  "ui.smelt": "Smelting",
  "ui.fuel": "Fuel",
  "ui.input": "Input",
  "ui.output": "Output",
  "ui.empty": "Empty",
  "ui.search": "Search",
  "ui.all": "All",
  "ui.blocks": "Blocks",
  "ui.items": "Items",
  "ui.tools": "Tools",
  "ui.armor": "Armor",
  "ui.food": "Food",
  "ui.creatures": "Creatures",
  "ui.biomes": "Biomes",
  "ui.obtained": "Obtained",
  "ui.not_obtained": "Not obtained",
  "ui.how_to_craft": "How to craft",
  "ui.drops": "Drops",
  "ui.hp": "Health",
  "ui.found_in": "Found in",
  "ui.at_y": "Below y =",
  "ui.light": "Light",
  "ui.day_light": "Daylight",
  "ui.night_light": "Nightlight",
  "ui.tool_required": "Tool",
  "ui.any_tool": "Any tool",
  "ui.hand": "Hand",
  "ui.respawn_set": "Respawn point set",
  "ui.sleeping": "Sleeping...",
  "ui.morning": "Good morning!",
  "ui.must_be_night": "You can only sleep at night",
  "ui.monsters_nearby": "There are monsters nearby",
  "ui.renamed": "Renamed to",
  "ui.tamed": "Tamed!",
  "ui.breed_ready": "Love mode",
  "ui.baby_born": "A baby was born!",
  "ui.food_level": "Food",
  "ui.saturation": "Saturation",
  "ui.eat_hint": "Right-click to eat",
  "ui.place_hint": "Right-click to place",
  "ui.no_room": "Not enough room",
  "ui.night_speed": "Sleep to skip the night",
  "ui.saved": "World saved",
  "ui.autosaving": "Autosaving...",
  "ui.loading": "Generating world...",
  "ui.loading_chunks": "Loading chunks...",
  "ui.controls_hint": "WASD move · Space jump · Shift sneak · E inventory · Q drop · F flight (creative) · Esc pause",
  "ui.click_to_play": "Click to Play",
  "ui.release_mouse": "Press Esc to release the mouse",
  "ui.hide_ui": "F1 to hide interface",
  "ui.help": "Help",
  "ui.enable_audio": "Sound",
  "ui.break_blocks": "To break blocks you need",
  "ui.creative_only": "Creative mode only",
  "ui.copied": "Copied to clipboard",
  "ui.unknown_recipe": "No matching recipe",
  "ui.learned": "Learned",
  "ui.muted": "Muted"
};

const UI_AR: Record<string, string> = {
  "ui.play": "العب",
  "ui.new_world": "عالم جديد",
  "ui.continue": "متابعة",
  "ui.world_name": "اسم العالم",
  "ui.seed": "البذرة",
  "ui.seed_placeholder": "اتركه فارغًا لعشوائية",
  "ui.game_mode": "نمط اللعب",
  "ui.survival": "البقاء",
  "ui.creative": "الإبداع",
  "ui.create": "إنشاء",
  "ui.load": "تحميل",
  "ui.delete": "حذف",
  "ui.back": "رجوع",
  "ui.resume": "استئناف",
  "ui.settings": "الإعدادات",
  "ui.save_and_quit": "حفظ وخروج",
  "ui.paused": "متوقف مؤقتًا",
  "ui.inventory": "حقيبة",
  "ui.crafting": "صناعة",
  "ui.creative_inventory": "حقيبة الإبداع",
  "ui.encyclopedia": "الموسوعة",
  "ui.health": "الصحة",
  "ui.hunger": "الجوع",
  "ui.breath": "النفس",
  "ui.xp": "الخبرة",
  "ui.level": "المستوى",
  "ui.day": "اليوم",
  "ui.time": "الوقت",
  "ui.death_title": "لقد مت",
  "ui.respawn": "إعادة الظهور",
  "ui.time_survived": "مدة البقاء",
  "ui.drops_lost": "سقطت أدواتك حيث مت",
  "ui.language": "اللغة",
  "ui.render_distance": "مسافة العرض",
  "ui.fov": "مجال الرؤية",
  "ui.mouse_sensitivity": "حساسية الفأرة",
  "ui.volume_master": "الصوت العام",
  "ui.volume_music": "الموسيقى",
  "ui.volume_sfx": "المؤثرات الصوتية",
  "ui.invert_y": "اعكس المحور Y",
  "ui.quality": "جودة الرسوميات",
  "ui.quality_low": "منخفضة",
  "ui.quality_medium": "متوسطة",
  "ui.quality_high": "عالية",
  "ui.fullscreen": "ملء الشاشة",
  "ui.vsync": "مزامنة عمودية",
  "ui.on": "تشغيل",
  "ui.off": "إيقاف",
  "ui.keybinds": "التحكم",
  "ui.move_forward": "تقدّم",
  "ui.move_back": "تراجع",
  "ui.move_left": "يسار",
  "ui.move_right": "يمين",
  "ui.jump": "قفز",
  "ui.sneak": "انخفاض",
  "ui.sprint": "عدو",
  "ui.inventory_key": "الحقيبة",
  "ui.drop": "إسقاط العنصر",
  "ui.attack": "هجوم / تعدين",
  "ui.use": "استخدام / وضع",
  "ui.pick_block": "التقاط الكتلة",
  "ui.toggle_fly": "تفعيل الطيران (الإبداع)",
  "ui.encyclopedia_key": "الموسوعة",
  "ui.recipe_hint": "الوصفات المتاحة مميزة",
  "ui.smelt": "صهر",
  "ui.fuel": "وقود",
  "ui.input": "المدخل",
  "ui.output": "المخرج",
  "ui.empty": "فارغ",
  "ui.search": "بحث",
  "ui.all": "الكل",
  "ui.blocks": "كتل",
  "ui.items": "عناصر",
  "ui.tools": "أدوات",
  "ui.armor": "دروع",
  "ui.food": "طعام",
  "ui.creatures": "مخلوقات",
  "ui.biomes": "بيئات",
  "ui.obtained": "تم الحصول عليه",
  "ui.not_obtained": "لم يتم الحصول عليه",
  "ui.how_to_craft": "طريقة الصناعة",
  "ui.drops": "الإسقاطات",
  "ui.hp": "الصحة",
  "ui.found_in": "يتواجد في",
  "ui.at_y": "تحت مستوى",
  "ui.light": "الضوء",
  "ui.day_light": "ضوء النهار",
  "ui.night_light": "ضوء الليل",
  "ui.tool_required": "الأداة",
  "ui.any_tool": "أي أداة",
  "ui.hand": "اليد",
  "ui.respawn_set": "تم تحديد نقطة الظهور",
  "ui.sleeping": "أنت نائم...",
  "ui.morning": "صباح الخير!",
  "ui.must_be_night": "يمكنك النوم في الليل فقط",
  "ui.monsters_nearby": "هناك وحوش قريبة",
  "ui.renamed": "تم التسمية",
  "ui.tamed": "تم الترويض!",
  "ui.breed_ready": "جاهز للتزاوج",
  "ui.baby_born": "وُلد صغير!",
  "ui.food_level": "الشبع",
  "ui.saturation": "الإشباع",
  "ui.eat_hint": "انقر بالزر الأيمن للأكل",
  "ui.place_hint": "انقر بالزر الأيمن للوضع",
  "ui.no_room": "لا توجد مساحة كافية",
  "ui.night_speed": "نم لتخطي الليل",
  "ui.saved": "تم حفظ العالم",
  "ui.autosaving": "جارٍ الحفظ التلقائي...",
  "ui.loading": "جارٍ توليد العالم...",
  "ui.loading_chunks": "جارٍ تحميل المقاطع...",
  "ui.controls_hint": "WASD للحركة · مسافة للقفز · Shift للانخفاض · E للحقيبة · Q للإسقاط · F للطيران (الإبداع) · Esc للإيقاف",
  "ui.click_to_play": "انقر للعب",
  "ui.release_mouse": "اضغط Esc لتحرير الفأرة",
  "ui.hide_ui": "F1 لإخفاء الواجهة",
  "ui.help": "مساعدة",
  "ui.enable_audio": "الصوت",
  "ui.break_blocks": "لكسر هذه الكتلة تحتاج",
  "ui.creative_only": "في نمط الإبداع فقط",
  "ui.copied": "تم النسخ",
  "ui.unknown_recipe": "لا توجد وصفة مطابقة",
  "ui.learned": "مكتشفة",
  "ui.muted": "صامت"
};

for (const [k, v] of Object.entries(UI_EN)) en.set(k, v);
for (const [k, v] of Object.entries(UI_AR)) ar.set(k, v);

const dicts: Record<Locale, Dict> = { en, ar };

export const SUPPORTED_LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ar", label: "العربية" }
];

export function t(key: string, locale: Locale, params?: Record<string, string | number>): string {
  let text = dicts[locale]?.get(key);
  if (text === undefined) text = dicts.en.get(key);
  if (text === undefined) return key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v));
    }
  }
  return text;
}

export function blockName(name: string, locale: Locale): string {
  return t(`block.${name}`, locale);
}

export function itemName(id: string, locale: Locale): string {
  const localized = dicts[locale]?.get(`item.${id}`);
  if (localized !== undefined) return localized;
  const fallback = dicts.en.get(`item.${id}`);
  if (fallback !== undefined) return fallback;
  return t(`block.${id}`, locale);
}

export function creatureName(id: string, locale: Locale): string {
  return t(`creature.${id}`, locale);
}

export function biomeName(id: string, locale: Locale): string {
  return t(`biome.${id}`, locale);
}

export function hasKey(key: string, locale: Locale): boolean {
  return dicts[locale]?.has(key) ?? false;
}

export function directionOf(locale: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}
