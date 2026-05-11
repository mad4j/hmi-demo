import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Set base to '/hmi-demo/' for GitHub Pages deployment (repo name sub-path).
  // Override with VITE_BASE env variable if deploying elsewhere.
  base: process.env.VITE_BASE ?? '/hmi-demo/',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
