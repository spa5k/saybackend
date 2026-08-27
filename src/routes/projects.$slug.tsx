import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Suspense } from 'react'

import { formatDate, getProject } from '@/lib/content'
import { seo } from '@/lib/site'

export const Route = createFileRoute('/projects/$slug')({
  loader: ({ params }) => {
    const project = getProject(params.slug)
    if (!project) throw notFound()
    return {
      slug: project.slug,
      title: project.title,
      description: project.description,
      date: project.date,
    }
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo({
          title: loaderData.title,
          description: loaderData.description,
          path: `/projects/${loaderData.slug}`,
          markdownPath: `/projects/${loaderData.slug}.md`,
        })
      : {},
  component: ProjectPage,
})

function ProjectPage() {
  const { slug } = Route.useParams()
  const project = getProject(slug)
  if (!project) return null
  const Content = project.Content
  return (
    <article className="post-page project-page">
      <header className="post-header page-frame">
        <Link to="/projects" className="eyebrow">
          ← Projects
        </Link>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        <div className="post-byline">
          <time dateTime={project.date}>{formatDate(project.date)}</time>
          <a
            href={`/projects/${project.slug}.md`}
            rel="alternate"
            type="text/markdown"
          >
            Markdown
          </a>
        </div>
      </header>
      <div className="post-body page-frame">
        <Suspense fallback={<p>Loading project…</p>}>
          <Content />
        </Suspense>
      </div>
    </article>
  )
}
