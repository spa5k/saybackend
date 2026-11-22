import type { ComponentProps } from 'react'

import { unpublishedSlugs } from '@/lib/content'

const POST_PATH =
  /^(?:https:\/\/saybackend\.com)?\/blog\/([^/#?]+)\/?(?:[#?].*)?$/

/**
 * A link in a post. A link to a post that is not published yet shows as
 * plain text, and the daily build makes it a link on the day that post
 * goes out.
 */
export default function PostLink({ href, ...props }: ComponentProps<'a'>) {
  const slug = href?.match(POST_PATH)?.[1]
  if (slug && unpublishedSlugs.has(slug)) return <span>{props.children}</span>
  return <a href={href} {...props} />
}
