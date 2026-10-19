import { MAX_AIR, MAX_HEALTH, MAX_HUNGER, QUALITY_PRESETS, TICK_MS } from "./config";
import { blockById } from "./content/blocks";
import { Game } from "./game";
import { attachDesktop } from "./input/desktop";
import { consumeLook, consumeUses, createInputState, selectHotbar, setLocked, toMoveInput, type HudEvents } from "./input/inputState";
import { attachTouch } from "./input/touch";
import { GameLoop } from "./render/loop";
import { createPaletteSection } from "./ui/creativePalette";
import { DeathScreen } from "./ui/deathScreen";
import { Hud } from "./ui/hud";
import { IconFactory } from "./ui/icons";
import { furnaceAccepts, furnaceStatus } from "./gameplay/furnace";
import { InventoryScreen, type ExtraSection } from "./ui/inventoryScreen";
import { PauseMenu } from "./ui/pauseMenu";
import { applyHudScale, browserStore, readDevice } from "./ui/responsive";
import { loadSettings, saveSettings, touchEnabled, type Settings } from "./ui/settings";
import { SettingsPanel } from "./ui/settingsPanel";
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
  const startTime = Number(params.get("time"));
  if (params.has("time") && Number.isFinite(startTime) && startTime >= 0 && startTime < 1) world.setTimeOfDay(startTime);
  const device = readDevice();
  const store = browserStore();
  let settings: Settings = loadSettings(store, device);
  let touchOn = touchEnabled(settings, device);
  const game = new Game(canvas, world, {
    mode: params.get("mode") === "creative" ? "creative" : "survival",
    quality: settings.quality,
    renderDistance: settings.renderDistance
  });
  const icons = new IconFactory(game.atlasCanvas);
  game.attachIcons(icons);
  const hud = new Hud(uiRoot, icons);
  const inventoryScreen = new InventoryScreen(uiRoot, icons);
  const input = createInputState();
  input.lookScale = settings.sensitivity;
  applyHudScale(hud.root, settings.hudScale);
  let mode: UiMode = "paused";
  const hudEvents: HudEvents = {};
  let debugStamped = 0;

  const lockPointer = (): void => {
    if (touchOn) {
      setLocked(input, true, hudEvents);
      return;
    }
    const request = canvas.requestPointerLock() as unknown;
    if (request instanceof Promise) request.catch(() => undefined);
  };
  const releasePointer = (): void => {
    if (touchOn) setLocked(input, false, hudEvents);
    else if (document.pointerLockElement === canvas) document.exitPointerLock();
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

  const openInventory = (craftSize: 2 | 3, title: string, extra?: ExtraSection): void => {
    mode = "inventory";
    inventoryScreen.open(game.inventory, { craftSize, title, extra }, dropLeftover);
    hud.setPlaying(false);
    releasePointer();
  };

  const closeInventory = (): void => {
    inventoryScreen.close();
    mode = "paused";
    lockPointer();
  };

  game.events.onMining = (event) => {
    if (event.kind === "blocked") hud.toast("This needs a stronger tool");
  };
  game.events.onInteract = (result) => {
    if (result.kind === "crafting") openInventory(3, "Crafting table");
    else if (result.kind === "bed") hud.toast(result.slept ? "You slept through the night. Spawn point set." : "Spawn point set. You can only sleep at night.");
    else if (result.kind === "container" && result.state.kind === "chest") {
      openInventory(2, "Chest", { title: "Chest", slots: result.state.slots });
    } else if (result.kind === "container" && result.state.kind === "furnace") {
      const furnace = result.state;
      openInventory(2, "Furnace", {
        title: "Input · Fuel · Output",
        slots: furnace.slots,
        accepts: furnaceAccepts,
        render: () => furnaceStatus(furnace)
      });
    }
  };
  const death = new DeathScreen(uiRoot, () => {
    death.hide();
    game.respawn();
    lockPointer();
  });
  game.events.onPlayerDamaged = (amount, source, attacker) => {
    if (attacker) hud.toast(`Hit by ${attacker.def.id.replace(/_/g, " ")} (-${amount})`);
    else if (source === "drown") hud.toast("You are drowning");
    else if (source === "starve") hud.toast("You are starving");
  };
  game.events.onDeath = (source) => {
    if (inventoryScreen.isOpen) inventoryScreen.close();
    mode = "paused";
    death.show(source);
    pause.hide();
    releasePointer();
  };
  game.events.onPlaceFailed = (reason) => {
    if (reason === "no-support") hud.toast("Needs a solid block below");
    else if (reason === "wrong-soil") hud.toast("Cannot be planted here");
  };

  const touch = attachTouch(uiRoot, input, hudEvents, { canFly: game.player.canFly, onPause: releasePointer });
  const settingsPanel = new SettingsPanel(
    uiRoot,
    settings,
    (next) => {
      settings = next;
      saveSettings(store, settings);
      game.setRenderDistance(settings.renderDistance);
      game.setPixelRatioCap(QUALITY_PRESETS[settings.quality].pixelRatioCap);
      input.lookScale = settings.sensitivity;
      applyHudScale(hud.root, settings.hudScale);
      touchOn = touchEnabled(settings, device);
    },
    () => {
      settingsPanel.hide();
      pause.show();
    }
  );
  pause.setButtons([
    {
      label: "Settings",
      onClick: () => {
        pause.hide();
        settingsPanel.show(settings);
      }
    }
  ]);
  inventoryScreen.setCloseHandler(() => closeInventory());
  hud.enableHotbarTaps((slot) => selectHotbar(input, slot, hudEvents));

  hudEvents.onToggleDebug = () => hud.toggleDebug();
  hudEvents.onToggleInventory = () => {
    if (inventoryScreen.isOpen) closeInventory();
    else if (mode === "playing") openInventory(2, "Inventory", game.creative ? createPaletteSection() : undefined);
  };
  hudEvents.onPauseChange = (paused) => {
    touch.setVisible(touchOn && !paused);
    if (!paused) {
      if (inventoryScreen.isOpen) inventoryScreen.close();
      mode = "playing";
      pause.hide();
      hud.setPlaying(true);
      return;
    }
    hud.setPlaying(false);
    if (mode === "inventory" || death.isVisible) return;
    mode = "paused";
    pause.show();
  };
  const detachDesktop = attachDesktop(canvas, input, hudEvents, { canFly: game.player.canFly });

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
      hud.setVitals(
        game.creative
          ? null
          : {
              health: game.stats.health,
              maxHealth: MAX_HEALTH,
              hunger: game.stats.hunger,
              maxHunger: MAX_HUNGER,
              air: game.stats.air,
              maxAir: MAX_AIR,
              showAir: game.stats.air < MAX_AIR
            }
      );
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
        const target = game.target
          ? `${game.target.x} ${game.target.y} ${game.target.z} ${blockById(world.getBlock(game.target.x, game.target.y, game.target.z)).name}`
          : "none";
        hud.setDebug([
          `FPS ${loop.fps.toFixed(0)}  ${game.mode}`,
          `XYZ ${pos.x.toFixed(2)} ${pos.y.toFixed(2)} ${pos.z.toFixed(2)}  ${movement}`,
          `Biome ${BIOMES[world.getBiome(bx, bz)]?.name ?? "unknown"}`,
          `Light sky ${world.getSkyLight(bx, by, bz)} block ${world.getBlockLight(bx, by, bz)}`,
          `Time ${clockText(world.dayFraction)}  day ${(world.dayFactor * 100).toFixed(0)}%`,
          `Chunks ${stream.loaded} loaded  ${stream.pending} pending`,
          `Creatures ${game.entities.entities.length}  night ${world.isNight ? "yes" : "no"}`,
          `Facing yaw ${((state.yaw * 180) / Math.PI).toFixed(0)} pitch ${((state.pitch * 180) / Math.PI).toFixed(0)}  target ${target}`
        ]);
      }
    }
  });

  const onResize = (): void => {
    game.resize(Math.max(1, window.innerWidth), Math.max(1, window.innerHeight));
    applyHudScale(hud.root, settings.hudScale);
  };
  const onPageHide = (): void => {
    loop.stop();
    detachDesktop();
    touch.detach();
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
