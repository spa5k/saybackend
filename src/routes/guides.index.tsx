import { Link, createFileRoute } from '@tanstack/react-router'

import { formatDate } from '@/lib/content'
import { guides } from '@/lib/guides'
import { SITE, breadcrumb, seo } from '@/lib/site'

const META = {
  title: 'Guides - SayBackend',
  description:
    'Practical guides on backend engineering, DevOps, and building software.',
}

export const Route = createFileRoute('/guides/')({
  head: () =>
    seo({
      ...META,
      path: '/guides',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Guides',
        description: META.description,
        url: `${SITE.origin}/guides/`,
        isPartOf: { '@type': 'WebSite', '@id': `${SITE.origin}/#website` },
        breadcrumb: breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides/' },
        ]),
      },
    }),
  component: GuidesIndex,
})

function GuidesIndex() {
  return (
    <section className="page-frame archive-page">
      <header className="page-heading">
        <p className="eyebrow">Guides</p>
        <h1>Guides</h1>
        <p>{META.description}</p>
      </header>
      {guides.length ? (
        <section className="archive-year">
          <div>
            {guides.map((guide) => (
              <article className="archive-row" key={guide.slug}>
                <time dateTime={guide.created_at}>
                  {formatDate(guide.created_at)}
                </time>
                <div>
                  <h3>
                    <Link
                      to="/guides/$slug"
                      params={{ slug: guide.slug }}
                      reloadDocument
                    >
                      {guide.title}
                    </Link>
                  </h3>
                  <p>{guide.meta_description}</p>
                </div>
                <span>{guide.reading_time_minutes} min</span>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <p>No guides published yet.</p>
      )}
    </section>
  )
}
