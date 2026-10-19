import { TICK_MS } from "./config";
import { Game } from "./game";
import { attachDesktop } from "./input/desktop";
import { consumeLook, consumeUses, createInputState, toMoveInput } from "./input/inputState";
import { GameLoop } from "./render/loop";
import { Hud } from "./ui/hud";
import { IconFactory } from "./ui/icons";
import { InventoryScreen } from "./ui/inventoryScreen";
import { PauseMenu } from "./ui/pauseMenu";
import { BIOMES } from "./voxels/biomes";
import { World } from "./voxels/world";

const DEFAULT_SEED = 271828;
const DEBUG_INTERVAL_MS = 250;
const CONTROLS_TEXT =
  "Left mouse break · Right mouse place or use · Wheel or 1-9 hotbar\n" +
  "WASD move · Space jump · Shift sneak · Ctrl or double-W sprint\n" +
  "E inventory · F fly (creative) · F3 debug · Esc pause";

type UiMode = "paused" | "playing" | "inventory";

function parseSeed(search: string): number {
  const raw = new URLSearchParams(search).get("seed");
  if (raw === null) return DEFAULT_SEED;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value >>> 0 : DEFAULT_SEED;
}

function clockText(dayFraction: number): string {
  const minutes = Math.floor(((dayFraction + 0.25) % 1) * 24 * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function boot(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
  const uiRoot = document.querySelector<HTMLDivElement>("#ui-root");
  if (!canvas || !uiRoot) {
    throw new Error("Block World requires #game-canvas and #ui-root in index.html");
  }

  const params = new URLSearchParams(window.location.search);
  const world = new World(parseSeed(window.location.search));
  const game = new Game(canvas, world, { mode: params.get("mode") === "creative" ? "creative" : "survival" });
  const icons = new IconFactory(game.atlasCanvas);
  game.attachIcons(icons);
  const hud = new Hud(uiRoot, icons);
  const inventoryScreen = new InventoryScreen(uiRoot, icons);
  const input = createInputState();
  let mode: UiMode = "paused";
  let debugStamped = 0;

  const lockPointer = (): void => {
    const request = canvas.requestPointerLock() as unknown;
    if (request instanceof Promise) request.catch(() => undefined);
  };
  const pause = new PauseMenu(uiRoot, {
    title: "Block World",
    info: `${game.mode === "creative" ? "Creative" : "Survival"} · seed ${world.seedInt}\n\n${CONTROLS_TEXT}`,
    onResume: lockPointer
  });
  pause.show("Play");

  const dropLeftover = (stack: { item: string; count: number }): void => {
    const { x, y, z } = game.player.state.position;
    game.drops.spawn(stack, x, y + 1.2, z);
  };

  const openInventory = (craftSize: 2 | 3, title: string): void => {
    mode = "inventory";
    inventoryScreen.open(game.inventory, { craftSize, title }, dropLeftover);
    hud.setPlaying(false);
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  };

  const closeInventory = (): void => {
    inventoryScreen.close();
    mode = "paused";
    lockPointer();
  };

  game.events.onMining = (event) => {
    if (event.kind === "blocked") hud.toast("This needs a stronger tool");
  };
  game.events.onPlaceFailed = (reason) => {
    if (reason === "no-support") hud.toast("Needs a solid block below");
    else if (reason === "wrong-soil") hud.toast("Cannot be planted here");
  };

  const detachDesktop = attachDesktop(
    canvas,
    input,
    {
      onToggleDebug: () => hud.toggleDebug(),
      onToggleInventory: () => {
        if (inventoryScreen.isOpen) closeInventory();
        else if (mode === "playing") openInventory(2, "Inventory");
      },
      onPauseChange: (paused) => {
        if (!paused) {
          if (inventoryScreen.isOpen) inventoryScreen.close();
          mode = "playing";
          pause.hide();
          hud.setPlaying(true);
          return;
        }
        hud.setPlaying(false);
        if (mode === "inventory") return;
        mode = "paused";
        pause.show();
      }
    },
    { canFly: game.player.canFly }
  );

  const onEscape = (event: KeyboardEvent): void => {
    if (event.code === "Escape" && inventoryScreen.isOpen) {
      event.preventDefault();
      closeInventory();
    }
  };

  const loop = new GameLoop(TICK_MS, {
    tick: () => {
      game.tick();
    },
    render: () => {
      const look = consumeLook(input);
      game.update({
        move: toMoveInput(input),
        dyaw: look.dyaw,
        dpitch: look.dpitch,
        attack: input.attack,
        uses: consumeUses(input),
        hotbarSlot: input.hotbarSlot,
        active: input.locked
      });
      game.render();
      hud.setHotbar(game.inventory.slots, game.inventory.selectedIndex);
      hud.setMiningProgress(game.mining.progress);
      hud.setVitals(null);
      if (inventoryScreen.isOpen) inventoryScreen.refresh();
      const now = performance.now();
      if (hud.debugVisible && now - debugStamped >= DEBUG_INTERVAL_MS) {
        debugStamped = now;
        const state = game.player.state;
        const pos = state.position;
        const bx = Math.floor(pos.x);
        const by = Math.floor(pos.y);
        const bz = Math.floor(pos.z);
        const stream = game.streamStats;
        const movement = state.flying ? "fly" : state.inWater ? "swim" : state.onGround ? "ground" : "air";
        const target = game.target ? `${game.target.x} ${game.target.y} ${game.target.z}` : "none";
        hud.setDebug([
          `FPS ${loop.fps.toFixed(0)}  ${game.mode}`,
          `XYZ ${pos.x.toFixed(2)} ${pos.y.toFixed(2)} ${pos.z.toFixed(2)}  ${movement}`,
          `Biome ${BIOMES[world.getBiome(bx, bz)]?.name ?? "unknown"}`,
          `Light sky ${world.getSkyLight(bx, by, bz)} block ${world.getBlockLight(bx, by, bz)}`,
          `Time ${clockText(world.dayFraction)}  day ${(world.dayFactor * 100).toFixed(0)}%`,
          `Chunks ${stream.loaded} loaded  ${stream.pending} pending`,
          `Facing yaw ${((state.yaw * 180) / Math.PI).toFixed(0)} pitch ${((state.pitch * 180) / Math.PI).toFixed(0)}  target ${target}`
        ]);
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
  window.addEventListener("keydown", onEscape);
  window.addEventListener("pagehide", onPageHide, { once: true });
  onResize();
  loop.start();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
