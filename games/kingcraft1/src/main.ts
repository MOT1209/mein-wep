import { TICK_MS } from "./config";
import { Game } from "./game";
import { attachDesktop } from "./input/desktop";
import { consumeLook, createInputState, toMoveInput } from "./input/inputState";
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

function createHint(uiRoot: HTMLElement): HTMLElement {
  const hint = document.createElement("div");
  hint.className = "bw-panel";
  hint.style.cssText =
    "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:16px 22px;font:15px/1.7 var(--ui-font);text-align:center;pointer-events:none;";
  hint.textContent =
    "Click to play\nWASD move · Space jump · Shift sneak · Ctrl or double-W sprint\nF fly · 1-9 hotbar · F3 debug · Esc release mouse";
  hint.style.whiteSpace = "pre";
  uiRoot.append(hint);
  return hint;
}

function createCrosshair(uiRoot: HTMLElement): HTMLElement {
  const crosshair = document.createElement("div");
  crosshair.style.cssText =
    "position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;pointer-events:none;background:linear-gradient(#fff,#fff) center/2px 14px no-repeat,linear-gradient(#fff,#fff) center/14px 2px no-repeat;mix-blend-mode:difference;";
  crosshair.classList.add("hidden");
  uiRoot.append(crosshair);
  return crosshair;
}

function boot(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
  const uiRoot = document.querySelector<HTMLDivElement>("#ui-root");
  if (!canvas || !uiRoot) {
    throw new Error("Block World requires #game-canvas and #ui-root in index.html");
  }

  const world = new World(parseSeed(window.location.search));
  const game = new Game(canvas, world);
  const overlay = createOverlay(uiRoot);
  const hint = createHint(uiRoot);
  const crosshair = createCrosshair(uiRoot);
  const input = createInputState();
  let overlayStamped = 0;

  const detachDesktop = attachDesktop(
    canvas,
    input,
    {
      onToggleDebug: () => {
        overlay.classList.toggle("hidden");
      },
      onPauseChange: (paused) => {
        hint.classList.toggle("hidden", !paused);
        crosshair.classList.toggle("hidden", paused);
      }
    },
    { canFly: game.player.canFly }
  );

  const loop = new GameLoop(TICK_MS, {
    tick: () => {
      game.tick();
    },
    render: () => {
      const look = consumeLook(input);
      game.update(toMoveInput(input), look.dyaw, look.dpitch, input.locked);
      game.render();
      const now = performance.now();
      if (now - overlayStamped >= OVERLAY_INTERVAL_MS) {
        overlayStamped = now;
        const pos = game.playerPosition;
        const state = game.player.state;
        const stream = game.streamStats;
        const mode = state.flying ? "fly" : state.inWater ? "swim" : state.onGround ? "ground" : "air";
        overlay.textContent =
          `FPS ${loop.fps.toFixed(0)}  ·  xyz ${pos.x.toFixed(1)} ${pos.y.toFixed(1)} ${pos.z.toFixed(1)}  ·  ${mode}\n` +
          `chunks ${stream.loaded} loaded · ${stream.pending} pending  ·  slot ${input.hotbarSlot + 1}`;
      }
    }
  });

  const onResize = (): void => {
    game.resize(Math.max(1, window.innerWidth), Math.max(1, window.innerHeight));
  };
  const onPageHide = (): void => {
    loop.stop();
    detachDesktop();
    game.dispose();
  };

  window.addEventListener("resize", onResize);
  window.addEventListener("pagehide", onPageHide, { once: true });
  onResize();
  loop.start();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
