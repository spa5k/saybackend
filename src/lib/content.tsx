import { lazy } from 'react'
import type { ComponentType, ElementType } from 'react'

type MdxContentProps = {
  components?: Record<string, ElementType>
}

type Frontmatter = {
  title: string
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
  '08-kubernetes-cluster-journey': 21,
  '09-nextjs-self-hosted-production': 20,
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
  '2026-aug-lint-ai-generated-code': 20,
  '2026-aug-prompt-caching-agent-harnesses': 17,
  '2026-jan-saybackend-changelog': 1,
  '2026-jun-conductor-claude-code-cliproxyapi': 6,
  '2026-may-cliproxyapi-factory-byok': 5,
}

function directoryId(path: string) {
  return path.split('/').at(-2) ?? path
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
  .filter((post) => !post.draft)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

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
    .map((post) => [post.oldPath as string, post.href]),
)

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}

const tagCounts = new Map<string, number>()
const MIN_NAVIGABLE_TAG_COUNT = 2
posts.forEach((post) =>
  post.tags?.forEach((tag) =>
    tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1),
  ),
)

export const navigableTags = [...tagCounts.entries()]
  .filter(([, count]) => count >= MIN_NAVIGABLE_TAG_COUNT)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

export function isNavigableTag(tag: string) {
  return (tagCounts.get(tag) ?? 0) >= MIN_NAVIGABLE_TAG_COUNT
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
