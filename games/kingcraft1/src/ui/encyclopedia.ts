import { BLOCKS, type BlockDef } from "../content/blocks";
import { CREATURES, type CreatureDef } from "../content/creatures";
import { allItems, foodValue, fuelSeconds, itemById, itemForBlock, toolStats } from "../content/items";
import { biomeName, blockName, creatureName, itemName, t, type Locale } from "../content/locales";
import { CRAFTING_RECIPES, SMELTING_RECIPES, type CraftingRecipe } from "../content/recipes";
import { el, injectUiStyles } from "./hud";
import { tr } from "./i18n";
import type { IconFactory } from "./icons";

export type EntryCategory = "blocks" | "items" | "creatures" | "recipes";
export const CATEGORIES: readonly EntryCategory[] = ["blocks", "items", "creatures", "recipes"];

export interface Entry {
  id: string;
  category: EntryCategory;
  name: string;
  icon: string | null;
  facts: string[];
  search: string;
}

function list(items: readonly string[], locale: Locale): string {
  return items.join(locale === "ar" ? "، " : ", ");
}

function ingredientCounts(recipe: CraftingRecipe): Map<string, number> {
  const counts = new Map<string, number>();
  const add = (item: string): void => {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  };
  if (recipe.type === "shaped") {
    for (const row of recipe.pattern) {
      for (const symbol of row) {
        const item = recipe.key[symbol];
        if (symbol !== " " && item) add(item);
      }
    }
  } else {
    for (const item of recipe.ingredients) add(item);
  }
  return counts;
}

function recipeFacts(recipe: CraftingRecipe, locale: Locale): string[] {
  const parts = [...ingredientCounts(recipe)].map(([item, count]) => `${count} × ${itemName(item, locale)}`);
  return [
    t(recipe.station === "table" ? "game.fact_made_at_table" : "game.fact_made_by_hand", locale),
    t("game.fact_ingredients", locale, { items: list(parts, locale) }),
    t("game.fact_makes", locale, { count: recipe.result.count, item: itemName(recipe.result.item, locale) })
  ];
}

function itemFacts(id: string, locale: Locale): string[] {
  const facts: string[] = [];
  const tool = toolStats(id);
  if (tool) {
    facts.push(
      t("game.fact_tool_stats", locale, {
        kind: t(`game.tool_${tool.kind}`, locale),
        tier: tool.tier,
        durability: tool.durability,
        damage: tool.damage
      })
    );
  }
  const food = foodValue(id);
  if (food) facts.push(t("game.fact_food", locale, { hunger: food.hunger }));
  const fuel = fuelSeconds(id);
  if (fuel > 0) facts.push(t("game.fact_fuel", locale, { seconds: fuel }));
  for (const smelt of SMELTING_RECIPES) {
    if (smelt.input === id) facts.push(t("game.fact_smelts_into", locale, { item: itemName(smelt.output, locale), seconds: smelt.seconds }));
    if (smelt.output === id) facts.push(t("game.fact_smelted_from", locale, { item: itemName(smelt.input, locale) }));
  }
  for (const recipe of CRAFTING_RECIPES) {
    if (recipe.result.item === id) {
      facts.push(...recipeFacts(recipe, locale));
      break;
    }
  }
  const usedIn = [...new Set(CRAFTING_RECIPES.filter((r) => ingredientCounts(r).has(id)).map((r) => itemName(r.result.item, locale)))];
  if (usedIn.length > 0) facts.push(t("game.fact_used_in", locale, { items: list(usedIn.slice(0, 8), locale) }));
  if (facts.length === 0) facts.push(t("game.fact_material", locale));
  return facts;
}

function blockFacts(def: BlockDef, locale: Locale): string[] {
  const facts: string[] = [];
  if (def.hardness < 0) facts.push(t("game.fact_unbreakable", locale));
  else facts.push(t("game.fact_hardness", locale, { value: def.hardness }));
  if (def.tool) facts.push(t("game.fact_tool", locale, { tool: t(`game.tool_${def.tool}`, locale) }));
  if (def.tier > 0) facts.push(t("game.fact_tier", locale, { tier: def.tier }));
  if (def.drops === "none") facts.push(t("game.fact_drops_nothing", locale));
  else if (Array.isArray(def.drops) && def.drops.length > 0) {
    facts.push(t("game.fact_drops", locale, { items: list(def.drops.map((d) => itemName(d.item, locale)), locale) }));
  }
  if (def.lightEmit > 0) facts.push(t("game.fact_light", locale, { value: def.lightEmit }));
  const item = itemForBlock(def.id);
  if (item) facts.push(...itemFacts(item, locale).filter((fact) => !facts.includes(fact)));
  return facts;
}

function creatureFacts(def: CreatureDef, locale: Locale): string[] {
  const facts = [
    t("game.fact_health", locale, { value: def.health }),
    t(`game.fact_behaviour_${def.category}`, locale)
  ];
  if (def.damage > 0) facts.push(t("game.fact_damage", locale, { value: def.damage }));
  if (def.ranged) facts.push(t("game.fact_ranged", locale, { range: def.ranged.range }));
  if (def.burnsInDaylight) facts.push(t("game.fact_burns", locale));
  const places = def.spawnBiome.includes("*") ? [t("game.anywhere", locale)] : def.spawnBiome.map((b) => biomeName(b, locale));
  if (def.spawnUnderground) places.push(t("game.fact_underground", locale));
  facts.push(t("game.fact_found_in", locale, { places: list(places, locale) }));
  if (def.drops.length > 0) facts.push(t("game.fact_drops", locale, { items: list(def.drops.map((d) => itemName(d.item, locale)), locale) }));
  return facts;
}

function entry(id: string, category: EntryCategory, name: string, icon: string | null, facts: string[]): Entry {
  return { id, category, name, icon, facts, search: `${name} ${id}`.toLowerCase() };
}

export function buildEntries(locale: Locale): Entry[] {
  const out: Entry[] = [];
  for (const def of BLOCKS) {
    if (!def || def.id === 0 || def.creativeHidden) continue;
    out.push(entry(`block:${def.name}`, "blocks", blockName(def.name, locale), itemForBlock(def.id) ?? null, blockFacts(def, locale)));
  }
  for (const def of allItems()) {
    if (def.kind === "block") continue;
    out.push(entry(`item:${def.id}`, "items", itemName(def.id, locale), def.id, itemFacts(def.id, locale)));
  }
  for (const def of CREATURES) {
    out.push(entry(`creature:${def.id}`, "creatures", creatureName(def.id, locale), null, creatureFacts(def, locale)));
  }
  for (const recipe of CRAFTING_RECIPES) {
    const icon = itemById(recipe.result.item) ? recipe.result.item : null;
    out.push(entry(`recipe:${recipe.id}`, "recipes", itemName(recipe.result.item, locale), icon, recipeFacts(recipe, locale)));
  }
  for (const smelt of SMELTING_RECIPES) {
    out.push(
      entry(`smelt:${smelt.input}`, "recipes", itemName(smelt.output, locale), smelt.output, [
        t("game.fact_smelts_into", locale, { item: itemName(smelt.output, locale), seconds: smelt.seconds }),
        t("game.fact_smelted_from", locale, { item: itemName(smelt.input, locale) })
      ])
    );
  }
  return out;
}

export function searchEntries(entries: readonly Entry[], query: string, category: EntryCategory | "all"): Entry[] {
  const q = query.trim().toLowerCase();
  return entries
    .filter((e) => (category === "all" || e.category === category) && (q === "" || e.search.includes(q)))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const ENCYCLOPEDIA_CSS = `
.bw-ency{display:flex;flex-direction:column;width:min(760px,calc(100vw - 16px));height:min(560px,calc(100vh - 16px));padding:12px;box-sizing:border-box;gap:8px}
.bw-ency-head{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.bw-ency-head h2{margin:0;flex:1;font-size:18px}
.bw-ency input{font:inherit;font-size:16px;padding:8px 10px;border-radius:8px;border:1px solid rgba(140,165,190,.4);background:#141b23;color:#e8eef4;min-width:0;flex:1 1 160px}
.bw-ency-tabs{display:flex;gap:6px;flex-wrap:wrap}
.bw-ency-tabs .bw-btn{min-height:40px;padding:6px 12px}
.bw-ency-tabs .bw-btn.on{border-color:#e8eef4}
.bw-ency-body{display:grid;grid-template-columns:minmax(150px,240px) 1fr;gap:10px;min-height:0;flex:1}
.bw-ency-list{overflow:auto;display:flex;flex-direction:column;gap:2px}
.bw-ency-list button{display:flex;align-items:center;gap:8px;min-height:40px;text-align:start;font:inherit;color:inherit;background:rgba(255,255,255,.04);border:1px solid transparent;border-radius:6px;padding:4px 8px;cursor:pointer}
.bw-ency-list button.on,.bw-ency-list button:focus-visible{border-color:#e8eef4;outline:none}
.bw-ency-list img,.bw-ency-detail img{width:28px;height:28px;image-rendering:pixelated}
.bw-ency-cat{margin-inline-start:auto;opacity:.55;font-size:12px}
.bw-ency-detail{overflow:auto;padding:4px 8px}
.bw-ency-detail h3{display:flex;align-items:center;gap:10px;margin:0 0 8px;font-size:18px}
.bw-ency-detail li{margin:4px 0}
@media (max-width:560px){.bw-ency-body{grid-template-columns:1fr;grid-template-rows:minmax(120px,40%) 1fr}}
`;

export class EncyclopediaScreen {
  private readonly root: HTMLElement;
  private readonly listEl: HTMLElement;
  private readonly detailEl: HTMLElement;
  private readonly searchEl: HTMLInputElement;
  private readonly tabs = new Map<EntryCategory | "all", HTMLElement>();
  private entries: Entry[] = [];
  private category: EntryCategory | "all" = "all";
  private selected: string | null = null;

  constructor(parent: HTMLElement, private readonly icons: IconFactory, private readonly locale: Locale, onClose: () => void) {
    injectUiStyles();
    if (!document.getElementById("bw-ency-styles")) {
      const style = document.createElement("style");
      style.id = "bw-ency-styles";
      style.textContent = ENCYCLOPEDIA_CSS;
      document.head.append(style);
    }
    this.root = el("div", "bw-screen hidden", parent);
    const win = el("div", "bw-panel bw-ency", this.root);
    const head = el("div", "bw-ency-head", win);
    el("h2", "", head).textContent = tr("ui.encyclopedia");
    this.searchEl = el("input", "", head);
    this.searchEl.type = "search";
    this.searchEl.placeholder = tr("game.search_placeholder");
    this.searchEl.setAttribute("aria-label", tr("ui.search"));
    this.searchEl.addEventListener("input", () => this.renderList());
    const close = el("button", "bw-btn", head);
    close.type = "button";
    close.textContent = tr("game.close");
    close.addEventListener("click", onClose);
    const tabs = el("div", "bw-ency-tabs", win);
    const labels: [EntryCategory | "all", string][] = [
      ["all", tr("ui.all")],
      ["blocks", tr("ui.blocks")],
      ["items", tr("ui.items")],
      ["creatures", tr("ui.creatures")],
      ["recipes", tr("game.recipes")]
    ];
    for (const [key, label] of labels) {
      const tab = el("button", "bw-btn", tabs);
      tab.type = "button";
      tab.textContent = label;
      tab.addEventListener("click", () => {
        this.category = key;
        this.renderList();
      });
      this.tabs.set(key, tab);
    }
    const body = el("div", "bw-ency-body", win);
    this.listEl = el("div", "bw-ency-list", body);
    this.listEl.setAttribute("role", "listbox");
    this.listEl.addEventListener("keydown", this.onListKey);
    this.detailEl = el("div", "bw-ency-detail", body);
  }

  get isOpen(): boolean {
    return !this.root.classList.contains("hidden");
  }

  open(): void {
    if (this.entries.length === 0) this.entries = buildEntries(this.locale);
    this.root.classList.remove("hidden");
    this.renderList();
    this.searchEl.focus();
  }

  close(): void {
    this.root.classList.add("hidden");
  }

  private renderList(): void {
    for (const [key, tab] of this.tabs) tab.classList.toggle("on", key === this.category);
    const results = searchEntries(this.entries, this.searchEl.value, this.category);
    this.listEl.replaceChildren();
    if (results.length === 0) {
      el("p", "", this.listEl).textContent = tr("game.no_results");
      this.detailEl.replaceChildren();
      return;
    }
    if (!this.selected || !results.some((e) => e.id === this.selected)) this.selected = results[0].id;
    for (const result of results.slice(0, 400)) {
      const row = el("button", result.id === this.selected ? "on" : "", this.listEl);
      row.type = "button";
      row.dataset.entry = result.id;
      row.setAttribute("role", "option");
      if (result.icon) {
        const img = el("img", "", row);
        img.src = this.icons.urlFor(result.icon);
        img.alt = "";
      }
      el("span", "", row).textContent = result.name;
      el("small", "bw-ency-cat", row).textContent = this.categoryLabel(result.category);
      row.addEventListener("click", () => this.select(result.id));
    }
    this.renderDetail();
  }

  private categoryLabel(category: EntryCategory): string {
    return tr(category === "recipes" ? "game.recipes" : `ui.${category}`);
  }

  private select(id: string): void {
    this.selected = id;
    for (const row of this.listEl.querySelectorAll<HTMLElement>("button[data-entry]")) row.classList.toggle("on", row.dataset.entry === id);
    this.renderDetail();
  }

  private renderDetail(): void {
    const current = this.entries.find((e) => e.id === this.selected);
    this.detailEl.replaceChildren();
    if (!current) return;
    const title = el("h3", "", this.detailEl);
    if (current.icon) {
      const img = el("img", "", title);
      img.src = this.icons.urlFor(current.icon);
      img.alt = "";
    }
    el("span", "", title).textContent = current.name;
    const facts = el("ul", "", this.detailEl);
    for (const fact of current.facts) el("li", "", facts).textContent = fact;
  }

  private readonly onListKey = (event: KeyboardEvent): void => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const rows = [...this.listEl.querySelectorAll<HTMLElement>("button[data-entry]")];
    const index = rows.findIndex((row) => row.dataset.entry === this.selected);
    const next = rows[Math.max(0, Math.min(rows.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))];
    if (!next?.dataset.entry) return;
    this.select(next.dataset.entry);
    next.focus();
  };
}
