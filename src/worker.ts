import handler from '@tanstack/react-start/server-entry'

const legacyPosts = new Map([
  ['00-saybackend-changelog', '/blog/2024-jun-saybackend-changelog'],
  ['01-zustand-url-state', '/blog/2023-dec-zustand-url-state-sharing'],
  ['02-golang-dockerfile', '/blog/2024-jun-golang-dockerfile-optimized'],
  [
    '03-electron-nextjs-ssr',
    '/blog/2024-aug-nextjs-electron-server-components',
  ],
  [
    '04-deploy-nextjs-to-production-without-vercel',
    '/blog/2024-sep-nextjs-deploy-any-server',
  ],
  ['05-kafka-in-docker-kraft', '/blog/2025-jan-kafka-docker-kraft-mode'],
  ['06-rag-chunking', '/blog/2025-feb-text-chunking-rag-systems'],
  ['11-happycontext-wide-logging', '/blog/happycontext-wide-logging-golang'],
  [
    '12-happymode-macos-appearance-scheduler',
    '/blog/happymode-macos-appearance-scheduler',
  ],
])

/**
 * Public tag archives were retired (they duplicated /topics/ hubs and left
 * hundreds of low-value URLs in Google's index). Tags that map cleanly to a
 * topic keep their equity through a 301; everything else returns 410 Gone so
 * Google drops the URLs quickly.
 */
const retiredTagTopics = new Map<string, string>([
  ['kafka', 'kafka-streaming'],
  ['apache-kafka', 'kafka-streaming'],
  ['kafka-with-docker', 'kafka-streaming'],
  ['kafka-local-cluster', 'kafka-streaming'],
  ['kafka-local-setup', 'kafka-streaming'],
  ['local-kafka-setup', 'kafka-streaming'],
  ['kafka-kraft-cluster', 'kafka-streaming'],
  ['kafka-without-zookeeper', 'kafka-streaming'],
  ['kafka-broker-setup', 'kafka-streaming'],
  ['message-queue', 'kafka-streaming'],
  ['docker', 'docker-deployment'],
  ['docker-compose', 'docker-deployment'],
  ['devops', 'docker-deployment'],
  ['deployment', 'docker-deployment'],
  ['production', 'docker-deployment'],
  ['local-development', 'docker-deployment'],
  ['golang', 'go-backend'],
  ['go', 'go-backend'],
  ['gin', 'go-backend'],
  ['zap', 'go-backend'],
  ['slog', 'go-backend'],
  ['logging', 'go-backend'],
  ['structured-logging', 'go-backend'],
  ['production-logging', 'go-backend'],
  ['log-sampling', 'go-backend'],
  ['contextual-logging', 'go-backend'],
  ['wide-events', 'go-backend'],
  ['postgres', 'postgresql'],
  ['postgresql', 'postgresql'],
  ['database', 'postgresql'],
  ['uuid', 'postgresql'],
  ['uuidv7', 'postgresql'],
  ['pgrx', 'postgresql'],
  ['nextjs', 'nextjs'],
  ['next.js', 'nextjs'],
  ['ssr', 'nextjs'],
  ['rsc', 'nextjs'],
  ['electron', 'nextjs'],
  ['react', 'nextjs'],
  ['vercel', 'nextjs'],
  ['rag', 'ai-rag'],
  ['ai', 'ai-rag'],
  ['chunking', 'ai-rag'],
  ['rag-chunking-strategies', 'ai-rag'],
  ['text-preprocessing', 'ai-rag'],
  ['embeddings', 'ai-rag'],
  ['semantic-search', 'ai-rag'],
  ['llm', 'ai-rag'],
  ['anthropic', 'ai-rag'],
  ['ai-research', 'ai-rag'],
])

/** Page routes are all lowercase; wrong-case variants (e.g. /Blog) must not
 * render duplicate 200s. Asset paths (images, fonts, files) keep their case. */
const lowercaseRoutePrefixes = [
  '/blog',
  '/topics',
  '/projects',
  '/about',
  '/hiring',
]

const goneHeaders = {
  'X-Robots-Tag': 'noindex, follow',
  'Cache-Control': 'public, max-age=3600',
}

function retiredTagResponse(pathname: string) {
  const raw = pathname.replace(/^\/tags\/|\/+$/g, '')
  let tag: string
  try {
    tag = decodeURIComponent(raw).toLowerCase().replace(/\/+$/, '')
  } catch {
    tag = raw.toLowerCase()
  }
  const topic = retiredTagTopics.get(tag)
  if (topic) {
    return Response.redirect(`https://saybackend.com/topics/${topic}/`, 301)
  }
  return new Response(
    'This tag archive was retired. Browse topics instead: https://saybackend.com/topics/',
    {
      status: 410,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', ...goneHeaders },
    },
  )
}

export default {
  async fetch(request: Request) {
    const url = new URL(request.url)
    const pathname = url.pathname

    // Retired tag archives: redirect mapped tags to their topic hub, else 410.
    if (
      pathname === '/tags' ||
      pathname === '/tags/' ||
      pathname.startsWith('/tags/')
    ) {
      if (pathname === '/tags' || pathname === '/tags/') {
        return Response.redirect('https://saybackend.com/blog/', 301)
      }
      return retiredTagResponse(pathname)
    }

    // Legacy post slugs from the Astro era.
    const match = pathname.match(/^\/blog\/([^/]+)\/?$/)
    const destination = match ? legacyPosts.get(match[1]) : undefined
    if (destination) {
      url.pathname = `${destination}/`
      return Response.redirect(url.href, 301)
    }

    // Wrong-case page URLs (e.g. /Blog) consolidate to the lowercase canonical.
    const lowercased = pathname.toLowerCase()
    if (
      lowercaseRoutePrefixes.some(
        (prefix) =>
          lowercased.startsWith(prefix) &&
          pathname !== lowercased &&
          !pathname.includes('.'),
      )
    ) {
      url.pathname = lowercased.endsWith('/') ? lowercased : `${lowercased}/`
      return Response.redirect(url.href, 301)
    }

    return handler.fetch(request)
  },
}
