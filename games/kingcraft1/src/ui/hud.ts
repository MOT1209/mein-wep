import { HOTBAR_SIZE } from "../config";
import { maxDurability, type ItemStack } from "../content/items";
import { tr, trItem } from "./i18n";
import type { IconFactory } from "./icons";

export interface Vitals {
  health: number;
  maxHealth: number;
  hunger: number;
  maxHunger: number;
  air: number;
  maxAir: number;
  showAir: boolean;
}

const STYLE_ID = "bw-ui-styles";
const TOAST_MS = 1800;

const CSS = `
.bw-hud{position:absolute;inset:0;pointer-events:none;font:13px/1.4 var(--ui-font);color:#e8eef4;--hud-scale:1}
.bw-crosshair{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;background:linear-gradient(#fff,#fff) center/2px 14px no-repeat,linear-gradient(#fff,#fff) center/14px 2px no-repeat;mix-blend-mode:difference}
.bw-progress{position:absolute;left:50%;top:calc(50% + 16px);width:44px;height:4px;margin-left:-22px;background:rgba(0,0,0,.45);border-radius:2px;overflow:hidden}
.bw-progress>i{display:block;height:100%;width:0;background:#f2f2f2}
.bw-bottom{position:absolute;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%) scale(var(--hud-scale));transform-origin:50% 100%;display:flex;flex-direction:column;align-items:center;gap:6px}
.bw-vitals{display:flex;gap:18px;font-size:12px;text-shadow:0 1px 2px #000}
.bw-bar{display:flex;align-items:center;gap:6px}
.bw-bar b{display:block;width:92px;height:8px;border-radius:4px;background:rgba(0,0,0,.5);overflow:hidden;border:1px solid rgba(255,255,255,.18)}
.bw-bar b>i{display:block;height:100%}
.bw-hotbar{display:flex;gap:4px;padding:4px;border-radius:10px;background:rgba(12,16,22,.72);border:2px solid rgba(120,140,160,.35)}
.bw-slot{position:relative;width:44px;height:44px;border-radius:6px;background:rgba(255,255,255,.06);border:2px solid transparent;box-sizing:border-box}
.bw-slot.sel{border-color:#f3f6f9;background:rgba(255,255,255,.16)}
.bw-slot img{position:absolute;left:4px;top:4px;width:32px;height:32px;image-rendering:pixelated}
.bw-slot .n{position:absolute;right:3px;bottom:1px;font-size:12px;font-weight:600;text-shadow:0 1px 2px #000,0 0 2px #000}
.bw-slot .d{position:absolute;left:5px;right:5px;bottom:3px;height:3px;background:#222}
.bw-slot .d>i{display:block;height:100%}
.bw-slot .k{position:absolute;left:3px;top:1px;font-size:10px;opacity:.55}
[dir=rtl] .bw-hotbar,[dir=rtl] .bw-grid,[dir=rtl] .bw-debug{direction:ltr}
.bw-debug{position:absolute;left:calc(10px + env(safe-area-inset-left));top:calc(10px + env(safe-area-inset-top));padding:8px 12px;white-space:pre;font:12px/1.5 ui-monospace,Consolas,monospace}
.bw-toast{position:absolute;left:50%;bottom:calc(120px + env(safe-area-inset-bottom));transform:translateX(-50%);padding:6px 14px;border-radius:8px;background:rgba(12,16,22,.85);opacity:0;transition:opacity .2s}
.bw-toast.show{opacity:1}
.bw-screen{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;background:rgba(5,8,12,.55);pointer-events:auto;touch-action:none}
.bw-window{padding:16px 18px;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);overflow:auto;box-sizing:border-box}
.bw-window h2{margin:0 0 10px;font-size:16px;font-weight:600}
.bw-grid{display:grid;gap:4px;grid-template-columns:repeat(var(--cols),44px)}
.bw-row{display:flex;gap:18px;align-items:center;margin-bottom:12px;flex-wrap:wrap}
.bw-arrow{font-size:22px;opacity:.7}
.bw-sep{height:10px}
.bw-cursor{position:fixed;width:32px;height:32px;pointer-events:none;z-index:10;transform:translate(-16px,-16px)}
.bw-cursor img{width:32px;height:32px;image-rendering:pixelated}
.bw-cursor .n{position:absolute;right:-4px;bottom:-4px;font-size:12px;font-weight:600;text-shadow:0 1px 2px #000}
.bw-menu{display:flex;flex-direction:column;gap:10px;min-width:min(260px,calc(100vw - 32px));max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);overflow:auto;box-sizing:border-box;padding:20px 24px;text-align:center}
.bw-menu h1{margin:0 0 4px;font-size:22px}
.bw-menu p{margin:0;font-size:13px;opacity:.8;white-space:pre-line}
.bw-menu .bw-btn{min-height:44px}
@media (max-width:520px){
.bw-window{padding:10px;max-width:calc(100vw - 16px)}
.bw-window .bw-grid{grid-template-columns:repeat(var(--cols),32px);gap:2px}
.bw-window .bw-slot{width:32px;height:32px}
.bw-window .bw-slot img{left:2px;top:2px;width:24px;height:24px}
.bw-row{gap:10px}
}
`;

export function injectUiStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.append(style);
}

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", parent?: HTMLElement): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  parent?.append(node);
  return node;
}

export function renderSlot(slot: HTMLElement, stack: ItemStack | null, icons: IconFactory): void {
  slot.replaceChildren();
  if (!stack) return;
  const img = el("img", "", slot);
  img.src = icons.urlFor(stack.item);
  img.alt = stack.item;
  img.draggable = false;
  slot.title = trItem(stack.item);
  if (stack.count > 1) el("span", "n", slot).textContent = String(stack.count);
  const max = maxDurability(stack.item);
  if (max > 0 && stack.durability !== undefined && stack.durability < max) {
    const ratio = stack.durability / max;
    const bar = el("i", "", el("span", "d", slot));
    bar.style.width = `${Math.round(ratio * 100)}%`;
    bar.style.background = `hsl(${Math.round(ratio * 120)},80%,50%)`;
  }
}

export function stackKey(stack: ItemStack | null): string {
  return stack ? `${stack.item}:${stack.count}:${stack.durability ?? ""}` : "-";
}

export class Hud {
  readonly root: HTMLElement;
  private readonly crosshair: HTMLElement;
  private readonly progress: HTMLElement;
  private readonly progressFill: HTMLElement;
  private readonly vitals: HTMLElement;
  private readonly bars: { health: HTMLElement; hunger: HTMLElement; air: HTMLElement; airRow: HTMLElement };
  private readonly slots: HTMLElement[] = [];
  private readonly debug: HTMLElement;
  private readonly toastEl: HTMLElement;
  private hotbarKey = "";
  private toastTimer = 0;

  constructor(parent: HTMLElement, private readonly icons: IconFactory) {
    injectUiStyles();
    this.root = el("div", "bw-hud", parent);
    this.crosshair = el("div", "bw-crosshair hidden", this.root);
    this.progress = el("div", "bw-progress hidden", this.root);
    this.progressFill = el("i", "", this.progress);
    const bottom = el("div", "bw-bottom", this.root);
    this.vitals = el("div", "bw-vitals", bottom);
    const bar = (label: string, color: string): { row: HTMLElement; fill: HTMLElement } => {
      const row = el("div", "bw-bar", this.vitals);
      el("span", "", row).textContent = label;
      const fill = el("i", "", el("b", "", row));
      fill.style.background = color;
      return { row, fill };
    };
    const health = bar(tr("ui.health"), "#d8443a");
    const hunger = bar(tr("game.food"), "#c98a3a");
    const air = bar(tr("game.air"), "#5aa8e0");
    this.bars = { health: health.fill, hunger: hunger.fill, air: air.fill, airRow: air.row };
    const hotbar = el("div", "bw-hotbar", bottom);
    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const slot = el("div", "bw-slot", hotbar);
      this.slots.push(slot);
    }
    this.debug = el("div", "bw-panel bw-debug hidden", this.root);
    this.toastEl = el("div", "bw-toast", this.root);
  }

  enableHotbarTaps(onTap: (slot: number) => void): void {
    this.slots.forEach((slot, index) => {
      slot.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        onTap(index);
      });
    });
  }

  setPlaying(playing: boolean): void {
    this.crosshair.classList.toggle("hidden", !playing);
    if (!playing) this.setMiningProgress(0);
  }

  setHotbar(slots: readonly (ItemStack | null)[], selected: number): void {
    const key = `${selected}|${slots.slice(0, HOTBAR_SIZE).map(stackKey).join(",")}`;
    if (key === this.hotbarKey) return;
    this.hotbarKey = key;
    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const slot = this.slots[i];
      renderSlot(slot, slots[i] ?? null, this.icons);
      el("span", "k", slot).textContent = String(i + 1);
      slot.classList.toggle("sel", i === selected);
    }
  }

  setVitals(vitals: Vitals | null): void {
    this.vitals.classList.toggle("hidden", vitals === null);
    if (!vitals) return;
    const pct = (value: number, max: number): string => `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
    this.bars.health.style.width = pct(vitals.health, vitals.maxHealth);
    this.bars.hunger.style.width = pct(vitals.hunger, vitals.maxHunger);
    this.bars.air.style.width = pct(vitals.air, vitals.maxAir);
    this.bars.airRow.classList.toggle("hidden", !vitals.showAir);
  }

  setMiningProgress(progress: number): void {
    const visible = progress > 0 && progress < 1;
    this.progress.classList.toggle("hidden", !visible);
    if (visible) this.progressFill.style.width = `${Math.round(progress * 100)}%`;
  }

  toggleDebug(): void {
    this.debug.classList.toggle("hidden");
  }

  get debugVisible(): boolean {
    return !this.debug.classList.contains("hidden");
  }

  setDebug(lines: readonly string[]): void {
    this.debug.textContent = lines.join("\n");
  }

  toast(text: string): void {
    this.toastEl.textContent = text;
    this.toastEl.classList.add("show");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove("show"), TOAST_MS);
  }
}
