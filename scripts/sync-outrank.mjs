// Pulls published Outrank articles into a local JSON file so /guides can be
// prerendered. Runs before dev and build. The API key never leaves this script.
import { mkdir, writeFile } from 'node:fs/promises'
import { BlogClient } from 'outrank-next-js-blog'

const output = new URL('../src/data/outrank/articles.json', import.meta.url)
const apiKey = (
  process.env.OUTRANK_API_KEY ?? process.env.OUTRANK_BLOG_API_KEY
)?.trim()
const required = process.argv.includes('--required')

async function write(articles) {
  await mkdir(new URL('./', output), { recursive: true })
  await writeFile(output, `${JSON.stringify(articles, null, 2)}\n`)
}

if (!apiKey) {
  if (required) {
    throw new Error(
      'OUTRANK_API_KEY is not set. Add it to .env so the build does not ship an empty /guides.',
    )
  }
  console.warn('[outrank] OUTRANK_API_KEY not set; /guides will be empty.')
  await write([])
  process.exit(0)
}

const client = new BlogClient(apiKey)
const summaries = await client.getAllArticles()
const articles = []
for (const summary of summaries) {
  const article = await client.getArticle(summary.slug)
  if (article) articles.push(article)
}
articles.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))

await write(articles)
console.log(`[outrank] synced ${articles.length} article(s).`)
