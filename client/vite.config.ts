import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "^/api/": "http://127.0.0.1:8000" },
  },
  build: {
    rollupOptions: {
      input: {
        members: resolve(import.meta.dirname, "members.html"),
        projects: resolve(import.meta.dirname, "projects.html"),
      },
    },
  },
});
