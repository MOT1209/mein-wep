import { HOTBAR_SIZE } from "../config";
import type { ItemStack } from "../content/items";
import type { Inventory } from "../gameplay/inventory";
import { el, injectUiStyles, renderSlot, stackKey } from "./hud";
import type { IconFactory } from "./icons";
import { clickSlot, craftAllInto, craftPreview, insertInto, quickMove, takeCraft, type MouseButtonKind } from "./slotLogic";

type SlotRef = { kind: "inv"; index: number } | { kind: "grid"; index: number } | { kind: "output" } | { kind: "extra"; index: number };

export interface ExtraSection {
  title: string;
  slots: (ItemStack | null)[];
  accepts?(index: number, stack: ItemStack): boolean;
  readOnly?: readonly number[];
  onChange?(): void;
  render?(): string;
}

export interface InventoryScreenOptions {
  craftSize: 2 | 3;
  title: string;
  extra?: ExtraSection;
}

const DRAG_THRESHOLD_PX = 4;

export class InventoryScreen {
  private readonly root: HTMLElement;
  private readonly cursorEl: HTMLElement;
  private inventory: Inventory | null = null;
  private grid: (ItemStack | null)[] = [];
  private craftSize: 2 | 3 = 2;
  private extra: ExtraSection | undefined;
  private cursor: ItemStack | null = null;
  private onLeftover: (stack: ItemStack) => void = () => undefined;
  private dragFrom: SlotRef | null = null;
  private dragStart = { x: 0, y: 0 };
  private readonly elements = new Map<string, HTMLElement>();
  private statusEl: HTMLElement | null = null;
  private closeHandler: () => void = () => undefined;

  constructor(parent: HTMLElement, private readonly icons: IconFactory) {
    injectUiStyles();
    this.root = el("div", "bw-screen hidden", parent);
    this.cursorEl = el("div", "bw-cursor hidden", parent);
    this.root.addEventListener("pointerdown", this.onPointerDown);
    this.root.addEventListener("pointerup", this.onPointerUp);
    this.root.addEventListener("pointermove", this.onPointerMove);
    this.root.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  setCloseHandler(handler: () => void): void {
    this.closeHandler = handler;
  }

  get isOpen(): boolean {
    return this.inventory !== null;
  }

  open(inventory: Inventory, options: InventoryScreenOptions, onLeftover: (stack: ItemStack) => void): void {
    this.inventory = inventory;
    this.craftSize = options.craftSize;
    this.grid = new Array<ItemStack | null>(options.craftSize * options.craftSize).fill(null);
    this.extra = options.extra;
    this.cursor = null;
    this.onLeftover = onLeftover;
    this.build(options.title);
    this.root.classList.remove("hidden");
    this.refresh();
  }

  close(): void {
    const inventory = this.inventory;
    if (!inventory) return;
    for (const stack of [...this.grid, this.cursor]) {
      if (!stack) continue;
      const leftover = inventory.add(stack);
      if (leftover) this.onLeftover(leftover);
    }
    this.grid = [];
    this.cursor = null;
    this.inventory = null;
    this.extra = undefined;
    this.root.classList.add("hidden");
    this.cursorEl.classList.add("hidden");
    this.cursorEl.dataset.stack = "-";
  }

  refresh(): void {
    const inventory = this.inventory;
    if (!inventory) return;
    for (const [key, node] of this.elements) {
      const stack = this.stackAt(this.parseKey(key));
      const signature = stackKey(stack);
      if (node.dataset.stack === signature) continue;
      node.dataset.stack = signature;
      renderSlot(node, stack, this.icons);
    }
    if (this.statusEl && this.extra?.render) this.statusEl.textContent = this.extra.render();
    const cursorKey = stackKey(this.cursor);
    if (this.cursorEl.dataset.stack !== cursorKey) {
      this.cursorEl.dataset.stack = cursorKey;
      this.cursorEl.classList.toggle("hidden", !this.cursor);
      renderSlot(this.cursorEl, this.cursor, this.icons);
    }
  }

  private build(title: string): void {
    this.root.replaceChildren();
    this.elements.clear();
    const win = el("div", "bw-panel bw-window", this.root);
    const header = el("div", "bw-row", win);
    header.style.justifyContent = "space-between";
    header.style.marginBottom = "6px";
    el("h2", "", header).textContent = title;
    const close = el("button", "bw-btn", header);
    close.type = "button";
    close.textContent = "Close";
    close.addEventListener("click", () => this.closeHandler());
    if (this.extra) {
      const row = el("div", "bw-row", win);
      el("strong", "", row).textContent = this.extra.title;
      const extraGrid = el("div", "bw-grid", row);
      const cols = Math.min(9, this.extra.slots.length);
      extraGrid.style.setProperty("--cols", String(cols));
      this.extra.slots.forEach((_, index) => this.slotEl(extraGrid, { kind: "extra", index }));
      this.statusEl = el("span", "", row);
    } else {
      this.statusEl = null;
    }
    const craftRow = el("div", "bw-row", win);
    el("strong", "", craftRow).textContent = "Crafting";
    const craftGrid = el("div", "bw-grid", craftRow);
    craftGrid.style.setProperty("--cols", String(this.craftSize));
    this.grid.forEach((_, index) => this.slotEl(craftGrid, { kind: "grid", index }));
    el("span", "bw-arrow", craftRow).textContent = "→";
    this.slotEl(craftRow, { kind: "output" });
    const main = el("div", "bw-grid", win);
    main.style.setProperty("--cols", String(HOTBAR_SIZE));
    const total = this.inventory?.slots.length ?? 0;
    for (let i = HOTBAR_SIZE; i < total; i++) this.slotEl(main, { kind: "inv", index: i });
    el("div", "bw-sep", win);
    const hotbar = el("div", "bw-grid", win);
    hotbar.style.setProperty("--cols", String(HOTBAR_SIZE));
    for (let i = 0; i < HOTBAR_SIZE; i++) this.slotEl(hotbar, { kind: "inv", index: i });
  }

  private slotEl(parent: HTMLElement, ref: SlotRef): HTMLElement {
    const node = el("div", "bw-slot", parent);
    const key = this.key(ref);
    node.dataset.slot = key;
    this.elements.set(key, node);
    return node;
  }

  private key(ref: SlotRef): string {
    return ref.kind === "output" ? "output" : `${ref.kind}:${ref.index}`;
  }

  private parseKey(key: string): SlotRef {
    if (key === "output") return { kind: "output" };
    const [kind, index] = key.split(":");
    const n = Number(index);
    if (kind === "grid") return { kind: "grid", index: n };
    if (kind === "extra") return { kind: "extra", index: n };
    return { kind: "inv", index: n };
  }

  private stackAt(ref: SlotRef): ItemStack | null {
    if (ref.kind === "inv") return this.inventory?.slots[ref.index] ?? null;
    if (ref.kind === "grid") return this.grid[ref.index] ?? null;
    if (ref.kind === "extra") return this.extra?.slots[ref.index] ?? null;
    return craftPreview(this.grid, this.craftSize);
  }

  private setStack(ref: SlotRef, stack: ItemStack | null): void {
    if (ref.kind === "inv" && this.inventory) this.inventory.slots[ref.index] = stack;
    else if (ref.kind === "grid") this.grid[ref.index] = stack;
    else if (ref.kind === "extra" && this.extra) {
      this.extra.slots[ref.index] = stack;
      this.extra.onChange?.();
    }
  }

  private refAt(target: EventTarget | null): SlotRef | null {
    const node = target instanceof HTMLElement ? target.closest<HTMLElement>("[data-slot]") : null;
    return node?.dataset.slot ? this.parseKey(node.dataset.slot) : null;
  }

  private apply(ref: SlotRef, button: MouseButtonKind, shift: boolean): void {
    const inventory = this.inventory;
    if (!inventory) return;
    if (ref.kind === "output") {
      if (shift) {
        const result = craftAllInto(this.grid, this.craftSize, inventory.slots);
        this.grid = result.grid;
      } else {
        const result = takeCraft(this.grid, this.craftSize, this.cursor);
        if (result) {
          this.grid = result.grid;
          this.cursor = result.cursor;
        }
      }
      return;
    }
    if (ref.kind === "extra" && this.extra?.readOnly?.includes(ref.index) && this.cursor) return;
    if (shift) {
      this.shiftMove(ref);
      return;
    }
    if (ref.kind === "extra" && this.cursor && this.extra?.accepts && !this.extra.accepts(ref.index, this.cursor)) return;
    const result = clickSlot(this.stackAt(ref), this.cursor, button);
    this.setStack(ref, result.slot);
    this.cursor = result.cursor;
  }

  private shiftMove(ref: SlotRef): void {
    const inventory = this.inventory;
    if (!inventory) return;
    if (ref.kind === "inv") {
      if (this.extra) {
        const stack = inventory.slots[ref.index];
        if (!stack) return;
        const index = this.extra.slots.findIndex((_, i) => !this.extra?.readOnly?.includes(i) && (this.extra?.accepts?.(i, stack) ?? true));
        if (index < 0) return;
        const leftover = insertInto(this.extra.slots, stack, index, this.extra.accepts ? index + 1 : this.extra.slots.length);
        inventory.slots[ref.index] = leftover;
        this.extra.onChange?.();
        return;
      }
      quickMove(inventory.slots, ref.index);
      return;
    }
    const stack = this.stackAt(ref);
    if (!stack) return;
    this.setStack(ref, insertInto(inventory.slots, stack, 0, inventory.slots.length));
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    const ref = this.refAt(event.target);
    if (!ref) return;
    event.preventDefault();
    this.dragFrom = this.cursor ? null : ref;
    this.dragStart = { x: event.clientX, y: event.clientY };
    this.apply(ref, event.button === 2 ? "right" : "left", event.shiftKey);
    this.refresh();
    this.moveCursor(event);
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    const from = this.dragFrom;
    this.dragFrom = null;
    if (!from || !this.cursor) return;
    const moved = Math.hypot(event.clientX - this.dragStart.x, event.clientY - this.dragStart.y) > DRAG_THRESHOLD_PX;
    if (!moved) return;
    const target = this.refAt(document.elementFromPoint(event.clientX, event.clientY));
    if (!target || this.key(target) === this.key(from) || target.kind === "output") return;
    this.apply(target, "left", false);
    this.refresh();
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.moveCursor(event);
  };

  private moveCursor(event: PointerEvent): void {
    this.cursorEl.style.left = `${event.clientX}px`;
    this.cursorEl.style.top = `${event.clientY}px`;
  }
}
