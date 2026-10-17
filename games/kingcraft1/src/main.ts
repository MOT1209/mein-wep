import { CHUNK_SX, CHUNK_SZ, TICK_MS } from "./config";
import { Game } from "./game";
import { GameLoop } from "./render/loop";
import { World } from "./voxels/world";

const DEFAULT_SEED = 271828;
const OVERLAY_INTERVAL_MS = 250;

function parseSeed(search: string): number {
  const raw = new URLSearchParams(search).get("seed");
  if (raw === null) return DEFAULT_SEED;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value >>> 0 : DEFAULT_SEED;
}

function createOverlay(uiRoot: HTMLElement): HTMLElement {
  const overlay = document.createElement("div");
  overlay.className = "bw-panel";
  overlay.style.cssText =
    "position:absolute;left:12px;bottom:12px;padding:8px 12px;font:13px/1.5 var(--ui-font);pointer-events:none;white-space:pre;";
  uiRoot.append(overlay);
  return overlay;
}

function boot(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
  const uiRoot = document.querySelector<HTMLDivElement>("#ui-root");
  if (!canvas || !uiRoot) {
    throw new Error("Block World requires #game-canvas and #ui-root in index.html");
  }

  const world = new World(parseSeed(window.location.search));
  const spawn = world.findSpawn();
  const centerCx = Math.floor(spawn.x / CHUNK_SX);
  const centerCz = Math.floor(spawn.z / CHUNK_SZ);
  for (let dz = -1; dz <= 1; dz++) {
    for (let dx = -1; dx <= 1; dx++) {
      world.ensureChunk(centerCx + dx, centerCz + dz);
    }
  }

  const game = new Game(canvas, world);
  const overlay = createOverlay(uiRoot);
  let overlayStamped = 0;

  const loop = new GameLoop(TICK_MS, {
    tick: () => {
      game.tick();
    },
    render: () => {
      game.render();
      const now = performance.now();
      if (now - overlayStamped >= OVERLAY_INTERVAL_MS) {
        overlayStamped = now;
        const pos = game.playerPosition;
        overlay.textContent = `FPS ${loop.fps.toFixed(0)}  ·  xyz ${pos.x.toFixed(1)} ${pos.y.toFixed(1)} ${pos.z.toFixed(1)}  ·  chunks ${world.loadedChunkCount}`;
      }
    }
  });

  const onResize = (): void => {
    game.resize(Math.max(1, window.innerWidth), Math.max(1, window.innerHeight));
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "F3") {
      event.preventDefault();
      overlay.classList.toggle("hidden");
    }
  };
  const onPageHide = (): void => {
    loop.stop();
    game.dispose();
  };

  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("pagehide", onPageHide, { once: true });
  onResize();
  loop.start();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
