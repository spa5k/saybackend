# Search Engine Coverage

## Done automatically

| Engine             | Status                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Google             | Verified in Search Console. Sitemap read, validation running.                                                      |
| Bing               | Submitted via IndexNow (`202 Accepted`). Bing also feeds DuckDuckGo, Yahoo, Ecosia, Startpage, and ChatGPT search. |
| Yandex             | IndexNow partner — receives the same submissions.                                                                  |
| Brave Search       | IndexNow partner — receives the same submissions.                                                                  |
| Naver, Seznam, Yep | IndexNow partners — receive the same submissions.                                                                  |

Every push to `main` triggers `.github/workflows/indexnow.yml`, which submits
all sitemap URLs six minutes after the Cloudflare deploy lands.

Manual re-run: `node scripts/ping-indexnow.mjs`.

## Remaining manual step: Bing Webmaster Tools (monitoring only)

IndexNow already tells Bing to crawl. Webmaster Tools adds ranking reports and
URL inspection. Takes five minutes:

1. Open https://www.bing.com/webmasters and sign in with a Microsoft account.
2. Choose **Import from Google Search Console** — this verifies the site and
   copies the sitemap in one step.
3. Repeat for the second site.

No code changes needed. Verification happens through the Google account.

## Optional: Yandex Webmaster

1. Open https://webmaster.yandex.com and sign in.
2. Add site `https://saybackend.com` (or happyformatter.com).
3. Verify with the HTML meta tag option, or via DNS.
4. Submit `https://<site>/sitemap-index.xml`.

## Notes

- DuckDuckGo, Yahoo, Ecosia, and Startpage have no submission process. They
  re-index from Bing and Google.
- Mojeek has its own crawler; it finds sites via links. Our cross-links from
  kamran.sh and the sister sites cover discovery.
- robots.txt allows all crawlers, including GPTBot, ClaudeBot, and
  PerplexityBot, for AI-answer visibility.
