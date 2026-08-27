import { Link, createFileRoute } from '@tanstack/react-router'

import { navigableTags } from '@/lib/content'
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
  return (
    <section className="page-frame collection-page">
      <header className="page-heading">
        <p className="eyebrow">Index</p>
        <h1>Tags</h1>
        <p>Recurring labels used across the archive.</p>
      </header>
      <div className="tag-cloud">
        {navigableTags.map(([tag, count]) => (
          <Link key={tag} to="/tags/$tag" params={{ tag }}>
            {tag} <span>{count}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
