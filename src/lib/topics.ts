import type { CollectionEntry } from "astro:content";

export type TopicDefinition = {
  slug: "postgresql" | "kubernetes" | "nextjs";
  name: string;
  title: string;
  description: string;
  keywords: string[];
  matchTags: string[];
  learningPoints: string[];
};

const TOPICS: Record<TopicDefinition["slug"], TopicDefinition> = {
  postgresql: {
    slug: "postgresql",
    name: "PostgreSQL",
    title: "PostgreSQL Guides",
    description:
      "Performance, safety, and production patterns for building on Postgres — from UUIDs to extensions and strictness tooling.",
    keywords: ["PostgreSQL", "Databases", "Performance", "Extensions"],
    matchTags: ["postgresql", "postgres", "database"],
    learningPoints: [
      "Pick the right identifiers and schema patterns",
      "Measure performance with real benchmarks",
      "Ship safer SQL with strictness tooling",
    ],
  },
  kubernetes: {
    slug: "kubernetes",
    name: "Kubernetes",
    title: "Kubernetes in Production",
    description:
      "Pragmatic infrastructure and cluster operations — networking, GitOps, automation, and the hard lessons that make clusters reliable.",
    keywords: ["Kubernetes", "DevOps", "Infrastructure", "GitOps"],
    matchTags: ["kubernetes", "k8s", "rke2", "k3s", "cilium", "gitops"],
    learningPoints: [
      "Choose a cluster distribution and architecture",
      "Avoid common networking and automation traps",
      "Operationalize upgrades, scaling, and GitOps",
    ],
  },
  nextjs: {
    slug: "nextjs",
    name: "Next.js",
    title: "Next.js Deployment & Infrastructure",
    description:
      "Self-hosting and production deployment strategies for Next.js — Docker, server builds, and avoiding platform lock-in.",
    keywords: ["Next.js", "Deployment", "Docker", "Production"],
    matchTags: ["nextjs", "next.js", "rsc", "ssr", "vercel", "deployment"],
    learningPoints: [
      "Build deployable Docker images for Next.js",
      "Understand SSR/RSC production constraints",
      "Operate and scale without platform lock-in",
    ],
  },
};

function normalizeTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[().,:/]/g, "")
    .replace(/’/g, "'");
}

export function getTopicDefinitions() {
  return Object.values(TOPICS);
}

export function getTopicBySlug(): typeof TOPICS;
export function getTopicBySlug(slug: TopicDefinition["slug"]): TopicDefinition;
export function getTopicBySlug(slug?: TopicDefinition["slug"]) {
  if (!slug) return TOPICS;
  return TOPICS[slug];
}

export function getTopicPosts(
  posts: CollectionEntry<"blog">[],
  topic: TopicDefinition,
) {
  const matchTags = new Set(topic.matchTags.map(normalizeTag));

  return posts.filter((post) => {
    const postTags = (post.data.tags ?? []).map(normalizeTag);
    return postTags.some((t) => matchTags.has(t));
  });
}
