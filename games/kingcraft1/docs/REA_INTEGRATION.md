# REA Integration Assessment — Block World

Date of assessment: 2026-10-16

## What REA is (verified from official sources)

REA ("Reverse Engineer Anything") is an MCP server + CLI (`rea-agents` npm package)
published by `morluto/rea` (MIT). It connects AI agents to tools that inspect:

- Native binaries (via Hopper, Ghidra or IDA providers)
- JavaScript / Electron applications (static analysis, no native engine needed)
- .NET assemblies, Android APKs, Flutter apps, WASM, EVM bytecode, SQLite databases
- Websites (browser observation), network captures, packet captures, process runs

Sources verified:
- https://github.com/morluto/rea (README, installation docs)
- https://rea.tools/ (official site)
- https://skills.sh/morluto/rea/reverse-engineer-anything (agent skill)

## Local availability check (2026-10-16)

| Check | Result |
| ----- | ------ |
| `rea` on PATH | **not found** |
| Global npm install | **not present** |
| REA MCP server registered in this environment | **no** |
| Node.js version | v24.19.0 — satisfies REA requirement (24.x ≥ 24.11) |

**Conclusion: REA is not installed and not configured in this environment.**

## Decision for this project

REA is **optional and non-blocking** for Block World. Rationale:

1. Block World is an **original game** built from scratch. The workflow guidance for this
   project explicitly prohibits copying Minecraft source code, proprietary assets or
   protected content, so there is no need to reverse engineer a target binary to
   reproduce private algorithms. Gameplay mechanics are implemented from public
   documentation, public knowledge of the genre, and original design.
2. Where a reference behavior genuinely needs investigation, the permitted research
   workflow applies: public docs, release notes, authorized observation, public APIs.
   REA would be one possible tool for that investigation, but only where a locally
   installed, authorized target exists.
3. Installing REA would modify the user's agent configuration (MCP registration).
   Per project execution rules, configuration changes require explicit user review and
   approval, so it is not performed unprompted.

## If REA installation is later desired (documented, not performed)

1. Run `npx rea-agents setup` and review the proposed agent/config changes before approving.
2. Backups of existing agent configuration are created by REA's setup; verify they exist.
3. Restart the agent session afterwards.
4. For native analysis a provider (Hopper/Ghidra/IDA) must be installed separately.
   Static JavaScript and .NET analysis needs no native provider.
5. Test with a read-only command such as `npx -y rea-agents@latest --help` before use.

## Safe usage constraints committed to by this project

- Only targets the user owns or is authorized to examine are ever analyzed.
- No DRM, anti-cheat, authentication or licensing circumvention.
- No extraction of proprietary assets for reuse in Block World.
- All REA findings, when any exist, would be recorded in `docs/CONTENT_RESEARCH.md`
  with date/source/evidence and clearly separated from hypotheses.

## Alternative research methods in use

When gameplay research is needed, this project relies on:

- Official game announcements, changelogs and release notes (recorded in
  `docs/CONTENT_RESEARCH.md` with dates and sources).
- Public technical articles and academic papers on procedural generation, voxel
  rendering and flood-fill lighting.
- Original design decisions documented in `docs/WORLD_GENERATION.md` and
  `docs/ARCHITECTURE.md`.
