// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 網站設定：https://docs.astro.build/zh-tw/reference/configuration-reference/
export default defineConfig({
  site: 'https://mosaicsli.github.io',
  integrations: [sitemap()],
});
