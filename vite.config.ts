import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // "@/" points at src/, so imports never need "../" (docs/conventions-typescript.md I1).
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
