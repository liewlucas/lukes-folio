import type { ImageRef } from "./types";

interface ImageOptions {
  width?: number;
  height?: number;
  /** focal/smart cropping */
  smart?: boolean;
  quality?: number;
  format?: "webp" | "avif" | "png" | "jpeg" | "original";
}

const isStoryblokAsset = (src: string) => src.includes("a.storyblok.com");

/**
 * Storyblok Image Service URL builder.
 * Non-Storyblok sources (local/remote fallbacks) are returned untouched.
 * Docs: https://www.storyblok.com/docs/image-service
 */
export function storyblokImage(src: string, opts: ImageOptions = {}): string {
  if (!src || !isStoryblokAsset(src)) return src;

  const { width = 0, height = 0, smart = true, quality, format = "webp" } = opts;
  const dimensions = `${width}x${height}`;
  const filters: string[] = [];
  if (format !== "original") filters.push(`format(${format})`);
  if (quality) filters.push(`quality(${quality})`);

  const filterStr = filters.length ? `/filters:${filters.join(":")}` : "";
  const cropStr = smart ? "/smart" : "";
  return `${src}/m/${dimensions}${cropStr}${filterStr}`;
}

/** Build a responsive srcset from a Storyblok asset. */
export function storyblokSrcset(
  src: string,
  widths: number[] = [480, 768, 1080, 1600],
): string | undefined {
  if (!isStoryblokAsset(src)) return undefined;
  return widths
    .map((w) => `${storyblokImage(src, { width: w })} ${w}w`)
    .join(", ");
}

/** Convenience: optimized cover for cards/heroes. */
export function cover(image: ImageRef | null, width = 1080): ImageRef | null {
  if (!image) return null;
  return { ...image, src: storyblokImage(image.src, { width }) };
}
