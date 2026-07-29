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
    title: 'Hiring Kamran Tahir - Backend, Full-Stack, Frontend Engineer',
    description:
      'Hiring page for Kamran Tahir. Senior Software Engineer open to backend, full-stack, and frontend roles across product engineering and platform teams.',
  },
} as const

type SeoInput = {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
  schema?: unknown
}

export function seo({
  title,
  description,
  path,
  image = '/images/blog.png',
  type = 'website',
  noindex = false,
  schema,
}: SeoInput) {
  const canonicalPath = path === '/' || path.endsWith('/') ? path : `${path}/`
  const canonical = new URL(canonicalPath, SITE.origin).href
  const socialImage = new URL(image, SITE.origin).href
  const documentTitle = `${title} | ${SITE.title}`

  return {
    meta: [
      { title: documentTitle },
      { name: 'title', content: documentTitle },
      { name: 'description', content: description },
      ...(noindex ? [{ name: 'robots', content: 'noindex,follow' }] : []),
      { property: 'og:type', content: type },
      { property: 'og:url', content: canonical },
      { property: 'og:title', content: documentTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: socialImage },
      { property: 'og:image:alt', content: documentTitle },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:site_name', content: SITE.title },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: canonical },
      { name: 'twitter:title', content: documentTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: socialImage },
      { name: 'twitter:image:alt', content: documentTitle },
    ],
    links: [{ rel: 'canonical', href: canonical }],
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
