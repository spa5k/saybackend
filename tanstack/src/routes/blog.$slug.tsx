import {
  Link,
  createFileRoute,
  notFound,
  redirect,
} from '@tanstack/react-router'
import { Suspense } from 'react'

import {
  formatDate,
  getPost,
  getRelatedPosts,
  legacyPostRedirects,
  posts,
} from '@/lib/content'
import { Giscus } from '@/components/Giscus'
import { SITE, breadcrumb, seo } from '@/lib/site'

export const Route = createFileRoute('/blog/$slug')({
  beforeLoad: ({ params }) => {
    const destination = legacyPostRedirects[params.slug]
    if (destination) {
      throw redirect({ href: destination, statusCode: 301 })
    }
  },
  loader: ({ params }) => {
    const post = getPost(params.slug)
    if (!post) throw notFound()
    return {
      slug: post.slug,
      title: post.title,
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
      title: loaderData.title,
      description: loaderData.description,
      path: `/blog/${loaderData.slug}`,
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
            datePublished: loaderData.date,
            dateModified: loaderData.updated ?? loaderData.date,
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
  const related = getRelatedPosts(post)
  const postIndex = posts.findIndex((item) => item.slug === post.slug)
  const newerPost = postIndex > 0 ? posts.at(postIndex - 1) : undefined
  const olderPost = posts.at(postIndex + 1)
  const Content = post.Content

  return (
    <article className="post-page">
      <header className="post-header page-frame">
        <Link to="/blog" className="eyebrow">
          ← Blog archive
        </Link>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
        <div className="post-byline">
          <span>By Kamran Tahir</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>{post.readingMinutes} min read</span>
        </div>
        <div className="post-tags">
          {(post.tags ?? []).slice(0, 6).map((tag) => (
            <Link key={tag} to="/tags/$tag" params={{ tag }}>
              {tag}
            </Link>
          ))}
        </div>
      </header>
      {post.wip ? (
        <div className="page-frame wip-note">
          This article is a work in progress and may change.
        </div>
      ) : null}
      <div className="post-body page-frame" data-pagefind-body>
        <Suspense fallback={<p>Loading article…</p>}>
          <Content />
        </Suspense>
        {post.faqs?.length ? (
          <section className="post-faq" aria-labelledby="frequently-asked">
            <p className="eyebrow">Quick answers</p>
            <h2 id="frequently-asked">Frequently asked questions</h2>
            <div>
              {post.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <nav className="post-navigation page-frame" aria-label="More articles">
        {newerPost ? (
          <Link to="/blog/$slug" params={{ slug: newerPost.slug }}>
            <span>← Newer</span>
            <strong>{newerPost.title}</strong>
          </Link>
        ) : (
          <span />
        )}
        {olderPost ? (
          <Link to="/blog/$slug" params={{ slug: olderPost.slug }}>
            <span>Older →</span>
            <strong>{olderPost.title}</strong>
          </Link>
        ) : null}
      </nav>
      {related.length ? (
        <aside className="related-posts page-frame">
          <p className="eyebrow">Keep reading</p>
          <div>
            {related.map((item) => (
              <Link
                key={item.slug}
                to="/blog/$slug"
                params={{ slug: item.slug }}
              >
                <span>{item.tags?.[0] ?? 'Article'}</span>
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>
        </aside>
      ) : null}
      <section className="post-comments page-frame" aria-label="Comments">
        <p className="eyebrow">Discussion</p>
        <Giscus term={post.oldPath} />
      </section>
    </article>
  )
}
