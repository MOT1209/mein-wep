import {
  MAX_HEALTH, MAX_FOOD, MAX_SATURATION,
  FALL_DAMAGE_THRESHOLD, FALL_DAMAGE_PER_BLOCK,
  STARVATION_DAMAGE, STARVATION_INTERVAL,
  HEAL_RATE, HEAL_THRESHOLD,
  EXHAUSTION_PER_JUMP, EXHAUSTION_PER_BREAK, EXHAUSTION_PER_SPRINT,
} from "../utils/Constants.js";

const ARMOR_REDUCTION = [0, 0.08, 0.16, 0.24, 0.32, 0.40, 0.48, 0.56, 0.64, 0.72, 0.80];

export class HealthSystem {
  constructor() {
    this.health = MAX_HEALTH;
    this.food = MAX_FOOD;
    this.saturation = MAX_SATURATION;
    this.exhaustion = 0;
    this._starveTimer = 0;
    this._healTimer = 0;
    this._invulnerable = 0;
    this.dead = false;
    this.onChange = null;
    this.onDeath = null;
    this.armorValue = 0;
  }

  setArmor(value) {
    this.armorValue = Math.max(0, Math.min(20, value));
  }

  _changed() { if (this.onChange) this.onChange(); }

  addExhaustion(amount) {
    this.exhaustion += amount;
    if (this.exhaustion >= 4) {
      this.exhaustion -= 4;
      if (this.saturation > 0) {
        this.saturation = Math.max(0, this.saturation - 1);
      } else if (this.food > 0) {
        this.food -= 1;
      }
      this._changed();
    }
  }

  eat(foodValue, saturationModifier) {
    if (this.food >= MAX_FOOD) return;
    this.food = Math.min(MAX_FOOD, this.food + foodValue);
    this.saturation = Math.min(MAX_SATURATION, this.saturation + saturationModifier);
    this._changed();
  }

  takeDamage(amount) {
    if (this._invulnerable > 0 || this.dead) return;
    const reduction = this.armorValue > 0 ? ARMOR_REDUCTION[Math.min(this.armorValue, 10)] : 0;
    const finalDamage = Math.max(0, Math.round(amount * (1 - reduction)));
    this.health = Math.max(0, this.health - finalDamage);
    this._invulnerable = 0.5;
    this._changed();
    if (this.health <= 0) {
      this.dead = true;
      if (this.onDeath) this.onDeath();
    }
  }

  fallDamage(fallDistance) {
    if (fallDistance <= FALL_DAMAGE_THRESHOLD) return;
    const dmg = Math.ceil((fallDistance - FALL_DAMAGE_THRESHOLD) * FALL_DAMAGE_PER_BLOCK);
    if (dmg > 0) this.takeDamage(dmg);
  }

  tick(dt) {
    if (this.dead) return;

    this._invulnerable = Math.max(0, this._invulnerable - dt);

    if (this.food <= 0) {
      this._starveTimer += dt;
      if (this._starveTimer >= STARVATION_INTERVAL) {
        this._starveTimer = 0;
        this.takeDamage(STARVATION_DAMAGE);
      }
    } else {
      this._starveTimer = 0;
    }

    if (this.food >= HEAL_THRESHOLD && this.health < MAX_HEALTH) {
      this._healTimer += dt;
      const interval = 1 / HEAL_RATE;
      if (this._healTimer >= interval) {
        this._healTimer = 0;
        this.health = Math.min(MAX_HEALTH, this.health + 1);
        this.addExhaustion(1.5);
        this._changed();
      }
    } else {
      this._healTimer = 0;
    }
  }

  reset() {
    this.health = MAX_HEALTH;
    this.food = MAX_FOOD;
    this.saturation = MAX_SATURATION;
    this.exhaustion = 0;
    this._starveTimer = 0;
    this._healTimer = 0;
    this._invulnerable = 0;
    this.dead = false;
    this.armorValue = 0;
    this._changed();
  }
}
