import { CHUNK_VOLUME, SAVE_FORMAT_VERSION } from "../config";
import type { SaveBackend } from "./db";

export class SaveError extends Error {}

export interface SavedPlayer {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  respawn: { x: number; y: number; z: number } | null;
}

export interface SaveFile {
  version: number;
  seed: number;
  mode: "survival" | "creative";
  time: number;
  player: SavedPlayer;
  stats: unknown;
  inventory: unknown;
  containers: unknown;
  entities: unknown;
  chunks: Record<string, string>;
}

export interface SaveInput {
  seed: number;
  mode: "survival" | "creative";
  time: number;
  player: SavedPlayer;
  stats: unknown;
  inventory: unknown;
  containers: unknown;
  entities: unknown;
  chunks: ReadonlyMap<string, Uint8Array>;
}

const CHUNK_KEY = /^-?\d+,-?\d+$/;

export function rleEncode(bytes: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < bytes.length) {
    const value = bytes[i];
    let run = 1;
    while (i + run < bytes.length && bytes[i + run] === value && run < 255) run++;
    out.push(run, value);
    i += run;
  }
  return Uint8Array.from(out);
}

export function rleDecode(data: Uint8Array, length: number): Uint8Array {
  if (data.length % 2 !== 0) throw new SaveError("Corrupt chunk data");
  const out = new Uint8Array(length);
  let offset = 0;
  for (let i = 0; i < data.length; i += 2) {
    const run = data[i];
    if (run === 0 || offset + run > length) throw new SaveError("Corrupt chunk data");
    out.fill(data[i + 1], offset, offset + run);
    offset += run;
  }
  if (offset !== length) throw new SaveError("Corrupt chunk data");
  return out;
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export function fromBase64(text: string): Uint8Array {
  let binary: string;
  try {
    binary = atob(text);
  } catch {
    throw new SaveError("Corrupt chunk data");
  }
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function buildSave(input: SaveInput): SaveFile {
  const chunks: Record<string, string> = {};
  for (const key of [...input.chunks.keys()].sort()) {
    const blocks = input.chunks.get(key);
    if (blocks) chunks[key] = toBase64(rleEncode(blocks));
  }
  return {
    version: SAVE_FORMAT_VERSION,
    seed: input.seed >>> 0,
    mode: input.mode,
    time: Math.max(0, Math.floor(input.time)),
    player: input.player,
    stats: input.stats,
    inventory: input.inventory,
    containers: input.containers,
    entities: input.entities,
    chunks
  };
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function readPlayer(raw: unknown): SavedPlayer {
  if (!raw || typeof raw !== "object") throw new SaveError("Missing player");
  const p = raw as Record<string, unknown>;
  if (![p.x, p.y, p.z].every(isNumber)) throw new SaveError("Invalid player position");
  const r = p.respawn as Record<string, unknown> | null | undefined;
  const respawn = r && [r.x, r.y, r.z].every(isNumber) ? { x: r.x as number, y: r.y as number, z: r.z as number } : null;
  return {
    x: p.x as number,
    y: p.y as number,
    z: p.z as number,
    yaw: isNumber(p.yaw) ? p.yaw : 0,
    pitch: isNumber(p.pitch) ? p.pitch : 0,
    respawn
  };
}

export function migrate(raw: unknown): SaveFile {
  if (!raw || typeof raw !== "object") throw new SaveError("Save is not an object");
  const save = raw as Record<string, unknown>;
  switch (save.version) {
    case 1: {
      if (!isNumber(save.seed)) throw new SaveError("Invalid seed");
      const chunks: Record<string, string> = {};
      if (save.chunks && typeof save.chunks === "object") {
        for (const [key, value] of Object.entries(save.chunks as Record<string, unknown>)) {
          if (CHUNK_KEY.test(key) && typeof value === "string") chunks[key] = value;
        }
      }
      return {
        version: 1,
        seed: save.seed >>> 0,
        mode: save.mode === "creative" ? "creative" : "survival",
        time: isNumber(save.time) && save.time >= 0 ? Math.floor(save.time) : 0,
        player: readPlayer(save.player),
        stats: save.stats ?? null,
        inventory: save.inventory ?? null,
        containers: save.containers ?? [],
        entities: save.entities ?? [],
        chunks
      };
    }
    default:
      throw new SaveError(`Unsupported save version: ${String(save.version)}`);
  }
}

export function decodeChunks(save: SaveFile): Map<string, Uint8Array> {
  const out = new Map<string, Uint8Array>();
  for (const [key, value] of Object.entries(save.chunks)) {
    out.set(key, rleDecode(fromBase64(value), CHUNK_VOLUME));
  }
  return out;
}

export function slotKey(seed: number, mode: string): string {
  return `world:${seed >>> 0}:${mode}`;
}

export async function saveWorld(backend: SaveBackend, key: string, save: SaveFile): Promise<void> {
  await backend.put(key, JSON.stringify(save));
}

export async function loadWorld(backend: SaveBackend, key: string): Promise<SaveFile | null> {
  const text = await backend.get(key);
  if (text === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new SaveError("Save is not valid JSON");
  }
  return migrate(parsed);
}

export class Autosaver {
  private elapsed = 0;
  private saving = false;

  constructor(
    private readonly intervalSeconds: number,
    private readonly save: () => Promise<void>
  ) {}

  tick(dt: number): boolean {
    this.elapsed += dt;
    if (this.elapsed < this.intervalSeconds || this.saving) return false;
    this.elapsed = 0;
    void this.now();
    return true;
  }

  async now(): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    try {
      await this.save();
    } finally {
      this.saving = false;
    }
  }
}
