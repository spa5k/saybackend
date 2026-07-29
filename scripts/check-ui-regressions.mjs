import { existsSync, globSync, readFileSync } from "node:fs";
import { join } from "node:path";

const clientDirectory = join(process.cwd(), "dist", "client");
const htmlFiles = globSync("**/*.html", { cwd: clientDirectory });
const failures = [];

if (htmlFiles.length === 0) {
  failures.push("the production build contains no HTML files");
}

const runtimeImagePages = htmlFiles.filter((file) =>
  readFileSync(join(clientDirectory, file), "utf8").includes("/_image?"),
);

if (runtimeImagePages.length > 0) {
  failures.push(
    `${runtimeImagePages.length} page(s) still depend on the unavailable /_image runtime endpoint`,
  );
}

const missingAssets = new Set();

for (const file of htmlFiles) {
  const html = readFileSync(join(clientDirectory, file), "utf8");

  for (const match of html.matchAll(/\/_astro\/[^"'()<>,\s?]+/g)) {
    const assetPath = decodeURIComponent(match[0].slice(1));
    if (!existsSync(join(clientDirectory, assetPath))) {
      missingAssets.add(assetPath);
    }
  }
}

if (missingAssets.size > 0) {
  failures.push(
    `${missingAssets.size} referenced _astro asset(s) are missing from the production build`,
  );
}

const homePage = readFileSync(join(clientDirectory, "index.html"), "utf8");
const backdropTag =
  homePage.match(/<div[^>]*\bid=(?:"backdrop"|'backdrop'|backdrop)[^>]*>/)?.[0] ??
  "";

if (!/\bhidden\b/.test(backdropTag)) {
  failures.push("the Pagefind backdrop is not display:none before search opens");
}

if (failures.length > 0) {
  console.error(`UI regression check failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(
    `UI regression check passed (${htmlFiles.length} generated pages inspected).`,
  );
}
