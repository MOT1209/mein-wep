# Controls

Source: `src/input/inputState.ts`, `src/input/desktop.ts`, `src/input/touch.ts`, `src/main.ts`.

## Desktop

Click **Play** (or the game view) to lock the mouse. Press **Esc** to release it and pause.

| Action | Input |
| ------ | ----- |
| Move | W A S D or arrow keys |
| Jump / fly up | Space |
| Sneak / fly down | Shift |
| Sprint | hold Ctrl, or double-tap W |
| Look | mouse |
| Break block / hit creature | hold left mouse button |
| Place block, use item, open container, eat | right mouse button |
| Place instead of using a block (e.g. next to a chest) | Shift + right mouse button |
| Hotbar slot | 1 – 9 or mouse wheel |
| Inventory | E (E or Esc closes it) |
| Encyclopedia | J (Esc closes it) |
| Fly on/off | F (creative mode only) |
| Debug and performance panel | F3 |

Keys are ignored while typing in a text field (for example the encyclopedia search).

## Touch

Touch controls appear automatically on touch devices (or set **Touch controls** to On in Settings).

| Action | Input |
| ------ | ----- |
| Move | left joystick |
| Look | drag anywhere on the screen |
| Place / use | tap the screen |
| Break | long-press the screen, or hold **Break** |
| Jump / fly up | **Jump** |
| Descend while flying | **Down** |
| Sneak on/off | **Sneak** |
| Fly on/off | **Fly** (creative only) |
| Hotbar slot | tap a slot |
| Inventory | **Bag**, close with **Close** |
| Pause | **Pause** |

There is no touch equivalent of shift-click in the inventory yet.

## URL options

| Option | Effect |
| ------ | ------ |
| `?seed=123` | world seed (each seed and mode has its own save) |
| `?mode=creative` | creative mode: instant breaking, flight, all-items palette, no damage |
| `?time=0.75` | start time of day (0 = sunrise, 0.5 = sunset, 0.75 = midnight) |
