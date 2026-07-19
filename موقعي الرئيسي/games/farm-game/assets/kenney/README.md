# Kenney Assets — Farm Game

## Downloaded Assets

### 1. Tiny Farm (132 tiles, 16x16)
- **Path**: `kenney/kenney_tiny-farm/`
- **Tiles**: `Tiles/tile_0000.png` to `tile_0131.png` (16x16 px each)
- **Tilemap**: `Tilemap/tilemap.png`, `tilemap_packed.png`
- **Tilesheet Info**: 12 columns × 11 rows, 1px spacing
- **License**: CC0 (free for any use)
- **Contents**: Farm crops, soil, grass, water, paths, fences, buildings, animals

### 2. UI Pack
- **Path**: `kenney/kenney_ui-pack/`
- **PNG**: `PNG/{Blue,Green,Grey,Red,Yellow}/` — buttons, sliders, panels, icons
- **Vector**: `Vector/` — SVG versions
- **Font**: `Font/` — UI font
- **Sounds**: `Sounds/` — UI sound effects
- **License**: CC0

### 3. Toon Characters
- **Path**: `kenney/kenney_toon-characters/`
- **Characters**: Male person, Female person, Male adventurer, Female adventurer, Robot, Zombie
- **Formats**: PNG Poses (HD + SD), Tilesheet, Vector (SVG)
- **Animations**: attack, walk, idle, cheer, etc.
- **License**: CC0

### 4. Nature Kit (322 files)
- **Path**: `kenney/kenney_nature-kit/`
- **Side view PNGs**: trees, grass, flowers, rocks, water, bridges, cliffs
- **Isometric**: 3D isometric versions
- **Models**: 3D model files
- **License**: CC0

## How to Use in Game

### Tile Maps (Tiny Farm)
```javascript
// Load tilesheet as sprite atlas
const tilesheet = new THREE.TextureLoader().load('assets/kenney/kenney_tiny-farm/Tilemap/tilemap_packed.png');
// Tile size: 16x16, spacing: 1px
// Atlas: 12 columns × 11 rows
```

### Characters (Toon Characters)
```javascript
// Use tilesheet for animation
const characterSheet = new THREE.TextureLoader().load(
  'assets/kenney/kenney_toon-characters/Male person/Tilesheet/character_malePerson_sheetHD.png'
);
// XML data available for frame definitions
```

### UI Elements (UI Pack)
```javascript
// Buttons, panels, icons available in PNG/{color}/
const button = new THREE.TextureLoader().load('assets/kenney/kenney_ui-pack/PNG/Green/button.png');
```

### Nature Decorations (Nature Kit)
```javascript
// Trees, grass, flowers for world decoration
const tree = new THREE.TextureLoader().load('assets/kenney/kenney_nature-kit/Side/tree_default.png');
```

## Missing Assets (Not Available on Kenney)
- **Toon Tiles**: URL `toon-tiles-1` does not exist on Kenney. Use Tiny Farm tiles instead.
- **Village Kit**: URL `village-kit` does not exist on Kenney. Use Nature Kit + Tiny Farm buildings.

## Alternative Sources (itch.io)
For additional assets not found on Kenney:
- https://kenney.itch.io/kenney-game-assets (All-in-1 bundle)
- Search itch.io for: "farm game assets", "pixel art tiles", "RPG characters"
