import { HOTBAR_SIZE } from "../config";
import type { MoveInput } from "../player/controller";

export const DOUBLE_TAP_MS = 300;
export const DEFAULT_LOOK_SENSITIVITY = 0.0025;

export interface HudEvents {
  onToggleDebug?(): void;
  onToggleInventory?(): void;
  onHotbarSelect?(slot: number): void;
  onPauseChange?(paused: boolean): void;
  onFlyChange?(flying: boolean): void;
}

export interface InputState {
  readonly held: Set<string>;
  locked: boolean;
  flying: boolean;
  sprintLatched: boolean;
  lastForwardTapMs: number;
  lookYaw: number;
  lookPitch: number;
  hotbarSlot: number;
}

export interface KeyOptions {
  canFly: boolean;
}

const MOVEMENT_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "ControlLeft",
  "ControlRight"
]);

export function createInputState(): InputState {
  return {
    held: new Set<string>(),
    locked: false,
    flying: false,
    sprintLatched: false,
    lastForwardTapMs: Number.NEGATIVE_INFINITY,
    lookYaw: 0,
    lookPitch: 0,
    hotbarSlot: 0
  };
}

function axis(state: InputState, positive: readonly string[], negative: readonly string[]): number {
  const pos = positive.some((code) => state.held.has(code)) ? 1 : 0;
  const neg = negative.some((code) => state.held.has(code)) ? 1 : 0;
  return pos - neg;
}

export function toMoveInput(state: InputState): MoveInput {
  const forward = axis(state, ["KeyW", "ArrowUp"], ["KeyS", "ArrowDown"]);
  const strafe = axis(state, ["KeyD", "ArrowRight"], ["KeyA", "ArrowLeft"]);
  const sprintHeld = state.held.has("ControlLeft") || state.held.has("ControlRight");
  return {
    forward,
    strafe,
    jump: state.held.has("Space"),
    sneak: state.held.has("ShiftLeft") || state.held.has("ShiftRight"),
    sprint: forward > 0 && (state.sprintLatched || sprintHeld),
    fly: state.flying
  };
}

export function addLook(state: InputState, movementX: number, movementY: number, sensitivity: number): void {
  if (!state.locked) return;
  state.lookYaw -= movementX * sensitivity;
  state.lookPitch -= movementY * sensitivity;
}

export function consumeLook(state: InputState): { dyaw: number; dpitch: number } {
  const delta = { dyaw: state.lookYaw, dpitch: state.lookPitch };
  state.lookYaw = 0;
  state.lookPitch = 0;
  return delta;
}

export function clearHeld(state: InputState): void {
  state.held.clear();
  state.sprintLatched = false;
}

export function setLocked(state: InputState, locked: boolean, events: HudEvents): void {
  if (state.locked === locked) return;
  state.locked = locked;
  if (!locked) clearHeld(state);
  events.onPauseChange?.(!locked);
}

export function handleKey(
  state: InputState,
  code: string,
  down: boolean,
  repeat: boolean,
  nowMs: number,
  events: HudEvents,
  options: KeyOptions
): boolean {
  if (code === "F3") {
    if (down && !repeat) events.onToggleDebug?.();
    return true;
  }
  if (code === "KeyE") {
    if (down && !repeat) events.onToggleInventory?.();
    return true;
  }
  if (code.startsWith("Digit")) {
    const slot = Number(code.slice(5)) - 1;
    if (Number.isInteger(slot) && slot >= 0 && slot < HOTBAR_SIZE) {
      if (down && !repeat) {
        state.hotbarSlot = slot;
        events.onHotbarSelect?.(slot);
      }
      return true;
    }
    return false;
  }
  if (!state.locked) {
    if (!down) state.held.delete(code);
    return false;
  }
  if (code === "KeyF") {
    if (down && !repeat && options.canFly) {
      state.flying = !state.flying;
      events.onFlyChange?.(state.flying);
    }
    return true;
  }
  if (!MOVEMENT_CODES.has(code)) return false;
  if (down) {
    if (code === "KeyW" && !repeat) {
      if (nowMs - state.lastForwardTapMs <= DOUBLE_TAP_MS) state.sprintLatched = true;
      state.lastForwardTapMs = nowMs;
    }
    state.held.add(code);
  } else {
    state.held.delete(code);
    if (code === "KeyW") state.sprintLatched = false;
  }
  return true;
}
