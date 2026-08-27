export const SITE = {
  title: 'SayBackend',
  description:
    'A blog about backend development, software engineering, and other tech topics.',
  origin: 'https://saybackend.com',
  email: 'hello@kamran.sh',
} as const

export const PAGE_META = {
  home: {
    title: 'SayBackend - Backend Engineering & DevOps Blog',
    description:
      'In-depth technical articles on backend development, DevOps, PostgreSQL, Kubernetes, and system architecture. Explore engineering tutorials, performance benchmarks, and production best practices.',
  },
  blog: {
    title: 'Backend Engineering Blog - SayBackend',
    description:
      'In-depth technical articles on backend development, DevOps, PostgreSQL, Kubernetes, Docker, and system architecture. Explore 50+ engineering tutorials and best practices from a senior software engineer.',
  },
  projects: {
    title: 'DevOps Projects & Portfolio - SayBackend',
    description:
      'Open-source projects and production deployments showcasing Go, Node.js, AWS, Kubernetes, PostgreSQL, and Docker implementations. View code repositories and live demos.',
  },
  about: {
    title: 'About Kamran Tahir - Senior Backend Engineer',
    description:
      'Meet Kamran Tahir, a Senior Software Engineer specializing in backend systems, AWS serverless architecture, PostgreSQL, and DevOps. 6+ years building scalable infrastructure and microservices.',
  },
  hiring: {
    title: 'Hire Kamran Tahir - Senior Software Engineer',
    description:
      'Kamran Tahir is a Senior Software Engineer available for backend, full-stack, frontend, and platform engineering roles.',
  },
} as const

export const NOT_FOUND_META = {
  title: '404 — Not Found',
  description: 'The page you are looking for does not exist.',
  path: '/404',
} as const

type SeoInput = {
  title: string
  description: string
  path: string
  markdownPath?: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
  publishedTime?: string
  modifiedTime?: string
  tags?: Array<string>
  schema?: unknown
}

export function seo({
  title,
  description,
  path,
  markdownPath,
  image = '/images/blog.png',
  type = 'website',
  noindex = false,
  publishedTime,
  modifiedTime,
  tags = [],
  schema,
}: SeoInput) {
  const canonicalPath = path === '/' || path.endsWith('/') ? path : `${path}/`
  const canonical = new URL(canonicalPath, SITE.origin).href
  const socialImage = new URL(image, SITE.origin).href
  const documentTitle = title.toLowerCase().includes(SITE.title.toLowerCase())
    ? title
    : `${title} | ${SITE.title}`
  const robots = noindex
    ? 'noindex,follow'
    : 'index,follow,max-image-preview:large'
  const publishedDateTime = publishedTime
    ? toIsoDateTime(publishedTime)
    : undefined
  const modifiedDateTime = modifiedTime
    ? toIsoDateTime(modifiedTime)
    : undefined

  return {
    meta: [
      { title: documentTitle },
      { name: 'title', content: documentTitle },
      { name: 'description', content: description },
      { name: 'robots', content: robots },
      { property: 'og:type', content: type },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:url', content: canonical },
      { property: 'og:title', content: documentTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: socialImage },
      { property: 'og:image:alt', content: documentTitle },
      { property: 'og:site_name', content: SITE.title },
      ...(type === 'article'
        ? [
            { name: 'author', content: 'Kamran Tahir' },
            ...(publishedDateTime
              ? [
                  {
                    property: 'article:published_time',
                    content: publishedDateTime,
                  },
                ]
              : []),
            ...(modifiedDateTime
              ? [
                  {
                    property: 'article:modified_time',
                    content: modifiedDateTime,
                  },
                ]
              : []),
            {
              property: 'article:author',
              content: `${SITE.origin}/about/`,
            },
            ...tags.map((tag) => ({
              property: 'article:tag',
              content: tag,
            })),
          ]
        : []),
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: canonical },
      { name: 'twitter:title', content: documentTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: socialImage },
      { name: 'twitter:image:alt', content: documentTitle },
    ],
    links: [
      { rel: 'canonical', href: canonical },
      ...(markdownPath
        ? [
            {
              rel: 'alternate',
              type: 'text/markdown',
              href: new URL(markdownPath, SITE.origin).href,
              title: `${documentTitle} — Markdown`,
            },
          ]
        : []),
    ],
    scripts: schema
      ? [
          {
            type: 'application/ld+json',
            children: JSON.stringify(schema),
          },
        ]
      : [],
  }
}

export function toIsoDateTime(date: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `${date}T00:00:00Z`
  }

  if (/(?:Z|[+-]\d{2}:\d{2})$/.test(date)) {
    return date
  }

  const parsed = new Date(date)
  return Number.isNaN(parsed.valueOf()) ? date : parsed.toISOString()
}

export function breadcrumb(items: Array<{ name: string; path?: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: new URL(item.path, SITE.origin).href } : {}),
    })),
  }
}
