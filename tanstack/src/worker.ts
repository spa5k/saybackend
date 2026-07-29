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

export default {
  async fetch(
    request: Request,
    env: { ASSETS: { fetch: (request: Request) => Promise<Response> } },
  ) {
    const url = new URL(request.url)
    const match = url.pathname.match(/^\/blog\/([^/]+)\/?$/)
    const destination = match ? legacyPosts.get(match[1]) : undefined

    if (destination) {
      url.pathname = `${destination}/`
      return Response.redirect(url.href, 301)
    }

    return env.ASSETS.fetch(request)
  },
}
