import { fileURLToPath, URL } from "node:url";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // All /api/* requests go to the unified backend (port 5000).
      // This covers both vinay-temp routes (/api/login, /api/projects, etc.)
      // and keshava routes (/api/keshava/publications, /api/keshava/auth/*, etc.)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
