// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { storyblok } from "@storyblok/astro";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV ?? "", process.cwd(), "");

const STORYBLOK_TOKEN =
  env.STORYBLOK_PREVIEW_TOKEN || env.STORYBLOK_TOKEN || "";

const SITE_URL = env.PUBLIC_SITE_URL || "https://liewlucass.com";

/**
 * Storyblok is only wired up when a token exists. Without one the site builds
 * entirely from local fallback content (see src/lib/content.ts), so a fresh
 * clone runs with zero credentials.
 */
const storyblokIntegration = STORYBLOK_TOKEN
  ? [
      storyblok({
        accessToken: STORYBLOK_TOKEN,
        bridge: true,
        apiOptions: { region: env.STORYBLOK_REGION || "eu" },
        components: {
          // map Storyblok block "component" names -> Astro components
          page: "storyblok/Page",
          hero: "storyblok/blocks/Hero",
          text: "storyblok/blocks/Text",
          richtext: "storyblok/blocks/RichText",
          image: "storyblok/blocks/Image",
          image_pair: "storyblok/blocks/ImagePair",
          gallery: "storyblok/blocks/Gallery",
          quote: "storyblok/blocks/Quote",
          process_section: "storyblok/blocks/ProcessSection",
          outcome: "storyblok/blocks/Outcome",
          external_link: "storyblok/blocks/ExternalLink",
          tech_stack: "storyblok/blocks/TechStack",
          featured_projects: "storyblok/blocks/FeaturedProjects",
          latest_posts: "storyblok/blocks/LatestPosts",
          callout: "storyblok/blocks/Callout",
        },
      }),
    ]
  : [];

export default defineConfig({
  site: SITE_URL,
  output: "static",
  adapter: cloudflare({
    imageService: "compile",
    platformProxy: { enabled: true },
  }),
  integrations: [...storyblokIntegration, sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
