import { describe, expect, it } from "vitest";
import {
  DOUBLE_TAP_MS,
  addLook,
  consumeLook,
  createInputState,
  handleKey,
  setLocked,
  toMoveInput,
  type HudEvents
} from "../src/input/inputState";

const CREATIVE = { canFly: true };
const SURVIVAL = { canFly: false };

function locked(events: HudEvents = {}) {
  const state = createInputState();
  setLocked(state, true, events);
  return state;
}

function press(state: ReturnType<typeof createInputState>, code: string, at = 0, events: HudEvents = {}, options = SURVIVAL) {
  return handleKey(state, code, true, false, at, events, options);
}

function release(state: ReturnType<typeof createInputState>, code: string, at = 0, events: HudEvents = {}, options = SURVIVAL) {
  return handleKey(state, code, false, false, at, events, options);
}

describe("input state", () => {
  it("maps WASD and arrows to forward and strafe axes", () => {
    const state = locked();
    press(state, "KeyW");
    press(state, "KeyD");
    expect(toMoveInput(state)).toMatchObject({ forward: 1, strafe: 1 });
    press(state, "KeyS");
    expect(toMoveInput(state).forward).toBe(0);
    release(state, "KeyW");
    release(state, "KeyD");
    press(state, "ArrowLeft");
    expect(toMoveInput(state)).toMatchObject({ forward: -1, strafe: -1 });
  });

  it("maps Space to jump and Shift to sneak", () => {
    const state = locked();
    press(state, "Space");
    press(state, "ShiftLeft");
    expect(toMoveInput(state)).toMatchObject({ jump: true, sneak: true });
  });

  it("ignores movement keys while the pointer is not locked", () => {
    const state = createInputState();
    expect(press(state, "KeyW")).toBe(false);
    expect(toMoveInput(state).forward).toBe(0);
  });

  it("sprints on double-tap W and stops when W is released", () => {
    const state = locked();
    press(state, "KeyW", 1000);
    release(state, "KeyW", 1050);
    press(state, "KeyW", 1000 + DOUBLE_TAP_MS - 10);
    expect(toMoveInput(state).sprint).toBe(true);
    release(state, "KeyW", 1500);
    press(state, "KeyW", 1500 + DOUBLE_TAP_MS + 50);
    expect(toMoveInput(state).sprint).toBe(false);
  });

  it("sprints while Control is held and only when moving forward", () => {
    const state = locked();
    press(state, "ControlLeft");
    expect(toMoveInput(state).sprint).toBe(false);
    press(state, "KeyW");
    expect(toMoveInput(state).sprint).toBe(true);
  });

  it("toggles flight with F only when flying is allowed", () => {
    const flips: boolean[] = [];
    const events: HudEvents = { onFlyChange: (flying) => flips.push(flying) };
    const survival = locked();
    press(survival, "KeyF", 0, events, SURVIVAL);
    expect(toMoveInput(survival).fly).toBe(false);

    const creative = locked();
    press(creative, "KeyF", 0, events, CREATIVE);
    expect(toMoveInput(creative).fly).toBe(true);
    expect(handleKey(creative, "KeyF", true, true, 10, events, CREATIVE)).toBe(true);
    expect(toMoveInput(creative).fly).toBe(true);
    press(creative, "KeyF", 20, events, CREATIVE);
    expect(toMoveInput(creative).fly).toBe(false);
    expect(flips).toEqual([true, false]);
  });

  it("selects hotbar slots 1-9 and fires HUD events", () => {
    const calls: string[] = [];
    const events: HudEvents = {
      onHotbarSelect: (slot) => calls.push(`slot:${slot}`),
      onToggleDebug: () => calls.push("debug"),
      onToggleInventory: () => calls.push("inventory")
    };
    const state = createInputState();
    expect(press(state, "Digit3", 0, events)).toBe(true);
    expect(state.hotbarSlot).toBe(2);
    expect(press(state, "Digit0", 0, events)).toBe(false);
    press(state, "F3", 0, events);
    press(state, "KeyE", 0, events);
    expect(handleKey(state, "F3", true, true, 0, events, SURVIVAL)).toBe(true);
    expect(calls).toEqual(["slot:2", "debug", "inventory"]);
  });

  it("accumulates mouse look only while locked and clears on consume", () => {
    const state = createInputState();
    addLook(state, 100, 50, 0.01);
    expect(consumeLook(state)).toEqual({ dyaw: 0, dpitch: 0 });
    setLocked(state, true, {});
    addLook(state, 100, 50, 0.01);
    addLook(state, -20, 0, 0.01);
    const look = consumeLook(state);
    expect(look.dyaw).toBeCloseTo(-0.8, 9);
    expect(look.dpitch).toBeCloseTo(-0.5, 9);
    expect(consumeLook(state)).toEqual({ dyaw: 0, dpitch: 0 });
  });

  it("drops held keys and reports pause when the pointer unlocks", () => {
    const pauses: boolean[] = [];
    const events: HudEvents = { onPauseChange: (paused) => pauses.push(paused) };
    const state = createInputState();
    setLocked(state, true, events);
    press(state, "KeyW");
    press(state, "Space");
    setLocked(state, false, events);
    expect(toMoveInput(state)).toMatchObject({ forward: 0, jump: false });
    expect(pauses).toEqual([false, true]);
  });
});

describe("mouse buttons and hotbar wheel", () => {
  it("holds attack on the left button and counts right clicks while locked", async () => {
    const { handleMouseButton, consumeUses, selectHotbar } = await import("../src/input/inputState");
    const state = createInputState();
    expect(handleMouseButton(state, 0, true)).toBe(false);
    expect(state.attack).toBe(false);
    setLocked(state, true, {});
    handleMouseButton(state, 0, true);
    expect(state.attack).toBe(true);
    handleMouseButton(state, 0, false);
    expect(state.attack).toBe(false);
    handleMouseButton(state, 2, true);
    handleMouseButton(state, 2, true);
    expect(consumeUses(state)).toBe(2);
    expect(consumeUses(state)).toBe(0);
    const picked: number[] = [];
    selectHotbar(state, -1, { onHotbarSelect: (slot) => picked.push(slot) });
    selectHotbar(state, 9, { onHotbarSelect: (slot) => picked.push(slot) });
    expect(picked).toEqual([8, 0]);
  });
});
