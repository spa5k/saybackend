import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import solidJs from "@astrojs/solid-js";
import compress from "astro-compress";

import partytown from "@astrojs/partytown";

/** @type {import('astro').AstroConfig} */
export default defineConfig({
  site: "https://saybackend.com",
  outDir: "./dist/client",

  integrations: [
    sitemap({
      serialize(item) {
        const pathname = new URL(item.url).pathname;

        if (pathname === "/tags/" || pathname.startsWith("/tags/")) {
          return undefined;
        }

        return item;
      },
    }),
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
      // theme: "css-variables",

      excludeLangs: ["mermaid"],
    },
    shikiConfig: {
      themes: {
        light: "vitesse-dark",
        dark: "vitesse-dark",
      },
    },
  },

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
});
