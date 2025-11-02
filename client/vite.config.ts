import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9991,
    strictPort: true,
    open: true,
    hmr: {
      overlay: true,
    },
  },
  clearScreen: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  optimizeDeps: {
    force: true, // Force dependency pre-bundling
  },
})