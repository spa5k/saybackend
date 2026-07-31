const baseUrl = process.env.SITE_URL ?? 'http://127.0.0.1:3000'
const productionOrigin = 'https://saybackend.com'

const legacyRedirects = {
  '00-saybackend-changelog': '/blog/2024-jun-saybackend-changelog',
  '01-zustand-url-state': '/blog/2023-dec-zustand-url-state-sharing',
  '02-golang-dockerfile': '/blog/2024-jun-golang-dockerfile-optimized',
  '03-electron-nextjs-ssr': '/blog/2024-aug-nextjs-electron-server-components',
  '04-deploy-nextjs-to-production-without-vercel':
    '/blog/2024-sep-nextjs-deploy-any-server',
  '05-kafka-in-docker-kraft': '/blog/2025-jan-kafka-docker-kraft-mode',
  '06-rag-chunking': '/blog/2025-feb-text-chunking-rag-systems',
  '11-happycontext-wide-logging': '/blog/happycontext-wide-logging-golang',
  '12-happymode-macos-appearance-scheduler':
    '/blog/happymode-macos-appearance-scheduler',
}

function attribute(html, selector, name, requiredName, requiredValue) {
  const tags = html.match(new RegExp(`<${selector}[^>]*>`, 'g')) ?? []
  for (const tag of tags) {
    if (requiredName && !tag.includes(`${requiredName}="${requiredValue}"`)) {
      continue
    }
    const value = tag.match(new RegExp(`${name}="([^"]*)"`))?.[1]
    if (value) return value
  }
}

function canonicalFor(path) {
  const normalized = path === '/' ? '/' : `${path.replace(/\/$/, '')}/`
  return new URL(normalized, productionOrigin).href
}

const sitemapResponse = await fetch(`${baseUrl}/sitemap-0.xml`)
if (!sitemapResponse.ok) {
  throw new Error(`Sitemap returned ${sitemapResponse.status}`)
}

const sitemap = await sitemapResponse.text()
if (sitemap.includes(`${productionOrigin}/tags/`)) {
  throw new Error('Tag archives must stay excluded from the sitemap')
}

const sitemapPaths = Array.from(
  sitemap.matchAll(
    new RegExp(
      `<loc>${productionOrigin.replace('.', '\\.')}([^<]*)</loc>`,
      'g',
    ),
  ),
  (match) => match[1],
)
const pagePaths = [
  ...new Set([...sitemapPaths, '/tags/', '/hiring/', '/pagefind']),
]
const markdownPaths = sitemapPaths
  .filter(
    (path) =>
      /^\/blog\/[^/]+\/$/.test(path) || /^\/projects\/[^/]+\/$/.test(path),
  )
  .map((path) => `${path.slice(0, -1)}.md`)
const failures = []

for (const path of pagePaths) {
  const response = await fetch(new URL(path, baseUrl))
  const html = await response.text()
  const expectedCanonical = canonicalFor(path)
  const actualCanonical = attribute(html, 'link', 'href', 'rel', 'canonical')
  const isArticle = path.startsWith('/blog/') && path !== '/blog/'
  const publishedTime = isArticle
    ? attribute(html, 'meta', 'content', 'property', 'article:published_time')
    : undefined
  const modifiedTime = isArticle
    ? attribute(html, 'meta', 'content', 'property', 'article:modified_time')
    : undefined
  const hasMarkdownDocument =
    (path.startsWith('/blog/') && path !== '/blog/') ||
    (path.startsWith('/projects/') && path !== '/projects/')
  const markdownAlternate = hasMarkdownDocument
    ? `${productionOrigin}${path.replace(/\/$/, '')}.md`
    : undefined

  if (
    response.status !== 200 ||
    !html.includes('<title>') ||
    !html.includes('name="description"') ||
    !html.includes('name="robots"') ||
    !html.includes('property="og:title"') ||
    !html.includes('name="twitter:card"') ||
    actualCanonical !== expectedCanonical ||
    (hasMarkdownDocument &&
      !html.includes(
        `rel="alternate" type="text/markdown" href="${markdownAlternate}"`,
      )) ||
    (isArticle &&
      (!html.includes('property="og:type" content="article"') ||
        !publishedTime?.match(/T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/) ||
        !modifiedTime?.match(/T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/) ||
        !html.includes('"@type":"BlogPosting"')))
  ) {
    failures.push({
      path,
      status: response.status,
      expectedCanonical,
      actualCanonical,
    })
  }
}

for (const path of markdownPaths) {
  const response = await fetch(new URL(path, baseUrl))
  const source = await response.text()
  const canonicalPath = `${path.slice(0, -3)}/`
  const canonical = canonicalFor(canonicalPath)
  const link = response.headers.get('link')

  if (
    response.status !== 200 ||
    !response.headers.get('content-type')?.startsWith('text/markdown') ||
    response.headers.get('x-robots-tag') !== 'noindex, follow' ||
    link !== `<${canonical}>; rel="canonical"; type="text/html"` ||
    !source.startsWith('---') ||
    /^import\s+.+from\s+['"]@?\//m.test(source) ||
    /^<[A-Z][A-Za-z0-9]*\b/m.test(source) ||
    /^\s*\/>\s*$/m.test(source)
  ) {
    failures.push({
      path,
      status: response.status,
      contentType: response.headers.get('content-type'),
      link,
    })
  }
}

const missingMarkdownResponse = await fetch(
  `${baseUrl}/blog/not-a-real-article.md`,
)
if (missingMarkdownResponse.status !== 404) {
  failures.push({
    path: '/blog/not-a-real-article.md',
    status: missingMarkdownResponse.status,
  })
}

const singleUseTagResponse = await fetch(`${baseUrl}/tags/backend`)
if (singleUseTagResponse.status !== 404) {
  failures.push({
    path: '/tags/backend',
    status: singleUseTagResponse.status,
  })
}

const homeResponse = await fetch(baseUrl)
const home = await homeResponse.text()
const unexpectedCriticalAssets = [
  '/pagefind/pagefind-ui.css',
  '/pagefind/pagefind-ui.js',
  'HappyContextBlocks',
  'InteractiveDiagram',
  'PgStrictBlocks',
  'useShikiHighlight',
].filter((asset) => home.includes(asset))

if (unexpectedCriticalAssets.length > 0) {
  failures.push({
    path: '/',
    unexpectedCriticalAssets,
  })
}

for (const [from, expectedPath] of Object.entries(legacyRedirects)) {
  const response = await fetch(`${baseUrl}/blog/${from}`, {
    redirect: 'manual',
  })
  const location = response.headers.get('location')
  const expectedLocation = new URL(`${expectedPath}/`, baseUrl).href
  if (response.status !== 301 || location !== expectedLocation) {
    failures.push({
      path: `/blog/${from}`,
      status: response.status,
      expectedLocation,
      actualLocation: location,
    })
  }
}

for (const endpoint of [
  '/rss.xml',
  '/llms.txt',
  '/sitemap-index.xml',
  '/sitemap-0.xml',
  '/robots.txt',
]) {
  const response = await fetch(`${baseUrl}${endpoint}`)
  if (response.status !== 200) {
    failures.push({ path: endpoint, status: response.status })
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify(failures, null, 2))
  process.exitCode = 1
} else {
  console.log(
    `Verified ${pagePaths.length} content pages, ${Object.keys(legacyRedirects).length} legacy redirects, and 5 feed/discovery endpoints.`,
    `Verified ${markdownPaths.length} Markdown documents.`,
  )
}
