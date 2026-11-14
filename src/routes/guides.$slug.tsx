import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { formatDate } from '@/lib/content'
import { getGuide } from '@/lib/guides'
import { SITE, breadcrumb, seo, toIsoDateTime } from '@/lib/site'

export const Route = createFileRoute('/guides/$slug')({
  ssr: true,
  loader: ({ params }) => {
    const guide = getGuide(params.slug)
    if (!guide) throw notFound()
    return {
      slug: guide.slug,
      title: guide.title,
      description: guide.meta_description,
      image: guide.image_url,
      createdAt: guide.created_at,
      updatedAt: guide.updated_at,
      tags: guide.tags,
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const url = `${SITE.origin}/guides/${loaderData.slug}/`
    const tags = loaderData.tags.slice(0, 12)
    return seo({
      title: loaderData.title,
      description: loaderData.description,
      path: `/guides/${loaderData.slug}`,
      image: loaderData.image || undefined,
      type: 'article',
      author: null,
      publishedTime: loaderData.createdAt,
      modifiedTime: loaderData.updatedAt,
      tags,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            headline: loaderData.title,
            ...(loaderData.image ? { image: loaderData.image } : {}),
            url,
            author: { '@id': `${SITE.origin}/#organization` },
            publisher: {
              '@type': 'Organization',
              '@id': `${SITE.origin}/#organization`,
              name: SITE.title,
              logo: {
                '@type': 'ImageObject',
                url: `${SITE.origin}/images/saybackend.png`,
              },
            },
            datePublished: toIsoDateTime(loaderData.createdAt),
            dateModified: toIsoDateTime(loaderData.updatedAt),
            description: loaderData.description,
            mainEntityOfPage: { '@type': 'WebPage', '@id': url },
            inLanguage: 'en-US',
            keywords: tags.join(', '),
          },
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides/' },
            { name: loaderData.title },
          ]),
        ],
      },
    })
  },
  component: GuidePage,
})

function GuidePage() {
  const { slug } = Route.useParams()
  const guide = getGuide(slug)
  if (!guide) return null

  return (
    <article className="post-page">
      <header className="post-header page-frame">
        <Link to="/guides/" className="eyebrow">
          ← All guides
        </Link>
        <h1>{guide.title}</h1>
        <p>{guide.meta_description}</p>
        <div className="post-byline">
          <time dateTime={guide.created_at}>
            {formatDate(guide.created_at)}
          </time>
          <span>{guide.reading_time_minutes} min read</span>
        </div>
        {guide.tags.length ? (
          <div className="post-tags">
            {guide.tags.slice(0, 6).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </header>
      {/* Outrank HTML comes from our own Outrank account at build time. */}
      <div
        className="post-body page-frame"
        data-pagefind-body
        dangerouslySetInnerHTML={{ __html: guide.html }}
      />
    </article>
  )
}
