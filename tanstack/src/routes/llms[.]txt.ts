import { createFileRoute } from '@tanstack/react-router'

import { posts, projects } from '@/lib/content'
import { SITE } from '@/lib/site'

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const text = `# ${SITE.title}

> ${SITE.description}

SayBackend is Kamran Tahir's engineering publication about backend systems, DevOps, databases, infrastructure, and practical AI tooling.

## Main pages

- [Home](${SITE.origin}/)
- [Blog archive](${SITE.origin}/blog/)
- [Topic guides](${SITE.origin}/topics/)
- [Projects](${SITE.origin}/projects/)
- [About the author](${SITE.origin}/about/)
- [RSS feed](${SITE.origin}/rss.xml)

## Articles

${posts
  .map(
    (post) =>
      `- [${post.title}](${SITE.origin}${post.href}/): ${post.description}\n  - [Markdown](${SITE.origin}${post.href}.md)`,
  )
  .join('\n')}

## Projects

${projects
  .map(
    (project) =>
      `- [${project.title}](${SITE.origin}${project.href}/): ${project.description}\n  - [Markdown](${SITE.origin}${project.href}.md)`,
  )
  .join('\n')}
`

        return new Response(text, {
          headers: {
            'Cache-Control':
              'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
            'Content-Type': 'text/plain; charset=utf-8',
          },
        })
      },
    },
  },
})
