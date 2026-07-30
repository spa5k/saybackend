import { Link, createFileRoute } from '@tanstack/react-router'

import { formatDate, projects } from '@/lib/content'
import { PAGE_META, SITE, breadcrumb, seo } from '@/lib/site'

export const Route = createFileRoute('/projects/')({
  head: () =>
    seo({
      ...PAGE_META.projects,
      path: '/projects',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'DevOps Projects & Portfolio',
        description: PAGE_META.projects.description,
        url: `${SITE.origin}/projects/`,
        isPartOf: { '@type': 'WebSite', '@id': `${SITE.origin}/#website` },
        breadcrumb: breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Projects', path: '/projects/' },
        ]),
      },
    }),
  component: Projects,
})

function Projects() {
  return (
    <section className="page-frame collection-page">
      <header className="page-heading">
        <p className="eyebrow">Selected work</p>
        <h1>Projects</h1>
        <p>{PAGE_META.projects.description}</p>
      </header>
      <div className="project-list">
        {projects.map((project, index) => (
          <article key={project.slug}>
            <span className="project-number">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h2>
                <Link to="/projects/$slug" params={{ slug: project.slug }}>
                  {project.title}
                </Link>
              </h2>
              <p>{project.description}</p>
            </div>
            <time dateTime={project.date}>{formatDate(project.date)}</time>
          </article>
        ))}
      </div>
    </section>
  )
}
