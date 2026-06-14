import type { Post, Project, SiteSettings } from "./types";
import {
  hasStoryblok,
  sbProjects,
  sbProject,
  sbPosts,
  sbPost,
  sbSettings,
} from "./storyblok";

import projectsFallback from "../data/fallback/projects.json";
import notesFallback from "../data/fallback/notes.json";
import settingsFallback from "../data/fallback/settings.json";

const fallbackProjects = projectsFallback as Project[];
const fallbackPosts = notesFallback as Post[];
const fallbackSettings = settingsFallback as SiteSettings;

const byDateDesc = (a: Post, b: Post) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

/**
 * Public content API. Reads Storyblok when a token is configured, otherwise
 * serves local fallback content so a fresh clone runs with zero credentials.
 * Every CMS call is guarded so a failed fetch degrades to fallback rather than
 * breaking the build.
 */

export async function getSettings(): Promise<SiteSettings> {
  if (hasStoryblok()) {
    const settings = await sbSettings().catch(() => undefined);
    if (settings) return settings;
  }
  return fallbackSettings;
}

export async function getProjects(): Promise<Project[]> {
  if (hasStoryblok()) {
    const projects = await sbProjects().catch(() => []);
    if (projects.length) return projects;
  }
  return fallbackProjects;
}

export async function getProject(slug: string): Promise<Project | undefined> {
  if (hasStoryblok()) {
    const project = await sbProject(slug).catch(() => undefined);
    if (project) return project;
  }
  return fallbackProjects.find((p) => p.slug === slug);
}

export async function getPosts(): Promise<Post[]> {
  let posts: Post[] = fallbackPosts;
  if (hasStoryblok()) {
    const fetched = await sbPosts().catch(() => []);
    if (fetched.length) posts = fetched;
  }
  return [...posts].sort(byDateDesc);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  if (hasStoryblok()) {
    const post = await sbPost(slug).catch(() => undefined);
    if (post) return post;
  }
  return fallbackPosts.find((p) => p.slug === slug);
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const projects = await getProjects();
  const featured = projects.filter((p) => p.featured);
  return (featured.length ? featured : projects).slice(0, limit);
}

export async function getLatestPosts(limit = 3): Promise<Post[]> {
  return (await getPosts()).slice(0, limit);
}

/** Format an ISO date as a readable editorial date label. */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
