# Save system

Source: `src/save/db.ts`, `src/save/saveLoad.ts`, `Game.snapshot()` / `Game.restore()` in
`src/game.ts`, `src/main.ts`.

## Where saves live

- IndexedDB database `blockworld`, object store `saves`, one entry per slot.
- Slot key: `world:<seed>:<mode>` — every seed and game mode has its own world.
- If IndexedDB is unavailable or blocked (some private windows), an in-memory backend is used
  and the pause menu says that saving is unavailable in this browser.
- Settings are separate: `localStorage` key `blockworld.settings.v1`.

## When the game saves

- every 60 seconds while playing (`AUTOSAVE_INTERVAL_SECONDS`);
- when the tab is hidden and when the page is closed;
- **Save now** in the pause menu;
- before reloading for a language change.

**New world** (pause menu, with confirmation) deletes the slot and reloads.

## Format (version 1)

```json
{
  "version": 1,
  "seed": 271828,
  "mode": "survival",
  "time": 12345,
  "player": { "x": 0.5, "y": 37, "z": 40.5, "yaw": 0, "pitch": 0, "respawn": null },
  "stats": { "health": 20, "hunger": 20, "saturation": 5, "air": 10, "exhaustion": 0 },
  "inventory": { "slots": [ ... 45 slots ... ], "hotbarIndex": 0 },
  "containers": [ { "key": "x,y,z", "state": { "kind": "chest", "slots": [ ... ] } } ],
  "entities": [ { "type": "woolback", "x": 0, "y": 0, "z": 0, "yaw": 0, "health": 10 } ],
  "chunks": { "cx,cz": "<base64 of run-length-encoded block ids>" }
}
```

- Only chunks the player changed are stored. Each is 24 576 block ids, run-length encoded as
  `(count, value)` byte pairs (runs up to 255) and base64-encoded.
- Keys are sorted and there are no timestamps, so the same state always produces the same text.
- Furnace state (`burnLeft`, `burnTotal`, `progress`) is part of the container entry.

## Loading

1. The save is parsed and passed through `migrate()`, which switches on `version`. Unknown
   versions and malformed fields raise `SaveError`; bad chunk keys are dropped and optional
   fields get defaults.
2. Stored chunks are decoded into `World.storedChunks` before any chunk is generated.
3. `Game.restore()` sets time, inventory, stats, containers, creatures, respawn point and the
   player position and view, then loads the chunks around the player.

If anything fails, the game starts a fresh world and shows a message instead of crashing.

## Adding a version

Bump `SAVE_FORMAT_VERSION` in `src/config.ts`, add a `case` to `migrate()` that converts the
older shape, and add a test to `tests/saveLoad.test.ts`.
