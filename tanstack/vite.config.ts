import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { devtools } from '@tanstack/devtools-vite'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { parse as parseYaml } from 'yaml'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import mdx from '@mdx-js/rollup'
import viteReact from '@vitejs/plugin-react'
import rehypeShiki from '@shikijs/rehype'
import tailwindcss from '@tailwindcss/vite'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import svgr from 'vite-plugin-svgr'

const frontmatterModulePrefix = '\0saybackend-frontmatter:'

function readImageDimensions(buffer: Buffer) {
  if (
    buffer.length >= 24 &&
    buffer.subarray(1, 4).toString('ascii') === 'PNG'
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    }
  }

  if (
    buffer.length >= 10 &&
    ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))
  ) {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    }
  }

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1
        continue
      }

      const marker = buffer[offset + 1]
      const size = buffer.readUInt16BE(offset + 2)
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5),
        }
      }
      offset += 2 + size
    }
  }
}

function mdxImageDimensions() {
  return {
    name: 'saybackend-mdx-image-dimensions',
    enforce: 'pre' as const,
    async transform(code: string, id: string) {
      if (!id.endsWith('.mdx')) return

      const dimensions = new Map<string, { width: number; height: number }>()
      const imports = code.matchAll(
        /import\s+(\w+)\s+from\s+["'](\.[^"']+\.(?:png|jpe?g|gif))["'];?/gi,
      )

      for (const match of imports) {
        const image = await readFile(resolve(dirname(id), match[2]))
        const size = readImageDimensions(image)
        if (size) dimensions.set(match[1], size)
      }

      if (!dimensions.size) return

      return code.replace(/<Picture\b[\s\S]*?\/>/g, (picture) => {
        if (/\bwidth=|\bheight=/.test(picture)) return picture
        const source = picture.match(/\bsrc=\{(\w+)\}/)?.[1]
        const size = source ? dimensions.get(source) : undefined
        if (!size) return picture

        return picture.replace(
          /\s*\/>$/,
          ` width={${size.width}} height={${size.height}} />`,
        )
      })
    },
  }
}

function frontmatterOnly(): Plugin {
  return {
    name: 'saybackend-frontmatter-only',
    enforce: 'pre' as const,
    async resolveId(id: string, importer: string | undefined) {
      const [source, query = ''] = id.split('?', 2)
      if (!new URLSearchParams(query).has('frontmatter-only')) return

      const resolved = await this.resolve(source, importer, { skipSelf: true })
      if (!resolved) return
      return `${frontmatterModulePrefix}${resolved.id}`
    },
    async load(id: string) {
      if (!id.startsWith(frontmatterModulePrefix)) return

      const file = id.slice(frontmatterModulePrefix.length)
      const source = await readFile(file, 'utf8')
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
      if (!match) {
        throw new Error(`Missing frontmatter in ${file}`)
      }

      return `export default ${JSON.stringify(parseYaml(match[1]))}`
    },
  }
}

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
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
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    devtools(),
    frontmatterOnly(),
    mdxImageDimensions(),
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
