import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';

// Standalone web app build (the default target: `npm run dev` / `build`).
// See vite.config.extension.js for the browser extension popup build.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        web: fileURLToPath(new URL('./index.html', import.meta.url)),
      },
    },
  },
  base: '/',
});
