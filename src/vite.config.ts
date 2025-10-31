import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Correct configuration for Netlify builds
export default defineConfig({
  plugins: [react()],
  base: './', // ensures relative paths
  build: {
    outDir: 'dist', // Netlify looks for this folder
  },
})
