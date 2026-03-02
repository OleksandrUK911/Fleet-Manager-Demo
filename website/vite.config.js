import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE is injected by GitHub Actions deploy workflow as '/Fleet-Manager-Demo/'
// for GitHub Pages. Locally and on a custom domain it stays '/'.
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
