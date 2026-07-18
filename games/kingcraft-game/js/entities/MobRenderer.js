import * as THREE from "three";

const GEO = {};

function box(w, h, d) {
  const k = `${w}_${h}_${d}`;
  if (!GEO[k]) GEO[k] = new THREE.BoxGeometry(w, h, d);
  return GEO[k];
}

const COLORS = {
  zombie_head: "#2a7a3a",
  zombie_body: "#3a8a4a",
  zombie_leg: "#1a6a2a",
  skeleton_head: "#e8e8e8",
  skeleton_body: "#d0d0d0",
  skeleton_leg: "#c0c0c0",
  creeper_head: "#2f6f2f",
  creeper_body: "#3f7f3f",
  creeper_leg: "#1f5f1f",
  spider_body: "#6f4f2f",
  spider_leg: "#3f2f1f",
  spider_eye: "#ff0000",
  enderman_body: "#1a1a1a",
  enderman_eye: "#ff00ff",
  witch_body: "#4a2a5a",
  witch_hat: "#2a1a2a",
  witch_nose: "#6a4a3a",
  slime_body: "#6fc96f",
  slime_eye: "#000000",
  husk_body: "#8a7a5a",
  husk_leg: "#6a5a3a",
  cow_body: "#8f6f3f",
  cow_spot: "#f0f0f0",
  cow_head: "#7f5f2f",
  cow_leg: "#6f4f2f",
  sheep_body: "#e8e8e8",
  sheep_head: "#f0f0f0",
  sheep_leg: "#c0c0c0",
  chicken_body: "#e8e0c0",
  chicken_head: "#f0e8d0",
  chicken_comb: "#ff3030",
  chicken_leg: "#ff8f00",
  pig_body: "#ffafa0",
  pig_head: "#ff8f7f",
  pig_leg: "#cf8f7f",
};

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}

function addPart(group, geom, material, px, py, pz) {
  const m = new THREE.Mesh(geom, material);
  m.position.set(px, py, pz);
  group.add(m);
  return m;
}

export function createMobMesh(type) {
  const g = new THREE.Group();

  switch (type) {
    case "zombie": {
      addPart(g, box(0.5, 0.5, 0.5), mat(COLORS.zombie_head), 0, 1.75, 0);
      addPart(g, box(0.6, 0.75, 0.4), mat(COLORS.zombie_body), 0, 1.1, 0);
      addPart(g, box(0.25, 0.75, 0.25), mat(COLORS.zombie_leg), -0.18, 0.37, 0);
      addPart(g, box(0.25, 0.75, 0.25), mat(COLORS.zombie_leg), 0.18, 0.37, 0);
      break;
    }
    case "skeleton": {
      addPart(g, box(0.5, 0.5, 0.5), mat(COLORS.skeleton_head), 0, 1.75, 0);
      addPart(g, box(0.6, 0.75, 0.4), mat(COLORS.skeleton_body), 0, 1.1, 0);
      addPart(g, box(0.2, 0.75, 0.2), mat(COLORS.skeleton_leg), -0.2, 0.37, 0);
      addPart(g, box(0.2, 0.75, 0.2), mat(COLORS.skeleton_leg), 0.2, 0.37, 0);
      break;
    }
    case "creeper": {
      addPart(g, box(0.55, 0.55, 0.55), mat(COLORS.creeper_head), 0, 1.95, 0);
      addPart(g, box(0.6, 0.8, 0.45), mat(COLORS.creeper_body), 0, 1.25, 0);
      addPart(g, box(0.25, 0.7, 0.25), mat(COLORS.creeper_leg), -0.18, 0.35, 0);
      addPart(g, box(0.25, 0.7, 0.25), mat(COLORS.creeper_leg), 0.18, 0.35, 0);
      break;
    }
    case "spider": {
      const sBody = addPart(g, box(0.6, 0.35, 0.5), mat(COLORS.spider_body), 0, 0.55, 0);
      const sHead = addPart(g, box(0.4, 0.3, 0.35), mat(COLORS.spider_body), 0, 0.55, -0.35);
      addPart(g, box(0.06, 0.06, 0.06), mat(COLORS.spider_eye), -0.12, 0.7, -0.5);
      addPart(g, box(0.06, 0.06, 0.06), mat(COLORS.spider_eye), 0.12, 0.7, -0.5);
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 4; i++) {
          const lx = side * 0.35;
          const lz = -0.25 + i * 0.17;
          addPart(g, box(0.06, 0.35, 0.06), mat(COLORS.spider_leg), lx, 0.35, lz);
        }
      }
      break;
    }
    case "cow": {
      addPart(g, box(0.7, 0.55, 0.6), mat(COLORS.cow_body), 0, 0.8, 0.05);
      addPart(g, box(0.55, 0.45, 0.5), mat(COLORS.cow_head), 0, 0.95, -0.5);
      const legH = 0.45;
      for (let side = -1; side <= 1; side += 2) {
        for (let front = -1; front <= 1; front += 2) {
          addPart(g, box(0.2, legH, 0.2), mat(COLORS.cow_leg), side * 0.3, legH / 2, front * 0.3);
        }
      }
      break;
    }
    case "sheep": {
      addPart(g, box(0.8, 0.5, 0.7), mat(COLORS.sheep_body), 0, 0.75, 0);
      addPart(g, box(0.5, 0.4, 0.5), mat(COLORS.sheep_head), 0, 0.9, -0.5);
      const sLegH = 0.4;
      for (let side = -1; side <= 1; side += 2) {
        for (let front = -1; front <= 1; front += 2) {
          addPart(g, box(0.18, sLegH, 0.18), mat(COLORS.sheep_leg), side * 0.3, sLegH / 2, front * 0.3);
        }
      }
      break;
    }
    case "chicken": {
      addPart(g, box(0.35, 0.35, 0.35), mat(COLORS.chicken_body), 0, 0.45, 0);
      addPart(g, box(0.25, 0.25, 0.25), mat(COLORS.chicken_head), 0, 0.7, -0.25);
      addPart(g, box(0.12, 0.12, 0.06), mat(COLORS.chicken_comb), 0, 0.82, -0.25);
      const cLegH = 0.3;
      addPart(g, box(0.08, cLegH, 0.08), mat(COLORS.chicken_leg), -0.1, cLegH / 2, 0);
      addPart(g, box(0.08, cLegH, 0.08), mat(COLORS.chicken_leg), 0.1, cLegH / 2, 0);
      break;
    }
    case "pig": {
      addPart(g, box(0.7, 0.45, 0.5), mat(COLORS.pig_body), 0, 0.65, 0);
      addPart(g, box(0.5, 0.4, 0.45), mat(COLORS.pig_head), 0, 0.75, -0.4);
      const pigLegH = 0.35;
      for (let side = -1; side <= 1; side += 2) {
        for (let front = -1; front <= 1; front += 2) {
          addPart(g, box(0.2, pigLegH, 0.2), mat(COLORS.pig_leg), side * 0.28, pigLegH / 2, front * 0.3);
        }
      }
      break;
    }
    case "enderman": {
      addPart(g, box(0.5, 0.5, 0.5), mat(COLORS.enderman_body), 0, 2.65, 0);
      addPart(g, box(0.55, 1.0, 0.4), mat(COLORS.enderman_body), 0, 1.85, 0);
      addPart(g, box(0.2, 0.75, 0.2), mat(COLORS.enderman_body), -0.22, 0.37, 0);
      addPart(g, box(0.2, 0.75, 0.2), mat(COLORS.enderman_body), 0.22, 0.37, 0);
      addPart(g, box(0.08, 0.08, 0.04), mat(COLORS.enderman_eye), -0.12, 2.75, -0.23);
      addPart(g, box(0.08, 0.08, 0.04), mat(COLORS.enderman_eye), 0.12, 2.75, -0.23);
      break;
    }
    case "witch": {
      addPart(g, box(0.5, 0.5, 0.5), mat(COLORS.witch_body), 0, 1.75, 0);
      addPart(g, box(0.6, 0.75, 0.4), mat(COLORS.witch_body), 0, 1.1, 0);
      addPart(g, box(0.3, 0.15, 0.3), mat(COLORS.witch_hat), 0, 2.05, 0.05);
      addPart(g, box(0.4, 0.1, 0.4), mat(COLORS.witch_hat), 0, 1.9, 0.05);
      addPart(g, box(0.08, 0.08, 0.15), mat(COLORS.witch_nose), 0, 1.65, -0.3);
      addPart(g, box(0.2, 0.75, 0.2), mat(COLORS.witch_body), -0.2, 0.37, 0);
      addPart(g, box(0.2, 0.75, 0.2), mat(COLORS.witch_body), 0.2, 0.37, 0);
      break;
    }
    case "slime": {
      addPart(g, box(0.5, 0.45, 0.5), mat(COLORS.slime_body), 0, 0.25, 0);
      addPart(g, box(0.08, 0.08, 0.06), mat(COLORS.slime_eye), -0.12, 0.35, -0.22);
      addPart(g, box(0.08, 0.08, 0.06), mat(COLORS.slime_eye), 0.12, 0.35, -0.22);
      break;
    }
    case "husk": {
      addPart(g, box(0.5, 0.5, 0.5), mat(COLORS.husk_body), 0, 1.75, 0);
      addPart(g, box(0.6, 0.75, 0.4), mat(COLORS.husk_body), 0, 1.1, 0);
      addPart(g, box(0.25, 0.75, 0.25), mat(COLORS.husk_leg), -0.18, 0.37, 0);
      addPart(g, box(0.25, 0.75, 0.25), mat(COLORS.husk_leg), 0.18, 0.37, 0);
      break;
    }
  }

  g.userData.type = type;
  return g;
}
