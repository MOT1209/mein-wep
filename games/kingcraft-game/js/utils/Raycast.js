// تتبّع شعاع عبر الشبكة (voxel DDA) لإيجاد أول كتلة صلبة في خط النظر.
import { isSolid } from "../world/BlockData.js";
import { REACH } from "./Constants.js";

// origin: THREE.Vector3, dir: THREE.Vector3 (موحّد)
// يعيد { block:[x,y,z], place:[x,y,z], normal:[..] } أو null
export function raycastVoxel(world, origin, dir, maxDist = REACH) {
  let x = Math.floor(origin.x);
  let y = Math.floor(origin.y);
  let z = Math.floor(origin.z);

  const stepX = Math.sign(dir.x);
  const stepY = Math.sign(dir.y);
  const stepZ = Math.sign(dir.z);

  const tDeltaX = stepX !== 0 ? Math.abs(1 / dir.x) : Infinity;
  const tDeltaY = stepY !== 0 ? Math.abs(1 / dir.y) : Infinity;
  const tDeltaZ = stepZ !== 0 ? Math.abs(1 / dir.z) : Infinity;

  const distToBoundary = (s, o, step) => {
    if (step > 0) return (Math.floor(o) + 1 - o);
    if (step < 0) return (o - Math.floor(o));
    return Infinity;
  };

  let tMaxX = stepX !== 0 ? distToBoundary(stepX, origin.x, stepX) * tDeltaX : Infinity;
  let tMaxY = stepY !== 0 ? distToBoundary(stepY, origin.y, stepY) * tDeltaY : Infinity;
  let tMaxZ = stepZ !== 0 ? distToBoundary(stepZ, origin.z, stepZ) * tDeltaZ : Infinity;

  let nx = 0, ny = 0, nz = 0;
  let t = 0;

  while (t <= maxDist) {
    if (isSolid(world.getBlock(x, y, z))) {
      return {
        block: [x, y, z],
        place: [x + nx, y + ny, z + nz],
        normal: [nx, ny, nz],
      };
    }
    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      x += stepX; t = tMaxX; tMaxX += tDeltaX; nx = -stepX; ny = 0; nz = 0;
    } else if (tMaxY < tMaxZ) {
      y += stepY; t = tMaxY; tMaxY += tDeltaY; nx = 0; ny = -stepY; nz = 0;
    } else {
      z += stepZ; t = tMaxZ; tMaxZ += tDeltaZ; nx = 0; ny = 0; nz = -stepZ;
    }
  }
  return null;
}
