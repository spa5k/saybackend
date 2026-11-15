import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Suspense } from 'react'

import { formatDate, getProject } from '@/lib/content'
import { SITE, breadcrumb, seo, toIsoDateTime } from '@/lib/site'

export const Route = createFileRoute('/projects/$slug')({
  loader: ({ params }) => {
    const project = getProject(params.slug)
    if (!project) throw notFound()
    return {
      slug: project.slug,
      title: project.title,
      seoTitle: project.seoTitle,
      description: project.description,
      date: project.date,
      demoURL: project.demoURL,
      repoURL: project.repoURL,
      applicationCategory: project.applicationCategory,
      price: project.price,
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const path = `/projects/${loaderData.slug}/`
    return seo({
      title: loaderData.seoTitle ?? loaderData.title,
      description: loaderData.description,
      path,
      markdownPath: `/projects/${loaderData.slug}.md`,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': loaderData.applicationCategory
              ? 'SoftwareApplication'
              : 'CreativeWork',
            ...(loaderData.applicationCategory
              ? {
                  applicationCategory: loaderData.applicationCategory,
                  operatingSystem: 'Web',
                }
              : {}),
            ...(loaderData.price
              ? {
                  offers: {
                    '@type': 'Offer',
                    price: loaderData.price,
                    priceCurrency: 'USD',
                  },
                }
              : {}),
            name: loaderData.title,
            description: loaderData.description,
            url: `${SITE.origin}${path}`,
            dateCreated: toIsoDateTime(loaderData.date),
            author: {
              '@type': 'Person',
              '@id': `${SITE.origin}/#author`,
              name: 'Kamran Tahir',
              url: `${SITE.origin}/about/`,
            },
            ...(loaderData.demoURL || loaderData.repoURL
              ? {
                  sameAs: [loaderData.demoURL, loaderData.repoURL].filter(
                    Boolean,
                  ),
                }
              : {}),
          },
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects/' },
            { name: loaderData.title, path },
          ]),
        ],
      },
    })
  },
  component: ProjectPage,
})

function ProjectPage() {
  const { slug } = Route.useParams()
  const project = getProject(slug)
  if (!project) return null
  const Content = project.Content
  return (
    <article className="post-page project-page">
      <header className="post-header page-frame">
        <Link to="/projects/" className="eyebrow">
          ← Projects
        </Link>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        <div className="post-byline">
          <time dateTime={project.date}>{formatDate(project.date)}</time>
          <a
            href={`/projects/${project.slug}.md`}
            rel="alternate"
            type="text/markdown"
          >
            Markdown
          </a>
        </div>
      </header>
      <div className="post-body page-frame">
        <Suspense fallback={<p>Loading project…</p>}>
          <Content />
        </Suspense>
      </div>
    </article>
  )
}
