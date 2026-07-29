# Design QA

## Evidence

- Source visual truth: `/Users/atlantic/.codex/generated_images/019fadce-a53d-7040-8c31-4d06c09ac6e2/call_es5cVkqSqSd1Kw4nGIvuTFD8.png`
- Normalized source: `/Users/atlantic/Developer/saybackend/tanstack/design-reference-1440x1024.png`
- Rendered implementation: `/Users/atlantic/Developer/saybackend/tanstack/implementation-home-1440x1024-normalized.png`
- Side-by-side comparison: `/Users/atlantic/Developer/saybackend/tanstack/design-comparison.png`
- Route: `/`
- State: desktop, light theme, navigation closed
- CSS viewport: 1440 × 1024
- Source pixels: 1487 × 1058, normalized to 1440 × 1024
- Implementation pixels: 1440 × 1024
- Density normalization: both artifacts compared at 1× and equal pixel dimensions

## Full-view comparison

The implementation preserves the selected Working Journal composition: restrained masthead, narrow editorial rail, serif-led feature story, etched green illustration, ruled article ledger, and low-contrast paper palette. The content hierarchy, column boundaries, archive density, and header controls remain visually coherent at the target viewport.

## Focused comparison

The full-view composite is readable enough to assess the principal fidelity surfaces. The masthead, rail typography, feature title, illustration, article rows, dividers, topic labels, and controls are all visible at native comparison size, so a second crop was not needed.

## Required fidelity surfaces

- Fonts and typography: Newsreader provides the editorial serif hierarchy; Geist Mono handles dates, topics, and small navigation metadata. Optical weights, line height, and title wrapping are consistent with the source direction.
- Spacing and layout rhythm: the two-column frame, vertical divider, feature-to-ledger transition, row spacing, and edge margins follow the source structure without overlap or clipping.
- Colors and tokens: warm paper, near-black ink, muted gray, and restrained green accents match the mock's visual balance. No gradients or generic elevated cards were introduced.
- Image quality and asset fidelity: the generated etched still-life matches the source subject, palette, transparency, and print-like treatment. The final asset has a clean transparent background and no visible halo at the target size.
- Copy and content: dynamic article titles, summaries, dates, topics, and project names intentionally use the real migrated content rather than the mock's illustrative wording.
- Icons and controls: the search, theme, and mobile-menu icons use one consistent library and align cleanly with the masthead.
- Responsiveness and accessibility: desktop, 390 × 844 mobile, open mobile navigation, dark theme, focus outlines, semantic navigation, and reduced-motion behavior were checked.

## Comparison history

### Pass 1 — blocked

- [P2] Feature title was oversized and wrapped into four to five lines, materially increasing the hero height and pushing the article ledger below the source composition.
- [P2] The rail introduction used a prominent green italic treatment that competed with the feature story and drifted from the source's quieter editorial hierarchy.

Fixes:

- Reduced the desktop feature-title scale and widened its text track.
- Rebalanced the feature grid, tightened the hero height, and returned the rail introduction to the primary ink color and roman style.
- Increased the illustration's visual scale and added a consistent `:focus-visible` treatment.

Post-fix evidence:

- `/Users/atlantic/Developer/saybackend/tanstack/implementation-home-1440x1024-normalized.png`
- `/Users/atlantic/Developer/saybackend/tanstack/design-comparison.png`

### Pass 2 — passed

No actionable P0, P1, or P2 differences remain. Real-content length and the absence of the mock's small secondary rail illustration are acceptable content/asset differences; the primary generated still-life carries the intended art direction.

## Primary interactions tested

- Desktop navigation links
- Search dialog, keyboard-ready input, and populated Pagefind results
- Light/dark theme toggle
- Mobile menu open/close state
- Article rendering with migrated MDX, images, and interactive article widgets
- Legacy redirects and canonical metadata through the route parity check
- Fresh production Pagefind indexing from the prerendered TanStack output

## Console check

The migrated Astro image compatibility warning was fixed by consuming Astro-only `inferSize` and `formats` props before rendering the native image element. SVG URL imports, visible FAQ content, and the final homepage capture were checked after the production build.

final result: passed
