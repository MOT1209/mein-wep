import { TerrainGen } from "../world/TerrainGen.js";

let gen = null;

self.onmessage = function (e) {
  const { type } = e.data;
  if (type === "init") {
    gen = new TerrainGen(e.data.seed);
    return;
  }
  if (type === "generateChunk" && gen) {
    const { cx, cz, size } = e.data;
    const S = size;
    const blocks = new Uint8Array(S * S * 64);
    const crossBorder = [];

    gen.generateChunk(cx, cz, S, (lx, ly, lz, id) => {
      if (lx >= 0 && lx < S && lz >= 0 && lz < S && ly >= 0 && ly < 64) {
        blocks[(ly * S + lz) * S + lx] = id;
      } else {
        const wx = cx * S + lx;
        const wz = cz * S + lz;
        crossBorder.push({ wx, wy: ly, wz, id });
      }
    });

    self.postMessage(
      { type: "chunkGenerated", cx, cz, blocks, crossBorder },
      { transfer: [blocks.buffer] }
    );
  }
};
