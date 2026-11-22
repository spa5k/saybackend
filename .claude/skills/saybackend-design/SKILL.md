---
name: saybackend-design
description: SayBackend's paper design system. Use when you add or restyle a post, a figure, a hero drawing, a page, a share (OG) card, or a third-party embed in this repo, or write any CSS for it.
---

# SayBackend design

The site looks like a **notebook page**: warm paper, **marker** shapes, black
**pen** notes. Every new thing is built from those three layers.

- **Paper**: the background. Off-white, with faint plus marks in heroes, tiles
  and full-width figures. Body text sits on plain paper.
- **Marker**: every filled shape in a drawing. Flat light tint, rough edge from
  the `pp-marker` SVG filter. Sand is "before" or "the rest"; one tint is the
  subject.
- **Pen**: the personal layer. Caveat handwriting, a drawn arrow, a circle
  round one number, "— Kamran". At most one pen note per figure.

## Owner's taste

These came from direct feedback. They outrank your own preference.

- Minimal and tidy, little text. Numbers are the visual emphasis.
- **Draw the mechanism of the post**: what is reused, where the hook runs,
  where the text is cut. A drawing that would fit any post is the wrong drawing.
- Each post gets its own drawing and its own share card. Hand-make them.
- Figures stay light: flat tints on paper, labels in ink on top.
- For a visual redesign, show options first and build the chosen one.
- Rejected, in the owner's words: chart libraries ("trash"), generic
  flowcharts and Mermaid, cards of chips ("really bad"), hatching or lines
  filling a shape, a script that stamps out share cards.

## Where things live

Read these before you write. They are the single source of truth for values.

| Need | Source |
| --- | --- |
| Colours, fonts, spacing tokens (light and `.dark`) | `:root` in `src/styles.css` |
| SVG filters and paper patterns (`pp-*`) | `src/components/paper/PaperDefs.tsx` |
| Figure frame, mark colours, pen note | `src/components/paper/Figure.tsx` |
| Hero and tile drawings | `src/components/paper/Motifs.tsx` |
| Which drawing a post gets | `src/lib/heroes.ts` |
| Moving line drawing of a post or page (hero and footer) | `src/components/paper/scenes.ts`, drawn by `SceneArt.tsx` |
| Site footer drawings | `src/components/paper/FooterArt.tsx` |
| Which colour a post gets, from its tags | `src/lib/marks.ts` |
| Header and footer | `src/components/SiteShell.tsx` |
| Home page parts | `src/components/paper/HomeParts.tsx` |
| Comment theme (giscus) | `src/giscus/*.css`, served by `src/worker.ts` |

Use tokens (`var(--ink)`, `var(--m-lilac)`) in components and CSS. The mark
names are historic: `--m-lilac` is the blue tint and `--m-blue` is the teal.
Type roles: Newsreader for titles and prose, Instrument Sans for UI and bold
lead-ins, Caveat for pen, JetBrains Mono for code.

## A new post, end to end

1. **Frontmatter.** Set `tags` so `markOf` picks the right colour, and
   `ogImage` to the card path from step 4.
2. **Hero drawing.** Add the post to `src/lib/heroes.ts`. Reuse a motif when it
   shows this post's mechanism; otherwise add one in `Motifs.tsx`. A new motif
   needs four entries: `Motif`, `MiniMotif`, `PAPER_OF`, and `TILE_VIEW` in
   `HomeParts.tsx`. Done when the hero, the home tile and the list row all show
   it.
   Then add a scene for the post's slug in `scenes.ts`. A scene is a function
   `(time, pointer) => Array<Shape>` in a 1000 x 200 box: lines only, no text,
   the same number of shapes on each call, and the pointer moves the one thing
   the post is about. It shows in the post hero and the post footer.
3. **Figures.** Follow [FIGURES.md](FIGURES.md). Done when every number the
   post argues from has a figure or a `NumberBand`, and no Mermaid, ASCII
   diagram or plain comparison table is left.
4. **Share card.** Follow [OG-CARDS.md](OG-CARDS.md).
5. **Verify.** Run the section below.

## A new page or block

Start from `PageHero` with a motif, then a `page-frame` (1040 px) or
`page-narrow` (760 px) section. Lists are a marker square, a serif title and a
small sans date, divided by `var(--rule)` lines. Hover is a marker highlight
under the title. Add phone rules (700 px and below) and tablet rules (700 to
860 px) in the same change.

## A third-party embed

Match it to the paper tokens through the embed's own theme hook; see the
giscus theme for the pattern. A stylesheet loaded from another origin needs a
CORS header, so serve it from `src/worker.ts`.

## Verify

Done means all of these pass and you looked at every screenshot.

1. `npx oxfmt --check src && npx eslint src && npx tsc --noEmit`
2. `npx vite build` (outside the sandbox: prerender opens a port), then
   `node scripts/finalize-static-build.mjs`. It fails when the search index
   and the published posts in the sitemap differ.
3. Screenshots of each changed page: desktop 1280, phone 500, dark theme.

   ```sh
   npx vite dev --port 4317 --strictPort &
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
     --hide-scrollbars --force-prefers-reduced-motion --window-size=1280,1600 \
     --timeout=14000 --screenshot=out.png http://localhost:4317/blog/<slug>/
   ```

   Use `--timeout`; `--virtual-time-budget` hangs on the dev server. Headless
   Chrome has a 500 px minimum width. Add `--force-dark-mode` for dark.
4. Check in each screenshot: every label is readable on its shape, nothing is
   cut at the figure edge, a figure on a phone scrolls sideways at full size,
   and no pen note covers a number.
