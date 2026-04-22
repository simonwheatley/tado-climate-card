import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.ts"],
  },
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "tado-climate-card.js",
    },
    rollupOptions: {
      external: [],
    },
    outDir: "dist",
    minify: false,
  },
});
