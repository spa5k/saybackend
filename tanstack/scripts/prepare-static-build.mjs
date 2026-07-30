import { rm } from 'node:fs/promises'

await rm(new URL('../public/pagefind/', import.meta.url), {
  recursive: true,
  force: true,
})
