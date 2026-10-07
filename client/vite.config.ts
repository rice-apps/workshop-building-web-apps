import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  root: import.meta.dirname,
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "^/api/(members|projects)(?:[?]|$)": "http://127.0.0.1:8000" },
  },
  build: {
    rollupOptions: {
      input: {
        members: resolve(import.meta.dirname, "ui/members.html"),
        projects: resolve(import.meta.dirname, "ui/projects.html"),
      },
    },
  },
});
