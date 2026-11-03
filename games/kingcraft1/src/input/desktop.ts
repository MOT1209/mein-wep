import {
  DEFAULT_LOOK_SENSITIVITY,
  addLook,
  clearHeld,
  handleKey,
  handleMouseButton,
  selectHotbar,
  setLocked,
  type HudEvents,
  type InputState
} from "./inputState";

export interface DesktopOptions {
  canFly?: boolean;
  sensitivity?: number;
  now?: () => number;
}

export function attachDesktop(
  canvas: HTMLCanvasElement,
  state: InputState,
  events: HudEvents = {},
  options: DesktopOptions = {}
): () => void {
  const sensitivity = options.sensitivity ?? DEFAULT_LOOK_SENSITIVITY;
  const now = options.now ?? (() => performance.now());
  const keyOptions = { canFly: options.canFly ?? false };

  const onClick = (): void => {
    if (document.pointerLockElement !== canvas) {
      const request = canvas.requestPointerLock() as unknown;
      if (request instanceof Promise) request.catch(() => undefined);
    }
  };
  const onLockChange = (): void => {
    setLocked(state, document.pointerLockElement === canvas, events);
  };
  const onKey = (event: KeyboardEvent): void => {
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    const handled = handleKey(state, event.code, event.type === "keydown", event.repeat, now(), events, keyOptions);
    if (handled) event.preventDefault();
  };
  const onMouseMove = (event: MouseEvent): void => {
    addLook(state, event.movementX, event.movementY, sensitivity);
  };
  const onMouseButton = (event: MouseEvent): void => {
    if (handleMouseButton(state, event.button, event.type === "mousedown")) event.preventDefault();
  };
  const onWheel = (event: WheelEvent): void => {
    if (!state.locked || event.deltaY === 0) return;
    event.preventDefault();
    selectHotbar(state, state.hotbarSlot + Math.sign(event.deltaY), events);
  };
  const onBlur = (): void => {
    clearHeld(state);
  };
  const onContextMenu = (event: Event): void => {
    event.preventDefault();
  };

  canvas.addEventListener("click", onClick);
  canvas.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("pointerlockchange", onLockChange);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mousedown", onMouseButton);
  document.addEventListener("mouseup", onMouseButton);
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKey);
  window.addEventListener("blur", onBlur);

  return () => {
    canvas.removeEventListener("click", onClick);
    canvas.removeEventListener("contextmenu", onContextMenu);
    document.removeEventListener("pointerlockchange", onLockChange);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mousedown", onMouseButton);
    document.removeEventListener("mouseup", onMouseButton);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("keyup", onKey);
    window.removeEventListener("blur", onBlur);
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    clearHeld(state);
  };
}
