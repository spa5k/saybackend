import '@tanstack/react-start/server-only'

import { getPost, getProject } from '@/lib/content'
import { SITE } from '@/lib/site'

const blogSources = {
  ...import.meta.glob<string>('../content/blog/07-*/index.mdx', {
    eager: true,
    import: 'default',
    query: '?content-source-only',
  }),
  ...import.meta.glob<string>('../content/blog/10-*/index.mdx', {
    eager: true,
    import: 'default',
    query: '?content-source-only',
  }),
  ...import.meta.glob<string>('../content/blog/20*/index.mdx', {
    eager: true,
    import: 'default',
    query: '?content-source-only',
  }),
}

const projectSources = import.meta.glob<string>(
  '../content/projects/**/index.md',
  {
    eager: true,
    import: 'default',
    query: '?content-source-only',
  },
)

function directoryId(path: string) {
  return path.split('/').at(-2) ?? path
}

function sourcesById(sources: Record<string, string>) {
  return new Map(
    Object.entries(sources).map(([path, source]) => [
      directoryId(path),
      source,
    ]),
  )
}

const blogSourcesById = sourcesById(blogSources)
const projectSourcesById = sourcesById(projectSources)

type MarkdownDocument = {
  canonicalPath: string
  filename: string
  source: string
}

function stripMdxImports(source: string) {
  const lines = source.split('\n')
  const frontmatterEnd = lines.findIndex(
    (line, index) => index > 0 && line.trim() === '---',
  )
  if (frontmatterEnd === -1) return source

  let index = frontmatterEnd + 1
  while (index < lines.length) {
    if (!lines[index].trim()) {
      index += 1
      continue
    }
    if (!lines[index].trimStart().startsWith('import ')) break

    do {
      index += 1
    } while (index < lines.length && !lines[index - 1].trimEnd().endsWith(';'))
  }

  return [
    ...lines.slice(0, frontmatterEnd + 1),
    '',
    ...lines.slice(index),
  ].join('\n')
}

function humanizeComponent(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
}

function componentFallback(block: string, canonical: string) {
  const name = block.match(/^<([A-Za-z][A-Za-z0-9]*)/)?.[1] ?? 'Component'
  const alt = block
    .match(/\balt=(?:"([^"]*)"|'([^']*)')/)
    ?.slice(1)
    .find(Boolean)
  const title = block
    .match(/\btitle=(?:"([^"]*)"|'([^']*)')/)
    ?.slice(1)
    .find(Boolean)
  const directUrl = block
    .match(/\b(?:href|url|repo)=(?:"([^"]*)"|'([^']*)')/)
    ?.slice(1)
    .find(Boolean)

  if (name === 'Picture' || name === 'img') {
    const src = block
      .match(/\bsrc=(?:"([^"]*)"|'([^']*)')/)
      ?.slice(1)
      .find(Boolean)
    const label = alt || title || 'Article image'
    if (src) {
      return `![${label}](${new URL(src, SITE.origin).href})`
    }
    return `[Image: ${label}](${canonical})`
  }

  const label = title || humanizeComponent(name)
  if (directUrl) return `[${label}](${directUrl})`
  return `[Interactive element: ${label}](${canonical})`
}

function toPortableMarkdown(source: string, canonicalPath: string) {
  const canonical = new URL(canonicalPath, SITE.origin).href
  const lines = stripMdxImports(source).split('\n')
  const output: string[] = []
  let inFence = false

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      output.push(line)
      continue
    }
    if (inFence) {
      output.push(line)
      continue
    }

    const trimmed = line.trim()
    if (/^<\/[A-Z][A-Za-z0-9]*>$/.test(trimmed)) continue
    if (/^<Callout\b/.test(trimmed)) {
      const block = [line]
      while (
        !block.at(-1)?.trimEnd().endsWith('>') &&
        index + 1 < lines.length
      ) {
        block.push(lines[(index += 1)])
      }
      const markup = block.join(' ')
      const title = markup
        .match(/\btitle=(?:"([^"]*)"|'([^']*)')/)
        ?.slice(1)
        .find(Boolean)
      const type = markup.match(/\btype=(?:"([^"]*)"|'([^']*)')/)?.[1]
      output.push(`**${title || (type === 'warning' ? 'Warning' : 'Note')}:**`)
      continue
    }
    if (/^<(?:img\b|[A-Z][A-Za-z0-9]*\b)/.test(trimmed)) {
      const block = [line]
      while (
        !block.at(-1)?.trimEnd().endsWith('>') &&
        index + 1 < lines.length
      ) {
        block.push(lines[(index += 1)])
      }
      output.push(componentFallback(block.join(' '), canonical))
      continue
    }

    output.push(line)
  }

  return output
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function getBlogMarkdown(slug: string): MarkdownDocument | undefined {
  const post = getPost(slug)
  const source = post ? blogSourcesById.get(post.id) : undefined
  if (!post || !source) return

  const canonicalPath = `${post.href}/`
  return {
    canonicalPath,
    filename: `${post.slug}.md`,
    source: toPortableMarkdown(source, canonicalPath),
  }
}

export function getProjectMarkdown(slug: string): MarkdownDocument | undefined {
  const project = getProject(slug)
  const source = project ? projectSourcesById.get(project.id) : undefined
  if (!project || !source) return

  const canonicalPath = `${project.href}/`
  return {
    canonicalPath,
    filename: `${project.slug}.md`,
    source: toPortableMarkdown(source, canonicalPath),
  }
}

export function markdownResponse(document: MarkdownDocument | undefined) {
  if (!document) {
    return new Response('Markdown document not found.\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const canonical = new URL(document.canonicalPath, SITE.origin).href
  return new Response(
    document.source.endsWith('\n') ? document.source : `${document.source}\n`,
    {
      headers: {
        'Cache-Control':
          'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
        'Content-Disposition': `inline; filename="${document.filename}"`,
        'Content-Language': 'en',
        'Content-Type': 'text/markdown; charset=utf-8',
        Link: `<${canonical}>; rel="canonical"; type="text/html"`,
        'X-Robots-Tag': 'noindex, follow',
      },
    },
  )
}
