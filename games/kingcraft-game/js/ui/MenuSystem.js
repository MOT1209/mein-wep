import * as WM from "../utils/WorldManager.js";

const ALL_SCREENS = [];

export class MenuSystem {
  constructor() {
    this.menu = document.getElementById("menu");
    this.worldSelect = document.getElementById("world-select");
    this.worldCreate = document.getElementById("world-create");
    this.pauseMenu = document.getElementById("pause-menu");
    this.settingsPanel = document.getElementById("settings-panel");
    this.chatInput = document.getElementById("chat-input");
    this.hud = document.getElementById("hud");
    this.crosshair = document.getElementById("crosshair");
    this.debug = document.getElementById("debug");
    this.canvas = document.getElementById("game");

    ALL_SCREENS.length = 0;
    ALL_SCREENS.push(this.menu, this.worldSelect, this.worldCreate, this.pauseMenu);

    this._currentWorldObj = null;
    this._onStartGame = null;
    this._saveCallback = null;
    this._closeUICallback = null;
    this._gameStarted = false;

    this._bindEvents();
  }

  get currentWorld() { return this._currentWorldObj; }
  set currentWorld(w) { this._currentWorldObj = w; }
  set onStartGame(fn) { this._onStartGame = fn; }
  set saveCallback(fn) { this._saveCallback = fn; }
  set closeUICallback(fn) { this._closeUICallback = fn; }
  get gameStarted() { return this._gameStarted; }
  set gameStarted(v) { this._gameStarted = v; }

  allHidden() { return ALL_SCREENS.every(s => s.classList.contains("hidden")); }
  hideAll() { ALL_SCREENS.forEach(s => s.classList.add("hidden")); }

  showScreen(screen) {
    this.hideAll();
    screen.classList.remove("hidden");
  }

  fmtTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  openPause() {
    this._paused = true;
    document.exitPointerLock();
    if (this._closeUICallback) this._closeUICallback();
    this.showScreen(this.pauseMenu);
  }

  closePause() {
    this._paused = false;
    this.pauseMenu.classList.add("hidden");
    if (this._gameStarted) this.canvas.requestPointerLock().catch(() => {});
  }

  get paused() { return this._paused; }

  async renderWorldList() {
    const list = document.getElementById("world-list");
    list.innerHTML = "";
    const worlds = await WM.listWorlds();
    if (worlds.length === 0) {
      list.innerHTML = '<div class="world-card" style="cursor:default;color:#888;justify-content:center;padding:20px">No worlds yet. Create one!</div>';
      return;
    }
    for (const w of worlds) {
      const card = document.createElement("div");
      card.className = "world-card";
      card.innerHTML = `
        <div class="world-icon">🌍</div>
        <div class="world-info">
          <div class="world-name">${w.name}</div>
          <div class="world-meta">${w.gameMode} • ${w.difficulty} • ${this.fmtTime(w.playTime)}</div>
        </div>
        <button class="world-delete" data-id="${w.id}" title="Delete">🗑</button>
        <span class="world-play">▶</span>
      `;
      card.addEventListener("click", (e) => {
        if (e.target.closest(".world-delete")) return;
        if (this._onStartGame) this._onStartGame(w);
      });
      card.querySelector(".world-delete").addEventListener("click", (e) => {
        e.stopPropagation();
        this._showDeleteConfirm(w);
      });
      list.appendChild(card);
    }
  }

  _showDeleteConfirm(world) {
    document.getElementById("delete-msg").textContent = `Delete "${world.name}"? This cannot be undone.`;
    const modal = document.getElementById("modal-delete");
    modal.classList.remove("hidden");
    document.getElementById("btn-confirm-delete").onclick = async () => {
      await WM.deleteWorld(world.id);
      modal.classList.add("hidden");
      this.renderWorldList();
    };
    document.getElementById("btn-cancel-delete").onclick = () => modal.classList.add("hidden");
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); }, { once: true });
  }

  _bindEvents() {
    document.getElementById("btn-singleplayer").addEventListener("click", () => {
      this.renderWorldList();
      this.showScreen(this.worldSelect);
    });

    document.getElementById("btn-create-world").addEventListener("click", () => {
      document.getElementById("create-name").value = "My World";
      document.getElementById("create-seed").value = "";
      document.getElementById("create-mode").value = "survival";
      document.getElementById("create-difficulty").value = "normal";
      this.showScreen(this.worldCreate);
    });

    document.getElementById("btn-cancel-create").addEventListener("click", () => {
      this.showScreen(this.worldSelect);
      this.renderWorldList();
    });

    document.getElementById("btn-random-seed").addEventListener("click", () => {
      document.getElementById("create-seed").value = Math.floor(Math.random() * 2147483647).toString();
    });

    document.getElementById("btn-create-confirm").addEventListener("click", async () => {
      const name = document.getElementById("create-name").value.trim() || "My World";
      const seed = document.getElementById("create-seed").value.trim() || Math.floor(Math.random() * 2147483647).toString();
      const mode = document.getElementById("create-mode").value;
      const diff = document.getElementById("create-difficulty").value;
      const world = await WM.createWorld(name, seed, mode, diff);
      if (world && this._onStartGame) this._onStartGame(world);
    });

    document.getElementById("btn-back-menu").addEventListener("click", () => {
      this.showScreen(this.menu);
    });

    document.getElementById("btn-resume").addEventListener("click", () => this.closePause());

    document.getElementById("btn-save-worlds").addEventListener("click", () => {
      if (this._saveCallback) this._saveCallback();
      this._gameStarted = false;
      this.closePause();
      this.renderWorldList();
      this.showScreen(this.worldSelect);
    });

    document.getElementById("btn-save-quit").addEventListener("click", () => {
      if (this._saveCallback) this._saveCallback();
      this._gameStarted = false;
      this.closePause();
      this.showScreen(this.menu);
    });

    document.getElementById("btn-quit-game").addEventListener("click", () => {
      document.getElementById("modal-quit").classList.remove("hidden");
    });

    document.getElementById("btn-quit").addEventListener("click", () => {
      document.getElementById("modal-quit").classList.remove("hidden");
    });

    document.getElementById("btn-confirm-quit").addEventListener("click", () => {
      document.getElementById("modal-quit").classList.add("hidden");
      if (this._saveCallback) this._saveCallback();
      this._gameStarted = false;
      this.closePause();
      this.showScreen(this.menu);
      window.close();
    });

    document.getElementById("btn-cancel-quit").addEventListener("click", () => {
      document.getElementById("modal-quit").classList.add("hidden");
    });

    document.getElementById("modal-quit").addEventListener("click", (e) => {
      if (e.target === document.getElementById("modal-quit")) {
        document.getElementById("modal-quit").classList.add("hidden");
      }
    });

    document.getElementById("btn-respawn").addEventListener("click", () => {
      this._onRespawn?.();
    });

    // Settings
    document.getElementById("btn-settings").addEventListener("click", () => {
      this._loadSettings();
      this.settingsPanel.classList.add("open");
      this.settingsPanel.classList.remove("hidden");
    });

    document.getElementById("btn-pause-settings").addEventListener("click", () => {
      this._loadSettings();
      this.settingsPanel.classList.add("open");
      this.settingsPanel.classList.remove("hidden");
    });

    document.getElementById("btn-save-settings").addEventListener("click", () => {
      this._saveSettings();
      this.settingsPanel.classList.remove("open");
      this.settingsPanel.classList.add("hidden");
    });

    this.settingsPanel.addEventListener("click", (e) => {
      if (e.target === this.settingsPanel) {
        this._saveSettings();
        this.settingsPanel.classList.remove("open");
        this.settingsPanel.classList.add("hidden");
      }
    });

    this.canvas.addEventListener("click", () => {
      if (this._gameStarted && document.pointerLockElement !== this.canvas) this.canvas.requestPointerLock().catch(() => {});
      else if (!document.pointerLockElement && this.allHidden() && !document.querySelector(".inv-ui:not(.hidden)")) this.canvas.requestPointerLock().catch(() => {});
    });
  }

  set onRespawn(fn) { this._onRespawn = fn; }

  _loadSettings() {
    const s = WM.loadSettings();
    document.getElementById("vol-master").value = s.masterVolume;
    document.getElementById("vol-sfx").value = s.sfxVolume;
    document.getElementById("vol-music").value = s.musicVolume;
    document.getElementById("sens-slider").value = s.sensitivity;
    document.getElementById("auto-jump").checked = s.autoJump;
    document.getElementById("invert-y").checked = s.invertY;
    document.getElementById("render-dist").value = s.renderDistance;
    document.getElementById("fov-slider").value = s.fov;
    document.getElementById("brightness").value = Math.round(s.brightness * 100);
    document.getElementById("lang-select").value = s.language;
  }

  _saveSettings() {
    const s = {
      masterVolume: parseInt(document.getElementById("vol-master").value),
      sfxVolume: parseInt(document.getElementById("vol-sfx").value),
      musicVolume: parseInt(document.getElementById("vol-music").value),
      sensitivity: parseInt(document.getElementById("sens-slider").value),
      autoJump: document.getElementById("auto-jump").checked,
      invertY: document.getElementById("invert-y").checked,
      renderDistance: parseInt(document.getElementById("render-dist").value),
      fov: parseInt(document.getElementById("fov-slider").value),
      brightness: parseInt(document.getElementById("brightness").value) / 100,
      language: document.getElementById("lang-select").value,
    };
    WM.saveSettings(s);
  }
}
