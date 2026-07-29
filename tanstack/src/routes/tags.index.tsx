import { Link, createFileRoute } from '@tanstack/react-router'

import { posts } from '@/lib/content'
import { seo } from '@/lib/site'

export const Route = createFileRoute('/tags/')({
  head: () =>
    seo({
      title: 'Tags',
      description: 'List of tags used.',
      path: '/tags',
      noindex: true,
    }),
  component: Tags,
})

function Tags() {
  const counts = new Map<string, number>()
  posts.forEach((post) =>
    post.tags?.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
  )
  const tags = [...counts.entries()].sort((a, b) => b[1] - a[1])

  return (
    <section className="page-frame collection-page">
      <header className="page-heading">
        <p className="eyebrow">Index</p>
        <h1>Tags</h1>
        <p>Every label used across the archive.</p>
      </header>
      <div className="tag-cloud">
        {tags.map(([tag, count]) => (
          <Link key={tag} to="/tags/$tag" params={{ tag }}>
            {tag} <span>{count}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
