# SayBackend

A backend engineering blog built with TanStack Start and deployed to Cloudflare
Workers.

- **Live site:** [saybackend.com](https://saybackend.com)
- **Topics:** Go, Docker, PostgreSQL, Kafka, Kubernetes, Next.js, RAG/AI,
  and systems engineering

## Stack

- TanStack Start, TanStack Router, and React
- Tailwind CSS and MDX
- Pagefind static search
- Shiki syntax highlighting with the Everforest theme
- Cloudflare Workers

## Development

```bash
npm clean-install
npm run dev
```

```bash
npm run build
npm run check
npm run verify:routes
npm run preview
```

## Project structure

```text
├── src/components/       # Shared UI and MDX components
├── src/content/blog/     # Blog posts and article media
├── src/lib/              # Content, metadata, and search helpers
├── src/routes/           # TanStack Router routes
├── public/               # Static assets and Pagefind index
└── wrangler.*.jsonc      # Cloudflare Worker configuration
```

## Deployment

`npm run deploy` builds and deploys the TanStack application and the `www`
redirect worker. The production build prerenders public routes and generates the
Pagefind index. Run `npm run verify:routes` against a preview before release to
check canonical URLs, redirects, feeds, discovery files, and article metadata.

The application follows Cloudflare's TanStack Start integration: the Cloudflare
Vite plugin builds the SSR Worker, `src/worker.ts` extends TanStack's default
server entry with legacy redirects, and `wrangler.jsonc` defines the production
Worker. Regenerate binding types with `npm run cf-typegen`.

## License

MIT
