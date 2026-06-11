// مخزون اللاعب: 36 خانة (أول 9 = الهاتبار) + دروع.
import { getItem } from "../items/Items.js";

export class Inventory {
  constructor() {
    this.slots = new Array(36).fill(null); // {id, count} | null
    this.armor = [null, null, null, null]; // خوذة، صدر، بنطال، حذاء
    this.selectedHotbar = 0;
    this.hotbarSize = 9;
    this.onChange = null; // callback لتحديث الواجهة
  }

  _changed() { if (this.onChange) this.onChange(); }

  maxStack(id) { const it = getItem(id); return it ? it.maxStack : 64; }

  get selectedStack() { return this.slots[this.selectedHotbar]; }

  selectHotbar(i) {
    if (i < 0 || i >= this.hotbarSize) return;
    this.selectedHotbar = i;
    this._changed();
  }

  // يضيف عناصر — يكدّس على الموجود ثم الخانات الفارغة. يعيد الكمية المتبقية.
  addItem(id, count = 1) {
    const max = this.maxStack(id);
    // كدّس أولاً
    for (let i = 0; i < this.slots.length && count > 0; i++) {
      const s = this.slots[i];
      if (s && s.id === id && s.count < max) {
        const add = Math.min(count, max - s.count);
        s.count += add; count -= add;
      }
    }
    // خانات فارغة
    for (let i = 0; i < this.slots.length && count > 0; i++) {
      if (!this.slots[i]) {
        const add = Math.min(count, max);
        this.slots[i] = { id, count: add }; count -= add;
      }
    }
    this._changed();
    return count;
  }

  count(id) {
    let n = 0;
    for (const s of this.slots) if (s && s.id === id) n += s.count;
    return n;
  }

  // ينقص كمية من عنصر عبر كل الخانات. يعيد true إذا نجح.
  consume(id, count = 1) {
    if (this.count(id) < count) return false;
    for (let i = 0; i < this.slots.length && count > 0; i++) {
      const s = this.slots[i];
      if (s && s.id === id) {
        const take = Math.min(count, s.count);
        s.count -= take; count -= take;
        if (s.count <= 0) this.slots[i] = null;
      }
    }
    this._changed();
    return true;
  }

  // ينقص واحداً من الخانة المختارة في الهاتبار (عند وضع بلوك)
  consumeSelected(count = 1) {
    const s = this.slots[this.selectedHotbar];
    if (!s) return false;
    s.count -= count;
    if (s.count <= 0) this.slots[this.selectedHotbar] = null;
    this._changed();
    return true;
  }

  // عناصر بداية للاختبار/البقاء
  giveStarter() {
    this.addItem("wood", 16);
    this.addItem("planks", 8);
    this.selectHotbar(0);
  }
}
