// إدارة الأفران: حالة لكل فرن (حسب موقعه) تُعالَج في حلقة اللعبة.
import { smeltResult, fuelValue } from "./Smelting.js";

function newState() {
  return { input: null, fuel: null, output: null, burn: 0, burnMax: 0, cook: 0 };
}

export class FurnaceManager {
  constructor() {
    this.states = new Map(); // "x,y,z" -> state
  }

  key(x, y, z) { return x + "," + y + "," + z; }

  get(x, y, z) {
    const k = this.key(x, y, z);
    let s = this.states.get(k);
    if (!s) { s = newState(); this.states.set(k, s); }
    return s;
  }

  remove(x, y, z) { this.states.delete(this.key(x, y, z)); }

  _canSmelt(s) {
    if (!s.input) return false;
    const res = smeltResult(s.input.id);
    if (!res) return false;
    if (!s.output) return true;
    return s.output.id === res.out && s.output.count < 64;
  }

  tickState(s, dt) {
    const can = this._canSmelt(s);

    // إشعال الوقود عند الحاجة
    if (s.burn <= 0 && can && s.fuel) {
      const fv = fuelValue(s.fuel.id);
      if (fv > 0) {
        s.fuel.count -= 1;
        if (s.fuel.count <= 0) s.fuel = null;
        s.burn = fv; s.burnMax = fv;
      }
    }

    if (s.burn > 0) {
      s.burn -= dt;
      if (can) {
        const res = smeltResult(s.input.id);
        s.cook += dt;
        if (s.cook >= res.time) {
          s.cook = 0;
          if (s.output) s.output.count += 1;
          else s.output = { id: res.out, count: 1 };
          s.input.count -= 1;
          if (s.input.count <= 0) s.input = null;
        }
      } else {
        s.cook = 0;
      }
    } else {
      s.cook = Math.max(0, s.cook - dt * 2);
    }
  }

  tick(dt) {
    for (const s of this.states.values()) this.tickState(s, dt);
  }
}
