import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Human-Benchmark/',   // NAMA REPO
  build: {
    outDir: 'docs',            // SESUAI GITHUB PAGES
  },
  plugins: [react()],
})
