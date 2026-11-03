import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    sourcemap: false,
    chunkSizeWarningLimit: 1500
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: false
  }
});
