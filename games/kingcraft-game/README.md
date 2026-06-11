# KingCraft 👑

A **3D voxel sandbox game** built with Three.js — mine, craft, build, and survive in an immersive block world!

> **Play now:** https://rashid-wep.vercel.app/games/kingcraft-game/
> **Dev blog:** https://rashid-wep.vercel.app/blog/building-kingcraft-3d-game.html

---

## 🎮 Features

| Feature | Description |
|---------|-------------|
| 🌍 **Voxel World** | Infinite procedurally generated world with chunk-based system (16×16×64) |
| 🏃 **Physics** | Full collision detection, gravity, jump, sprint, flying |
| 🖱️ **Block Interaction** | Place/break blocks via raycasting |
| 🎯 **Performance** | Instance rendering, chunk culling, 60 FPS |
| 🎛️ **Debug Tools** | F3 overlay with FPS, position, chunk data |
| 📦 **Inventory** | 9-slot hotbar, block types system |

## 🎯 Controls

| Key | Action |
|-----|--------|
| `WASD` | Move |
| `Space` | Jump (double-tap to fly) |
| `Shift` | Sprint |
| `E` | Inventory |
| `Q` | Drop item |
| `T` | Chat |
| `F` | Toggle hand |
| `V` / `F5` | Toggle perspective |
| `F3` | Debug overlay |

## 🧱 Block Types

- `0` — Air
- `1` — Grass
- `2` — Dirt  
- `3` — Stone

## 🛠️ Tech Stack

- **Three.js r160** — 3D rendering engine
- **Vanilla JavaScript** — ES Modules architecture
- **CSS3** — Minecraft-style UI (HUD, inventory, menu)

## 📁 Project Structure

```
games/kingcraft-game/
├── index.html          # Main game page
├── showcase.html       # Project showcase page
├── main.js             # Entry module
├── js/                 # Game logic modules
│   ├── world.js        # Chunk system & world gen
│   ├── player.js       # Movement & physics
│   ├── inventory.js    # Block management
│   ├── ui.js           # HUD & menus
│   └── debug.js        # F3 overlay
├── css/                # Styles
├── icons/              # PWA icons
└── manifest.json       # PWA manifest
```

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/MOT1209/mein-wep.git

# Navigate to game
cd mein-wep/games/kingcraft-game

# Start a local server (required for ES modules)
npx serve .
# OR
python -m http.server 8099

# Open in browser
# http://127.0.0.1:8099/index.html
```

> ⚠️ ES modules won't work with `file://` — use a local server!

## 📈 Roadmap

- [x] Basic world generation
- [x] Player movement & physics
- [x] Block placement/breaking
- [x] Debug overlay (F3)
- [x] PWA support
- [ ] Multiplayer (WebSocket)
- [ ] More block types (wood, leaves, water)
- [ ] World saving (IndexedDB)
- [ ] Perlin noise terrain
- [ ] Sound effects & music

## 📝 License

Part of the [Rashid Portfolio](https://github.com/MOT1209/mein-wep) — open source project.
