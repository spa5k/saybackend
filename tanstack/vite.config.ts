import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { fileURLToPath, URL } from 'node:url'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import mdx from '@mdx-js/rollup'
import viteReact from '@vitejs/plugin-react'
import rehypeShiki from '@shikijs/rehype'
import tailwindcss from '@tailwindcss/vite'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import svgr from 'vite-plugin-svgr'

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      {
        find: '@/components/Callout.astro',
        replacement: fileURLToPath(
          new URL('./src/components/mdx/Callout.tsx', import.meta.url),
        ),
      },
      {
        find: '@/components/GitHubRepoCard.astro',
        replacement: fileURLToPath(
          new URL('./src/components/mdx/GitHubRepoCard.tsx', import.meta.url),
        ),
      },
      {
        find: 'astro:assets',
        replacement: fileURLToPath(
          new URL('./src/components/mdx/AstroAssets.tsx', import.meta.url),
        ),
      },
      {
        find: '@components',
        replacement: fileURLToPath(
          new URL('./src/components', import.meta.url),
        ),
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
  plugins: [
    devtools(),
    svgr({ include: '**/*.svg' }),
    mdx({
      include: /\.mdx?$/,
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: 'frontmatter' }],
      ],
      rehypePlugins: [
        [
          rehypeShiki,
          {
            themes: {
              light: 'everforest-light',
              dark: 'everforest-dark',
            },
            defaultColor: false,
          },
        ],
      ],
    }),
    tailwindcss(),
    tanstackStart({
      pages: [
        { path: '/404' },
        { path: '/rss.xml' },
        { path: '/sitemap-index.xml' },
        { path: '/sitemap-0.xml' },
      ],
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoStaticPathsDiscovery: true,
        failOnError: true,
      },
    }),
    viteReact(),
  ],
})

export default config
