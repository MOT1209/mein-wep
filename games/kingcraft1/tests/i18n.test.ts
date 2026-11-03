import { describe, expect, it } from "vitest";
import { BLOCKS } from "../src/content/blocks";
import { CREATURES } from "../src/content/creatures";
import { allItems } from "../src/content/items";
import { LOCALES, directionOf, localeKeys, rawText, t } from "../src/content/locales";
import { CRAFTING_RECIPES, SMELTING_RECIPES } from "../src/content/recipes";
import { buildEntries, searchEntries } from "../src/ui/encyclopedia";
import { detectLocale, getLocale, isLocale, setLocale, tr } from "../src/ui/i18n";
import { clampSettings, defaultSettings } from "../src/ui/settings";

const ARABIC = /[؀-ۿ]/;

describe("dictionaries", () => {
  it("has every key in every locale", () => {
    const en = new Set(localeKeys("en"));
    for (const locale of LOCALES) {
      const keys = new Set(localeKeys(locale));
      const missing = [...en].filter((k) => !keys.has(k));
      const extra = [...keys].filter((k) => !en.has(k));
      expect(missing, `${locale} missing`).toEqual([]);
      expect(extra, `${locale} extra`).toEqual([]);
    }
  });

  it("has non-empty Arabic text written in Arabic script for every key", () => {
    const bad = localeKeys("ar").filter((k) => {
      const text = rawText(k, "ar") ?? "";
      return text.trim() === "" || !ARABIC.test(text);
    });
    expect(bad).toEqual([]);
  });

  it("keeps the same placeholders in both languages", () => {
    const params = (text: string): string[] => (text.match(/\{[a-z]+\}/g) ?? []).sort();
    const mismatched = localeKeys("en").filter((k) => params(rawText(k, "en") ?? "").join() !== params(rawText(k, "ar") ?? "").join());
    expect(mismatched).toEqual([]);
  });

  it("interpolates parameters and falls back to the key", () => {
    expect(t("game.toast_hit_by", "en", { name: "Rattler", amount: 3 })).toBe("Hit by Rattler (-3)");
    expect(t("game.toast_hit_by", "ar", { name: "x", amount: 3 })).toContain("3");
    expect(t("no.such.key", "ar")).toBe("no.such.key");
  });
});

describe("locale switching", () => {
  it("detects Arabic from browser languages and defaults to English", () => {
    expect(detectLocale(["ar-SA", "en"])).toBe("ar");
    expect(detectLocale(["de-DE", "en-US"])).toBe("en");
    expect(detectLocale([])).toBe("en");
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("flips direction and translates through tr()", () => {
    const root = { lang: "", dir: "" } as unknown as HTMLElement;
    setLocale("ar", root);
    expect(getLocale()).toBe("ar");
    expect(root.dir).toBe("rtl");
    expect(root.lang).toBe("ar");
    expect(ARABIC.test(tr("ui.settings"))).toBe(true);
    setLocale("en", root);
    expect(root.dir).toBe("ltr");
    expect(tr("ui.settings")).toBe("Settings");
    expect(directionOf("ar")).toBe("rtl");
  });

  it("stores the language in settings", () => {
    expect(defaultSettings({ coarsePointer: false, languages: ["ar-EG"] }).language).toBe("ar");
    expect(clampSettings({ language: "xx" }, { coarsePointer: false, languages: ["en"] }).language).toBe("en");
    expect(clampSettings({ language: "ar" }, { coarsePointer: false }).language).toBe("ar");
  });
});

describe("encyclopedia", () => {
  const entries = buildEntries("en");
  const ids = new Set(entries.map((e) => e.id));

  it("has one entry per def with stable unique ids", () => {
    expect(ids.size).toBe(entries.length);
    for (const def of BLOCKS) {
      if (!def || def.id === 0 || def.creativeHidden) continue;
      expect(ids.has(`block:${def.name}`), def.name).toBe(true);
    }
    for (const item of allItems()) if (item.kind !== "block") expect(ids.has(`item:${item.id}`), item.id).toBe(true);
    for (const creature of CREATURES) expect(ids.has(`creature:${creature.id}`)).toBe(true);
    for (const recipe of CRAFTING_RECIPES) expect(ids.has(`recipe:${recipe.id}`)).toBe(true);
    for (const smelt of SMELTING_RECIPES) expect(ids.has(`smelt:${smelt.input}`)).toBe(true);
    expect(buildEntries("en").map((e) => e.id)).toEqual(entries.map((e) => e.id));
  });

  it("gives every entry a name and at least one fact", () => {
    for (const e of entries) {
      expect(e.name.trim(), e.id).not.toBe("");
      expect(e.facts.length, e.id).toBeGreaterThan(0);
    }
  });

  it("describes blocks, tools, food, creatures and recipes from the defs", () => {
    const facts = (id: string): string => entries.find((e) => e.id === id)?.facts.join(" | ") ?? "";
    expect(facts("block:ferrite_ore")).toMatch(/Hardness 2\.8.*Pickaxe.*tier 2/);
    expect(facts("block:glass")).toContain("Drops nothing");
    expect(facts("item:ember_dust").length).toBeGreaterThan(0);
    expect(facts("item:stick")).toContain("Used to make");
    expect(facts("block:torch")).toContain("light level 14");
    expect(facts("item:stone_pickaxe")).toMatch(/Pickaxe, tier 2/);
    expect(facts("item:cooked_meat")).toContain("Restores 8 food");
    expect(facts("item:raw_ferrite")).toContain("Smelts into");
    expect(facts("creature:rattler")).toMatch(/Hostile.*Attacks from up to 16/);
    expect(facts("creature:bramblehog")).toContain("Peaceful");
  });

  it("builds Arabic entries in Arabic", () => {
    const ar = buildEntries("ar");
    expect(ar.map((e) => e.id)).toEqual(entries.map((e) => e.id));
    const latin = ar.filter((e) => !ARABIC.test(e.name) || !e.facts.every((f) => ARABIC.test(f)));
    expect(latin.map((e) => e.id)).toEqual([]);
  });

  it("searches by name or id within a category", () => {
    expect(searchEntries(entries, "furnace", "blocks").map((e) => e.id)).toContain("block:furnace");
    expect(searchEntries(entries, "FURNACE", "creatures")).toEqual([]);
    expect(searchEntries(entries, "", "creatures")).toHaveLength(CREATURES.length);
    expect(searchEntries(entries, "zzzz", "all")).toEqual([]);
    const ar = buildEntries("ar");
    expect(searchEntries(ar, "فرن", "blocks").some((e) => e.id === "block:furnace")).toBe(true);
  });
});
