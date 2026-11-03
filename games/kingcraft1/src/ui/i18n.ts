import { LOCALES, blockName, creatureName, directionOf, itemName, t, type Locale } from "../content/locales";

let current: Locale = "en";

export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split("-")[0];
    if ((LOCALES as readonly string[]).includes(base)) return base as Locale;
  }
  return "en";
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function getLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale, root: HTMLElement | null = typeof document === "undefined" ? null : document.documentElement): void {
  current = locale;
  if (!root) return;
  root.lang = locale;
  root.dir = directionOf(locale);
}

export function tr(key: string, params?: Record<string, string | number>): string {
  return t(key, current, params);
}

export function trItem(id: string): string {
  return itemName(id, current);
}

export function trBlock(name: string): string {
  return blockName(name, current);
}

export function trCreature(id: string): string {
  return creatureName(id, current);
}
