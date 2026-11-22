# SayBackend repo rules

## Blog folder names

Each post folder in `src/content/blog/` must start with the year and month of
its `date` frontmatter, in the form `YYYY-mon-`, for example
`2026-nov-solid-2-async-reactive-graph`.

Before you open a pull request:

1. Read the `date` field of every post's `index.mdx`.
2. Compare it with the folder prefix.
3. Fix every mismatch before the PR.

The folder name is the post id. It is used in `src/lib/heroes.ts` and
`src/lib/content.tsx`. Update those files when you rename a folder.
