import { Link, createFileRoute } from '@tanstack/react-router'

import { SITE, breadcrumb, seo } from '@/lib/site'
import { topicCards } from '@/lib/topics'

export const Route = createFileRoute('/topics/')({
  head: () =>
    seo({
      title: 'Topics',
      description: 'Content clusters and learning paths.',
      path: '/topics',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Topics',
        description:
          'Content clusters and learning paths on backend engineering.',
        url: `${SITE.origin}/topics/`,
        isPartOf: { '@type': 'WebSite', '@id': `${SITE.origin}/#website` },
        breadcrumb: breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Topics', path: '/topics/' },
        ]),
      },
    }),
  component: Topics,
})

function Topics() {
  return (
    <section className="page-frame collection-page">
      <header className="page-heading">
        <p className="eyebrow">Learning paths</p>
        <h1>Topics</h1>
        <p>Focused trails through the writing, grouped by the problem space.</p>
      </header>
      <div className="topic-grid">
        {topicCards().map((topic) => (
          <Link
            key={topic.slug}
            to="/topics/$topic"
            params={{ topic: topic.slug }}
          >
            <span className="eyebrow">
              {topic.count} article{topic.count === 1 ? '' : 's'}
            </span>
            <h2>{topic.name}</h2>
            <p>{topic.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
