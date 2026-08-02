// نظام الزراعة: الحرث، الغرس، النمو، الحصاد
import { blockByName, getBlock } from "./BlockData.js";

// بيانات المحاصيل
const CROPS = {
  wheat_seeds: { id: "wheat_seeds", stages: ["wheat0", "wheat1", "wheat2"], harvest: "wheat", seed: "wheat_seeds", time: 30, minDrop: 1, maxDrop: 2, seedDrop: 1 },
  carrot: { id: "carrot", stages: ["carrots0", "carrots1", "carrots2"], harvest: "carrot", seed: null, time: 25, minDrop: 2, maxDrop: 5, seedDrop: 0 },
  potato: { id: "potato", stages: ["potatoes0", "potatoes1", "potatoes2"], harvest: "potato", seed: null, time: 25, minDrop: 2, maxDrop: 5, seedDrop: 0 },
};

// البلوكات التي يمكن حرثها -> البلوك الناتج
const TILLABLE = { dirt: "farmland", grass: "farmland" };

// البذور التي تزرع على الأرض المزروعة
const PLANTABLE = {};
for (const key in CROPS) {
  const c = CROPS[key];
  PLANTABLE[c.stages[0]] = true;
}

// معرفات مراحل المحاصيل (للتحديث السريع)
const CROP_STAGE_IDS = {};
for (const key in CROPS) {
  const c = CROPS[key];
  CROP_STAGE_IDS[blockByName(c.stages[0])?.id] = c;
  CROP_STAGE_IDS[blockByName(c.stages[1])?.id] = c;
  CROP_STAGE_IDS[blockByName(c.stages[2])?.id] = c;
}
// map from block id to its stage index
const STAGE_MAP = {};
for (const key in CROPS) {
  const c = CROPS[key];
  for (let i = 0; i < c.stages.length; i++) {
    const b = blockByName(c.stages[i]);
    if (b) STAGE_MAP[b.id] = { crop: c, stage: i };
  }
}

// حالة النمو لكل مزروعة
const _growth = new Map();

export class FarmingSystem {
  constructor(world) {
    this.world = world;
  }

  // حرث: تحويل تراب/عشب إلى أرض مزروعة
  till(x, y, z) {
    const id = this.world.getBlock(x, y, z);
    const name = getBlock(id).name;
    const target = TILLABLE[name];
    if (!target) return false;
    const b = blockByName(target);
    if (!b) return false;
    this.world.setBlock(x, y, z, b.id);
    return true;
  }

  // غرس: وضع بذرة على أرض مزروعة
  plant(x, y, z, seedId) {
    const crop = CROPS[seedId];
    if (!crop) return false;
    // السفلي أرض مزروعة؟
    const below = this.world.getBlock(x, y - 1, z);
    if (getBlock(below).name !== "farmland") return false;
    // العلوي هواء؟
    const cur = this.world.getBlock(x, y, z);
    if (cur !== 0) return false; // ليس هواء
    // ازرع
    const stage0 = blockByName(crop.stages[0]);
    if (!stage0) return false;
    this.world.setBlock(x, y, z, stage0.id);
    const key = x + "," + y + "," + z;
    _growth.set(key, 0);
    return true;
  }

  // حصاد المحصول الناضج
  harvest(x, y, z) {
    const id = this.world.getBlock(x, y, z);
    const info = STAGE_MAP[id];
    if (!info || info.stage < 2) return null; // غير ناضج
    const crop = info.crop;
    // إزالة المحصول
    this.world.setBlock(x, y, z, 0);
    const key = x + "," + y + "," + z;
    _growth.delete(key);
    // حساب النقاط
    const count = crop.minDrop + Math.floor(Math.random() * (crop.maxDrop - crop.minDrop + 1));
    const drops = [{ id: crop.harvest, count }];
    if (crop.seedDrop > 0 && Math.random() < 0.5) {
      drops.push({ id: crop.seed, count: crop.seedDrop });
    } else if (crop.seed === null) {
      // لا بذور إضافية
    }
    return drops;
  }

  // تحديث النمو
  tick(dt) {
    const toAdvance = [];
    for (const [key, timer] of _growth) {
      const [x, y, z] = key.split(",").map(Number);
      const id = this.world.getBlock(x, y, z);
      const info = STAGE_MAP[id];
      if (!info) { _growth.delete(key); continue; }
      if (info.stage >= 2) continue; // ناضج
      const newTimer = timer + dt;
      _growth.set(key, newTimer);
      if (newTimer >= info.crop.time) {
        toAdvance.push({ x, y, z, crop: info.crop, currentStage: info.stage });
      }
    }
    for (const { x, y, z, crop, currentStage } of toAdvance) {
      const nextStage = currentStage + 1;
      if (nextStage < crop.stages.length) {
        const b = blockByName(crop.stages[nextStage]);
        if (b) this.world.setBlock(x, y, z, b.id);
        _growth.set(x + "," + y + "," + z, 0); // إعادة العدّاد للمرحلة التالية
      }
    }
  }

  // تنظيف عند كسر البلوك
  onBlockBreak(x, y, z) {
    const key = x + "," + y + "," + z;
    _growth.delete(key);
  }
}

// دوال مساعدة للفحص
export function isCropSeed(id) {
  return !!CROPS[id];
}

export function getCropInfo(blockId) {
  return STAGE_MAP[blockId] || null;
}
