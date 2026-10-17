import { PLAYER_HEIGHT, PLAYER_WIDTH, STEP_HEIGHT } from "../config";
import { isLiquid, isSolidBlock } from "../content/blocks";

export interface VoxelSource {
  getBlock(x: number, y: number, z: number): number;
}

export interface CollisionResult {
  x: number;
  y: number;
  z: number;
  onGround: boolean;
  hitCeiling: boolean;
  hitWall: boolean;
  inWater: boolean;
}

export interface MoveOptions {
  width?: number;
  height?: number;
  stepHeight?: number;
}

const EPS = 1e-4;

function cellRangeX(x: number, hw: number): [number, number] {
  return [Math.floor(x - hw + EPS), Math.floor(x + hw - EPS)];
}

function cellRangeZ(z: number, hw: number): [number, number] {
  return [Math.floor(z - hw + EPS), Math.floor(z + hw - EPS)];
}

function solidSlice(world: VoxelSource, x0: number, x1: number, y: number, z0: number, z1: number): boolean {
  for (let z = z0; z <= z1; z++) {
    for (let x = x0; x <= x1; x++) {
      if (isSolidBlock(world.getBlock(x, y, z))) return true;
    }
  }
  return false;
}

function liquidSlice(world: VoxelSource, x0: number, x1: number, y: number, z0: number, z1: number): boolean {
  for (let z = z0; z <= z1; z++) {
    for (let x = x0; x <= x1; x++) {
      if (isLiquid(world.getBlock(x, y, z))) return true;
    }
  }
  return false;
}

export function overlapsSolid(
  world: VoxelSource,
  x: number,
  y: number,
  z: number,
  width: number,
  height: number
): boolean {
  const hw = width / 2;
  const [x0, x1] = cellRangeX(x, hw);
  const [z0, z1] = cellRangeZ(z, hw);
  for (let yy = Math.floor(y + EPS); yy <= Math.floor(y + height - EPS); yy++) {
    if (solidSlice(world, x0, x1, yy, z0, z1)) return true;
  }
  return false;
}

function moveAxisX(
  world: VoxelSource,
  x: number,
  y: number,
  z: number,
  dx: number,
  w: number,
  h: number
): { x: number; blocked: boolean } {
  if (dx === 0) return { x, blocked: false };
  const hw = w / 2;
  const [z0, z1] = cellRangeZ(z, hw);
  const y0 = Math.floor(y + EPS);
  const y1 = Math.floor(y + h - EPS);
  const nx = x + dx;
  if (dx > 0) {
    const from = Math.floor(x + hw - EPS);
    const to = Math.floor(nx + hw - EPS);
    for (let xx = from + 1; xx <= to; xx++) {
      for (let yy = y0; yy <= y1; yy++) {
        if (solidSlice(world, xx, xx, yy, z0, z1)) return { x: xx - hw, blocked: true };
      }
    }
  } else {
    const from = Math.floor(x - hw + EPS);
    const to = Math.floor(nx - hw + EPS);
    for (let xx = from - 1; xx >= to; xx--) {
      for (let yy = y0; yy <= y1; yy++) {
        if (solidSlice(world, xx, xx, yy, z0, z1)) return { x: xx + 1 + hw, blocked: true };
      }
    }
  }
  return { x: nx, blocked: false };
}

function moveAxisY(
  world: VoxelSource,
  x: number,
  y: number,
  z: number,
  dy: number,
  w: number,
  h: number
): { y: number; landed: boolean; ceiling: boolean } {
  if (dy === 0) return { y, landed: false, ceiling: false };
  const hw = w / 2;
  const [x0, x1] = cellRangeX(x, hw);
  const [z0, z1] = cellRangeZ(z, hw);
  const ny = y + dy;
  if (dy < 0) {
    const from = Math.floor(y + EPS);
    const to = Math.floor(ny + EPS);
    for (let yy = from; yy >= to; yy--) {
      if (solidSlice(world, x0, x1, yy, z0, z1)) return { y: yy + 1, landed: true, ceiling: false };
    }
  } else {
    const from = Math.floor(y + h - EPS);
    const to = Math.floor(ny + h - EPS);
    for (let yy = from + 1; yy <= to; yy++) {
      if (solidSlice(world, x0, x1, yy, z0, z1)) return { y: yy - h, landed: false, ceiling: true };
    }
  }
  return { y: ny, landed: false, ceiling: false };
}

function moveAxisZ(
  world: VoxelSource,
  x: number,
  y: number,
  z: number,
  dz: number,
  w: number,
  h: number
): { z: number; blocked: boolean } {
  if (dz === 0) return { z, blocked: false };
  const hw = w / 2;
  const [x0, x1] = cellRangeX(x, hw);
  const y0 = Math.floor(y + EPS);
  const y1 = Math.floor(y + h - EPS);
  const nz = z + dz;
  if (dz > 0) {
    const from = Math.floor(z + hw - EPS);
    const to = Math.floor(nz + hw - EPS);
    for (let zz = from + 1; zz <= to; zz++) {
      for (let yy = y0; yy <= y1; yy++) {
        if (solidSlice(world, x0, x1, yy, zz, zz)) return { z: zz - hw, blocked: true };
      }
    }
  } else {
    const from = Math.floor(z - hw + EPS);
    const to = Math.floor(nz - hw + EPS);
    for (let zz = from - 1; zz >= to; zz--) {
      for (let yy = y0; yy <= y1; yy++) {
        if (solidSlice(world, x0, x1, yy, zz, zz)) return { z: zz + 1 + hw, blocked: true };
      }
    }
  }
  return { z: nz, blocked: false };
}

export function moveWithCollision(
  world: VoxelSource,
  x: number,
  y: number,
  z: number,
  dx: number,
  dy: number,
  dz: number,
  options: MoveOptions = {}
): CollisionResult {
  const w = options.width ?? PLAYER_WIDTH;
  const h = options.height ?? PLAYER_HEIGHT;
  const step = options.stepHeight ?? STEP_HEIGHT;
  let px = x;
  let py = y;
  let pz = z;
  let hitWall = false;

  const rx = moveAxisX(world, px, py, pz, dx, w, h);
  if (rx.blocked) {
    const raised = py + step;
    const retry = step > 0 && !overlapsSolid(world, px, raised, pz, w, h) ? moveAxisX(world, px, raised, pz, dx, w, h) : null;
    if (retry && !retry.blocked) {
      px = retry.x;
      py = raised;
    } else {
      px = rx.x;
      hitWall = true;
    }
  } else {
    px = rx.x;
  }

  const ry = moveAxisY(world, px, py, pz, dy, w, h);
  py = ry.y;

  const rz = moveAxisZ(world, px, py, pz, dz, w, h);
  if (rz.blocked) {
    const raised = py + step;
    const retry = step > 0 && !overlapsSolid(world, px, raised, pz, w, h) ? moveAxisZ(world, px, raised, pz, dz, w, h) : null;
    if (retry && !retry.blocked) {
      pz = retry.z;
      py = raised;
    } else {
      pz = rz.z;
      hitWall = true;
    }
  } else {
    pz = rz.z;
  }

  const hw = w / 2;
  const [x0, x1] = cellRangeX(px, hw);
  const [z0, z1] = cellRangeZ(pz, hw);
  let inWater = false;
  const yTop = Math.floor(py + h - EPS);
  for (let yy = Math.floor(py + EPS); yy <= yTop; yy++) {
    if (liquidSlice(world, x0, x1, yy, z0, z1)) {
      inWater = true;
      break;
    }
  }

  const below = Math.floor(py + EPS) - 1;
  const onGround = ry.landed || (solidSlice(world, x0, x1, below, z0, z1) && py - (below + 1) < EPS);

  return { x: px, y: py, z: pz, onGround, hitCeiling: ry.ceiling, hitWall, inWater };
}
