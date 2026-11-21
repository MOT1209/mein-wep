import { describe, expect, it } from "vitest";
import { Equipment, armorAbsorb } from "../src/gameplay/equipment";
import { PlayerStats } from "../src/player/stats";

describe("armor", () => {
  it("absorbs a share of incoming damage that grows with armor points", () => {
    expect(armorAbsorb(0, 0, 10)).toBe(0);
    expect(armorAbsorb(20, 0, 10)).toBeCloseTo(7.5);
    expect(armorAbsorb(20, 2, 10)).toBeCloseTo(7.6);
  });

  it("keeps each slot to its own armor piece", () => {
    const equipment = new Equipment();
    expect(equipment.accepts(0, { item: "ferrite_head", count: 1 })).toBe(true);
    expect(equipment.accepts(0, { item: "ferrite_chest", count: 1 })).toBe(false);
    equipment.slots[0] = { item: "ferrite_head", count: 1 };
    expect(equipment.points).toBe(2);
  });

  it("reduces fall damage in the stats pipeline and records the absorbed share", () => {
    const stats = new PlayerStats();
    stats.armorPoints = 20;
    const event = stats.damage(10, "fall");
    expect(event.amount).toBeCloseTo(2.5);
    expect(event.absorbed).toBeCloseTo(7.5);
    expect(stats.health).toBeCloseTo(17.5);
  });

  it("does not protect against drowning", () => {
    const stats = new PlayerStats();
    stats.armorPoints = 20;
    expect(stats.damage(4, "drown").amount).toBe(4);
  });

  it("wears down on hits and restores from a save", () => {
    const equipment = new Equipment();
    equipment.slots[1] = { item: "leather_chest", count: 1 };
    equipment.wear();
    expect(equipment.slots[1]?.durability).toBe(79);
    const restored = Equipment.fromJSON(equipment.toJSON());
    expect(restored.toJSON()).toEqual(equipment.toJSON());
    expect(restored.points).toBe(3);
  });

  it("drops armor saved in the wrong slot", () => {
    const restored = Equipment.fromJSON({ slots: [{ item: "leather_feet", count: 1 }, null, null, null] });
    expect(restored.slots[0]).toBeNull();
  });
});
