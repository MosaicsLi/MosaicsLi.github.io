import { getCollection } from 'astro:content';

// 取得要顯示的文章：正式發佈時排除草稿，並依日期由新到舊排序
export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
