import { Link, createFileRoute } from '@tanstack/react-router'

import { PageHero } from '@/components/paper/PageHero'
import { PostTiles, PostTimeline } from '@/components/paper/HomeParts'
import { PostList } from '@/components/paper/PostList'
import { formatDate, posts } from '@/lib/content'
import { heroOf } from '@/lib/heroes'
import { PAGE_META, SITE, breadcrumb, seo } from '@/lib/site'

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
              'An engineering blog dedicated to backend systems, DevOps, and structural data patterns',
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
            sameAs: [
              'https://github.com/spa5k',
              'https://linkedin.com/in/kamrantahir2',
              'https://kamran.sh/',
            ],
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
  const [lead, ...rest] = posts
  return (
    <>
      <PageHero
        motif={heroOf(lead)}
        eyebrow={<span className="hand">newest</span>}
        title={
          <Link to="/blog/$slug/" params={{ slug: lead.slug }} reloadDocument>
            {lead.title}
          </Link>
        }
        meta={
          <>
            {lead.description}
            <span className="home-lead-date">
              {formatDate(lead.date)} · {lead.readingMinutes} min
            </span>
          </>
        }
        heading={false}
      />
      <section className="page-frame home">
        <h1 className="sr-only">
          SayBackend: backend engineering and DevOps blog
        </h1>
        <PostTiles posts={rest.slice(0, 6)} />
        <PostTimeline posts={posts} />
        <h2 className="home-list-title">More writing</h2>
        <PostList posts={rest.slice(6, 14)} />
        <div className="home-more">
          <Link to="/blog/" className="pill">
            All writing →
          </Link>
          <Link to="/projects/" className="pill">
            Projects
          </Link>
          <Link to="/about/" className="pill">
            About me
          </Link>
        </div>
      </section>
    </>
  )
}
