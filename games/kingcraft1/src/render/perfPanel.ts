export interface RenderInfo {
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

export interface ChunkCounters {
  loaded: number;
  pending: number;
  loadedTotal: number;
  unloadedTotal: number;
}

export class FrameTimer {
  private readonly samples: number[] = [];

  constructor(private readonly window = 60) {}

  add(ms: number): void {
    if (!Number.isFinite(ms) || ms < 0) return;
    this.samples.push(ms);
    if (this.samples.length > this.window) this.samples.shift();
  }

  get average(): number {
    if (this.samples.length === 0) return 0;
    return this.samples.reduce((sum, v) => sum + v, 0) / this.samples.length;
  }

  get worst(): number {
    return this.samples.length === 0 ? 0 : Math.max(...this.samples);
  }
}

export function perfLines(frame: FrameTimer, info: RenderInfo, chunks: ChunkCounters, entities: number, particles: number): string[] {
  return [
    `Frame ${frame.average.toFixed(1)} ms avg  ${frame.worst.toFixed(1)} ms worst`,
    `Draw calls ${info.calls}  triangles ${info.triangles}`,
    `Geometries ${info.geometries}  textures ${info.textures}`,
    `Chunks +${chunks.loadedTotal} -${chunks.unloadedTotal}  entities ${entities}  particles ${particles}`
  ];
}
