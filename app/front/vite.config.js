import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // La racine est l'endroit où se trouve vite.config.js (qui est /app dans le Docker)
  base: '/',
  build: {
    outDir: 'dist',
  },
});
