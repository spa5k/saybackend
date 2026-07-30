import { posts } from './content'
import type { Post } from './content'

export type Topic = {
  slug: string
  name: string
  title: string
  description: string
  match: Array<string>
}

export const topics: Array<Topic> = [
  {
    slug: 'postgresql',
    name: 'PostgreSQL',
    title: 'PostgreSQL Guides',
    description:
      'Performance, safety, and production patterns for building on Postgres — from UUIDs to extensions and strictness tooling.',
    match: ['postgres', 'postgresql', 'uuid', 'pgrx', 'extension'],
  },
  {
    slug: 'nextjs',
    name: 'Next.js',
    title: 'Next.js Deployment & SSR',
    description:
      'Self-hosting and production deployment strategies for Next.js, SSR, RSC, and Electron.',
    match: ['nextjs', 'next.js', 'ssr', 'electron', 'vercel'],
  },
  {
    slug: 'docker-deployment',
    name: 'Docker & Deployment',
    title: 'Docker and Production Deployment',
    description:
      'Container-first delivery patterns, optimized Dockerfiles, and reliable production rollouts.',
    match: ['docker', 'dockerfile', 'deployment', 'production'],
  },
  {
    slug: 'go-backend',
    name: 'Go Backend Engineering',
    title: 'Go Backend and API Patterns',
    description:
      'Practical backend engineering in Go — middleware, architecture, reliability, and performance.',
    match: ['golang', 'go-middleware', 'gin', 'fiber', 'echo', 'happycontext'],
  },
  {
    slug: 'kafka-streaming',
    name: 'Kafka & Streaming',
    title: 'Kafka, KRaft, and Streaming Systems',
    description:
      'Hands-on Kafka infrastructure, KRaft mode, Docker workflows, and streaming reliability.',
    match: ['kafka', 'kraft', 'streaming', 'message-queue'],
  },
  {
    slug: 'ai-rag',
    name: 'AI & RAG Systems',
    title: 'RAG and Document Processing Systems',
    description:
      'Applied AI engineering for retrieval systems, chunking, embeddings, and document pipelines.',
    match: ['rag', 'chunking', 'semantic-search', 'ai', 'llm'],
  },
  {
    slug: 'observability',
    name: 'Observability & Logging',
    title: 'Production Observability and Logging',
    description:
      'Logging architecture, context propagation, event quality, and cost-aware telemetry.',
    match: [
      'logging',
      'observability',
      'wide-events',
      'sampling',
      'happycontext',
    ],
  },
  {
    slug: 'kubernetes',
    name: 'Cloud & Kubernetes',
    title: 'Cloud Infrastructure and Kubernetes',
    description:
      'Cloud operations, Kubernetes, automation, infrastructure decisions, and production hardening.',
    match: ['kubernetes', 'k8s', 'infrastructure', 'devops', 'cloudflare'],
  },
  {
    slug: 'frontend-state',
    name: 'Frontend State Patterns',
    title: 'Frontend State Management Patterns',
    description:
      'URL state, shareability, and practical React workflows that improve UX and debugging.',
    match: ['react', 'zustand', 'url state', 'frontend'],
  },
  {
    slug: 'changelog',
    name: 'Changelog',
    title: 'Product and Site Changelog',
    description:
      'Release notes and updates across the site, architecture, features, and tooling.',
    match: ['changelog'],
  },
]

export function postsForTopic(topic: Topic): Array<Post> {
  return posts.filter((post) => {
    const haystack = `${post.title} ${post.description} ${(
      post.tags ?? []
    ).join(' ')}`.toLowerCase()
    return topic.match.some((term) => haystack.includes(term.toLowerCase()))
  })
}

export function topicCards() {
  return topics
    .map((topic) => ({ ...topic, count: postsForTopic(topic).length }))
    .filter((topic) => topic.count > 0)
    .sort((a, b) => b.count - a.count)
}
