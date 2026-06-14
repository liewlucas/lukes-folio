/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly STORYBLOK_TOKEN?: string;
  readonly STORYBLOK_PREVIEW_TOKEN?: string;
  readonly STORYBLOK_VERSION?: "draft" | "published";
  readonly STORYBLOK_REGION?: "eu" | "us" | "ap" | "ca" | "cn";
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
