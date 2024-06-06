import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/static";
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";

const LIVE_URL = "https://www.saybackend.com";
// this is the astro command your npm script runs
const isBuild = SCRIPT.includes("astro build");
const BASE_URL = isBuild ? LIVE_URL : LOCALHOST_URL;

// https://astro.build/config
export default defineConfig({
  site: BASE_URL,
  integrations: [tailwind(), sitemap(), mdx(), pagefind()],
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
  },
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    speedInsights: {
      enabled: true,
    },
  }),
});
