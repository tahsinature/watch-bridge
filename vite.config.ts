import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Relative base keeps the app portable on GitHub Pages regardless of the
// repo/subpath it is served from. The app is a single page (tab-based, no
// client-side router), so relative asset URLs resolve correctly everywhere.
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
