import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { formatDate } from '@/lib/content'
import { SITE, breadcrumb, seo } from '@/lib/site'
import { postsForTopic, topics } from '@/lib/topics'

export const Route = createFileRoute('/topics/$topic')({
  loader: ({ params }) => {
    const topic = topics.find((item) => item.slug === params.topic)
    if (!topic) throw notFound()
    return topic
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const topicPosts = postsForTopic(loaderData)
    return seo({
      title: loaderData.title,
      description: loaderData.description,
      path: `/topics/${loaderData.slug}`,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            name: loaderData.title,
            description: loaderData.description,
            url: `${SITE.origin}/topics/${loaderData.slug}/`,
            isPartOf: { '@type': 'WebSite', '@id': `${SITE.origin}/#website` },
            about: loaderData.match,
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: topicPosts.map((post, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${SITE.origin}${post.href}/`,
                name: post.title,
              })),
            },
          },
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Topics', path: '/topics/' },
            { name: loaderData.name },
          ]),
        ],
      },
    })
  },
  component: TopicPage,
})

function TopicPage() {
  const topic = Route.useLoaderData()
  const topicPosts = postsForTopic(topic)
  return (
    <section className="page-frame archive-page">
      <header className="page-heading">
        <Link to="/topics" className="eyebrow">
          ← All topics
        </Link>
        <h1>{topic.title}</h1>
        <p>{topic.description}</p>
      </header>
      <div className="archive-year topic-results">
        <h2>{topicPosts.length}</h2>
        <div>
          {topicPosts.map((post) => (
            <article className="archive-row" key={post.slug}>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <div>
                <h3>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    reloadDocument
                  >
                    {post.title}
                  </Link>
                </h3>
                <p>{post.description}</p>
              </div>
              <span>{post.readingMinutes} min</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
