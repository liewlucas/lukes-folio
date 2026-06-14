export interface SeoInput {
  title: string;
  description?: string;
  /** absolute or root-relative path of the current page */
  path?: string;
  /** OG image URL (absolute preferred) */
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  type: "website" | "article";
  publishedTime?: string;
  noindex: boolean;
}

const SITE_NAME = "Lucas Liew";
const DEFAULT_DESCRIPTION =
  "Editorial archive of brand & product design work, notes, and experiments by Lucas Liew.";

export function siteUrl(): string {
  return import.meta.env.PUBLIC_SITE_URL || "https://liewlucass.com";
}

/** Build a fully-resolved SEO meta object for a page. */
export function buildSeo(input: SeoInput): SeoMeta {
  const base = siteUrl().replace(/\/$/, "");
  const path = input.path ?? "/";
  const canonical = new URL(path, base + "/").toString();

  const title =
    input.title === SITE_NAME ? SITE_NAME : `${input.title} — ${SITE_NAME}`;

  let image = input.image;
  if (image && !image.startsWith("http")) {
    image = new URL(image, base + "/").toString();
  }

  return {
    title,
    description: input.description?.trim() || DEFAULT_DESCRIPTION,
    canonical,
    image,
    type: input.type ?? "website",
    publishedTime: input.publishedTime,
    noindex: input.noindex ?? false,
  };
}

export { SITE_NAME, DEFAULT_DESCRIPTION };
