import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";

import compress from "astro-compress";

import partytown from "@astrojs/partytown";

/** @type {import('astro').AstroConfig} */
export default defineConfig({
  site: "https://www.saybackend.com",
  integrations: [
    sitemap(),
    mdx(),
    pagefind(),
    compress(),
    partytown({
      config: {
        forward: ["dataLayer.push", "gtag"],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: true,
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
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
});
