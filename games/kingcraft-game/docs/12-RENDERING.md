# Rendering Pipeline

> **API:** Vulkan 1.3 / DirectX 12 Ultimate  
> **Shaders:** HLSL (compiled to SPIR-V)  
> **Target:** 60 FPS @ 1080p/1440p/4K

---

## 1. Render Graph

### 1.1 Pass Overview

```
FRAME START
  │
  ├── Depth Pre-Pass
  │   Purpose: Write scene depth early for Hi-Z culling
  │   Output: Depth buffer
  │   Cost: ~0.5ms
  │
  ├── G-Buffer Pass (Deferred)
  │   Purpose: Render opaque geometry to multiple render targets
  │   Targets: Albedo, Normal, PBR (roughness/metalness/AO), Position
  │   Cost: ~2.0ms
  │
  ├── Voxel G-Buffer
  │   Purpose: Chunk geometry (greedy-meshed) into G-Buffer
  │   Special: Tri-planar texturing, baked AO from vertex data
  │   Cost: ~1.5ms
  │
  ├── Shadow Map Pass (CSM)
  │   Purpose: Directional light shadow maps
  │   Cascades: 4 cascades (near→far)
  │   Resolution: 2048×2048 per cascade
  │   Cost: ~1.0ms
  │
  ├── Lighting Pass (Deferred Shading)
  │   Purpose: Compute final lighting
  │   Lights: 1 directional + 256 point lights (tiled deferred)
  │   Features: SSAO, baked GI probes
  │   Cost: ~1.5ms
  │
  ├── Forward Pass (Transparents)
  │   Purpose: Render transparent/alpha-tested geometry
  │   Features: Order-independent transparency (OIT) using per-pixel linked lists
  │   Cost: ~0.5ms
  │
  ├── Water Pass
  │   Purpose: Underwater post-processing + water surface
  │   Features: Vertex animation, reflection/refraction
  │   Cost: ~0.5ms
  │
  ├── Volumetric Fog
  │   Purpose: Fog, clouds, volumetric lighting
  │   Method: Ray-marched volume texture
  │   Cost: ~1.0ms
  │
  ├── Post-Processing
  │   Passes: Bloom → Tone Mapping → Color Grading → TAA → FXAA
  │   Cost: ~2.0ms
  │
  └── UI Overlay
      Purpose: HUD, inventory, menus
      Cost: ~0.5ms

FRAME END (Total: ~11ms → ~90 FPS budget)
```

### 1.2 Render Target Layout

```
RT0: Albedo (R8G8B8A8_UNORM)           - Color + opacity
RT1: Normal (R8G8B8A8_SNORM)           - World-space normal + roughness
RT2: PBR (R8G8B8A8_UNORM)              - Metalness, AO, emissive, sky light
RT3: Position (R16G16B16A16_FLOAT)      - World position + material ID
Depth: (D32_FLOAT)                      - Depth buffer

Swap Chain: (R8G8B8A8_UNORM or R16G16B16A16_FLOAT for HDR)
```

---

## 2. Voxel Rendering

### 2.1 Greedy Meshing Algorithm

```
For each sub-chunk (32×16×32):
  For each axis (X, Y, Z):
    For each slice perpendicular to axis:
      For each row in slice:
        Find longest run of same block type
        Merge run into single quad
        Store quad: position, size, normal, UV, AO, texture index
  
  Output: Vertex buffer + index buffer per sub-chunk
  Average compression: 95% vertex reduction vs naive meshing
  Build time: ~2ms per sub-chunk (20ms for full chunk)
```

### 2.2 LOD System

```
LOD 0: Full resolution (32×384×32 chunks)
  - Greedy meshing with full detail
  - Render distance: 0-8 chunks

LOD 1: 2×2×2 merging (16×48×16 blocks per chunk)
  - Merge 2×2×2 blocks of same type
  - Averaged normals for slopes
  - Render distance: 8-16 chunks

LOD 2: 4×4×4 merging (8×24×8 blocks per chunk)
  - Simplified geometry
  - No block entities rendered
  - Render distance: 16-32 chunks

LOD 3: 8×8×8 merging (4×12×4 blocks per chunk)
  - Terrain silhouette only
  - Billboard/impostor rendering
  - Render distance: 32-64 chunks

LOD TRANSITION:
  - Distance-based blending between LOD levels
  - Vertex morphing to prevent "pop-in"
  - 2 chunk overlap zone for smooth transition
```

### 2.3 Frustum Culling

```
- Hierarchical Z-buffer occlusion culling
- Per-chunk bounding box test against view frustum
- Per-sub-chunk occlusion test (read back Hi-Z from previous frame)
- Entity culling: per-entity bounding sphere test
- Average culling rate: 70-90% of chunks culled
```

---

## 3. Lighting System

### 3.1 Light Types

```
Directional Light (Sun/Moon):
  - Cascaded Shadow Maps (4 cascades, 2048×2048 each)
  - Shadow bias based on slope
  - PCF filtering (4×4 samples)
  - Contact hardening shadows

Point Lights (Torches, Lamps, Turrets):
  - Tiled deferred shading (256 lights max)
  - 3D clustered light culling
  - IES profiles for realistic falloff
  - Dynamic range: 0-15 block radius

Ambient Light:
  - Baked ambient occlusion (vertex-level)
  - Sky light contribution (hemispherical)
  - Indirect light from GI probes
  - Minimum ambient: 0.02 (prevents full-black)

Emissive Light:
  - From block luminance values (0-15)
  - Bloom contribution from bright emissives
  - No shadow casting from emissives
```

### 3.2 Voxel Light Propagation

```
SKY LIGHT (sun/moon):
  - Propagated from top of world downward
  - Attenuates through transparent blocks (glass: 3, water: 3)
  - Attenuates by 1 per block through air
  - Recalculated on block changes only (flood fill)

BLOCK LIGHT (torches, etc.):
  - Emitted from luminance sources (0-15)
  - Propagated outward by flood fill
  - Attenuates by 1 per block
  - Through transparent blocks: same as opaque (no attenuation bonus)
  - Recalculated when source added/removed

LIGHT UPDATES:
  - Dirty queue: blocks that changed light
  - Process 1024 updates per tick max
  - Priority: near player first
  - Average update: 5ms for full recalc of one chunk
```

---

*End of Rendering Pipeline Document*

Next: [Physics System →](./13-PHYSICS.md)
