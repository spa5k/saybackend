# Saybackend

> A backend-focused blog and resource hub built with Astro.

[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-8C4BFF?logo=astro)](https://astro.build)
[![Deployed on Cloudflare](https://img.shields.io/badge/Deployed%20on-Cloudflare-F38020?logo=cloudflare)](https://www.saybackend.com)

## Overview

**Saybackend** is a modern, fast blog and content platform focused on backend engineering topics. It covers everything from Go and Docker to PostgreSQL, Kafka, Kubernetes, and beyond.

- **Live site**: [https://www.saybackend.com](https://www.saybackend.com)
- **Topics**: Go, Docker, PostgreSQL, Kafka, Kubernetes, Next.js, RAG/AI, and more

## Tech Stack

- **[Astro](https://astro.build/)** - Static site generator with islands architecture
- **[React](https://react.dev/)** - Interactive components (charts, tables, UI)
- **[SolidJS](https://www.solidjs.com/)** - Lightweight reactive components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[MDX](https://mdxjs.com/)** - Markdown with JSX components for blog posts
- **[Pagefind](https://pagefind.app/)** - Static search engine
- **[Cloudflare](https://workers.cloudflare.com/)** - Edge deployment via Astro Cloudflare adapter

## Features

- **Fast & lightweight** - Astro's zero-JS-by-default approach
- **Full-text search** - Pagefind-powered search across all content
- **Code syntax highlighting** - Shiki-powered with custom themes
- **Interactive charts** - Chart.js and Recharts for data visualization
- **Responsive design** - Mobile-first with Tailwind CSS
- **SEO optimized** - Sitemap, RSS feed, and structured metadata
- **Comments** - Giscus integration for discussions
- **Dark mode** - System-aware theme switching

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format
```

## Project Structure

```
├── src/
│   ├── components/          # Reusable Astro/React/Solid components
│   ├── content/blog/        # Blog posts in MDX
│   ├── layouts/             # Page layouts
│   ├── pages/               # Route pages
│   └── styles/              # Global styles
├── public/                  # Static assets
├── astro.config.mjs         # Astro configuration
├── wrangler.jsonc           # Cloudflare Workers config
└── package.json             # Dependencies
```

## Content

Blog posts are written in MDX and live in `src/content/blog/`. Each post includes:

- Frontmatter metadata (title, description, date, tags)
- Interactive components (charts, callouts, tabs)
- Code blocks with syntax highlighting
- Auto-generated OG images

## Deployment

The site is automatically deployed to **Cloudflare Pages** via the Astro Cloudflare adapter. The build process includes:

- Static page generation
- Image optimization with Sharp
- Pagefind index generation
- Asset compression

## License

MIT
