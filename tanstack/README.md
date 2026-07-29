# SayBackend — TanStack Start

The TanStack Start migration of SayBackend. It keeps the existing content,
public URLs, redirects, feeds, sitemap behavior, and SEO metadata while moving
the site to React and the Working Journal visual system.

## Local development

```bash
npm install
npm run dev
```

The local site runs at `http://127.0.0.1:3000`.

## Verification

```bash
npm run lint
npm run check
npx tsc --noEmit
npm run build
npm run verify:routes
```

`verify:routes` expects the development server on port 3000 by default. Set
`SITE_URL` to check another local preview. The script verifies content pages,
canonical and social metadata, legacy redirects, RSS, sitemaps, and robots.txt.

## Content and routes

- Blog and project content lives under `src/content`.
- File-based routes live under `src/routes`.
- Shared metadata and schema helpers live in `src/lib/site.ts`.
- Content discovery, slugs, reading time, and legacy redirects live in
  `src/lib/content.tsx`.
- Pagefind is regenerated from `dist/client` on every production build.
- Cloudflare deployment and canonical-host redirect configuration live in the
  two `wrangler.*.jsonc` files.

The migration QA record and normalized design comparison are in
[`design-qa.md`](./design-qa.md).
