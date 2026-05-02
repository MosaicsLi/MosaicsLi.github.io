import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: '../LabInterview', // 👈 你想要的資料夾名稱
    },
    base: '/LabInterview/',   // 這行是給 GitHub Pages 子路徑用
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});