#!/usr/bin/env node
/**
 * Ping IndexNow (Bing, Yandex, Seznam, Naver) with every URL in the live
 * sitemap. Runs from CI after deploys; needs no build output.
 *
 *   node scripts/ping-indexnow.mjs            # https://saybackend.com
 *   SITE_URL=http://localhost:4173 node scripts/ping-indexnow.mjs
 */
const SITE_URL = process.env.SITE_URL ?? 'https://saybackend.com'
const KEY = 'saybackend-2a6df4f8c061c58ca904654e'
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`

const sitemapResponse = await fetch(`${SITE_URL}/sitemap-0.xml`)
if (!sitemapResponse.ok) {
  console.error(`sitemap-0.xml returned ${sitemapResponse.status}`)
  process.exit(1)
}
const xml = await sitemapResponse.text()
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
  match[1].trim(),
)
if (urls.length === 0) {
  console.error('no URLs found in sitemap')
  process.exit(1)
}

console.log(`submitting ${urls.length} URLs to IndexNow for ${SITE_URL}`)

const payload = JSON.stringify({
  host: new URL(SITE_URL).host,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
})

// api.indexnow.org is the canonical endpoint; some networks cannot resolve
// it, and any partner endpoint (Bing) propagates submissions to all IndexNow
// search engines, so fall back to it.
const endpoints = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
]

let status = 0
let body = ''
for (const endpoint of endpoints) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: payload,
    })
    status = response.status
    body = await response.text().catch(() => '')
    console.log(`${endpoint} responded ${status}`)
  } catch (error) {
    console.log(
      `${endpoint} unreachable: ${error.cause?.code ?? error.message}`,
    )
    continue
  }
  // 200 = OK, 202 = accepted (key check pending).
  if (status === 200 || status === 202) {
    process.exit(0)
  }
}

console.error(body)
process.exit(1)
