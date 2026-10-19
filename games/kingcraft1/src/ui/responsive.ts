import { hudScaleFor, type DeviceInfo, type KeyValueStore } from "./settings";

export function readDevice(): DeviceInfo {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  return {
    cores: typeof nav.hardwareConcurrency === "number" ? nav.hardwareConcurrency : undefined,
    memoryGb: typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined,
    coarsePointer: coarse || "ontouchstart" in window,
    languages: navigator.languages?.length ? navigator.languages : [navigator.language]
  };
}

export function browserStore(): KeyValueStore | null {
  try {
    const store = window.localStorage;
    return store ?? null;
  } catch {
    return null;
  }
}

export function applyHudScale(hudRoot: HTMLElement, userScale: number): void {
  hudRoot.style.setProperty("--hud-scale", String(hudScaleFor(window.innerWidth, window.innerHeight, userScale)));
}
