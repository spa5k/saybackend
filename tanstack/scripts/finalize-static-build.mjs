import { copyFile, cp, mkdir, stat, writeFile } from 'node:fs/promises'

const output = new URL('../dist/client/', import.meta.url)
const notFoundSource = new URL('404/index.html', output)
const notFoundTarget = new URL('404.html', output)

await copyFile(notFoundSource, notFoundTarget)

const requiredArtifacts = [
  '404.html',
  'rss.xml',
  'sitemap-index.xml',
  'sitemap-0.xml',
  'pagefind/pagefind.js',
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

await cp(
  new URL('pagefind/', output),
  new URL('../public/pagefind/', import.meta.url),
  {
    recursive: true,
    force: true,
  },
)

const deployDirectory = new URL('../../.wrangler/deploy/', import.meta.url)
await mkdir(deployDirectory, { recursive: true })
await writeFile(
  new URL('config.json', deployDirectory),
  `${JSON.stringify({
    configPath: '../../tanstack/dist/server/wrangler.json',
    auxiliaryWorkers: [],
  })}\n`,
)
