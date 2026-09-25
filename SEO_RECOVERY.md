# SEO Recovery — Findings and Fixes (September 2026)

## Summary

Google Search Console (GSC) reports **530 not indexed pages** and only **35 indexed pages**.
Ahrefs reports **6 organic keywords**, **8 monthly organic traffic**, and a crawl where
**75.1% of URLs are redirects** and **18.6% are 404s**.

Root cause: two site migrations in three months (www → apex domain in June 2026,
Astro → TanStack Start in July 2026) plus a retired tag-archive system that now returns
a redirect chain ending in 404 or `noindex` for hundreds of URLs.

## Evidence

### Google Search Console (sc-domain:saybackend.com)

| Reason                             | Pages | What they are                                                                                                     |
| ---------------------------------- | ----: | ----------------------------------------------------------------------------------------------------------------- |
| Not found (404)                    |   233 | 232 old `www.saybackend.com/tags/*` URLs + 1 project URL                                                          |
| Excluded by 'noindex' tag          |   148 | Current `/tags/*` pages (www + apex pairs), all `noindex,follow`                                                  |
| Page with redirect                 |    92 | Legacy Astro slugs (`/blog/00-saybackend-changelog`, `/topics/*`, `/about`) and www → apex redirects              |
| Crawled - currently not indexed    |    55 | `.md` endpoints, tag URLs with spaces/capitals (`/tags/Zustand URL synchronization/`), `sitemap-0.xml`, `rss.xml` |
| Discovered - currently not indexed |     1 | —                                                                                                                 |
| Alternate page with canonical      |     1 | —                                                                                                                 |

Performance (16 months): 2.21K clicks, 355K impressions, 0.6% CTR, avg position 9.9.
Last 3 months: 212 clicks, 68K impressions, avg position 9.2. Impressions down 27% vs
previous period. Top queries still resolve around position 5–10 (`kafka kraft docker
compose`, `electron nextjs`, `zustand url state`) — rankings exist, but crawl equity is
wasted on 530 junk URLs and thin tag archives that duplicate topic hubs.

### Ahrefs (site explorer, subdomains mode)

- Organic keywords: **6**. Top 3: 1. Organic traffic: **8/mo**. Value: $7.
- Top pages by traffic: only 4 URLs, led by `/blog/2025-jan-kafka-docker-kraft-mode/`.
- Crawled pages: 1,236 → **3XX redirect: 928 (75.1%)**, **404: 230 (18.6%)**, 200 OK: 78.
- Site Audit: 378 errors; `Noindex page` 48, `Noindex follow page` 48, `Page has links
to redirect` 64, `Redirected page has no incoming internal links` 59, `3XX redirect` 66.
- Backlink profile is healthy (DR 51, 1.3K backlinks, 834 referring domains) — the
  traffic loss is not a link problem.

### Live-site behavior (before this PR)

- `/tags/zustand/` → 307 → `/tags/zustand` → **404** (double hop, wrong direction).
- `/tags/rag/` → 200 with `noindex,follow` (excluded from index on purpose).
- `/Blog`, `/About`, `/TOPICS` → **200** (router matched case-insensitively; duplicate
  URLs with correct canonical but crawlable).
- `/blog/<slug>.md` → 200 (already carries `X-Robots-Tag: noindex, follow` + canonical
  header — acceptable, kept for llms.txt).
- `www.saybackend.com/*` → 301 to apex (correct, keep).

## Changes in this PR

1. **Retire public tag archives** (removes ~430 of the 530 not-indexed URLs):
   - `/tags/<anything>`: tags that map to an existing topic hub 301 to it
     (e.g. `/tags/kafka` → `/topics/kafka-streaming/`); all other tag URLs return
     **410 Gone** with `X-Robots-Tag: noindex, follow` so Google drops them fast.
   - `/tags/` and `/tags` 301 to `/blog/`.
   - Handled at the edge worker (`src/worker.ts`) and mirrored in server routes
     (`src/routes/tags.$tag.ts`, `src/routes/tags.index.ts`) for dev/preview.
2. **Stop linking to tag pages from posts** — tags render as plain labels now;
   `navigableTags` / `isNavigableTag` removed from the content lib.
3. **Case-sensitive URL cleanup**: wrong-case page paths (`/Blog`, `/topics/AI-RAG/`)
   now 301 to the lowercase canonical instead of serving duplicate 200s.
4. **Pin `recharts` to 3.10.0** — 3.10.1 ships without `es6/util/cursor/*` files and
   broke `npm run build` on main (deploy blocker; unrelated to SEO but required to ship).

Sitemap, RSS, llms.txt, `.md` endpoints, and legacy post redirects are unchanged and
verified (35 pages, 18 markdown docs, 9 legacy redirects — see `scripts/verify-routes.mjs`).

## Expected outcome

- The "Excluded by noindex" (148) and most "Not found" (233) groups disappear from GSC
  within weeks as Google processes the 410s and topic redirects.
- Crawl budget concentrates on 35 real pages and 10 topic hubs.
- Topic hubs inherit tag-page link equity where a mapping exists.
- Indexed page count and impressions should recover first; clicks follow as rankings
  consolidate.

## After merge (manual steps, ~15 minutes)

1. Deploy, then submit `https://saybackend.com/sitemap-index.xml` again in GSC → Sitemaps.
2. GSC → Indexing → Pages: open "Excluded by noindex" → **VALIDATE FIX**; repeat for
   "Not found (404)".
3. URL-inspect and request indexing for `/topics/` hubs that now receive tag redirects
   (`kafka-streaming`, `ai-rag`, `postgresql`, `go-backend`, `docker-deployment`, `nextjs`).
4. Watch Ahrefs Site Audit next crawl: the 928 redirects and 230 404s should collapse
   to the small set of intentional legacy post redirects.
5. Content follow-ups (not in this PR): Ahrefs flags 16 short/10 long meta descriptions
   and 9 long titles; the two "Slow page" URLs; keep publishing for the query clusters
   the site already ranks for (Kafka KRaft compose, Electron+Next.js, UUIDv7 in Postgres,
   Zustand URL state).
