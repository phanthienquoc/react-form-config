import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ReactFormConfig",
      formats: ["es", "cjs"],
      fileName: (format) => format === "es" ? "index.js" : "index.cjs",
      cssFileName: "styles",
    },
    rollupOptions: {
      external: [
        /^react(?:\/.*)?$/,
        /^react-dom(?:\/.*)?$/,
        /^@hookform\/resolvers(?:\/.*)?$/,
        /^@tanstack\/react-query(?:\/.*)?$/,
        "react-hook-form",
        "zod",
      ],
    },
  },
});
