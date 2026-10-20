import { tr } from "../ui/i18n";
import { handleKey, addLook, type HudEvents, type InputState } from "./inputState";

export const TOUCH_LOOK_SENSITIVITY = 0.006;
export const JOYSTICK_RADIUS = 56;
export const TAP_MAX_MS = 220;
export const TAP_MAX_MOVE_PX = 10;
export const LONG_PRESS_MS = 350;

export interface TouchOptions {
  canFly: boolean;
  onPause(): void;
}

export interface TouchControls {
  readonly root: HTMLElement;
  setVisible(visible: boolean): void;
  detach(): void;
}

const STYLE_ID = "bw-touch-styles";
const CSS = `
.bw-touch-root{position:absolute;inset:0;z-index:1;pointer-events:none;touch-action:none;-webkit-user-select:none;user-select:none}
.bw-look{position:absolute;inset:0;pointer-events:auto}
.bw-stick{position:absolute;left:calc(18px + env(safe-area-inset-left));bottom:calc(18px + env(safe-area-inset-bottom));width:${JOYSTICK_RADIUS * 2}px;height:${JOYSTICK_RADIUS * 2}px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.3);pointer-events:auto}
.bw-knob{position:absolute;left:50%;top:50%;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;background:rgba(255,255,255,.45)}
.bw-pad{position:absolute;right:calc(14px + env(safe-area-inset-right));bottom:calc(18px + env(safe-area-inset-bottom));display:grid;grid-template-columns:repeat(3,56px);gap:8px;pointer-events:none}
.bw-tbtn{width:56px;height:56px;border-radius:14px;border:2px solid rgba(255,255,255,.35);background:rgba(12,16,22,.55);color:#eef;font:600 12px/1 var(--ui-font);pointer-events:auto;touch-action:none;display:flex;align-items:center;justify-content:center;text-align:center}
.bw-tbtn.on{background:rgba(80,140,90,.75)}
.bw-top{position:absolute;right:calc(14px + env(safe-area-inset-right));top:calc(12px + env(safe-area-inset-top));display:flex;gap:8px;pointer-events:none}
.bw-touch .bw-bottom{bottom:calc(150px + env(safe-area-inset-bottom))}
.bw-touch .bw-hud{z-index:2}
.bw-touch .bw-hotbar{pointer-events:auto}
`;

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.append(style);
}

function node(tag: string, className: string, parent: HTMLElement, text = ""): HTMLElement {
  const el = document.createElement(tag);
  el.className = className;
  if (text) el.textContent = text;
  parent.append(el);
  return el;
}

export function attachTouch(parent: HTMLElement, state: InputState, events: HudEvents, options: TouchOptions): TouchControls {
  injectStyles();
  const root = node("div", "bw-touch-root hidden", parent);
  const look = node("div", "bw-look", root);
  const stick = node("div", "bw-stick", root);
  const knob = node("div", "bw-knob", stick);
  const top = node("div", "bw-top", root);
  const pad = node("div", "bw-pad", root);
  const cleanups: (() => void)[] = [];

  const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, fn: (e: HTMLElementEventMap[K]) => void): void => {
    el.addEventListener(type, fn as EventListener);
    cleanups.push(() => el.removeEventListener(type, fn as EventListener));
  };

  let stickId: number | null = null;
  const setStick = (dx: number, dy: number): void => {
    const len = Math.hypot(dx, dy);
    const scale = len > JOYSTICK_RADIUS ? JOYSTICK_RADIUS / len : 1;
    const x = dx * scale;
    const y = dy * scale;
    knob.style.transform = `translate(${x}px,${y}px)`;
    state.analogStrafe = x / JOYSTICK_RADIUS;
    state.analogForward = -y / JOYSTICK_RADIUS;
  };
  const stickCenter = (): { x: number; y: number } => {
    const rect = stick.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };
  on(stick, "pointerdown", (e) => {
    e.preventDefault();
    stickId = e.pointerId;
    stick.setPointerCapture(e.pointerId);
    const c = stickCenter();
    setStick(e.clientX - c.x, e.clientY - c.y);
  });
  on(stick, "pointermove", (e) => {
    if (e.pointerId !== stickId) return;
    const c = stickCenter();
    setStick(e.clientX - c.x, e.clientY - c.y);
  });
  const endStick = (e: PointerEvent): void => {
    if (e.pointerId !== stickId) return;
    stickId = null;
    setStick(0, 0);
  };
  on(stick, "pointerup", endStick);
  on(stick, "pointercancel", endStick);

  interface LookTouch {
    x: number;
    y: number;
    startX: number;
    startY: number;
    start: number;
    timer: number;
    holding: boolean;
  }
  const looks = new Map<number, LookTouch>();
  on(look, "pointerdown", (e) => {
    e.preventDefault();
    look.setPointerCapture(e.pointerId);
    const touch: LookTouch = { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, start: performance.now(), timer: 0, holding: false };
    touch.timer = window.setTimeout(() => {
      if (Math.hypot(touch.x - touch.startX, touch.y - touch.startY) <= TAP_MAX_MOVE_PX) {
        touch.holding = true;
        state.attack = state.locked;
      }
    }, LONG_PRESS_MS);
    looks.set(e.pointerId, touch);
  });
  on(look, "pointermove", (e) => {
    const touch = looks.get(e.pointerId);
    if (!touch) return;
    addLook(state, e.clientX - touch.x, e.clientY - touch.y, TOUCH_LOOK_SENSITIVITY);
    touch.x = e.clientX;
    touch.y = e.clientY;
  });
  const endLook = (e: PointerEvent): void => {
    const touch = looks.get(e.pointerId);
    if (!touch) return;
    looks.delete(e.pointerId);
    window.clearTimeout(touch.timer);
    if (touch.holding) state.attack = false;
    const moved = Math.hypot(e.clientX - touch.startX, e.clientY - touch.startY);
    if (!touch.holding && moved <= TAP_MAX_MOVE_PX && performance.now() - touch.start <= TAP_MAX_MS && state.locked) {
      state.usePresses++;
    }
  };
  on(look, "pointerup", endLook);
  on(look, "pointercancel", endLook);

  const button = (parent: HTMLElement, label: string, down: () => void, up?: () => void): HTMLElement => {
    const b = node("button", "bw-tbtn", parent, label);
    (b as HTMLButtonElement).type = "button";
    on(b, "pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      b.setPointerCapture(e.pointerId);
      down();
    });
    if (up) {
      on(b, "pointerup", () => up());
      on(b, "pointercancel", () => up());
    }
    return b;
  };
  const hold = (code: string): [() => void, () => void] => [() => state.held.add(code), () => state.held.delete(code)];

  button(top, tr("game.touch_bag"), () => events.onToggleInventory?.());
  button(top, tr("game.touch_pause"), () => options.onPause());
  const [jumpDown, jumpUp] = hold("Space");
  const sneakBtn = button(pad, tr("game.touch_sneak"), () => {
    const active = !state.held.has("ShiftLeft");
    if (active) state.held.add("ShiftLeft");
    else state.held.delete("ShiftLeft");
    sneakBtn.classList.toggle("on", active);
  });
  button(pad, tr("game.touch_break"), () => (state.attack = state.locked), () => (state.attack = false));
  button(pad, tr("game.touch_place"), () => {
    if (state.locked) state.usePresses++;
  });
  if (options.canFly) {
    const flyBtn = button(pad, tr("game.touch_fly"), () => {
      handleKey(state, "KeyF", true, false, performance.now(), events, { canFly: true });
      flyBtn.classList.toggle("on", state.flying);
    });
  } else {
    node("span", "", pad);
  }
  button(pad, tr("game.touch_down"), ...hold("ShiftRight"));
  button(pad, tr("game.touch_jump"), jumpDown, jumpUp);

  return {
    root,
    setVisible(visible: boolean): void {
      root.classList.toggle("hidden", !visible);
      document.body.classList.toggle("bw-touch", visible);
    },
    detach(): void {
      for (const cleanup of cleanups) cleanup();
      root.remove();
      document.body.classList.remove("bw-touch");
    }
  };
}
