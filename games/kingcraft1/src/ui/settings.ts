import { MAX_RENDER_DISTANCE, MIN_RENDER_DISTANCE, QUALITY_PRESETS, type QualityLevel } from "../config";
import type { Locale } from "../content/locales";
import { detectLocale, isLocale } from "./i18n";

export type TouchMode = "auto" | "on" | "off";

export interface Settings {
  quality: QualityLevel;
  renderDistance: number;
  sensitivity: number;
  hudScale: number;
  touch: TouchMode;
  volume: number;
  language: Locale;
}

export interface DeviceInfo {
  cores?: number;
  memoryGb?: number;
  coarsePointer: boolean;
  languages?: readonly string[];
}

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SETTINGS_KEY = "blockworld.settings.v1";
export const MIN_SENSITIVITY = 0.2;
export const MAX_SENSITIVITY = 3;
export const MIN_HUD_SCALE = 0.6;
export const MAX_HUD_SCALE = 1.5;
const QUALITY_LEVELS: readonly QualityLevel[] = ["low", "medium", "high"];
const TOUCH_MODES: readonly TouchMode[] = ["auto", "on", "off"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function detectQuality(device: DeviceInfo): QualityLevel {
  const cores = device.cores ?? 4;
  const memory = device.memoryGb ?? 4;
  if (cores <= 2 || memory <= 2) return "low";
  if (device.coarsePointer) return cores >= 8 && memory >= 6 ? "medium" : "low";
  if (cores >= 8 && memory >= 8) return "high";
  return "medium";
}

export function defaultSettings(device: DeviceInfo): Settings {
  const quality = detectQuality(device);
  return {
    quality,
    renderDistance: QUALITY_PRESETS[quality].renderDistance,
    sensitivity: 1,
    hudScale: 1,
    touch: "auto",
    volume: 0.7,
    language: detectLocale(device.languages ?? [])
  };
}

export function clampSettings(raw: unknown, device: DeviceInfo): Settings {
  const base = defaultSettings(device);
  if (!raw || typeof raw !== "object") return base;
  const value = raw as Partial<Record<keyof Settings, unknown>>;
  const quality = QUALITY_LEVELS.includes(value.quality as QualityLevel) ? (value.quality as QualityLevel) : base.quality;
  return {
    quality,
    renderDistance: Math.round(clamp(num(value.renderDistance, QUALITY_PRESETS[quality].renderDistance), MIN_RENDER_DISTANCE, MAX_RENDER_DISTANCE)),
    sensitivity: clamp(num(value.sensitivity, base.sensitivity), MIN_SENSITIVITY, MAX_SENSITIVITY),
    hudScale: clamp(num(value.hudScale, base.hudScale), MIN_HUD_SCALE, MAX_HUD_SCALE),
    touch: TOUCH_MODES.includes(value.touch as TouchMode) ? (value.touch as TouchMode) : base.touch,
    volume: clamp(num(value.volume, base.volume), 0, 1),
    language: isLocale(value.language) ? value.language : base.language
  };
}

export function loadSettings(store: KeyValueStore | null, device: DeviceInfo): Settings {
  if (!store) return defaultSettings(device);
  try {
    const raw = store.getItem(SETTINGS_KEY);
    return clampSettings(raw ? JSON.parse(raw) : null, device);
  } catch {
    return defaultSettings(device);
  }
}

export function saveSettings(store: KeyValueStore | null, settings: Settings): boolean {
  if (!store) return false;
  try {
    store.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

export function withQuality(settings: Settings, quality: QualityLevel): Settings {
  return { ...settings, quality, renderDistance: QUALITY_PRESETS[quality].renderDistance };
}

export function touchEnabled(settings: Settings, device: DeviceInfo): boolean {
  if (settings.touch === "on") return true;
  if (settings.touch === "off") return false;
  return device.coarsePointer;
}

export function hudScaleFor(viewportWidth: number, viewportHeight: number, userScale: number): number {
  const fit = Math.min(1, (viewportWidth - 24) / 476, (viewportHeight - 24) / 360);
  return clamp(Math.max(0.55, fit) * userScale, 0.45, MAX_HUD_SCALE);
}
