import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'

const output = new URL('../dist/client/', import.meta.url)
const notFoundSource = new URL('404/index.html', output)
const notFoundTarget = new URL('404.html', output)

await copyFile(notFoundSource, notFoundTarget)

const requiredArtifacts = [
  '404.html',
  'llms.txt',
  'rss.xml',
  'sitemap-index.xml',
  'sitemap-0.xml',
  'search-index.json',
]

await Promise.all(
  requiredArtifacts.map(async (path) => {
    const file = new URL(path, output)
    const info = await stat(file)
    if (!info.isFile() || info.size === 0) {
      throw new Error(`Missing static build artifact: ${path}`)
    }
  }),
)

// The search index must hold the published posts and nothing else: the same
// set of posts as the blog pages in the sitemap.
const sitemap = await readFile(new URL('sitemap-0.xml', output), 'utf8')
const publishedSlugs = new Set(
  Array.from(
    sitemap.matchAll(/<loc>[^<]*\/blog\/([^/<]+)\/<\/loc>/g),
    (m) => m[1],
  ),
)
const searchIndex = JSON.parse(
  await readFile(new URL('search-index.json', output), 'utf8'),
)
const indexedSlugs = new Set(
  Object.values(searchIndex.storedFields).map((fields) => fields.slug),
)
const notPublished = [...indexedSlugs].filter(
  (slug) => !publishedSlugs.has(slug),
)
const notIndexed = [...publishedSlugs].filter((slug) => !indexedSlugs.has(slug))
if (notPublished.length > 0 || notIndexed.length > 0) {
  throw new Error(
    `Search index does not match the published posts.\n` +
      `  Indexed but not published: ${notPublished.join(', ') || 'none'}\n` +
      `  Published but not indexed: ${notIndexed.join(', ') || 'none'}`,
  )
}

const deployDirectory = new URL('../.wrangler/deploy/', import.meta.url)
await mkdir(deployDirectory, { recursive: true })
await writeFile(
  new URL('config.json', deployDirectory),
  `${JSON.stringify({
    configPath: '../../dist/server/wrangler.json',
    auxiliaryWorkers: [],
  })}\n`,
)
