# Share (OG) cards

A card is one hand-written HTML file in `design/og/`, 1200 x 630, exported to a
PNG. `design/og/card.css` holds the shared layout and fonts.
`design/og/_template.html` is the current look; copy it for a new card.

## Anatomy

Fixed on every card: plus-mark paper, the SayBackend brand at the top left, the
topic with its marker square at the bottom left, "— Kamran" at the bottom
right.

Different on every card:

- **Title** (left, 540 px wide): a bold sans lead-in, then a short serif claim.
  Write it for the card; the post title is usually too long. Use `h1.long` at
  four lines.
- **One pen circle** round the single number or word that matters.
- **Drawing** (`.art`, right, 480 x 400): the post's mechanism, drawn fresh.
  Reuse the idea of the post's hero, at card scale, with real numbers as
  labels.
- **One pen note** with an arrow, pointing at the result.

Each card must look like its post. Two cards that differ only in text are a
failure; change the composition.

## Colours

A card is a standalone file, so it uses hex values. Keep them equal to the
light tokens in `src/styles.css`.

| Role | Hex |
| --- | --- |
| Paper | `#faf9f5` |
| Ink and pen | `#141413` |
| Muted label | `#73726c` |
| Sand (baseline) | `#c8c4b2` |
| Blue tint: Go | `#93b2f2` |
| Teal tint: Postgres | `#86cfc5` |
| Amber tint: agents | `#f1cd80` |
| Sage tint: web | `#abd3a6` |
| Rose tint: a second subject | `#f2a48f` |

The topic square uses the post's colour from `src/lib/marks.ts`.

## Steps

1. Copy `_template.html` to `design/og/<post-name>-og.html`.
2. Write the title, draw `.art`, set the topic and its colour.
3. Export:

   ```sh
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
     --hide-scrollbars --allow-file-access-from-files --window-size=1200,630 \
     --screenshot=public/images/<post-name>-og.png \
     "file://$PWD/design/og/<post-name>-og.html"
   ```

4. Open the PNG. Done when the fonts are Newsreader, Instrument Sans and
   Caveat (a system font means the font path failed), no text touches an edge
   or another element, and the drawing reads at 600 px wide.
5. Set `ogImage: "/images/<post-name>-og.png"` in the post's frontmatter.

## Other brand images

- `design/og/blog.html` is the default card, `public/images/blog.png`.
- `design/og/saybackend.html` is the publisher logo. Export it at
  `--window-size=672,378` to `public/images/saybackend.png`.
- `public/favicon.svg` is the mark: a tilted ink S block on paper (source in `design/logo/`). The PNG
  icons, `favicon.ico` and `public/images/logo.svg` copy it. Change them
  together.
