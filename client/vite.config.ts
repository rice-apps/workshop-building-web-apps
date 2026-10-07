import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  root: import.meta.dirname,
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "^/api/(members|projects)(?:[?]|$)": "http://localhost:8000" },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        members: resolve(import.meta.dirname, "ui/members.html"),
        projects: resolve(import.meta.dirname, "ui/projects.html"),
      },
    },
  },
});
