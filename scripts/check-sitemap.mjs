const defaultBaseUrl = process.env.SITE_URL || process.env.CHECK_URL;
const baseUrl = (process.argv.find((arg) => arg.startsWith("--url=")) || "")
  .slice("--url=".length)
  .trim();

const origin = (baseUrl || defaultBaseUrl || "").trim().replace(/\/+$/, "");

if (!origin) {
  console.error(
    "Missing site URL. Provide `SITE_URL=https://www.saybackend.com` or `--url=https://www.saybackend.com`.",
  );
  process.exit(2);
}

const sitemapIndexUrl = `${origin}/sitemap-index.xml`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseLocsFromSitemapIndex(xml) {
  const locs = [];
  const re = /<loc>\s*([^<]+)\s*<\/loc>/g;
  for (let match = re.exec(xml); match; match = re.exec(xml)) {
    locs.push(match[1]);
  }
  return locs;
}

async function fetchText(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "saybackend-sitemap-check/1.0",
      accept: "application/xml,text/xml,*/*;q=0.8",
    },
  });
  const text = await res.text();
  return { res, text };
}

try {
  const { res, text } = await fetchText(sitemapIndexUrl);
  assert(
    res.ok,
    `GET ${sitemapIndexUrl} failed: ${res.status} ${res.statusText}`,
  );
  assert(
    /<sitemapindex[\s>]/i.test(text),
    "Response does not look like a sitemap index (missing <sitemapindex>).",
  );

  const locs = parseLocsFromSitemapIndex(text);
  assert(locs.length > 0, "Sitemap index contains zero <loc> entries.");

  // Spot-check the first child sitemap to catch common “index exists but child is broken” failures.
  const firstChild = locs[0];
  const child = await fetchText(firstChild);
  assert(
    child.res.ok,
    `GET ${firstChild} failed: ${child.res.status} ${child.res.statusText}`,
  );
  assert(
    /<urlset[\s>]/i.test(child.text) || /<sitemapindex[\s>]/i.test(child.text),
    "First child sitemap does not look like a sitemap (<urlset> or <sitemapindex> missing).",
  );

  console.log(
    `OK: ${sitemapIndexUrl} (${locs.length} child sitemap${locs.length === 1 ? "" : "s"})`,
  );
} catch (err) {
  console.error(`Sitemap check failed for ${sitemapIndexUrl}`);
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
