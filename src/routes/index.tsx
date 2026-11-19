import { Link, createFileRoute } from '@tanstack/react-router'

import { Circled } from '@/components/paper/Figure'
import { PostCalendar } from '@/components/paper/PostCalendar'
import { PostList } from '@/components/paper/PostList'
import { posts } from '@/lib/content'
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
  return (
    <section className="page-narrow home">
      <h1 className="sr-only">
        SayBackend: backend engineering and DevOps blog
      </h1>
      <div className="home-hero">
        <PostCalendar posts={posts} />
        <div>
          <p className="home-hero-title" role="presentation">
            Backend systems, measured and <Circled>drawn</Circled>.
          </p>
          <p className="note-card taped hand">
            Expect code, tradeoffs, and the occasional post-mortem.
          </p>
        </div>
      </div>
      <PostList posts={posts.slice(0, 8)} flagNewest />
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
  )
}
