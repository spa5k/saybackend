import {
  Link,
  createFileRoute,
  notFound,
  redirect,
} from '@tanstack/react-router'
import { Suspense } from 'react'

import { MarkdownLogo } from '@phosphor-icons/react'

import {
  formatDate,
  getPost,
  getRelatedPosts,
  legacyPostRedirects,
  posts,
} from '@/lib/content'
import { Giscus } from '@/components/Giscus'
import { Circled } from '@/components/paper/Figure'
import { PageHero } from '@/components/paper/PageHero'
import { heroOf } from '@/lib/heroes'
import { markOf } from '@/lib/marks'
import CodeWindow from '@/components/mdx/CodeWindow'
import ResponsiveTable from '@/components/mdx/ResponsiveTable'
import { SITE, breadcrumb, seo, toIsoDateTime } from '@/lib/site'

export const Route = createFileRoute('/blog/$slug')({
  ssr: true,
  beforeLoad: ({ params }) => {
    const destination = legacyPostRedirects[params.slug]
    if (destination) {
      throw redirect({
        to: '/blog/$slug/',
        params: { slug: destination },
        statusCode: 301,
      })
    }
  },
  loader: ({ params }) => {
    const post = getPost(params.slug)
    if (!post) throw notFound()
    return {
      slug: post.slug,
      title: post.title,
      seoTitle: post.seoTitle,
      description: post.description,
      date: post.date,
      updated: post.updated,
      tags: post.tags ?? [],
      ogImage: post.ogImage,
      faqs: post.faqs,
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const url = `${SITE.origin}/blog/${loaderData.slug}/`
    const articleTags = loaderData.tags.slice(0, 12)
    return seo({
      title: loaderData.seoTitle ?? loaderData.title,
      description: loaderData.description,
      path: `/blog/${loaderData.slug}`,
      markdownPath: `/blog/${loaderData.slug}.md`,
      image: loaderData.ogImage,
      type: 'article',
      publishedTime: loaderData.date,
      modifiedTime: loaderData.updated ?? loaderData.date,
      tags: articleTags,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            headline: loaderData.title,
            image: new URL(
              loaderData.ogImage ?? '/images/blog.png',
              SITE.origin,
            ).href,
            url,
            author: {
              '@type': 'Person',
              '@id': `${SITE.origin}/#author`,
              name: 'Kamran Tahir',
              url: `${SITE.origin}/about/`,
            },
            publisher: {
              '@type': 'Organization',
              '@id': `${SITE.origin}/#organization`,
              name: SITE.title,
              logo: {
                '@type': 'ImageObject',
                url: `${SITE.origin}/images/saybackend.png`,
              },
            },
            datePublished: toIsoDateTime(loaderData.date),
            dateModified: toIsoDateTime(loaderData.updated ?? loaderData.date),
            description: loaderData.description,
            mainEntityOfPage: { '@type': 'WebPage', '@id': url },
            inLanguage: 'en-US',
            about: articleTags,
            keywords: articleTags.join(', '),
          },
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog/' },
            { name: loaderData.title },
          ]),
          ...(loaderData.faqs?.length
            ? [
                {
                  '@type': 'FAQPage',
                  mainEntity: loaderData.faqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: faq.answer,
                    },
                  })),
                },
              ]
            : []),
        ],
      },
    })
  },
  component: PostPage,
})

function PostPage() {
  const { slug } = Route.useParams()
  const post = getPost(slug)
  if (!post) return null
  const postIndex = posts.findIndex((item) => item.slug === post.slug)
  const newerPost = postIndex > 0 ? posts.at(postIndex - 1) : undefined
  const olderPost = posts.at(postIndex + 1)
  const related = getRelatedPosts(post).filter(
    (candidate) =>
      candidate.slug !== newerPost?.slug && candidate.slug !== olderPost?.slug,
  )
  const Content = post.Content

  return (
    <article className="post-page">
      <PageHero
        motif={heroOf(post)}
        eyebrow={markOf(post).name}
        title={<PostTitle title={post.title} />}
        meta={
          <div className="post-byline">
            <a
              href="https://kamran.sh/"
              target="_blank"
              rel="noopener"
              title="Portfolio"
            >
              Kamran Tahir
            </a>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>{post.readingMinutes} min</span>
            <a
              href={`/blog/${post.slug}.md`}
              rel="alternate"
              type="text/markdown"
              title="View this article as Markdown"
            >
              <MarkdownLogo aria-hidden size={13} weight="bold" />
              Markdown
            </a>
          </div>
        }
      />
      {post.wip ? (
        <div className="page-narrow wip-note">
          This article is a work in progress and may change.
        </div>
      ) : null}
      <div className="post-body" data-pagefind-body>
        <Suspense fallback={null}>
          <Content components={{ pre: CodeWindow, table: ResponsiveTable }} />
        </Suspense>
        <footer className="post-end not-typography" data-pagefind-ignore="">
          <div className="post-tags">
            <span className="post-tombstone" aria-hidden="true" />
            {(post.tags ?? []).slice(0, 5).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <span className="hand">— Kamran</span>
        </footer>
      </div>
      <nav className="post-navigation" aria-label="More articles">
        {newerPost ? (
          <Link
            to="/blog/$slug/"
            params={{ slug: newerPost.slug }}
            reloadDocument
          >
            <span>← Newer</span>
            <strong>{newerPost.title}</strong>
          </Link>
        ) : (
          <span />
        )}
        {olderPost ? (
          <Link
            to="/blog/$slug/"
            params={{ slug: olderPost.slug }}
            reloadDocument
          >
            <span>Older →</span>
            <strong>{olderPost.title}</strong>
          </Link>
        ) : null}
      </nav>
      <section className="post-comments" aria-label="Comments">
        <p className="eyebrow">Discussion</p>
        <Giscus term={post.oldPath} />
      </section>
      {related.length ? (
        <aside className="related-posts">
          <p className="eyebrow">Keep reading</p>
          <div>
            {related.map((item) => (
              <Link
                key={item.slug}
                to="/blog/$slug/"
                params={{ slug: item.slug }}
                reloadDocument
              >
                <span>{item.tags?.[0] ?? 'Article'}</span>
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>
        </aside>
      ) : null}
    </article>
  )
}

/**
 * "Name: the rest" titles get the name in bold sans above the serif line.
 * The first headline number (77×, 95%) gets a pen circle.
 */
function PostTitle({ title }: { title: string }) {
  const split = title.match(/^([^:]{3,36}):\s+(.+)$/)
  const lead = split?.[1]
  const rest = split?.[2] ?? title
  const figure = rest.match(/\d[\d.,]*\s?(?:×|%)/)
  const start = figure?.index ?? -1
  return (
    <>
      {lead ? <b>{lead}:</b> : null}
      {figure && start >= 0 ? (
        <>
          {rest.slice(0, start)}
          <Circled>{figure[0]}</Circled>
          {rest.slice(start + figure[0].length)}
        </>
      ) : (
        rest
      )}
    </>
  )
}
