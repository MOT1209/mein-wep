import { el, injectUiStyles } from "./hud";

export interface PauseMenuOptions {
  title: string;
  info: string;
  onResume(): void;
}

export interface MenuButton {
  label: string;
  onClick(): void;
}

export class PauseMenu {
  private readonly root: HTMLElement;
  private readonly menu: HTMLElement;
  private readonly heading: HTMLElement;
  private readonly infoEl: HTMLElement;
  private readonly resume: HTMLButtonElement;
  private readonly extras: HTMLElement;

  constructor(parent: HTMLElement, options: PauseMenuOptions) {
    injectUiStyles();
    this.root = el("div", "bw-screen", parent);
    this.menu = el("div", "bw-panel bw-menu", this.root);
    this.heading = el("h1", "", this.menu);
    this.heading.textContent = options.title;
    this.resume = el("button", "bw-btn primary", this.menu);
    this.resume.type = "button";
    this.resume.textContent = "Play";
    this.resume.addEventListener("click", () => options.onResume());
    this.extras = el("div", "bw-menu", this.menu);
    this.extras.style.padding = "0";
    this.extras.style.minWidth = "0";
    this.infoEl = el("p", "", this.menu);
    this.infoEl.textContent = options.info;
  }

  get isVisible(): boolean {
    return !this.root.classList.contains("hidden");
  }

  show(resumeLabel = "Resume"): void {
    this.resume.textContent = resumeLabel;
    this.root.classList.remove("hidden");
  }

  hide(): void {
    this.root.classList.add("hidden");
  }

  setInfo(text: string): void {
    this.infoEl.textContent = text;
  }

  setButtons(buttons: readonly MenuButton[]): void {
    this.extras.replaceChildren();
    for (const button of buttons) {
      const node = el("button", "bw-btn", this.extras);
      node.type = "button";
      node.textContent = button.label;
      node.addEventListener("click", () => button.onClick());
    }
  }
}
