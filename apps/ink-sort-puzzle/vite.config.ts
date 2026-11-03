import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: '/ink-sort-puzzle/', // GitHub Pages 子路徑，要和 outDir 的資料夾名稱一致
  build: {
    outDir: '../../dist/ink-sort-puzzle',
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})