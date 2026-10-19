import type { DamageSource } from "../player/stats";
import { el, injectUiStyles } from "./hud";

const CAUSES: Readonly<Record<DamageSource, string>> = {
  mob: "You were defeated by a creature.",
  fall: "You fell from a high place.",
  drown: "You ran out of air.",
  starve: "You starved.",
  void: "You fell out of the world."
};

export class DeathScreen {
  private readonly root: HTMLElement;
  private readonly cause: HTMLElement;

  constructor(parent: HTMLElement, onRespawn: () => void) {
    injectUiStyles();
    this.root = el("div", "bw-screen hidden", parent);
    this.root.style.background = "rgba(90,10,10,.55)";
    const menu = el("div", "bw-panel bw-menu", this.root);
    el("h1", "", menu).textContent = "You died";
    this.cause = el("p", "", menu);
    el("p", "", menu).textContent = "Your items were dropped where you fell.";
    const button = el("button", "bw-btn primary", menu);
    button.type = "button";
    button.textContent = "Respawn";
    button.addEventListener("click", onRespawn);
  }

  get isVisible(): boolean {
    return !this.root.classList.contains("hidden");
  }

  show(source: DamageSource | null): void {
    this.cause.textContent = source ? CAUSES[source] : "";
    this.root.classList.remove("hidden");
  }

  hide(): void {
    this.root.classList.add("hidden");
  }
}
