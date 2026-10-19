import { describe, expect, it } from "vitest";
import { MAX_RENDER_DISTANCE, MIN_RENDER_DISTANCE, QUALITY_PRESETS } from "../src/config";
import {
  MAX_SENSITIVITY,
  SETTINGS_KEY,
  clampSettings,
  defaultSettings,
  detectQuality,
  hudScaleFor,
  loadSettings,
  saveSettings,
  touchEnabled,
  withQuality,
  type KeyValueStore
} from "../src/ui/settings";

const DESKTOP = { cores: 8, memoryGb: 8, coarsePointer: false };
const PHONE = { cores: 6, memoryGb: 4, coarsePointer: true };

class MemoryStore implements KeyValueStore {
  readonly data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

class BrokenStore implements KeyValueStore {
  getItem(): string | null {
    throw new Error("blocked");
  }
  setItem(): void {
    throw new Error("quota");
  }
}

describe("quality detection", () => {
  it("picks presets from cores, memory and pointer type", () => {
    expect(detectQuality(DESKTOP)).toBe("high");
    expect(detectQuality({ cores: 4, memoryGb: 8, coarsePointer: false })).toBe("medium");
    expect(detectQuality(PHONE)).toBe("low");
    expect(detectQuality({ cores: 8, memoryGb: 8, coarsePointer: true })).toBe("medium");
    expect(detectQuality({ cores: 2, coarsePointer: false })).toBe("low");
    expect(detectQuality({ coarsePointer: false })).toBe("medium");
  });

  it("derives the default render distance from the preset", () => {
    expect(defaultSettings(DESKTOP).renderDistance).toBe(QUALITY_PRESETS.high.renderDistance);
    expect(withQuality(defaultSettings(DESKTOP), "low").renderDistance).toBe(QUALITY_PRESETS.low.renderDistance);
  });
});

describe("clamping", () => {
  it("clamps numbers into range and rejects unknown enums", () => {
    const s = clampSettings({ quality: "ultra", renderDistance: 99, sensitivity: 50, hudScale: 0, touch: "maybe" }, DESKTOP);
    expect(s.quality).toBe("high");
    expect(s.renderDistance).toBe(MAX_RENDER_DISTANCE);
    expect(s.sensitivity).toBe(MAX_SENSITIVITY);
    expect(s.hudScale).toBeGreaterThan(0);
    expect(s.touch).toBe("auto");
    expect(clampSettings({ renderDistance: -5 }, DESKTOP).renderDistance).toBe(MIN_RENDER_DISTANCE);
    expect(clampSettings({ volume: 4 }, DESKTOP).volume).toBe(1);
    expect(clampSettings({ volume: -1 }, DESKTOP).volume).toBe(0);
    expect(clampSettings({}, DESKTOP).volume).toBe(0.7);
    expect(clampSettings("nonsense", PHONE)).toEqual(defaultSettings(PHONE));
  });
});

describe("persistence", () => {
  it("round-trips through an injected store", () => {
    const store = new MemoryStore();
    const settings = { ...defaultSettings(DESKTOP), renderDistance: 5, sensitivity: 1.4, touch: "on" as const };
    expect(saveSettings(store, settings)).toBe(true);
    expect(store.data.has(SETTINGS_KEY)).toBe(true);
    expect(loadSettings(store, DESKTOP)).toEqual(settings);
  });

  it("falls back to defaults on missing, corrupt or blocked storage", () => {
    const store = new MemoryStore();
    expect(loadSettings(store, PHONE)).toEqual(defaultSettings(PHONE));
    store.setItem(SETTINGS_KEY, "{not json");
    expect(loadSettings(store, PHONE)).toEqual(defaultSettings(PHONE));
    expect(loadSettings(new BrokenStore(), PHONE)).toEqual(defaultSettings(PHONE));
    expect(saveSettings(new BrokenStore(), defaultSettings(PHONE))).toBe(false);
    expect(loadSettings(null, PHONE)).toEqual(defaultSettings(PHONE));
  });
});

describe("touch and HUD scale", () => {
  it("enables touch controls by mode or pointer type", () => {
    expect(touchEnabled(defaultSettings(PHONE), PHONE)).toBe(true);
    expect(touchEnabled(defaultSettings(DESKTOP), DESKTOP)).toBe(false);
    expect(touchEnabled({ ...defaultSettings(DESKTOP), touch: "on" }, DESKTOP)).toBe(true);
    expect(touchEnabled({ ...defaultSettings(PHONE), touch: "off" }, PHONE)).toBe(false);
  });

  it("shrinks the HUD on narrow screens and respects the user factor", () => {
    expect(hudScaleFor(1280, 720, 1)).toBe(1);
    expect(hudScaleFor(375, 667, 1)).toBeLessThan(1);
    expect(hudScaleFor(375, 667, 1)).toBeGreaterThan(0.5);
    expect(hudScaleFor(1280, 720, 1.2)).toBeCloseTo(1.2, 9);
  });
});
