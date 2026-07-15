import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';

// Content script build — a separate pass from vite.config.extension.js.
// Content scripts (unlike the background service worker) can't be declared
// as ES modules in the manifest, so this must produce one self-contained
// classic-script file with no import/export at the top level.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist-extension',
    emptyOutDir: false, // don't wipe out popup/background from the other build pass
    rollupOptions: {
      input: {
        content: fileURLToPath(new URL('./src/content/index.jsx', import.meta.url)),
      },
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
