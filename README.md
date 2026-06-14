# liewlucass.com

A design-led personal portfolio for **Lucas Liew** — a warm editorial archive
(linen texture, deep oxblood red, expressive italic serif display) rather than a
generic developer portfolio. Think *brand-designer archive / printed summer zine
/ living notebook*.

The site runs entirely on **local fallback content out of the box** and switches
to **Storyblok** the moment a token is provided. It's static-first and deploys to
**Cloudflare Workers**.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | [Astro](https://astro.build) (static-first) |
| Language | TypeScript |
| CMS | [Storyblok](https://www.storyblok.com) (optional — falls back to local content) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) + custom CSS for texture/type |
| Fonts | DM Serif Display (display italic) + Inter (utility/body), via Google Fonts (OFL) |
| Deploy | Cloudflare Workers (`@astrojs/cloudflare` adapter + Wrangler) |
| Package manager | pnpm |

---

## Local setup

```bash
pnpm install
pnpm dev          # http://localhost:4321
```

No credentials are required — the site builds from `src/content/fallback/`.

### Commands

```bash
pnpm dev          # local dev server
pnpm build        # production build -> dist/
pnpm preview      # serve the built Worker locally via Wrangler
pnpm deploy       # build + deploy to Cloudflare Workers
pnpm astro -- ... # run any Astro CLI command
```

---

## Environment variables

Copy `.env.example` to `.env` and fill in as needed:

```txt
STORYBLOK_TOKEN=          # published delivery token (production)
STORYBLOK_PREVIEW_TOKEN=  # draft/preview token (Visual Editor)
STORYBLOK_VERSION=draft   # "draft" while editing, "published" for production
STORYBLOK_REGION=eu       # eu | us | ap | ca | cn
PUBLIC_SITE_URL=https://liewlucass.com
```

**Content source resolution** (`src/lib/content.ts`):

- **No token** → local fallback content. A fresh clone just works.
- **Token present** → fetches from Storyblok; if a fetch fails or returns
  nothing, it silently falls back to local content so the build never breaks.

---

## Storyblok setup

1. Create a Storyblok space.
2. Copy the **preview** and **public** tokens into `.env`.
3. Create the content types and folders below.
4. Set the Visual Editor preview URL to `https://localhost:4321/` (dev) or your
   deployed URL.

### Folders / slugs

| Content | Slug pattern | Example |
|---|---|---|
| Projects | `work/<slug>` | `work/gulabi-mango` |
| Notes | `notes/<slug>` | `notes/fonts-that-feel-like-summer` |
| Site settings | `settings` | `settings` |
| Flexible pages | any (`page` content type) | `home`, `about` |

### Content models

**Page** — `title`, `seo_title`, `seo_description`, `body` (blocks),
`theme_variant` (`linen` \| `red` \| `dark` \| `minimal`).

**Project** — `title`, `slug`, `subtitle`, `year`, `role`, `stack` (multi/CSV),
`cover_image` (asset), `summary`, `problem` (richtext), `process` (richtext),
`outcome` (richtext), `gallery` (multi-asset), `featured` (boolean),
`external_url`, `github_url`.

**Post** — `title`, `slug`, `date`, `category`, `excerpt`, `cover_image`,
`body` (richtext), `related_project` (project slug), `featured` (boolean).

**Site Settings** — `site_title`, `intro_line`, `navigation` (blocks of
`{label, href}`), `social_links` (blocks of `{label, url}`), `footer_text`,
`email`.

### Reusable blocks

Astro components for each Storyblok block live in `src/storyblok/blocks/` and are
mapped by name in `astro.config.mjs`:

`hero`, `text`, `richtext`, `image`, `image_pair`, `gallery`, `quote`,
`process_section`, `outcome`, `external_link`, `tech_stack`,
`featured_projects`, `latest_posts`, `callout`.

Images use the **Storyblok Image Service** (`src/lib/image.ts`) for responsive
`srcset` + WebP. Local/fallback images pass through untouched.

> The Storyblok integration (and the Visual Editor bridge) is only registered
> when a token is present, so a credential-free build has zero CMS overhead.

---

## Cloudflare Workers deployment

The build produces static assets **plus** a small Worker entry
(`dist/_worker.js/index.js`) via `@astrojs/cloudflare`. `wrangler.toml` is
preconfigured; `public/.assetsignore` keeps the Worker code out of the public
asset bundle.

### One-time

```bash
pnpm dlx wrangler login
pnpm deploy            # astro build && wrangler deploy
```

### Connect the GitHub repo (CI deploys)

1. Cloudflare dashboard → **Workers & Pages → Create → Connect to Git**.
2. Pick this repo. Build command: `pnpm build`. Deploy command: `wrangler deploy`.
3. Add environment variables under **Settings → Variables & Secrets**
   (`STORYBLOK_TOKEN`, `STORYBLOK_VERSION=published`, `STORYBLOK_REGION`,
   `PUBLIC_SITE_URL`). Use **Secrets** for tokens.

### Connect liewlucass.com

1. Add the domain as a zone in Cloudflare (update nameservers).
2. In the Worker → **Settings → Domains & Routes → Add custom domain** →
   `liewlucass.com`. (Or uncomment the `[[routes]]` block in `wrangler.toml`.)

### Rebuild on Storyblok publish

1. Cloudflare → Worker → **Deploy Hooks** (or CI provider) → create a hook URL.
2. Storyblok → **Settings → Webhooks → Story published/unpublished** → paste the
   hook URL. Publishing content now triggers a fresh deploy.

```txt
Storyblok publish ──webhook──▶ Cloudflare deploy hook ──▶ build ──▶ liewlucass.com
```

---

## Updating content

- **With Storyblok:** edit in the Visual Editor and publish. The webhook (above)
  redeploys. Set `STORYBLOK_VERSION=published` in production.
- **Without Storyblok:** edit the JSON in `src/content/fallback/` and redeploy.

---

## Project structure

```txt
src/
  components/
    global/   Nav, Footer, Seo, Texture
    ui/       Label, Rule, Cover, PageHeader
    work/     ProjectCard
    notes/    NoteCard
  layouts/    BaseLayout, ProjectLayout, PostLayout
  lib/        content.ts (public API), storyblok.ts, image.ts, seo.ts, types.ts
  pages/      index, work/[…], notes/[…], about, contact, lab, 404,
              robots.txt.ts, notes/rss.xml.ts
  storyblok/  Page.astro + blocks/* (CMS block components)
  styles/     globals.css (design system), texture.css
  data/
    fallback/ projects.json, notes.json, settings.json
public/       favicon.svg, .assetsignore
```

---

## Design system

Tokens live in `src/styles/globals.css` under `@theme` (usable as Tailwind
utilities and CSS vars):

`--color-linen`, `--color-paper`, `--color-ink-red`, `--color-wine`,
`--color-muted`, `--color-rule`, `--color-dark`, plus custom easing curves
(`--ease-out`, `--ease-in-out`, `--ease-drawer`).

Interaction polish follows a few rules: custom ease-out curves (never `ease-in`),
`scale(0.97)` press feedback, entrances from `translateY` via `@starting-style`
(never `scale(0)`), hover gated behind `(hover: hover)`, and a full
`prefers-reduced-motion` fallback.

---

## SEO

Per-page title/description, OpenGraph + Twitter cards, canonical URLs, a
generated sitemap (`/sitemap-index.xml`), an RSS feed for notes
(`/notes/rss.xml`), `robots.txt`, and a themed 404.

---

## Known limitations

- **Fallback covers are typographic plates**, not photos — drop real
  `cover_image` assets in Storyblok (or wire local images) for richer cards.
- **Contact is mailto-only** (no form) by design for v1.
- **Storyblok Visual Editor preview** runs against the static dev server; for
  fully live in-context editing you'd opt specific routes into on-demand
  rendering (`export const prerender = false`).
- The Storyblok content models must be created manually in the space (no schema
  migration is shipped).

## Next steps

- Add real project imagery + case-study galleries.
- Filtering/sorting on `/work`; tag pages for `/notes`.
- Flesh out `/lab` with live embeds.
- Optional: `astro check` in CI (`pnpm add -D @astrojs/check`).
