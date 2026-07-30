import { Link, createFileRoute } from '@tanstack/react-router'

import { formatDate, posts, projects } from '@/lib/content'
import { PAGE_META, SITE, breadcrumb, seo } from '@/lib/site'
import { topicCards } from '@/lib/topics'

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      ...PAGE_META.home,
      path: '/',
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${SITE.origin}/#website`,
            url: `${SITE.origin}/`,
            name: SITE.title,
            description:
              'A engineering blog dedicated to backend systems, DevOps, and structural data patterns',
            publisher: { '@id': `${SITE.origin}/#organization` },
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE.origin}/pagefind/?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@type': 'Organization',
            '@id': `${SITE.origin}/#organization`,
            name: SITE.title,
            url: `${SITE.origin}/`,
            logo: {
              '@type': 'ImageObject',
              url: `${SITE.origin}/favicon.ico`,
            },
            sameAs: ['https://github.com/spa5k'],
            contactPoint: {
              '@type': 'ContactPoint',
              email: SITE.email,
              contactType: 'customer service',
            },
          },
          breadcrumb([{ name: 'Home', path: '/' }]),
        ],
      },
    }),
  component: Home,
})

function Home() {
  const [featured, ...recent] = posts
  const topics = topicCards().slice(0, 8)

  return (
    <>
      <section className="page-frame journal-home">
        <aside className="journal-rail">
          <img
            src="/images/editorial-still-life-320.webp"
            alt=""
            className="rail-illustration"
            aria-hidden="true"
            width={320}
            height={213}
            loading="lazy"
            decoding="async"
          />
          <p className="rail-intro">
            Notes on systems, patterns, and the daily work of building reliable
            software.
          </p>
          <div className="rail-rule" />
          <p className="rail-copy">
            I write about backend systems, DevOps, and the messy middle where
            architecture meets reality. Expect code, tradeoffs, and the
            occasional post-mortem.
          </p>
          <Link to="/about" className="text-link">
            More about me →
          </Link>
          <div className="rail-rule" />
          <p className="eyebrow">Topics</p>
          <ul className="topic-index">
            {topics.map((topic) => (
              <li key={topic.slug}>
                <Link to="/topics/$topic" params={{ topic: topic.slug }}>
                  <span>{topic.name}</span>
                  <span>{topic.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/topics" className="text-link">
            All topics →
          </Link>
        </aside>

        <div className="journal-content">
          <article className="featured-story">
            <div className="featured-copy">
              <p className="eyebrow">Latest essay</p>
              <h1>
                <Link to="/blog/$slug" params={{ slug: featured.slug }}>
                  {featured.title}
                </Link>
              </h1>
              <p className="featured-summary">{featured.description}</p>
              <Link
                to="/blog/$slug"
                params={{ slug: featured.slug }}
                className="text-link featured-link"
              >
                Read the essay →
              </Link>
            </div>
            <img
              src="/images/editorial-still-life-640.webp"
              alt="Etched illustration of technical books, coffee, and an open notebook"
              className="featured-illustration"
              width={640}
              height={427}
              decoding="async"
              fetchPriority="high"
            />
          </article>

          <div className="post-ledger">
            {recent.slice(0, 4).map((post) => (
              <article className="ledger-row" key={post.slug}>
                <div className="ledger-meta">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span>{post.readingMinutes} min read</span>
                </div>
                <h2>
                  <Link to="/blog/$slug" params={{ slug: post.slug }}>
                    {post.title}
                  </Link>
                </h2>
                <span className="ledger-topic">
                  {post.tags?.[0] ?? 'Notes'}
                </span>
              </article>
            ))}
          </div>
          <Link to="/blog" className="text-link archive-link">
            View full archive →
          </Link>
        </div>
      </section>

      <section className="projects-strip">
        <div className="page-frame projects-strip-inner">
          <p className="eyebrow">Projects & experiments</p>
          {projects.map((project) => (
            <article key={project.slug}>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <Link
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="text-link"
              >
                Read more →
              </Link>
            </article>
          ))}
          <article>
            <h2>More writing</h2>
            <p>Browse the complete collection of articles and build logs.</p>
            <Link to="/blog" className="text-link">
              See the archive →
            </Link>
          </article>
        </div>
      </section>
    </>
  )
}
