import '@tanstack/react-start/server-only'

import GithubSlugger from 'github-slugger'
import MiniSearch from 'minisearch'

import { isPublished, posts } from '@/lib/content'
import { markOf } from '@/lib/marks'
import { getBlogMarkdown } from '@/lib/markdown.server'
import { searchOptions } from '@/lib/search'
import type { SearchSection } from '@/lib/search'

const SKIPPED_SECTIONS = new Set(['sources', 'references'])

/** Inline Markdown to the text a reader sees: no link targets or markup. */
function inlineText(markdown: string) {
  // Code spans keep their text as written, underscores and all.
  return markdown
    .split(/(`[^`]*`)/)
    .map((part) =>
      part.startsWith('`') && part.endsWith('`') && part.length > 1
        ? part.slice(1, -1)
        : part
            .replace(/\[Interactive element: [^\]]*\]\([^)]*\)/g, ' ')
            .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\$\$?([^$]*)\$\$?/g, '$1')
            .replace(/(\*{1,3}|~~)(\S(?:.*?\S)?)\1/g, '$2')
            .replace(/(^|[^\w])_{1,3}(\S(?:.*?\S)?)_{1,3}(?=[^\w]|$)/g, '$1$2'),
    )
    .join('')
}

/** Block Markdown to plain words for the index. */
function plainText(markdown: string) {
  return inlineText(
    markdown
      .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
      .replace(/^\s*>\s?/gm, '')
      .replace(/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm, ' ')
      .replace(/\|/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Splits a post at its headings. Anchors come from the same slugger, in the
 * same order, as the heading ids that rehype-slug writes into the page.
 */
function sectionsOf(markdown: string) {
  const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, '')
  const slugger = new GithubSlugger()
  const sections: Array<{
    heading: string
    anchor: string
    lines: Array<string>
  }> = [{ heading: '', anchor: '', lines: [] }]
  let inFence = false

  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (heading) {
      const text = inlineText(heading[2]).trim()
      sections.push({ heading: text, anchor: slugger.slug(text), lines: [] })
      continue
    }
    sections.at(-1)?.lines.push(line)
  }

  return sections
    .filter((section) => !SKIPPED_SECTIONS.has(section.heading.toLowerCase()))
    .map((section) => ({
      ...section,
      text: plainText(section.lines.join('\n')),
    }))
    .filter((section) => section.text || section.heading)
}

/** Published blog posts only: no drafts and no posts dated after the build. */
export function buildSearchIndex() {
  const index = new MiniSearch<SearchSection>(searchOptions)

  for (const post of posts.filter(isPublished)) {
    const document = getBlogMarkdown(post.slug)
    if (!document) continue
    const mark = markOf(post).mark
    const tags = (post.tags ?? []).join(' ')

    index.addAll(
      sectionsOf(document.source).map((section, position) => ({
        id: `${post.slug}#${section.anchor}`,
        slug: post.slug,
        anchor: section.anchor,
        title: post.title,
        heading: section.heading,
        // The intro also carries the description, which the page shows first.
        text:
          position === 0 && !section.heading
            ? `${post.description} ${section.text}`.trim()
            : section.text,
        // Tags belong to the post, so only its first section carries them.
        tags: position === 0 ? tags : '',
        date: post.date.slice(0, 10),
        mark,
      })),
    )
  }

  return index
}
