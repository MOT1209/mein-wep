import { describe, expect, it } from "vitest";
import { B, blockById } from "../src/content/blocks";
import { ContainerStore } from "../src/gameplay/containers";
import { interact, type InteractWorld } from "../src/gameplay/interactive";

class FakeWorld implements InteractWorld {
  blocks = new Map<string, number>();
  isNight = false;
  mornings = 0;

  getBlock(x: number, y: number, z: number): number {
    return this.blocks.get(`${x},${y},${z}`) ?? B.AIR;
  }

  setBlock(x: number, y: number, z: number, id: number): boolean {
    this.blocks.set(`${x},${y},${z}`, id);
    return true;
  }

  skipToMorning(): void {
    this.mornings++;
  }
}

describe("block interactions", () => {
  it("toggles a door between open and closed", () => {
    const world = new FakeWorld();
    world.blocks.set("0,10,0", B.DOOR_CLOSED);
    const opened = interact(world, new ContainerStore(), { x: 0, y: 10, z: 0 });
    expect(opened).toEqual({ kind: "door", open: true });
    expect(world.getBlock(0, 10, 0)).toBe(B.DOOR_OPEN);
    const closed = interact(world, new ContainerStore(), { x: 0, y: 10, z: 0 });
    expect(closed).toEqual({ kind: "door", open: false });
    expect(world.getBlock(0, 10, 0)).toBe(B.DOOR_CLOSED);
  });

  it("only sleeps at night", () => {
    const world = new FakeWorld();
    world.blocks.set("2,10,2", B.BED);
    expect(interact(world, new ContainerStore(), { x: 2, y: 10, z: 2 })).toMatchObject({ kind: "bed", slept: false });
    expect(world.mornings).toBe(0);
    world.isNight = true;
    expect(interact(world, new ContainerStore(), { x: 2, y: 10, z: 2 })).toMatchObject({ kind: "bed", slept: true });
    expect(world.mornings).toBe(1);
  });

  it("reports a fume vent instead of doing nothing", () => {
    const world = new FakeWorld();
    world.blocks.set("5,9,5", B.FUME_VENT);
    expect(interact(world, new ContainerStore(), { x: 5, y: 9, z: 5 })).toEqual({
      kind: "fume",
      at: { x: 5, y: 9, z: 5 }
    });
  });

  it("opens a chest as a container with 27 slots", () => {
    const world = new FakeWorld();
    world.blocks.set("1,9,1", B.CHEST);
    const result = interact(world, new ContainerStore(), { x: 1, y: 9, z: 1 });
    expect(result?.kind).toBe("container");
    if (result?.kind !== "container") return;
    expect(result.state.slots).toHaveLength(27);
    expect(result.state.kind).toBe("chest");
  });

  it("returns nothing for a block with no behaviour", () => {
    const world = new FakeWorld();
    world.blocks.set("3,9,3", B.STONE);
    expect(blockById(B.STONE).interactive).toBeUndefined();
    expect(interact(world, new ContainerStore(), { x: 3, y: 9, z: 3 })).toBeNull();
  });
});
