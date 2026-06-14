import { useStoryblokApi, renderRichText } from "@storyblok/astro";
import type { ImageRef, Post, Project, SiteSettings } from "./types";

/** Resolved content version for the current build/runtime. */
export function storyblokVersion(): "draft" | "published" {
  const v = import.meta.env.STORYBLOK_VERSION;
  return v === "published" ? "published" : "draft";
}

export function hasStoryblok(): boolean {
  return Boolean(
    import.meta.env.STORYBLOK_TOKEN || import.meta.env.STORYBLOK_PREVIEW_TOKEN,
  );
}

type SbAsset = { filename?: string; alt?: string } | null | undefined;
type SbStory<T> = { slug: string; content: T };

function toImage(asset: SbAsset): ImageRef | null {
  if (!asset || !asset.filename) return null;
  return { src: asset.filename, alt: asset.alt ?? "" };
}

function toStack(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string")
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

function rich(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  try {
    return renderRichText(value as never) ?? "";
  } catch {
    return "";
  }
}

function mapProject(story: SbStory<Record<string, any>>): Project {
  const c = story.content;
  return {
    title: c.title ?? story.slug,
    slug: story.slug,
    subtitle: c.subtitle ?? "",
    year: String(c.year ?? ""),
    role: c.role ?? "",
    stack: toStack(c.stack),
    cover_image: toImage(c.cover_image),
    summary: c.summary ?? "",
    problem_html: rich(c.problem),
    process_html: rich(c.process),
    outcome_html: rich(c.outcome),
    gallery: Array.isArray(c.gallery)
      ? c.gallery.map(toImage).filter((i: ImageRef | null): i is ImageRef => !!i)
      : [],
    featured: Boolean(c.featured),
    external_url: c.external_url?.url || c.external_url || null,
    github_url: c.github_url?.url || c.github_url || null,
  };
}

function mapPost(story: SbStory<Record<string, any>>): Post {
  const c = story.content;
  return {
    title: c.title ?? story.slug,
    slug: story.slug,
    date: c.date ?? "",
    category: c.category ?? "Notes",
    excerpt: c.excerpt ?? "",
    cover_image: toImage(c.cover_image),
    body_html: rich(c.body),
    related_project:
      typeof c.related_project === "string" ? c.related_project : null,
    featured: Boolean(c.featured),
  };
}

async function fetchStories(startsWith: string) {
  const api = useStoryblokApi();
  const { data } = await api.get("cdn/stories", {
    version: storyblokVersion(),
    starts_with: startsWith,
    per_page: 100,
  });
  return data.stories as SbStory<Record<string, any>>[];
}

async function fetchStory(slug: string) {
  const api = useStoryblokApi();
  const { data } = await api.get(`cdn/stories/${slug}`, {
    version: storyblokVersion(),
  });
  return data.story as SbStory<Record<string, any>>;
}

export async function sbProjects(): Promise<Project[]> {
  return (await fetchStories("work/")).map(mapProject);
}

export async function sbProject(slug: string): Promise<Project | undefined> {
  const story = await fetchStory(`work/${slug}`).catch(() => undefined);
  return story ? mapProject(story) : undefined;
}

export async function sbPosts(): Promise<Post[]> {
  return (await fetchStories("notes/")).map(mapPost);
}

export async function sbPost(slug: string): Promise<Post | undefined> {
  const story = await fetchStory(`notes/${slug}`).catch(() => undefined);
  return story ? mapPost(story) : undefined;
}

export async function sbSettings(): Promise<SiteSettings | undefined> {
  const story = await fetchStory("settings").catch(() => undefined);
  if (!story) return undefined;
  const c = story.content;
  return {
    site_title: c.site_title ?? "Lucas Liew",
    intro_line: c.intro_line ?? "",
    navigation: Array.isArray(c.navigation)
      ? c.navigation.map((n: any) => ({
          label: n.label ?? "",
          href: n.href?.cached_url ? `/${n.href.cached_url}` : n.href ?? "/",
        }))
      : [],
    social_links: Array.isArray(c.social_links)
      ? c.social_links.map((s: any) => ({
          label: s.label ?? "",
          url: s.url?.url || s.url || "#",
        }))
      : [],
    footer_text: c.footer_text ?? "",
    email: c.email ?? "",
  };
}
