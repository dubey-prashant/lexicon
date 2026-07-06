import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';

// Browser extension popup build. See vite.config.js for the default
// standalone web app build.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist-extension',
    rollupOptions: {
      input: {
        popup: fileURLToPath(new URL('./popup.html', import.meta.url)),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  base: './',
  // The dev server always serves root index.html regardless of build.input
  // (that setting only applies to `vite build`) — index.html is now the web
  // app entry, so open popup.html explicitly here to avoid confusion.
  server: {
    open: '/popup.html',
  },
});
