import { lazy } from 'react'
import type { ComponentType, ElementType } from 'react'

type MdxContentProps = {
  components?: Record<string, ElementType>
}

type Frontmatter = {
  title: string
  /** Shorter title for search results; the on-page headline keeps `title`. */
  seoTitle?: string
  description: string
  date: string
  updated?: string
  draft?: boolean
  wip?: boolean
  slug?: string
  oldPath?: string
  ogImage?: string
  tags?: Array<string>
  faqs?: Array<{ question: string; answer: string }>
  demoURL?: string
  repoURL?: string
  /** schema.org category; marks a project as a SoftwareApplication. */
  applicationCategory?: string
  /** Price in USD, for SoftwareApplication offers. */
  price?: string
}

type ContentModule = {
  default: ComponentType<MdxContentProps>
  frontmatter: Frontmatter
}

export type Post = Frontmatter & {
  id: string
  slug: string
  href: string
  readingMinutes: number
  Content: ComponentType<MdxContentProps>
}

export type Project = Frontmatter & {
  id: string
  slug: string
  href: string
  Content: ComponentType<MdxContentProps>
}

const blogFrontmatter = {
  ...import.meta.glob<Frontmatter>('../content/blog/07-*/index.mdx', {
    eager: true,
    import: 'default',
    query: '?frontmatter-only',
  }),
  ...import.meta.glob<Frontmatter>('../content/blog/10-*/index.mdx', {
    eager: true,
    import: 'default',
    query: '?frontmatter-only',
  }),
  ...import.meta.glob<Frontmatter>('../content/blog/20*/index.mdx', {
    eager: true,
    import: 'default',
    query: '?frontmatter-only',
  }),
}
const blogModules = {
  ...import.meta.glob<ContentModule>('../content/blog/07-*/index.mdx'),
  ...import.meta.glob<ContentModule>('../content/blog/10-*/index.mdx'),
  ...import.meta.glob<ContentModule>('../content/blog/20*/index.mdx'),
}
const projectFrontmatter = import.meta.glob<Frontmatter>(
  '../content/projects/**/index.md',
  {
    eager: true,
    import: 'default',
    query: '?frontmatter-only',
  },
)
const projectModules = import.meta.glob<ContentModule>(
  '../content/projects/**/index.md',
)

const readingTimes: Record<string, number> = {
  '07-uuidv7-postgres': 17,
  '10-recreating-planetscale-pg-strict-in-rust': 13,
  '2023-dec-zustand-url-state-sharing': 2,
  '2024-aug-nextjs-electron-server-components': 7,
  '2024-jun-golang-dockerfile-optimized': 6,
  '2024-jun-saybackend-changelog': 1,
  '2024-sep-nextjs-deploy-any-server': 14,
  '2025-feb-text-chunking-rag-systems': 6,
  '2025-jan-kafka-docker-kraft-mode': 4,
  '2026-feb-happycontext-wide-logging': 4,
  '2026-feb-happymode-macos-appearance-scheduler': 5,
  '2026-aug-happycontext-performance': 11,
  '2026-oct-faster-github-actions': 6,
  '2026-aug-lint-ai-generated-code': 20,
  '2026-aug-prompt-caching-agent-harnesses': 17,
  '2026-jan-saybackend-changelog': 1,
  '2026-jun-conductor-claude-code-cliproxyapi': 6,
  '2026-may-cliproxyapi-factory-byok': 5,
  '2026-nov-saybackend-redesign': 5,
  '2026-nov-postgresql-19-backend-engineers': 7,
  '2026-nov-self-host-nextjs-16': 8,
  '2026-nov-cliproxyapi-setup-fixes': 8,
  '2026-nov-golang-dockerfile-best-practices': 8,
  '2026-nov-uuidv7-postgres-functions-size': 7,
  '2026-dec-code-mode-explained': 9,
  '2026-dec-code-mode-pi': 10,
  '2026-dec-code-mode-claude-code': 9,
  '2026-dec-code-mode-opencode': 8,
  '2026-dec-code-mode-compared': 8,
  '2026-nov-vllm-fallback-detokenizer': 11,
  '2026-dec-nvidia-dynamo-code-audit': 14,
  '2026-dec-lint-ratchet': 10,
  '2026-dec-agents-prove-changes': 10,
  '2027-jan-ai-review-agents': 9,
  '2027-jan-github-actions-minutes': 9,
  '2027-jan-rust-target-disk-space': 9,
  '2027-jan-rust-mbx-worktrees': 9,
  '2027-jan-git-twig-cow-worktrees': 9,
  '2027-jan-faster-rust-dev-builds': 9,
  '2027-jan-dockerize-rust-service': 9,
  '2027-jan-solid-2-async-reactive-graph': 9,
  '2027-jan-migrate-solidstart-solid-2': 8,
  '2027-feb-solidstart-maintenance-options': 8,
  '2027-feb-self-host-tanstack-start': 9,
  '2027-feb-tanstack-start-server-functions': 9,
  '2027-feb-solid-start-mode-vs-tanstack-start': 9,
  '2027-feb-blog-on-tanstack-start': 8,
}

function directoryId(path: string) {
  return path.split('/').at(-2) ?? path
}

/** A draft, or a post with a date after the build day, is not published. */
export function isPublished(post: Pick<Frontmatter, 'draft' | 'date'>) {
  return !post.draft && post.date.slice(0, 10) <= __BUILD_DATE__
}

export const posts: Array<Post> = Object.entries(blogFrontmatter)
  .map(([path, frontmatter]) => {
    const id = directoryId(path)
    const slug = frontmatter.slug || id
    const loadModule = blogModules[path]
    return {
      ...frontmatter,
      id,
      slug,
      href: `/blog/${slug}`,
      readingMinutes: readingTimes[id] ?? 1,
      Content: lazy(async () => {
        const module = await loadModule()
        return { default: module.default }
      }),
    }
  })
  // The local dev server shows unpublished posts too, so they can be read first.
  .filter((post) => import.meta.env.DEV || isPublished(post))
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

/** Slugs of posts that exist but are not published in this build. */
export const unpublishedSlugs = new Set(
  Object.entries(blogFrontmatter)
    .map(([path, frontmatter]) => frontmatter.slug || directoryId(path))
    .filter((slug) => !posts.some((post) => post.slug === slug)),
)

export const projects: Array<Project> = Object.entries(projectFrontmatter)
  .map(([path, frontmatter]) => {
    const id = directoryId(path)
    const slug = frontmatter.slug || id
    const loadModule = projectModules[path]
    return {
      ...frontmatter,
      id,
      slug,
      href: `/projects/${slug}`,
      Content: lazy(async () => {
        const module = await loadModule()
        return { default: module.default }
      }),
    }
  })
  .filter((project) => !project.draft)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

export const legacyPostRedirects = Object.fromEntries(
  posts
    .filter((post) => post.oldPath)
    .map((post) => [post.oldPath as string, post.slug]),
)

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}

export function getRelatedPosts(post: Post, limit = 3) {
  const tags = new Set(post.tags ?? [])
  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      post: candidate,
      relevance: (candidate.tags ?? []).filter((tag) => tags.has(tag)).length,
    }))
    .filter(({ relevance }) => relevance > 0)
    .sort(
      (a, b) =>
        b.relevance - a.relevance ||
        Date.parse(b.post.date) - Date.parse(a.post.date),
    )
    .slice(0, limit)
    .map(({ post: candidate }) => candidate)
}

export function formatDate(date: string) {
  const normalized = /^\d{4}-\d{2}-\d{2}/.test(date)
    ? `${date.slice(0, 10)}T00:00:00Z`
    : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(normalized))
}
