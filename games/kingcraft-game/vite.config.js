import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "./",
  build: {
    outDir: "dist",
    target: "esnext",
  },
  server: {
    port: 8099,
    open: false,
  },
});
