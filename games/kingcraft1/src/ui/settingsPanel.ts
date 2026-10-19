import { MAX_RENDER_DISTANCE, MIN_RENDER_DISTANCE, type QualityLevel } from "../config";
import { el, injectUiStyles } from "./hud";
import { MAX_HUD_SCALE, MAX_SENSITIVITY, MIN_HUD_SCALE, MIN_SENSITIVITY, withQuality, type Settings, type TouchMode } from "./settings";

const PANEL_CSS = `
.bw-settings label{display:grid;grid-template-columns:minmax(84px,120px) minmax(90px,1fr) 44px;gap:10px;align-items:center;text-align:left;font-size:14px;min-height:44px}
.bw-settings input[type=range]{width:100%;min-height:32px}
.bw-settings select{font:inherit;font-size:16px;padding:6px 8px;border-radius:6px;background:#1c2630;color:#e8eef4;border:1px solid rgba(140,165,190,.4)}
.bw-settings small{grid-column:1/-1;opacity:.65;font-size:12px}
`;

export class SettingsPanel {
  private readonly root: HTMLElement;
  private readonly body: HTMLElement;
  private settings: Settings;

  constructor(parent: HTMLElement, initial: Settings, private readonly onChange: (settings: Settings) => void, onBack: () => void) {
    injectUiStyles();
    if (!document.getElementById("bw-settings-styles")) {
      const style = document.createElement("style");
      style.id = "bw-settings-styles";
      style.textContent = PANEL_CSS;
      document.head.append(style);
    }
    this.settings = initial;
    this.root = el("div", "bw-screen hidden", parent);
    const menu = el("div", "bw-panel bw-menu bw-settings", this.root);
    el("h1", "", menu).textContent = "Settings";
    this.body = el("div", "", menu);
    const back = el("button", "bw-btn primary", menu);
    back.type = "button";
    back.textContent = "Back";
    back.addEventListener("click", onBack);
  }

  get isVisible(): boolean {
    return !this.root.classList.contains("hidden");
  }

  show(settings: Settings): void {
    this.settings = settings;
    this.render();
    this.root.classList.remove("hidden");
  }

  hide(): void {
    this.root.classList.add("hidden");
  }

  private commit(next: Settings): void {
    this.settings = next;
    this.onChange(next);
    this.render();
  }

  private render(): void {
    this.body.replaceChildren();
    const s = this.settings;
    const select = <T extends string>(label: string, value: T, options: readonly [T, string][], apply: (v: T) => Settings): void => {
      const row = el("label", "", this.body);
      el("span", "", row).textContent = label;
      const input = el("select", "", row);
      for (const [key, text] of options) {
        const option = el("option", "", input);
        option.value = key;
        option.textContent = text;
        option.selected = key === value;
      }
      el("span", "", row);
      input.addEventListener("change", () => this.commit(apply(input.value as T)));
    };
    const slider = (label: string, value: number, min: number, max: number, step: number, format: (v: number) => string, apply: (v: number) => Settings): void => {
      const row = el("label", "", this.body);
      el("span", "", row).textContent = label;
      const input = el("input", "", row);
      input.type = "range";
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.value = String(value);
      const out = el("span", "", row);
      out.textContent = format(value);
      input.addEventListener("input", () => (out.textContent = format(Number(input.value))));
      input.addEventListener("change", () => this.commit(apply(Number(input.value))));
    };
    select<QualityLevel>("Quality", s.quality, [["low", "Low"], ["medium", "Medium"], ["high", "High"]], (q) => withQuality(s, q));
    slider("View distance", s.renderDistance, MIN_RENDER_DISTANCE, MAX_RENDER_DISTANCE, 1, (v) => `${v}`, (v) => ({ ...s, renderDistance: v }));
    slider("Look speed", s.sensitivity, MIN_SENSITIVITY, MAX_SENSITIVITY, 0.1, (v) => `${v.toFixed(1)}x`, (v) => ({ ...s, sensitivity: v }));
    slider("HUD size", s.hudScale, MIN_HUD_SCALE, MAX_HUD_SCALE, 0.05, (v) => `${Math.round(v * 100)}%`, (v) => ({ ...s, hudScale: v }));
    slider("Sound", s.volume, 0, 1, 0.05, (v) => (v <= 0 ? "Off" : `${Math.round(v * 100)}%`), (v) => ({ ...s, volume: v }));
    select<TouchMode>("Touch controls", s.touch, [["auto", "Auto"], ["on", "On"], ["off", "Off"]], (t) => ({ ...s, touch: t }));
    const note = el("small", "", this.body);
    note.textContent = "Quality sets the default view distance and pixel density. Settings are saved in this browser.";
  }
}
