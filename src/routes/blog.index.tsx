import { Link, createFileRoute } from '@tanstack/react-router'

import { formatDate, posts } from '@/lib/content'
import { PAGE_META, SITE, breadcrumb, seo } from '@/lib/site'
import { topicCards } from '@/lib/topics'

export const Route = createFileRoute('/blog/')({
  head: () =>
    seo({
      ...PAGE_META.blog,
      path: '/blog',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Backend Engineering Blog',
        description:
          'In-depth technical articles on backend development, DevOps, PostgreSQL, Kubernetes, and system architecture',
        url: `${SITE.origin}/blog/`,
        isPartOf: { '@type': 'WebSite', '@id': `${SITE.origin}/#website` },
        breadcrumb: breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog/' },
        ]),
      },
    }),
  component: BlogIndex,
})

function BlogIndex() {
  const byYear = posts.reduce<Record<string, typeof posts>>((years, post) => {
    const year = post.date.slice(0, 4)
    years[year] ??= []
    years[year].push(post)
    return years
  }, {})
  return (
    <section className="page-frame archive-page">
      <header className="page-heading">
        <p className="eyebrow">The archive</p>
        <h1>Writing on systems that have to work.</h1>
        <p>{PAGE_META.blog.description}</p>
      </header>
      <div className="topic-pills">
        {topicCards().map((topic) => (
          <Link
            key={topic.slug}
            to="/topics/$topic"
            params={{ topic: topic.slug }}
          >
            {topic.name} <span>{topic.count}</span>
          </Link>
        ))}
      </div>
      {Object.entries(byYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, yearPosts]) => (
          <section className="archive-year" key={year}>
            <h2>{year}</h2>
            <div>
              {yearPosts.map((post) => (
                <article className="archive-row" key={post.slug}>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <div>
                    <h3>
                      <Link to="/blog/$slug" params={{ slug: post.slug }}>
                        {post.title}
                      </Link>
                    </h3>
                    <p>{post.description}</p>
                  </div>
                  <span>{post.readingMinutes} min</span>
                </article>
              ))}
            </div>
          </section>
        ))}
    </section>
  )
}
