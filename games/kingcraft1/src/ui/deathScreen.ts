import type { DamageSource } from "../player/stats";
import { el, injectUiStyles } from "./hud";
import { tr } from "./i18n";

const CAUSES: Readonly<Record<DamageSource, string>> = {
  mob: "game.death_mob",
  fall: "game.death_fall",
  drown: "game.death_drown",
  starve: "game.death_starve",
  void: "game.death_void"
};

export class DeathScreen {
  private readonly root: HTMLElement;
  private readonly cause: HTMLElement;

  constructor(parent: HTMLElement, onRespawn: () => void) {
    injectUiStyles();
    this.root = el("div", "bw-screen hidden", parent);
    this.root.style.background = "rgba(90,10,10,.55)";
    const menu = el("div", "bw-panel bw-menu", this.root);
    el("h1", "", menu).textContent = tr("ui.death_title");
    this.cause = el("p", "", menu);
    el("p", "", menu).textContent = tr("game.death_items");
    const button = el("button", "bw-btn primary", menu);
    button.type = "button";
    button.textContent = tr("ui.respawn");
    button.addEventListener("click", onRespawn);
  }

  get isVisible(): boolean {
    return !this.root.classList.contains("hidden");
  }

  show(source: DamageSource | null): void {
    this.cause.textContent = source ? tr(CAUSES[source]) : "";
    this.root.classList.remove("hidden");
  }

  hide(): void {
    this.root.classList.add("hidden");
  }
}
