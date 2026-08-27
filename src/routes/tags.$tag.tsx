import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { formatDate, isNavigableTag, posts } from '@/lib/content'
import { seo } from '@/lib/site'

export const Route = createFileRoute('/tags/$tag')({
  loader: ({ params }) => {
    if (!isNavigableTag(params.tag)) throw notFound()
    const tagPosts = posts.filter((post) => post.tags?.includes(params.tag))
    if (!tagPosts.length) throw notFound()
    return {
      tag: params.tag,
      posts: tagPosts.map(
        ({ slug, title, description, date, readingMinutes }) => ({
          slug,
          title,
          description,
          date,
          readingMinutes,
        }),
      ),
    }
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo({
          title: `Tag: ${loaderData.tag}`,
          description: `Posts with the tag: ${loaderData.tag}`,
          path: `/tags/${encodeURIComponent(loaderData.tag)}`,
          noindex: true,
        })
      : {},
  component: TagPage,
})

function TagPage() {
  const data = Route.useLoaderData()
  return (
    <section className="page-frame archive-page">
      <header className="page-heading">
        <Link to="/tags" className="eyebrow">
          ← All tags
        </Link>
        <h1>{data.tag}</h1>
        <p>{data.posts.length} entries in this part of the archive.</p>
      </header>
      <div className="archive-year topic-results">
        <h2>{data.posts.length}</h2>
        <div>
          {data.posts.map((post) => (
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
