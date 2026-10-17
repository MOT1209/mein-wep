import { B, isLiquid } from "../content/blocks";
import { FACE_NX, FACE_NY, FACE_NZ, FACE_PX, FACE_PY, FACE_PZ } from "../voxels/mesher";

export interface RayWorld {
  getBlock(x: number, y: number, z: number): number;
}

export interface RayHit {
  x: number;
  y: number;
  z: number;
  id: number;
  face: number;
  distance: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export function isTargetable(id: number): boolean {
  return id !== B.AIR && !isLiquid(id);
}

export function raycastVoxel(
  world: RayWorld,
  ox: number,
  oy: number,
  oz: number,
  dx: number,
  dy: number,
  dz: number,
  maxDist: number
): RayHit | null {
  const len = Math.hypot(dx, dy, dz);
  if (len === 0 || maxDist <= 0) return null;
  const rx = dx / len;
  const ry = dy / len;
  const rz = dz / len;

  let vx = Math.floor(ox);
  let vy = Math.floor(oy);
  let vz = Math.floor(oz);

  const stepX = rx > 0 ? 1 : rx < 0 ? -1 : 0;
  const stepY = ry > 0 ? 1 : ry < 0 ? -1 : 0;
  const stepZ = rz > 0 ? 1 : rz < 0 ? -1 : 0;

  const tDeltaX = stepX === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rx);
  const tDeltaY = stepY === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / ry);
  const tDeltaZ = stepZ === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rz);

  const boundary = (o: number, v: number, step: number): number => {
    if (step > 0) return v + 1 - o;
    if (step < 0) return o - v;
    return Number.POSITIVE_INFINITY;
  };

  let tMaxX = stepX === 0 ? Number.POSITIVE_INFINITY : boundary(ox, vx, stepX);
  let tMaxY = stepY === 0 ? Number.POSITIVE_INFINITY : boundary(oy, vy, stepY);
  let tMaxZ = stepZ === 0 ? Number.POSITIVE_INFINITY : boundary(oz, vz, stepZ);

  let face = FACE_PY;
  let t = 0;

  while (t <= maxDist) {
    const id = world.getBlock(vx, vy, vz);
    if (isTargetable(id)) {
      return { x: vx, y: vy, z: vz, id, face, distance: t };
    }
    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      t = tMaxX;
      vx += stepX;
      tMaxX += tDeltaX;
      face = stepX > 0 ? FACE_NX : FACE_PX;
    } else if (tMaxY < tMaxZ) {
      t = tMaxY;
      vy += stepY;
      tMaxY += tDeltaY;
      face = stepY > 0 ? FACE_NY : FACE_PY;
    } else {
      t = tMaxZ;
      vz += stepZ;
      tMaxZ += tDeltaZ;
      face = stepZ > 0 ? FACE_NZ : FACE_PZ;
    }
  }
  return null;
}

export function raycastLine(world: RayWorld, from: Vec3, to: Vec3): boolean {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const dist = Math.hypot(dx, dy, dz);
  if (dist === 0) return true;
  return raycastVoxel(world, from.x, from.y, from.z, dx, dy, dz, dist) === null;
}
