export interface GameLoopHandlers {
  tick: () => void;
  render: () => void;
}

const MAX_FRAME_MS = 250;
const FPS_WINDOW_MS = 500;

export class GameLoop {
  private raf = 0;
  private last = 0;
  private accumulator = 0;
  private running = false;
  private frames = 0;
  private windowStarted = 0;
  private fpsValue = 0;
  private readonly tickMs: number;
  private readonly handlers: GameLoopHandlers;

  constructor(tickMs: number, handlers: GameLoopHandlers) {
    this.tickMs = tickMs;
    this.handlers = handlers;
  }

  get fps(): number {
    return this.fpsValue;
  }

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.windowStarted = this.last;
    this.frames = 0;
    this.accumulator = 0;
    this.raf = requestAnimationFrame(this.step);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private readonly step = (now: number): void => {
    if (!this.running) return;
    const elapsed = Math.min(now - this.last, MAX_FRAME_MS);
    this.last = now;
    this.accumulator += elapsed;
    while (this.accumulator >= this.tickMs) {
      this.handlers.tick();
      this.accumulator -= this.tickMs;
    }
    this.handlers.render();
    this.frames += 1;
    if (now - this.windowStarted >= FPS_WINDOW_MS) {
      this.fpsValue = (this.frames * 1000) / (now - this.windowStarted);
      this.frames = 0;
      this.windowStarted = now;
    }
    this.raf = requestAnimationFrame(this.step);
  };
}
