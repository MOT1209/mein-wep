// واجهة المخزون + التصنيع (2×2 و 3×3) + الفرن. تحريك العناصر بالنقر.
import { itemIcon, getItem } from "../items/Items.js";
import { matchRecipe } from "../crafting/Crafting.js";

export class InventoryUI {
  constructor(inventory) {
    this.inv = inventory;
    this.craft = new Array(9).fill(null);
    this.craftSize = 2;
    this.held = null;       // الكومة على المؤشر
    this.mode = null;       // null | inventory | table | furnace
    this.furnace = null;    // حالة الفرن عند الفتح
    this.slotEls = [];
    this.onClose = null;
    this.onArmorChange = null;

    this.overlay = document.createElement("div");
    this.overlay.className = "inv-overlay hidden";
    this.overlay.addEventListener("contextmenu", (e) => e.preventDefault());
    this.overlay.addEventListener("mousemove", (e) => this._moveHeld(e));
    document.body.appendChild(this.overlay);

    this.heldEl = document.createElement("div");
    this.heldEl.className = "inv-held hidden";
    document.body.appendChild(this.heldEl);
  }

  get isOpen() { return this.mode !== null; }

  open(mode, furnaceState = null) {
    this.mode = mode;
    this.furnace = furnaceState;
    this.craftSize = mode === "table" ? 3 : 2;
    this._build();
    this.overlay.classList.remove("hidden");
    this.render();
  }

  close() {
    // أعد عناصر التصنيع والكومة المحمولة إلى المخزون
    for (let i = 0; i < this.craft.length; i++) {
      if (this.craft[i]) { this.inv.addItem(this.craft[i].id, this.craft[i].count); this.craft[i] = null; }
    }
    if (this.held) { this.inv.addItem(this.held.id, this.held.count); this.held = null; }
    this._updateHeld();
    this.mode = null;
    this.furnace = null;
    this.overlay.classList.add("hidden");
    if (this.onClose) this.onClose();
  }

  // ===== الوصول للكومات حسب المنطقة =====
  _get(zone, i) {
    if (zone === "inv") return this.inv.slots[i];
    if (zone === "craft") return this.craft[i];
    if (zone === "armor") return this.inv.armor[i];
    if (zone === "fin") return this.furnace.input;
    if (zone === "ffuel") return this.furnace.fuel;
    if (zone === "fout") return this.furnace.output;
    return null;
  }
  _set(zone, i, stack) {
    if (zone === "inv") this.inv.slots[i] = stack;
    else if (zone === "craft") this.craft[i] = stack;
    else if (zone === "armor") this.inv.armor[i] = stack;
    else if (zone === "fin") this.furnace.input = stack;
    else if (zone === "ffuel") this.furnace.fuel = stack;
    else if (zone === "fout") this.furnace.output = stack;
  }

  _maxStack(id) { const it = getItem(id); return it ? it.maxStack : 64; }

  // ===== بناء التخطيط =====
  _build() {
    this.slotEls = [];
    this.overlay.innerHTML = "";
    const panel = document.createElement("div");
    panel.className = "inv-panel";

    const title = document.createElement("div");
    title.className = "inv-title";
    title.textContent = this.mode === "furnace" ? "فرن" : (this.mode === "table" ? "طاولة التصنيع" : "المخزون");
    panel.appendChild(title);

    if (this.mode === "furnace") {
      panel.appendChild(this._buildFurnaceTop());
    } else {
      panel.appendChild(this._buildCraftTop());
    }

    // فتحات الدروع (على اليسار عند فتح المخزون فقط)
    if (this.mode !== "furnace") {
      const invRow = document.createElement("div");
      invRow.className = "inv-row";
      invRow.style.alignItems = "flex-start";

      const armorCol = document.createElement("div");
      armorCol.className = "inv-armor";
      armorCol.style.display = "flex";
      armorCol.style.flexDirection = "column";
      armorCol.style.gap = "4px";
      armorCol.style.marginRight = "12px";
      armorCol.style.marginTop = "8px";
      const armorParts = ["خوذة", "صندوق", "بنطلون", "حذاء"];
      for (let i = 0; i < 4; i++) {
        const slot = this._slot("armor", i);
        slot.title = armorParts[i];
        const lbl = document.createElement("div");
        lbl.className = "armor-label";
        lbl.textContent = armorParts[i];
        slot.appendChild(lbl);
        armorCol.appendChild(slot);
      }
      invRow.appendChild(armorCol);

      const mainGrid = document.createElement("div");
      mainGrid.appendChild(this._buildInventoryGrid());
      invRow.appendChild(mainGrid);
      panel.appendChild(invRow);
    } else {
      panel.appendChild(this._buildInventoryGrid());
    }

    const hint = document.createElement("div");
    hint.className = "inv-hint";
    hint.textContent = "نقر = نقل الكومة • نقر يمين = نصف/واحد • E أو Esc للإغلاق";
    panel.appendChild(hint);

    this.overlay.appendChild(panel);
  }

  _buildInventoryGrid() {
    const container = document.createElement("div");
    const main = document.createElement("div");
    main.className = "inv-grid";
    main.style.gridTemplateColumns = "repeat(9, 44px)";
    main.style.marginTop = "8px";
    for (let i = 9; i < 36; i++) main.appendChild(this._slot("inv", i));
    container.appendChild(main);

    const hb = document.createElement("div");
    hb.className = "inv-grid";
    hb.style.gridTemplateColumns = "repeat(9, 44px)";
    hb.style.marginTop = "6px";
    for (let i = 0; i < 9; i++) hb.appendChild(this._slot("inv", i));
    container.appendChild(hb);

    return container;
  }

  _buildCraftTop() {
    const row = document.createElement("div");
    row.className = "inv-row";
    const grid = document.createElement("div");
    grid.className = "inv-grid";
    grid.style.gridTemplateColumns = `repeat(${this.craftSize}, 44px)`;
    for (let r = 0; r < this.craftSize; r++)
      for (let c = 0; c < this.craftSize; c++)
        grid.appendChild(this._slot("craft", r * 3 + c)); // فهرسة ثابتة 3×3
    row.appendChild(grid);

    const arrow = document.createElement("div");
    arrow.className = "inv-arrow"; arrow.textContent = "➜";
    row.appendChild(arrow);

    row.appendChild(this._slot("result", 0, "inv-result"));
    return row;
  }

  _buildFurnaceTop() {
    const row = document.createElement("div");
    row.className = "inv-row";

    const col = document.createElement("div");
    col.style.display = "flex"; col.style.flexDirection = "column"; col.style.gap = "8px";
    col.appendChild(this._slot("fin", 0));   // مُدخل (أعلى)
    col.appendChild(this._slot("ffuel", 0)); // وقود (أسفل)
    row.appendChild(col);

    const mid = document.createElement("div");
    mid.className = "furnace-mid";
    this.flameEl = document.createElement("div");
    this.flameEl.className = "furnace-flame"; this.flameEl.textContent = "🔥";
    mid.appendChild(this.flameEl);
    this.progEl = document.createElement("div");
    this.progEl.className = "furnace-progress";
    const bar = document.createElement("div"); this.progEl.appendChild(bar); this.progBar = bar;
    mid.appendChild(this.progEl);
    row.appendChild(mid);

    row.appendChild(this._slot("fout", 0, "inv-result")); // ناتج
    return row;
  }

  _slot(zone, index, extra = "") {
    const el = document.createElement("div");
    el.className = "inv-slot" + (extra ? " " + extra : "");
    el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this._click(zone, index, e.button === 2);
    });
    this.slotEls.push({ el, zone, index });
    return el;
  }

  // ===== منطق النقر =====
  _click(zone, index, isRight) {
    if (zone === "result") { this._takeResult(isRight); this._after(); return; }

    // معالجة فتحات الدروع
    if (zone === "armor") {
      const cur = this.held;
      if (cur && this.inv.isArmorFor(cur.id, index)) {
        const old = this._get("armor", index);
        this._set("armor", index, cur);
        this.held = old;
      } else if (!cur) {
        this.held = this._get("armor", index);
        this._set("armor", index, null);
      }
      this._after();
      if (this.onArmorChange) this.onArmorChange();
      return;
    }

    const cur = this._get(zone, index);

    // خانة الناتج (فرن): التقاط فقط
    if (zone === "fout") {
      if (!cur) { this._after(); return; }
      if (!this.held) { this.held = cur; this._set(zone, index, null); }
      else if (this.held.id === cur.id && this.held.count + cur.count <= this._maxStack(cur.id)) {
        this.held.count += cur.count; this._set(zone, index, null);
      }
      this._after(); return;
    }

    if (!this.held) {
      if (!cur) { this._after(); return; }
      if (isRight) {
        const half = Math.ceil(cur.count / 2);
        this.held = { id: cur.id, count: half };
        cur.count -= half;
        if (cur.count <= 0) this._set(zone, index, null);
      } else {
        this.held = cur; this._set(zone, index, null);
      }
    } else {
      if (!cur) {
        if (isRight) {
          this._set(zone, index, { id: this.held.id, count: 1 });
          this.held.count -= 1; if (this.held.count <= 0) this.held = null;
        } else {
          this._set(zone, index, this.held); this.held = null;
        }
      } else if (cur.id === this.held.id) {
        const max = this._maxStack(cur.id);
        if (isRight) {
          if (cur.count < max) { cur.count += 1; this.held.count -= 1; if (this.held.count <= 0) this.held = null; }
        } else {
          const add = Math.min(this.held.count, max - cur.count);
          cur.count += add; this.held.count -= add; if (this.held.count <= 0) this.held = null;
        }
      } else {
        this._set(zone, index, this.held); this.held = cur;
      }
    }
    this._after();
  }

  _takeResult(isRight) {
    const out = matchRecipe(this.craft, 3);
    if (!out) return;
    const max = this._maxStack(out.id);
    if (this.held) {
      if (this.held.id !== out.id) return;
      if (this.held.count + out.count > max) return;
      this.held.count += out.count;
    } else {
      this.held = { id: out.id, count: out.count };
    }
    for (let i = 0; i < this.craft.length; i++) {
      const s = this.craft[i];
      if (s && s.count > 0) { s.count -= 1; if (s.count <= 0) this.craft[i] = null; }
    }
  }

  _after() {
    this.inv._changed();
    this.render();
  }

  // تحديث الفرن (يُستدعى من حلقة اللعبة)
  tickFurnace() {
    if (this.mode === "furnace" && this.furnace) this.render();
  }

  // ===== الرسم =====
  render() {
    // نتيجة التصنيع
    const result = (this.mode === "furnace") ? null : matchRecipe(this.craft, 3);

    for (const { el, zone, index } of this.slotEls) {
      let stack;
      if (zone === "result") stack = result;
      else stack = this._get(zone, index);
      this._fill(el, stack);
    }

    if (this.mode === "furnace" && this.furnace) {
      const f = this.furnace;
      const ratio = f.cook > 0 && f.input ? Math.min(1, f.cook / 10) : 0;
      if (this.progBar) this.progBar.style.width = (ratio * 100) + "%";
      if (this.flameEl) this.flameEl.classList.toggle("on", f.burn > 0);
    }

    this._updateHeld();
  }

  _fill(el, stack) {
    el.innerHTML = "";
    if (!stack) return;
    const cv = document.createElement("canvas");
    cv.width = 34; cv.height = 34;
    cv.getContext("2d").drawImage(itemIcon(stack.id, 34), 0, 0);
    el.appendChild(cv);
    if (stack.count > 1) {
      const c = document.createElement("span");
      c.className = "cnt"; c.textContent = stack.count;
      el.appendChild(c);
    }
  }

  _moveHeld(e) {
    this._hx = e.clientX; this._hy = e.clientY;
    if (this.held) {
      this.heldEl.style.left = e.clientX + "px";
      this.heldEl.style.top = e.clientY + "px";
    }
  }

  _updateHeld() {
    if (!this.held) { this.heldEl.classList.add("hidden"); return; }
    this.heldEl.classList.remove("hidden");
    this.heldEl.innerHTML = "";
    const cv = document.createElement("canvas");
    cv.width = 36; cv.height = 36;
    cv.getContext("2d").drawImage(itemIcon(this.held.id, 36), 0, 0);
    this.heldEl.appendChild(cv);
    if (this.held.count > 1) {
      const c = document.createElement("span");
      c.className = "cnt"; c.textContent = this.held.count;
      this.heldEl.appendChild(c);
    }
    if (this._hx != null) { this.heldEl.style.left = this._hx + "px"; this.heldEl.style.top = this._hy + "px"; }
  }
}
