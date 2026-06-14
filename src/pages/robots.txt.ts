import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const site = context.site?.toString().replace(/\/$/, "") ?? "https://liewlucass.com";
  const body = `User-agent: *
Allow: /

Sitemap: ${site}/sitemap-index.xml
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
