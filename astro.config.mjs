// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 網站設定：https://docs.astro.build/zh-tw/reference/configuration-reference/
export default defineConfig({
  site: 'https://mosaicsli.github.io',
  integrations: [sitemap()],
  vite: {
    // ffmpeg.wasm 自己會開 Web Worker，不能被 Vite 預先打包，否則開發模式會載入失敗
    optimizeDeps: { exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'] },
  },
});
