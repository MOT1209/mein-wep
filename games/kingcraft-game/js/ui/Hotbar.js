// شريط الأدوات: يعرض أول 9 خانات من المخزون. اختيار بالأرقام أو عجلة الفأرة.
import { itemIcon } from "../items/Items.js";

export class Hotbar {
  constructor(el, inventory) {
    this.el = el;
    this.inv = inventory;
    this.render();
    this._bind();
    inventory.onChange = () => this.render();
  }

  // العنصر المختار حالياً (stack أو null)
  get selectedStack() { return this.inv.slots[this.inv.selectedHotbar]; }

  render() {
    this.el.innerHTML = "";
    for (let i = 0; i < this.inv.hotbarSize; i++) {
      const stack = this.inv.slots[i];
      const slot = document.createElement("div");
      slot.className = "slot" + (i === this.inv.selectedHotbar ? " active" : "");

      if (stack) {
        const icon = document.createElement("canvas");
        icon.width = 32; icon.height = 32;
        const ctx = icon.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(itemIcon(stack.id, 32), 0, 0);
        slot.appendChild(icon);

        if (stack.count > 1) {
          const n = document.createElement("span");
          n.className = "slot-name";
          n.textContent = stack.count;
          slot.appendChild(n);
        }
      }

      const key = document.createElement("span");
      key.className = "slot-key";
      key.textContent = i + 1;
      slot.appendChild(key);

      this.el.appendChild(slot);
    }
  }

  select(i) { this.inv.selectHotbar(i); }

  _bind() {
    window.addEventListener("keydown", (e) => {
      if (e.code.startsWith("Digit")) {
        const n = parseInt(e.code.slice(5), 10);
        if (n >= 1 && n <= this.inv.hotbarSize) this.select(n - 1);
      }
    });
    window.addEventListener("wheel", (e) => {
      const dir = Math.sign(e.deltaY);
      const n = (this.inv.selectedHotbar + dir + this.inv.hotbarSize) % this.inv.hotbarSize;
      this.select(n);
    }, { passive: true });
  }
}
