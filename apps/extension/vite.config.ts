import { URL, fileURLToPath } from 'node:url';
import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import manifest from './manifest.json';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    react(),
    crx({ manifest }),
  ],
});
