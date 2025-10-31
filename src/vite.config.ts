import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ fixes MIME error on Netlify
  build: {
    outDir: 'build', // ✅ Netlify detects this easily
  },
})
