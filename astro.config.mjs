import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";
import rehypeMermaid from "rehype-mermaid";

import react from "@astrojs/react";
import solidJs from "@astrojs/solid-js";
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
    rehypePlugins: [
      [
        rehypeMermaid,
        {
          strategy: "img-svg",
          mermaidConfig: {
            theme: "dark",
            securityLevel: "loose",
            startOnLoad: true,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          },
        },
      ],
    ],
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
