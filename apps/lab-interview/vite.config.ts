import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: '../../dist/LabInterview',
      emptyOutDir: true,
    },
    base: '/LabInterview/', // GitHub Pages 子路徑，要和 outDir 的資料夾名稱一致（沿用舊網址）
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});