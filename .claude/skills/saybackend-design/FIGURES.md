# Figures

Figures are React components in `src/components/paper/`, imported into the
post's MDX. They are plain SVG. Read a component's props type before you use
it; `src/content/blog/2026-aug-happycontext-performance/index.mdx` is the
reference post.

## Pick by what the post claims

| The claim | Component |
| --- | --- |
| Before and after, a few cases | `BeforeAfterBars` |
| One number that carries the post | `NumberBand` |
| A ranking | `RankBars` |
| Parts of a whole | `SegmentBar`, `ShareBars`, `ShareGrid` |
| Two sizes compared as areas | `SquareCompare` |
| A trend, or a log scale | `LineFigure` |
| A count of items, some marked | `DotMatrix` |
| Paired values per row | `PairedDots` |
| Rows of blocks: what is kept, reused, stacked | `BlockRows`, `KeepRows`, `LevelRows` |
| Text cut into pieces | `TextChunks`, `StepStrings` |
| A short ordered path | `Chain` |
| Trade-offs or a decision in prose | `ProsCons`, `DecisionList` (`Lists.tsx`) |

When none fits, write a post-specific drawing in
`src/components/react/blog/<post>/`, built on `Figure` and the `pp-*` filters.
A post-specific drawing is the normal case for a mechanism.

## Rules for a drawing

- Wrap it in `Figure`: `title` states the measure and unit, `legend` names the
  colours, `caption` holds the one caveat.
- Fills come from `MARKS` in `Figure.tsx`. Sand for the baseline, one tint for
  the subject, a second tint only for a second subject.
- Every filled shape gets `filter="url(#pp-marker)"`. Axis lines use the
  `fig-axis` class.
- Labels are ink, 11 px or larger, set with `style={{ fontSize }}`. The
  stylesheet gives labels a paper halo so they read on any shape.
- Use `bleed` for the one or two figures that carry the post; they run the
  full page width on plus-mark paper. The others stay in the text column.
- One `HandNote` per figure, pointing at the result, clear of every number.
- Give the SVG `role="img"` and an `aria-label` that states the result.
- On a phone the figure keeps 620 px and scrolls inside `.fig-plot`; design the
  viewBox so it reads at that width.

## Interactive blocks

Keep them rare: one per post at most, where the reader changes an input and
sees the mechanism respond. Style them with
`src/components/react/blog/widget.css`. Buttons are pills, 40 px high on touch
screens.
