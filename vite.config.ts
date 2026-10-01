import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { recipeProxy } from "./recipe-proxy.ts";

export default defineConfig({
  plugins: [react(), recipeProxy()],
  // "@/" points at src/, so imports never need "../" (docs/conventions-typescript.md I1).
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
