import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 部落格文章：放在 src/content/blog/ 底下的 .md 檔
// 每篇文章最上面的 frontmatter 必須符合這個格式
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    // true 的話只會在本機 npm run dev 時顯示，不會發佈
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
