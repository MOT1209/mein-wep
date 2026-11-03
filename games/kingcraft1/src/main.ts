import { AUTOSAVE_INTERVAL_SECONDS, MAX_AIR, MAX_HEALTH, MAX_HUNGER, QUALITY_PRESETS, TICK_MS } from "./config";
import { blockById } from "./content/blocks";
import { Game } from "./game";
import { attachDesktop } from "./input/desktop";
import { consumeLook, consumeUses, createInputState, selectHotbar, setLocked, toMoveInput, type HudEvents } from "./input/inputState";
import { attachTouch } from "./input/touch";
import { Sfx } from "./audio/sfx";
import { GameLoop } from "./render/loop";
import { FrameTimer, perfLines } from "./render/perfPanel";
import { openBackend } from "./save/db";
import { Autosaver, buildSave, decodeChunks, loadWorld, saveWorld, slotKey, type SaveFile } from "./save/saveLoad";
import { createPaletteSection } from "./ui/creativePalette";
import { DeathScreen } from "./ui/deathScreen";
import { Hud } from "./ui/hud";
import { IconFactory } from "./ui/icons";
import { furnaceAccepts, furnaceProgress } from "./gameplay/furnace";
import { InventoryScreen, type ExtraSection } from "./ui/inventoryScreen";
import { PauseMenu } from "./ui/pauseMenu";
import { applyHudScale, browserStore, readDevice } from "./ui/responsive";
import { loadSettings, saveSettings, touchEnabled, type Settings } from "./ui/settings";
import { SettingsPanel } from "./ui/settingsPanel";
import { EncyclopediaScreen } from "./ui/encyclopedia";
import { setLocale, tr, trCreature } from "./ui/i18n";
import { BIOMES } from "./voxels/biomes";
import { World } from "./voxels/world";

const DEFAULT_SEED = 271828;
const DEBUG_INTERVAL_MS = 250;

type UiMode = "paused" | "playing" | "inventory" | "book";

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

async function boot(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
  const uiRoot = document.querySelector<HTMLDivElement>("#ui-root");
  if (!canvas || !uiRoot) {
    throw new Error("Block World requires #game-canvas and #ui-root in index.html");
  }

  const params = new URLSearchParams(window.location.search);
  const world = new World(parseSeed(window.location.search));
  const requestedMode = params.get("mode") === "creative" ? "creative" : "survival";
  const backend = await openBackend(typeof indexedDB === "undefined" ? undefined : indexedDB);
  const saveKey = slotKey(world.seedInt, requestedMode);
  let saved: SaveFile | null = null;
  let loadProblem = "";
  try {
    saved = await loadWorld(backend, saveKey);
    if (saved) for (const [key, blocks] of decodeChunks(saved)) world.storedChunks.set(key, blocks);
  } catch (error) {
    saved = null;
    world.storedChunks.clear();
    loadProblem = error instanceof Error ? error.message : String(error);
    console.warn("Save could not be loaded, starting a new world:", loadProblem);
  }
  const device = readDevice();
  const store = browserStore();
  let settings: Settings = loadSettings(store, device);
  setLocale(settings.language);
  let touchOn = touchEnabled(settings, device);
  const game = new Game(canvas, world, {
    mode: requestedMode,
    quality: settings.quality,
    renderDistance: settings.renderDistance
  });
  if (saved) game.restore(saved);
  const startTime = Number(params.get("time"));
  if (params.has("time") && Number.isFinite(startTime) && startTime >= 0 && startTime < 1) world.setTimeOfDay(startTime);
  const icons = new IconFactory(game.atlasCanvas);
  game.attachIcons(icons);
  const hud = new Hud(uiRoot, icons);
  const inventoryScreen = new InventoryScreen(uiRoot, icons);
  const input = createInputState();
  input.lookScale = settings.sensitivity;
  const sfx = new Sfx();
  sfx.setVolume(settings.volume);
  game.events.onSound = (kind, material) => sfx.play(kind, material);
  const frames = new FrameTimer();
  applyHudScale(hud.root, settings.hudScale);
  let mode: UiMode = "paused";
  const hudEvents: HudEvents = {};
  let debugStamped = 0;
  let lastFrame = performance.now();

  const lockPointer = (): void => {
    sfx.unlock();
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
    title: tr("game.title"),
    info:
      `${tr(game.mode === "creative" ? "ui.creative" : "ui.survival")} · ${tr("ui.seed")} ${world.seedInt} · ` +
      `${tr(backend.persistent ? (saved ? "game.info_save_loaded" : "game.info_new_world") : "game.info_no_saving")}\n\n${tr("game.controls_desktop")}`,
    onResume: lockPointer
  });
  pause.show(tr("ui.play"));

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
    if (event.kind === "blocked") hud.toast(tr("game.toast_stronger_tool"));
  };
  game.events.onInteract = (result) => {
    if (result.kind === "crafting") openInventory(3, tr("game.crafting_table"));
    else if (result.kind === "bed") hud.toast(tr(result.slept ? "game.toast_slept" : "game.toast_bed_day"));
    else if (result.kind === "container" && result.state.kind === "chest") {
      openInventory(2, tr("game.chest"), { title: tr("game.chest"), slots: result.state.slots });
    } else if (result.kind === "container" && result.state.kind === "furnace") {
      const furnace = result.state;
      openInventory(2, tr("game.furnace"), {
        title: tr("game.furnace_slots"),
        slots: furnace.slots,
        accepts: furnaceAccepts,
        render: () => {
          const progress = furnaceProgress(furnace);
          return progress.lit ? tr("game.furnace_burning", { fuel: progress.fuel, smelt: progress.smelt }) : tr("game.furnace_idle");
        }
      });
    }
  };
  const death = new DeathScreen(uiRoot, () => {
    death.hide();
    game.respawn();
    lockPointer();
  });
  game.events.onPlayerDamaged = (amount, source, attacker) => {
    if (attacker) hud.toast(tr("game.toast_hit_by", { name: trCreature(attacker.def.id), amount }));
    else if (source === "drown") hud.toast(tr("game.toast_drowning"));
    else if (source === "starve") hud.toast(tr("game.toast_starving"));
  };
  game.events.onDeath = (source) => {
    if (inventoryScreen.isOpen) inventoryScreen.close();
    mode = "paused";
    death.show(source);
    pause.hide();
    releasePointer();
  };
  game.events.onPlaceFailed = (reason) => {
    if (reason === "no-support") hud.toast(tr("game.toast_no_support"));
    else if (reason === "wrong-soil") hud.toast(tr("game.toast_wrong_soil"));
  };

  const touch = attachTouch(uiRoot, input, hudEvents, { canFly: game.player.canFly, onPause: releasePointer });
  const settingsPanel = new SettingsPanel(
    uiRoot,
    settings,
    (next) => {
      const languageChanged = next.language !== settings.language;
      settings = next;
      saveSettings(store, settings);
      if (languageChanged) {
        loop.stop();
        void autosaver.now().finally(() => window.location.reload());
        return;
      }
      game.setRenderDistance(settings.renderDistance);
      game.setPixelRatioCap(QUALITY_PRESETS[settings.quality].pixelRatioCap);
      game.setQuality(settings.quality);
      sfx.setVolume(settings.volume);
      input.lookScale = settings.sensitivity;
      applyHudScale(hud.root, settings.hudScale);
      touchOn = touchEnabled(settings, device);
    },
    () => {
      settingsPanel.hide();
      pause.show();
    }
  );
  const autosaver = new Autosaver(AUTOSAVE_INTERVAL_SECONDS, () => saveWorld(backend, saveKey, buildSave(game.snapshot())));
  let bookFromPause = false;
  const encyclopedia = new EncyclopediaScreen(uiRoot, icons, settings.language, () => closeBook());
  const openBook = (fromPause: boolean): void => {
    bookFromPause = fromPause;
    mode = "book";
    pause.hide();
    hud.setPlaying(false);
    encyclopedia.open();
    releasePointer();
  };
  const closeBook = (): void => {
    encyclopedia.close();
    mode = "paused";
    if (bookFromPause) pause.show();
    else lockPointer();
  };
  pause.setButtons([
    {
      label: tr("ui.encyclopedia"),
      onClick: () => openBook(true)
    },
    {
      label: tr("ui.settings"),
      onClick: () => {
        pause.hide();
        settingsPanel.show(settings);
      }
    },
    {
      label: tr("game.save_now"),
      onClick: () => {
        autosaver.now().then(
          () => hud.toast(tr(backend.persistent ? "game.toast_saved" : "game.toast_saved_session")),
          () => hud.toast(tr("game.toast_save_failed"))
        );
      }
    },
    {
      label: tr("ui.new_world"),
      onClick: () => {
        if (!window.confirm(tr("game.new_world_confirm"))) return;
        loop.stop();
        void backend.delete(saveKey).finally(() => window.location.reload());
      }
    }
  ]);
  if (loadProblem) hud.toast(tr("game.toast_load_failed"));
  inventoryScreen.setCloseHandler(() => closeInventory());
  inventoryScreen.setCraftHandler(() => sfx.play("craft", "wood"));
  hud.enableHotbarTaps((slot) => selectHotbar(input, slot, hudEvents));

  hudEvents.onToggleDebug = () => hud.toggleDebug();
  hudEvents.onToggleInventory = () => {
    if (inventoryScreen.isOpen) closeInventory();
    else if (mode === "playing") openInventory(2, tr("ui.inventory"), game.creative ? createPaletteSection() : undefined);
  };
  hudEvents.onPauseChange = (paused) => {
    touch.setVisible(touchOn && !paused);
    if (!paused) {
      if (inventoryScreen.isOpen) inventoryScreen.close();
      if (encyclopedia.isOpen) encyclopedia.close();
      mode = "playing";
      pause.hide();
      hud.setPlaying(true);
      return;
    }
    hud.setPlaying(false);
    if (mode === "inventory" || mode === "book" || death.isVisible) return;
    mode = "paused";
    pause.show();
  };
  const detachDesktop = attachDesktop(canvas, input, hudEvents, { canFly: game.player.canFly });

  const onEscape = (event: KeyboardEvent): void => {
    if (event.code !== "Escape" && event.target instanceof HTMLInputElement) return;
    if (event.code === "Escape" && inventoryScreen.isOpen) {
      event.preventDefault();
      closeInventory();
    } else if (event.code === "Escape" && encyclopedia.isOpen) {
      event.preventDefault();
      closeBook();
    } else if (event.code === "KeyJ" && mode === "playing" && !event.repeat) {
      event.preventDefault();
      openBook(false);
    }
  };

  const loop = new GameLoop(TICK_MS, {
    tick: () => {
      game.tick();
    },
    render: () => {
      const frameNow = performance.now();
      frames.add(frameNow - lastFrame);
      if (input.locked) autosaver.tick((frameNow - lastFrame) / 1000);
      lastFrame = frameNow;
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
          `Facing yaw ${((state.yaw * 180) / Math.PI).toFixed(0)} pitch ${((state.pitch * 180) / Math.PI).toFixed(0)}  target ${target}`,
          ...perfLines(
            frames,
            {
              calls: game.renderer.info.render.calls,
              triangles: game.renderer.info.render.triangles,
              geometries: game.renderer.info.memory.geometries,
              textures: game.renderer.info.memory.textures
            },
            stream,
            game.entities.entities.length,
            game.particles.particles.length
          ),
          `Sound ${sfx.muted ? "off" : "on"}  quality ${game.quality}`
        ]);
      }
    }
  });

  const onResize = (): void => {
    game.resize(Math.max(1, window.innerWidth), Math.max(1, window.innerHeight));
    applyHudScale(hud.root, settings.hudScale);
  };
  const onHidden = (): void => {
    if (document.visibilityState === "hidden") void autosaver.now();
  };
  const onPageHide = (): void => {
    void autosaver.now();
    loop.stop();
    detachDesktop();
    touch.detach();
    game.dispose();
  };

  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onEscape);
  window.addEventListener("pagehide", onPageHide, { once: true });
  document.addEventListener("visibilitychange", onHidden);
  onResize();
  loop.start();
}

function start(): void {
  boot().catch((error: unknown) => {
    console.error("Block World failed to start:", error);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
