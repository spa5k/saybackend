import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/static";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";

import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  site: "https://www.saybackend.com",
  integrations: [tailwind(), sitemap(), mdx(), pagefind(), compress()],
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
