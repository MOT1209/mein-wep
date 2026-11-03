import { B } from "../../src/content/blocks";

export class MapWorld {
  readonly blocks = new Map<string, number>();
  floorY: number;
  floorId: number;

  constructor(floorY = 0, floorId: number = B.STONE) {
    this.floorY = floorY;
    this.floorId = floorId;
  }

  getBlock(x: number, y: number, z: number): number {
    const set = this.blocks.get(`${x},${y},${z}`);
    if (set !== undefined) return set;
    return y <= this.floorY ? this.floorId : B.AIR;
  }

  setBlock(x: number, y: number, z: number, id: number): boolean {
    if (this.getBlock(x, y, z) === id) return false;
    this.blocks.set(`${x},${y},${z}`, id);
    return true;
  }
}
