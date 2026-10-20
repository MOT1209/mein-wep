# Blocks and items

Generated from `src/content/blocks.ts`, `items.ts`, `creatures.ts` and `locales.ts` on 2026-10-20.
Regenerate the tables if those files change.

Mining rules (from `src/gameplay/mining.ts`): the right tool kind breaks a block in
`hardness × 1.5 / efficiency` seconds; any other tool or a bare hand takes `hardness × 1.5`
seconds, or `hardness × 5` when the block has a tier above 0. A tool of the right kind but a
lower tier cannot break a tiered block at all. Tiered blocks only drop items when broken with the
right tool. Wooden tools are tier 1, stone 2, ferrite 3, aurum 4, aetherite 5.

## Blocks (83)

| ID | Name | English | العربية | Hardness | Tool | Tier | Drops | Notes |
| -- | ---- | ------- | ------- | -------- | ---- | ---- | ----- | ----- |
| 1 | `stone` | Stone | حجر | 1.6 | pickaxe | 1 | cobblestone 1 |  |
| 2 | `grass` | Grass | عشب | 0.7 | shovel | 0 | dirt 1 |  |
| 3 | `dirt` | Dirt | تراب | 0.6 | shovel | 0 | itself |  |
| 4 | `cobblestone` | Cobblestone | حجر مكسر | 1.8 | pickaxe | 1 | itself |  |
| 5 | `sand` | Sand | رمل | 0.5 | shovel | 0 | itself |  |
| 6 | `sandstone` | Sandstone | حجر رملي | 1.4 | pickaxe | 1 | itself |  |
| 7 | `gravel` | Gravel | حصى | 0.65 | shovel | 0 | gravel 1 (85%), stone_shard 1 (15%) |  |
| 8 | `water` | Water | ماء | unbreakable | any | 0 | nothing | hidden in creative; liquid |
| 9 | `log` | Sable Log | جذع سابل | 2 | axe | 0 | itself |  |
| 10 | `leaves` | Sable Leaves | أوراق سابل | 0.25 | shears | 0 | sapling_sable 1 (12%), apple 1 (5%), stick 1-2 (10%) |  |
| 11 | `planks` | Planks | ألواح خشبية | 1.1 | axe | 0 | itself |  |
| 12 | `glass` | Glass | زجاج | 0.4 | pickaxe | 0 | nothing |  |
| 13 | `coal_ore` | Coal Ore | خام الفحم | 2.2 | pickaxe | 1 | coal 1 |  |
| 14 | `copper_ore` | Copper Ore | خام النحاس | 2.4 | pickaxe | 1 | raw_copper 2-3 |  |
| 15 | `ferrite_ore` | Ferrite Ore | خام الفيريت | 2.8 | pickaxe | 2 | raw_ferrite 1 |  |
| 16 | `aurum_ore` | Aurum Ore | خام الأوروم | 3 | pickaxe | 3 | raw_aurum 1 |  |
| 17 | `aetherite_ore` | Aetherite Ore | خام الإيثريت | 3.4 | pickaxe | 3 | aetherite_gem 1 |  |
| 18 | `ember_ore` | Ember Ore | خام الجمر | 2.9 | pickaxe | 2 | ember_dust 3-5 | light 4 |
| 19 | `bedrock` | Bedrock | صخر الأساس | unbreakable | pickaxe | 99 | nothing | hidden in creative |
| 20 | `snow_block` | Snow Block | كتلة ثلج | 0.4 | shovel | 0 | itself |  |
| 21 | `snow_grass` | Snow Grass | عشب ثلجي | 0.7 | shovel | 0 | dirt 1 |  |
| 22 | `ice` | Ice | جليد | 0.6 | pickaxe | 1 | nothing |  |
| 23 | `permafrost` | Permafrost | أرض متجمدة | 2.4 | pickaxe | 1 | itself |  |
| 24 | `frostglass` | Frostglass | زجاج صقيعي | 0.7 | pickaxe | 1 | itself |  |
| 25 | `glowcrystal` | Glowcrystal | بلورة مضيئة | 0.8 | pickaxe | 1 | itself | light 13; needs support |
| 26 | `icicle` | Icicle | دلاية جليدية | 0.3 | pickaxe | 0 | nothing | needs support |
| 27 | `cactus` | Cactus | صبار | 0.6 | any | 0 | itself | needs support |
| 28 | `tall_grass` | Tall Grass | عشب طويل | 0.1 | shears | 0 | seeds 1-2 (30%), tall_grass 1 (60%) | needs support |
| 29 | `flower_red` | Red Flower | زهرة حمراء | 0.1 | any | 0 | itself | needs support |
| 30 | `flower_yellow` | Yellow Flower | زهرة صفراء | 0.1 | any | 0 | itself | needs support |
| 31 | `flower_blue` | Blue Flower | زهرة زرقاء | 0.1 | any | 0 | itself | needs support |
| 32 | `mushroom_red` | Red Mushroom | فطر أحمر | 0.1 | any | 0 | itself | needs support |
| 33 | `mushroom_brown` | Brown Mushroom | فطر بني | 0.1 | any | 0 | itself | needs support |
| 34 | `dead_bush` | Dead Bush | شجيرة يابسة | 0.1 | any | 0 | stick 1-2 (70%) | needs support |
| 35 | `torch` | Torch | مشعل | 0.05 | any | 0 | itself | light 14; needs support |
| 36 | `crafting_table` | Crafting Table | طاولة صناعة | 1.6 | axe | 0 | itself | interactive: crafting |
| 37 | `furnace` | Furnace | فرن | 2.4 | pickaxe | 1 | itself | interactive: furnace |
| 38 | `furnace_lit` | Furnace (Lit) | فرن موقَد | 2.4 | pickaxe | 1 | furnace 1 | interactive: furnace; light 12; hidden in creative |
| 39 | `chest` | Chest | صندوق | 1.6 | axe | 0 | itself | interactive: chest |
| 40 | `bed` | Bed | سرير | 0.9 | any | 0 | itself | interactive: bed |
| 41 | `door_closed` | Oak Door | باب خشبي | 1.4 | axe | 0 | door_closed 1 | interactive: door |
| 42 | `door_open` | Oak Door (Open) | باب خشبي (مفتوح) | 1.4 | axe | 0 | door_closed 1 | interactive: door; hidden in creative |
| 43 | `bricks` | Bricks | طوب | 2.1 | pickaxe | 1 | itself |  |
| 44 | `stone_bricks` | Stone Bricks | طوب حجري | 2 | pickaxe | 1 | itself |  |
| 45 | `mossy_stone` | Mossy Stone | حجر مطحلب | 2 | pickaxe | 1 | itself |  |
| 46 | `sandstone_bricks` | Sandstone Bricks | طوب رملي | 1.8 | pickaxe | 1 | itself |  |
| 47 | `emberstone` | Emberstone | حجر الجمر | 2.6 | pickaxe | 2 | itself |  |
| 48 | `emberstone_bricks` | Emberstone Bricks | طوب الجمر | 2.6 | pickaxe | 2 | itself |  |
| 49 | `rustrock` | Rustrock | صخر الصدأ | 2.6 | pickaxe | 2 | itself |  |
| 50 | `rustrock_bricks` | Rustrock Bricks | طوب الصدأ | 2.6 | pickaxe | 2 | itself |  |
| 51 | `emberlight` | Emberlight | ضوء الجمر | 1.2 | pickaxe | 1 | itself | light 15 |
| 52 | `understone` | Understone | حجر الأعماق | 2.2 | pickaxe | 1 | cobbled_understone 1 |  |
| 53 | `understone_bricks` | Understone Bricks | طوب الأعماق | 2.2 | pickaxe | 1 | itself |  |
| 54 | `fume_vent` | Fume Vent | فتحة أبخرة | 2 | pickaxe | 1 | itself | interactive: fume |
| 55 | `farmland` | Farmland | أرض زراعية | 0.6 | shovel | 0 | dirt 1 |  |
| 56 | `farmland_wet` | Wet Farmland | أرض زراعية مبللة | 0.6 | shovel | 0 | dirt 1 | hidden in creative |
| 57 | `wheat_0` | Wheat Sprout | شتلة قمح | 0.05 | any | 0 | seeds 1 | hidden in creative; needs support; growth stage 0 |
| 58 | `wheat_1` | Young Wheat | قمح صغير | 0.05 | any | 0 | seeds 1 | hidden in creative; needs support; growth stage 1 |
| 59 | `wheat_2` | Growing Wheat | قمح متوسط | 0.05 | any | 0 | seeds 1 | hidden in creative; needs support; growth stage 2 |
| 60 | `wheat_3` | Ripe Wheat | قمح ناضج | 0.05 | any | 0 | wheat 1, seeds 1-3 | needs support; growth stage 3 |
| 61 | `log_pine` | Pine Log | جذع صنوبر | 2 | axe | 0 | itself |  |
| 62 | `leaves_pine` | Pine Leaves | أوراق صنوبر | 0.25 | shears | 0 | sapling_pine 1 (12%), stick 1-2 (8%) |  |
| 63 | `log_dune` | Dune Willow Log | جذع صفصاف الدون | 2 | axe | 0 | itself |  |
| 64 | `leaves_dune` | Dune Willow Leaves | أوراق صفصاف الدون | 0.25 | shears | 0 | sapling_dune 1 (12%) |  |
| 65 | `clay` | Clay | طين | 0.6 | shovel | 0 | clay_ball 4 |  |
| 66 | `voidrock` | Voidrock | صخر العدم | 8 | pickaxe | 3 | itself |  |
| 67 | `wool` | White Wool | صوف أبيض | 0.8 | any | 0 | itself |  |
| 68 | `wool_red` | Red Wool | صوف أحمر | 0.8 | any | 0 | itself |  |
| 69 | `wool_blue` | Blue Wool | صوف أزرق | 0.8 | any | 0 | itself |  |
| 70 | `wool_yellow` | Yellow Wool | صوف أصفر | 0.8 | any | 0 | itself |  |
| 71 | `ferro_lantern` | Ferro Lantern | فانوس فيريتي | 1.4 | pickaxe | 1 | itself | light 15 |
| 72 | `campfire` | Campfire | نار مخيم | 1.2 | axe | 0 | itself | light 13 |
| 73 | `glowshroom` | Glowshroom | فطر مضيء | 0.1 | any | 0 | itself | light 7; needs support |
| 74 | `crystal_block` | Crystal Block | كتلة بلورية | 2.4 | pickaxe | 3 | itself |  |
| 75 | `aurum_block` | Aurum Block | كتلة أوروم | 2.6 | pickaxe | 3 | itself |  |
| 76 | `ferrite_block` | Ferrite Block | كتلة فيريت | 3.2 | pickaxe | 2 | itself |  |
| 77 | `copper_block` | Copper Block | كتلة نحاس | 2.8 | pickaxe | 2 | itself |  |
| 78 | `coal_block` | Coal Block | كتلة فحم | 2.4 | pickaxe | 1 | itself |  |
| 79 | `sapling_sable` | Sable Sapling | شتلة سابل | 0.05 | any | 0 | itself | needs support |
| 80 | `sapling_pine` | Pine Sapling | شتلة صنوبر | 0.05 | any | 0 | itself | needs support |
| 81 | `sapling_dune` | Dune Willow Sapling | شتلة صفصاف الدون | 0.05 | any | 0 | itself | needs support |
| 82 | `dewberry_full` | Dewberry Bush | نبتة توت الندى | 0.1 | any | 0 | dewberry 1-2, dewberry_full 1 (50%) | needs support; growth stage 1 |
| 83 | `dewberry_empty` | Dewberry Bush (Empty) | نبتة توت الندى (فارغة) | 0.1 | any | 0 | dewberry_empty 1 (50%) | hidden in creative; needs support; growth stage 0 |

## Items that are not blocks (74)

| ID | Kind | English | العربية | Stack | Stats |
| -- | ---- | ------- | ------- | ----- | ----- |
| `stick` | material | Stick | عصا | 64 | fuel 5 s |
| `coal` | material | Coal | فحم | 64 | fuel 80 s |
| `charcoal` | material | Charcoal | فحم نباتي | 64 | fuel 80 s |
| `raw_ferrite` | material | Raw Ferrite | فيريت خام | 64 |  |
| `ferrite_ingot` | material | Ferrite Ingot | سبيكة فيريت | 64 |  |
| `raw_copper` | material | Raw Copper | نحاس خام | 64 |  |
| `copper_ingot` | material | Copper Ingot | سبيكة نحاس | 64 |  |
| `raw_aurum` | material | Raw Aurum | أوروم خام | 64 |  |
| `aurum_ingot` | material | Aurum Ingot | سبيكة أوروم | 64 |  |
| `aetherite_gem` | material | Aetherite Gem | جوهرة إيثريت | 64 |  |
| `ember_dust` | material | Ember Dust | غبار الجمر | 64 |  |
| `clay_ball` | material | Clay Ball | كرة طين | 64 |  |
| `brick` | material | Brick | طوبة | 64 |  |
| `stone_shard` | material | Stone Shard | شظية حجر | 64 |  |
| `string` | material | String | خيط | 64 |  |
| `leather` | material | Leather | جلد | 64 |  |
| `feather` | material | Feather | ريشة | 64 |  |
| `bone` | material | Bone | عظم | 64 |  |
| `ground_bone` | misc | Ground Bone | عظم مطحون | 64 | use: bone_meal |
| `wheat` | material | Wheat | قمح | 64 |  |
| `seeds` | material | Seeds | بذور | 64 |  |
| `cobbled_understone` | material | Cobbled Understone | حجر أعماق مكسر | 64 |  |
| `apple` | food | Apple | تفاحة | 64 | food +4, saturation 2.4; use: eat |
| `bread` | food | Bread | خبز | 64 | food +6, saturation 3.6; use: eat |
| `dewberry` | food | Dewberry | توت الندى | 64 | food +2, saturation 1.2; use: eat |
| `raw_meat` | food | Raw Meat | لحم نيء | 64 | food +3, saturation 1.2; use: eat |
| `cooked_meat` | food | Cooked Meat | لحم مشوي | 64 | food +8, saturation 6.4; use: eat |
| `wood_pickaxe` | tool | Wooden Pickaxe | معول خشبي | 1 | pickaxe tier 1, durability 60, damage 1.5, efficiency 2 |
| `wood_axe` | tool | Wooden Axe | فأس خشبي | 1 | axe tier 1, durability 60, damage 1.5, efficiency 2 |
| `wood_shovel` | tool | Wooden Shovel | مجرفة خشبي | 1 | shovel tier 1, durability 60, damage 1.5, efficiency 2 |
| `wood_hoe` | tool | Wooden Hoe | معزقة خشبي | 1 | hoe tier 1, durability 60, damage 1.5, efficiency 2 |
| `wood_sword` | tool | Wooden Sword | سيف خشبي | 1 | sword tier 1, durability 60, damage 4, efficiency 2 |
| `stone_pickaxe` | tool | Stone Pickaxe | معول حجري | 1 | pickaxe tier 2, durability 132, damage 2, efficiency 4 |
| `stone_axe` | tool | Stone Axe | فأس حجري | 1 | axe tier 2, durability 132, damage 2, efficiency 4 |
| `stone_shovel` | tool | Stone Shovel | مجرفة حجري | 1 | shovel tier 2, durability 132, damage 2, efficiency 4 |
| `stone_hoe` | tool | Stone Hoe | معزقة حجري | 1 | hoe tier 2, durability 132, damage 2, efficiency 4 |
| `stone_sword` | tool | Stone Sword | سيف حجري | 1 | sword tier 2, durability 132, damage 5, efficiency 4 |
| `ferrite_pickaxe` | tool | Ferrite Pickaxe | معول فيريتي | 1 | pickaxe tier 3, durability 260, damage 2.5, efficiency 6 |
| `ferrite_axe` | tool | Ferrite Axe | فأس فيريتي | 1 | axe tier 3, durability 260, damage 2.5, efficiency 6 |
| `ferrite_shovel` | tool | Ferrite Shovel | مجرفة فيريتي | 1 | shovel tier 3, durability 260, damage 2.5, efficiency 6 |
| `ferrite_hoe` | tool | Ferrite Hoe | معزقة فيريتي | 1 | hoe tier 3, durability 260, damage 2.5, efficiency 6 |
| `ferrite_sword` | tool | Ferrite Sword | سيف فيريتي | 1 | sword tier 3, durability 260, damage 6, efficiency 6 |
| `aurum_pickaxe` | tool | Aurum Pickaxe | معول أورومي | 1 | pickaxe tier 4, durability 40, damage 3, efficiency 10 |
| `aurum_axe` | tool | Aurum Axe | فأس أورومي | 1 | axe tier 4, durability 40, damage 3, efficiency 10 |
| `aurum_shovel` | tool | Aurum Shovel | مجرفة أورومي | 1 | shovel tier 4, durability 40, damage 3, efficiency 10 |
| `aurum_hoe` | tool | Aurum Hoe | معزقة أورومي | 1 | hoe tier 4, durability 40, damage 3, efficiency 10 |
| `aurum_sword` | tool | Aurum Sword | سيف أورومي | 1 | sword tier 4, durability 40, damage 4, efficiency 10 |
| `aetherite_pickaxe` | tool | Aetherite Pickaxe | معول إيثريتي | 1 | pickaxe tier 5, durability 1600, damage 3.5, efficiency 12 |
| `aetherite_axe` | tool | Aetherite Axe | فأس إيثريتي | 1 | axe tier 5, durability 1600, damage 3.5, efficiency 12 |
| `aetherite_shovel` | tool | Aetherite Shovel | مجرفة إيثريتي | 1 | shovel tier 5, durability 1600, damage 3.5, efficiency 12 |
| `aetherite_hoe` | tool | Aetherite Hoe | معزقة إيثريتي | 1 | hoe tier 5, durability 1600, damage 3.5, efficiency 12 |
| `aetherite_sword` | tool | Aetherite Sword | سيف إيثريتي | 1 | sword tier 5, durability 1600, damage 8, efficiency 12 |
| `ferrite_shears` | tool | Ferrite Shears | مقص فيريتي | 1 | shears tier 3, durability 238, damage 1, efficiency 5; use: shears |
| `leather_head` | armor | Leather Helmet | خوذة Leather | 1 |  |
| `leather_chest` | armor | Leather Chestplate | درع صدر Leather | 1 |  |
| `leather_legs` | armor | Leather Leggings | بنطال Leather | 1 |  |
| `leather_feet` | armor | Leather Boots | حذاء Leather | 1 |  |
| `ferrite_head` | armor | Ferrite Helmet | خوذة فيريتي | 1 |  |
| `ferrite_chest` | armor | Ferrite Chestplate | درع صدر فيريتي | 1 |  |
| `ferrite_legs` | armor | Ferrite Leggings | بنطال فيريتي | 1 |  |
| `ferrite_feet` | armor | Ferrite Boots | حذاء فيريتي | 1 |  |
| `aurum_head` | armor | Aurum Helmet | خوذة أورومي | 1 |  |
| `aurum_chest` | armor | Aurum Chestplate | درع صدر أورومي | 1 |  |
| `aurum_legs` | armor | Aurum Leggings | بنطال أورومي | 1 |  |
| `aurum_feet` | armor | Aurum Boots | حذاء أورومي | 1 |  |
| `aetherite_head` | armor | Aetherite Helmet | خوذة إيثريتي | 1 |  |
| `aetherite_chest` | armor | Aetherite Chestplate | درع صدر إيثريتي | 1 |  |
| `aetherite_legs` | armor | Aetherite Leggings | بنطال إيثريتي | 1 |  |
| `aetherite_feet` | armor | Aetherite Boots | حذاء إيثريتي | 1 |  |
| `bow` | misc | Shortbow | قوس قصير | 1 | fuel 15 s; use: bow |
| `arrow` | misc | Arrow | سهم | 64 |  |
| `name_tag` | misc | Name Tag | بطاقة تسمية | 16 | use: name_tag |
| `bucket` | misc | Bucket | دلو | 1 |  |
| `water_bucket` | misc | Water Bucket | دلو ماء | 1 |  |

## Creatures (8)

| ID | Category | Body | Health | Damage | Spawns in | Drops |
| -- | -------- | ---- | ------ | ------ | --------- | ----- |
| `bramblehog` | passive | quadruped | 10 | 0 | plains, forest, beach | raw_meat, leather |
| `woolback` | passive | quadruped | 10 | 0 | plains, forest, mountains | wool |
| `cluckhen` | passive | bird | 4 | 0 | plains, forest | feather, raw_meat |
| `hornbleat` | passive | quadruped | 10 | 0 | mountains, plains | raw_meat, leather |
| `cave_crawler` | neutral | crawler | 12 | 2 | *, underground | string |
| `shadewisp` | hostile | wisp | 16 | 3 | *, underground | ember_dust |
| `rattler` | hostile | biped | 14 | 2 (ranged 16 blocks) | *, underground | bone, string |
| `rime_wisp` | hostile | wisp | 18 | 3 | snow_taiga, mountains, underground | frostglass, aetherite_gem |
