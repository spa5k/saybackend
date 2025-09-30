import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import solidJs from "@astrojs/solid-js";
import compress from "astro-compress";

import partytown from "@astrojs/partytown";

import cloudflare from "@astrojs/cloudflare";

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
    solidJs({
      include: ["**/solid/**/*"],
    }),
    react({
      include: ["**/react/**/*"],
      experimentalReactChildren: true,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  prefetch: true,

  markdown: {
    syntaxHighlight: {
      type: "shiki",
      theme: "css-variables",
      excludeLangs: ["mermaid"],
    },
  },

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: "compile",
  }),
});
