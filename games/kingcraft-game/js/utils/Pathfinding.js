import { isSolid } from "../world/BlockData.js";

const COST_HORIZ = 10;
const COST_VERT = 14;
const COST_STEP_UP = 15;
const MAX_ITERATIONS = 3000;
const MAX_PATH_LENGTH = 64;

class MinHeap {
  constructor() {
    this.data = [];
  }
  push(node) {
    this.data.push(node);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p].f <= this.data[i].f) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      let i = 0;
      const n = this.data.length;
      while (true) {
        let smallest = i;
        const l = (i << 1) + 1;
        const r = (i << 1) + 2;
        if (l < n && this.data[l].f < this.data[smallest].f) smallest = l;
        if (r < n && this.data[r].f < this.data[smallest].f) smallest = r;
        if (smallest === i) break;
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      }
    }
    return top;
  }
  get size() { return this.data.length; }
}

function isWalkable(world, x, y, z, mobH) {
  if (y < 1 || y + mobH >= 64) return false;
  for (let dy = 0; dy < mobH; dy++) {
    if (isSolid(world.getBlock(x, y + dy, z))) return false;
  }
  return true;
}

function canStandAt(world, x, y, z) {
  return isWalkable(world, x, y, z, 2);
}

function neighbors(world, x, y, z, minX, maxX, minY, maxY, minZ, maxZ) {
  const result = [];
  const dirs = [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]];
  for (const [dx, dz] of dirs) {
    const nx = x + dx, nz = z + dz;
    if (nx < minX || nx > maxX || nz < minZ || nz > maxZ) continue;

    let ny = y;
    if (canStandAt(world, nx, ny, nz)) {
      result.push({ x: nx, y: ny, z: nz, cost: COST_HORIZ });
      continue;
    }

    for (let stepUp = 1; stepUp <= 2; stepUp++) {
      const ty = y + stepUp;
      if (ty > maxY) break;
      if (canStandAt(world, nx, ty, nz)) {
        result.push({ x: nx, y: ty, z: nz, cost: COST_STEP_UP + stepUp * COST_VERT });
        break;
      }
    }

    if (result.length === 0) {
      for (let drop = 1; drop <= 3; drop++) {
        const ty = y - drop;
        if (ty < minY) break;
        if (canStandAt(world, nx, ty, nz)) {
          result.push({ x: nx, y: ty, z: nz, cost: COST_HORIZ + drop * 2 });
          break;
        }
      }
    }
  }
  return result;
}

function heuristic(ax, ay, az, bx, by, bz) {
  const dx = Math.abs(ax - bx);
  const dy = Math.abs(ay - by);
  const dz = Math.abs(az - bz);
  return (dx + dy + dz) * COST_HORIZ;
}

export function findPath(world, startX, startY, startZ, endX, endY, endZ) {
  const sx = Math.floor(startX), sy = Math.floor(startY), sz = Math.floor(startZ);
  const ex = Math.floor(endX), ey = Math.floor(endY), ez = Math.floor(endZ);

  const RADIUS = 16;
  const minX = Math.max(sx - RADIUS, ex - RADIUS);
  const maxX = Math.min(sx + RADIUS, ex + RADIUS);
  const minY = Math.max(1, Math.min(sy, ey) - 4);
  const maxY = Math.min(62, Math.max(sy, ey) + 4);
  const minZ = Math.max(sz - RADIUS, ez - RADIUS);
  const maxZ = Math.min(sz + RADIUS, ez + RADIUS);

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const d = maxZ - minZ + 1;

  const gScore = new Float32Array(w * h * d);
  const closed = new Uint8Array(w * h * d);

  function idx(x, y, z) {
    return ((x - minX) * h + (y - minY)) * d + (z - minZ);
  }

  if (!canStandAt(world, sx, sy, sz) || !canStandAt(world, ex, ey, ez)) return null;

  const startNode = { x: sx, y: sy, z: sz, g: 0, f: heuristic(sx, sy, sz, ex, ey, ez), parent: null };
  const open = new MinHeap();
  open.push(startNode);

  let iterations = 0;
  let found = null;

  while (open.size > 0 && iterations < MAX_ITERATIONS) {
    const node = open.pop();
    iterations++;

    const key = idx(node.x, node.y, node.z);
    if (closed[key]) continue;
    closed[key] = 1;

    if (node.x === ex && node.y === ey && node.z === ez) {
      found = node;
      break;
    }

    if (node.g > 0 && heuristic(node.x, node.y, node.z, ex, ey, ez) <= COST_HORIZ * 2) {
      if (canStandAt(world, node.x, node.y, node.z)) {
        found = node;
        break;
      }
    }

    const nbrs = neighbors(world, node.x, node.y, node.z, minX, maxX, minY, maxY, minZ, maxZ);
    for (const nb of nbrs) {
      const nk = idx(nb.x, nb.y, nb.z);
      if (closed[nk]) continue;

      const ng = node.g + nb.cost;
      if (gScore[nk] === 0 || ng < gScore[nk]) {
        gScore[nk] = ng;
        const nf = ng + heuristic(nb.x, nb.y, nb.z, ex, ey, ez);
        open.push({ x: nb.x, y: nb.y, z: nb.z, g: ng, f: nf, parent: node });
      }
    }
  }

  if (!found && open.size === 0) return null;
  if (!found) found = open.data[0];

  const path = [];
  let cur = found;
  let count = 0;
  while (cur && count < MAX_PATH_LENGTH) {
    path.unshift({ x: cur.x + 0.5, y: cur.y, z: cur.z + 0.5 });
    cur = cur.parent;
    count++;
  }
  if (path.length > 0) {
    path[path.length - 1] = { x: startX, y: startY, z: startZ };
  }
  return path;
}
