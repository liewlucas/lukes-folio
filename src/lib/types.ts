/** Normalized content shapes used across the site, independent of source
 *  (Storyblok or local fallback). Rich fields arrive as pre-rendered HTML. */

export interface ImageRef {
  src: string;
  alt: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  site_title: string;
  intro_line: string;
  navigation: NavItem[];
  social_links: SocialLink[];
  footer_text: string;
  email: string;
}

export interface Project {
  title: string;
  slug: string;
  subtitle: string;
  year: string;
  role: string;
  stack: string[];
  cover_image: ImageRef | null;
  summary: string;
  /** pre-rendered HTML */
  problem_html: string;
  process_html: string;
  outcome_html: string;
  gallery: ImageRef[];
  featured: boolean;
  external_url: string | null;
  github_url: string | null;
}

export interface Post {
  title: string;
  slug: string;
  /** ISO date string */
  date: string;
  category: string;
  excerpt: string;
  cover_image: ImageRef | null;
  /** pre-rendered HTML */
  body_html: string;
  related_project: string | null;
  featured: boolean;
}

export type ThemeVariant = "linen" | "red" | "dark" | "minimal";
