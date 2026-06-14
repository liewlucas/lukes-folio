import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts } from "@lib/content";
import { SITE_NAME, DEFAULT_DESCRIPTION } from "@lib/seo";

export async function GET(context: APIContext) {
  const posts = await getPosts();
  const site = context.site ?? new URL("https://liewlucass.com");

  return rss({
    title: `${SITE_NAME} — Notes`,
    description: DEFAULT_DESCRIPTION,
    site,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt,
      pubDate: post.date ? new Date(post.date) : undefined,
      link: `/notes/${post.slug}/`,
      categories: post.category ? [post.category] : undefined,
    })),
    customData: `<language>en</language>`,
  });
}
