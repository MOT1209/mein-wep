# Baseline Audit — Block World

Date: 2026-10-16
Auditor: Block World engineering (AI-assisted)
Repository: `C:\Users\aihmo\Downloads\kingcraft1`
Git state at audit: **no repository** (directory existed, no `.git`, no files).

## 1. Repository inventory

| Item                         | State at audit |
| ---------------------------- | -------------- |
| Files                        | none           |
| README / docs                | none           |
| Dependency manifest          | none           |
| Tests                        | none           |
| CI configuration             | none           |
| Existing assets              | none           |
| Existing engine / code       | none           |
| Local git history            | none           |

The directory was **empty**. There is no prior work to preserve.

## 2. Environment

| Tool          | Version / status                  |
| ------------- | --------------------------------- |
| OS            | Windows (win32), PowerShell 5.1   |
| Node.js       | v24.19.0                          |
| npm           | 11.17.0                           |
| Godot         | not installed                     |
| Unity         | Unity Hub launcher only, no project/editor workflow available headless |
| Blender       | not installed                     |
| Network       | available (npm registry reachable) |

## 3. Engine decision

Requirements driving the choice: 3D voxel rendering, mobile **and** desktop input targets,
world persistence, low distribution friction, headless-testable logic, fast iterative
verification in this environment, permissive licensing.

| Candidate       | Strengths                                        | Blockers in this environment |
| --------------- | ------------------------------------------------ | ---------------------------- |
| Godot 4         | Excellent voxel-friendly 3D, mobile export       | Not installed; GDScript/C# toolchain absent; headless verification of gameplay logic would require the editor binary |
| Unity           | Mature 3D, mobile export                         | No usable license/editor project flow here; heavy install; difficult headless verification |
| **Web (Three.js + TypeScript + Vite)** | Runs on desktop and mobile browsers from one codebase; touch and mouse/pointer-lock inputs are first-class; IndexedDB persistence; TypeScript logic is unit-testable with Vitest headlessly; zero licensing cost; trivial distribution (static hosting) | Renderer ceilings on very weak GPUs; mitigated with chunked rendering, distance culling and quality settings |

**Decision: browser-based 3D engine — Three.js 0.168 + TypeScript 5.6 + Vite 5.4, tested with Vitest 2.4.**

Justification: it is the only candidate that is fully installable, runnable and verifiable
in this environment today, satisfies both mobile and desktop targets from one codebase, and
keeps all game logic in plain TypeScript that can be unit tested without a GPU.

Trade-offs accepted:
- No native console/mobile-store export in v1; web distribution only (documented as future work).
- WebGL draw-call budget is smaller than native; the architecture (chunk meshing, face
  culling, greedy-style merging of per-chunk geometry, fog-limited render distance) is
  designed around that constraint.

## 4. Technical risks identified

1. **Chunk meshing performance** — mitigated by face-culled meshing into one buffer per
   chunk per render pass, background generation in idle slices.
2. **Memory growth from chunk data** — chunk unload beyond a configurable radius, block
   data in `Uint8Array`s, no per-block objects.
3. **Lighting correctness across chunk borders** — flood-fill light engine with
   cross-chunk propagation queues; covered by tests.
4. **Save integrity** — versioned save format, atomic-ish write pattern via IndexedDB
   transactions, migration path, backup of previous version.
5. **Mobile thermal/battery** — quality presets, capped render distance, reduced
   particle counts, capped device pixel ratio.
6. **Input divergence (touch vs. pointer-lock)** — separate control modules sharing a
   single `PlayerIntent` interface consumed by the movement controller.

## 5. Smallest playable milestone (Phase 1 exit criteria)

A browser window where:

- A procedurally generated voxel world renders (1 biome minimum, deterministic by seed).
- The player can walk, jump, look around with pointer lock (desktop) and touch controls (mobile).
- Blocks can be broken with mining progress and placed from a hotbar.
- A debug overlay shows FPS, position and chunk stats.

This milestone is implemented first, then extended phase by phase per `docs/ROADMAP.md`.

## 6. Current status summary

| Area                        | Status      |
| --------------------------- | ----------- |
| Engine decision             | done        |
| Project scaffold            | done        |
| Baseline audit              | this file   |
| Roadmap                     | `docs/ROADMAP.md` |
| REA integration assessment  | `docs/REA_INTEGRATION.md` (REA not installed; optional, non-blocking) |
| Content research            | `docs/CONTENT_RESEARCH.md` |
| Implementation              | in progress — see `docs/CHANGELOG.md` |
