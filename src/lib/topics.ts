import type { CollectionEntry } from "astro:content";

export type TopicDefinition = {
  slug:
    | "postgresql"
    | "nextjs"
    | "docker-deployment"
    | "go-backend"
    | "kafka-streaming"
    | "ai-rag"
    | "observability"
    | "kubernetes"
    | "frontend-state"
    | "changelog";
  name: string;
  title: string;
  description: string;
  keywords: string[];
  matchTags: string[];
  matchText?: string[];
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
    matchTags: [
      "postgresql",
      "postgres",
      "database",
      "uuid",
      "uuidv7",
      "pgrx",
      "extension",
      "benchmarking",
    ],
    matchText: ["postgres", "postgresql", "pg_strict"],
    learningPoints: [
      "Pick the right identifiers and schema patterns",
      "Measure performance with real benchmarks",
      "Ship safer SQL with strictness tooling",
    ],
  },
  nextjs: {
    slug: "nextjs",
    name: "Next.js",
    title: "Next.js Deployment & SSR",
    description:
      "Self-hosting and production deployment strategies for Next.js — SSR, RSC, Electron packaging, and platform-independent delivery.",
    keywords: ["Next.js", "SSR", "RSC", "Deployment", "Electron"],
    matchTags: [
      "nextjs",
      "next.js",
      "ssr",
      "rsc",
      "react-server-components",
      "server-components",
      "electron",
      "vercel",
      "deployment",
      "production",
      "self-hosting next.js",
      "standalone next.js build",
      "node.js hosting",
      "ci/cd for next.js",
    ],
    matchText: ["next.js", "nextjs", "electron"],
    learningPoints: [
      "Choose the right deploy strategy for SSR and RSC",
      "Package apps for self-hosted and hybrid environments",
      "Run Next.js in production without platform lock-in",
    ],
  },
  "docker-deployment": {
    slug: "docker-deployment",
    name: "Docker & Deployment",
    title: "Docker and Production Deployment",
    description:
      "Container-first delivery patterns for backend and web apps — optimized Dockerfiles, image sizing, and reliable production rollouts.",
    keywords: ["Docker", "Deployment", "DevOps", "Production"],
    matchTags: [
      "docker",
      "dockerfile",
      "containerization",
      "deployment",
      "production deployment",
      "cloud deployment",
      "serverless architecture",
    ],
    matchText: ["docker", "deployment"],
    learningPoints: [
      "Build smaller and faster container images",
      "Ship portable builds across cloud providers",
      "Standardize production release workflows",
    ],
  },
  "go-backend": {
    slug: "go-backend",
    name: "Go Backend Engineering",
    title: "Go Backend and API Patterns",
    description:
      "Practical backend engineering in Go — middleware, architecture, reliability, and performance patterns used in production services.",
    keywords: ["Go", "Backend", "API", "Performance", "Architecture"],
    matchTags: [
      "golang",
      "go-middleware",
      "gin",
      "fiber",
      "echo",
      "backend",
      "backend development",
      "http-middleware",
      "performance",
    ],
    matchText: ["golang", "go middleware", "go backend", "happycontext"],
    learningPoints: [
      "Design clean middleware and service boundaries",
      "Improve backend reliability and failure handling",
      "Benchmark and tune performance where it matters",
    ],
  },
  "kafka-streaming": {
    slug: "kafka-streaming",
    name: "Kafka & Streaming",
    title: "Kafka, KRaft, and Streaming Systems",
    description:
      "Hands-on Kafka infrastructure and local/production setup patterns — KRaft mode, Docker workflows, and streaming reliability.",
    keywords: ["Kafka", "Streaming", "KRaft", "Message Queues"],
    matchTags: [
      "kafka",
      "kraft",
      "streaming",
      "message-queue",
      "apache-kafka",
      "kafka-docker",
      "kafka-kraft-mode",
      "kafka-local-development",
      "kafka-cluster-docker",
    ],
    matchText: ["kafka", "kraft"],
    learningPoints: [
      "Run Kafka reliably with KRaft mode",
      "Avoid local-dev and networking misconfigurations",
      "Move from local clusters to production safely",
    ],
  },
  "ai-rag": {
    slug: "ai-rag",
    name: "AI & RAG Systems",
    title: "RAG and Document Processing Systems",
    description:
      "Applied AI engineering for retrieval systems — chunking strategies, embedding tradeoffs, and practical document pipeline design.",
    keywords: ["RAG", "AI", "NLP", "Semantic Search"],
    matchTags: [
      "rag",
      "chunking",
      "text-chunking",
      "rag-chunking",
      "rag-chunking-strategies",
      "semantic-chunking",
      "retrieval-augmented-generation",
      "embedding-models",
      "semantic-search",
      "vector-search",
      "llm-optimization",
      "nlp",
      "machine-learning",
      "ai-research",
    ],
    matchText: ["rag", "chunking"],
    learningPoints: [
      "Choose chunking strategies based on retrieval goals",
      "Balance retrieval quality, latency, and cost",
      "Design robust AI document processing pipelines",
    ],
  },
  observability: {
    slug: "observability",
    name: "Observability & Logging",
    title: "Production Observability and Logging",
    description:
      "Logging architecture and observability strategy for backend systems — context propagation, event quality, and cost-aware telemetry.",
    keywords: ["Observability", "Logging", "Tracing", "Reliability"],
    matchTags: [
      "logging",
      "observability",
      "structured-logging",
      "request-logging",
      "contextual-logging",
      "json-logging",
      "log-aggregation",
      "error-monitoring",
      "wide-events",
      "go-logging-library",
      "production-logging",
      "sampling",
    ],
    matchText: ["logging", "observability", "happycontext"],
    learningPoints: [
      "Design logs that are actionable under pressure",
      "Propagate context cleanly across requests",
      "Control observability cost without losing signal",
    ],
  },
  kubernetes: {
    slug: "kubernetes",
    name: "Cloud & Kubernetes",
    title: "Cloud Infrastructure and Kubernetes",
    description:
      "Cloud operations and platform engineering patterns — Kubernetes, automation, infra decisions, and production hardening lessons.",
    keywords: ["Cloud", "Infrastructure", "Kubernetes", "DevOps"],
    matchTags: [
      "kubernetes",
      "k8s",
      "infrastructure",
      "devops",
      "cloudflare",
      "serverless",
      "deployment",
      "production",
    ],
    matchText: [
      "kubernetes",
      "rke2",
      "k3s",
      "cilium",
      "gitops",
      "infrastructure",
    ],
    learningPoints: [
      "Make infrastructure decisions that age well",
      "Automate provisioning and delivery workflows",
      "Harden production systems for scale and recovery",
    ],
  },
  "frontend-state": {
    slug: "frontend-state",
    name: "Frontend State Patterns",
    title: "Frontend State Management Patterns",
    description:
      "State handling patterns for modern apps — URL state, shareability, and practical React workflows that improve UX and debugging.",
    keywords: ["React", "State Management", "Zustand", "Frontend"],
    matchTags: [
      "react",
      "zustand",
      "url state management",
      "zustand url state",
      "zustand query params",
      "zustand search params",
      "docs",
      "tips",
    ],
    matchText: ["zustand", "state via url", "url state"],
    learningPoints: [
      "Choose storage and sync strategies for app state",
      "Make state shareable and reproducible via URLs",
      "Reduce state complexity in frontend architecture",
    ],
  },
  changelog: {
    slug: "changelog",
    name: "Changelog",
    title: "Product and Site Changelog",
    description:
      "Release notes and updates across the site and tooling — architecture shifts, feature additions, and quality-of-life improvements.",
    keywords: ["Changelog", "Releases", "Updates", "Roadmap"],
    matchTags: ["changelog"],
    matchText: ["changelog"],
    learningPoints: [
      "Track major updates and shipped improvements",
      "Understand why technical decisions changed over time",
      "Follow release momentum across the platform",
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
  const matchText = topic.matchText?.map(normalizeTag) ?? [];

  return posts.filter((post) => {
    const postTags = (post.data.tags ?? []).map(normalizeTag);
    const tagged = postTags.some((t) => matchTags.has(t));
    if (tagged) return true;

    if (matchText.length === 0) return false;

    const searchableText = normalizeTag(`${post.data.title ?? ""} ${post.id}`);
    return matchText.some((phrase) => searchableText.includes(phrase));
  });
}
