Role: You are an expert UI/UX Designer and Frontend Engineer specializing in "Swiss Minimal" aesthetics. No shadow borders, or something like that, just zero corner radius type thing.

Keep in mind that we are doing a blog, not a SAAS Site or something, so it should be readble and easy,

Task: Create a complete Design System & Landing Page Specification for "SayBackend" (A Personal Engineering Blog).

Do not just restyle, but recreate them from scratch, below is a design system from a site i like quite much, use it for reference for colors and components etc only, only minimal inspirations from it.

# LeapOCR Design System

A minimalist, brutalist design system built with precision and structural honesty. This document covers all design elements used in the LeapOCR marketing site for implementation in the dashboard.

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Color System](#color-system)
- [Typography](#typography)
- [Layout System](#layout-system)
- [Component Library](#component-library)
- [Animation & Motion](#animation--motion)
- [Responsive Patterns](#responsive-patterns)
- [Implementation Guide](#implementation-guide)

---

## Design Philosophy

**Minimalist Brutalism** — A precision instrument aesthetic with these core principles:

- **Zero Border Radius**: All elements are perfectly rectangular (`border-radius: 0px !important`)
- **Structural Borders**: 1px solid borders everywhere to expose the grid structure
- **Radical Contrast**: Bold, massive headlines contrasted with microscopic labels
- **No Shadows or Gradients**: Pure flat design with color blocking
- **Functional Cursors**: Custom blue square cursor for interactive elements

---

## Color System

### Core Palette

```css
--color-primary: #050505 /* Almost black - primary text, borders, backgrounds */
  --color-background: #ffffff /* Pure white - default background */
  --color-border: #cccccc /* Light gray - structural borders */
  --color-accent: #0066ff /* Vibrant blue - CTAs, links, highlights */;
```

### Extended Palette

```css
--color-background-pure: #ffffff /* Pure white for cards */
  --color-muted: #6b7280 /* Medium gray for secondary text */
  --color-structural: #cccccc /* Alias for border color */;
```

### Semantic Colors

```css
--color-success: #22c55e /* Green for success states */ --color-warning: #f59e0b
  /* Amber for warnings */ --color-error: #ef4444 /* Red for errors */
  --color-info: #0066ff /* Blue for info (uses accent) */;
```

### Usage Guidelines

- **Primary Text**: Always `var(--color-primary)` (#050505)
- **Backgrounds**: White by default, invert to black on hover
- **Borders**: All borders use `var(--color-border)` with `.border-structural` utility
- **Accent**: Use sparingly for CTAs, active states, and key highlights only
- **Never**: Use shadows, gradients, or color overlays

### CSS Variable Access

Always use CSS custom properties for inline styles:

```html
<div style="background-color: var(--color-accent); color: white">Content</div>
```

---

## Typography

### Font Stack

```css
--font-family-display: "Inter", "Helvetica Neue", Arial, sans-serif;
--font-family-mono: "JetBrains Mono", "Fira Code", monospace;
--font-family-cursive: "Imperial Script", cursive;
--font-family-cursive-alex: "Alex Brush", cursive;
```

### Font Usage

- **Display/Body**: Inter (sans-serif)
- **Code/Labels**: JetBrains Mono (monospace)
- **Emphasis/Decorative**: Alex Brush (cursive script)

### Heading Hierarchy

All headings follow the same base style:

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 800; /* Extra bold */
  letter-spacing: -0.04em; /* Tight tracking */
  text-transform: uppercase; /* Always caps */
  line-height: 0.9; /* Compressed */
}
```

### Typography Patterns

#### Hero Headlines

```html
<h1
  class="text-[9vw] leading-[0.85] tracking-tighter uppercase sm:text-[7vw] md:text-[6vw] lg:text-[4.5vw] xl:text-[5vw]"
>
  The API for Structured Document Data
</h1>
```

- Fluid sizing with viewport units
- Ultra-tight leading (0.85-0.9)
- Always uppercase
- Maximum 800 font weight

#### Page Headlines

```html
<h2 class="text-4xl font-black uppercase md:text-5xl">Section Title</h2>
```

#### Mono Labels

```html
<span class="font-label">FIG 1.0 — SYSTEM_STATUS</span>
```

CSS for `.font-label`:

```css
.font-label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}
```

#### Body Text

```html
<p class="font-mono text-sm leading-relaxed md:text-base">
  Body content uses monospace for technical precision.
</p>
```

#### Cursive Emphasis

```html
<span
  class="alex-brush-regular"
  style="text-transform: none; letter-spacing: 0; color: var(--color-accent)"
>
  Document Data
</span>
```

CSS for `.alex-brush-regular`:

```css
.alex-brush-regular {
  font-family: "Alex Brush", cursive;
  font-weight: 400;
  font-style: normal;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  letter-spacing: 0;
}
```

---

## Layout System

### Containers

#### Standard Content Container

```html
<div class="mx-auto max-w-7xl px-6">
  <!-- Content -->
</div>
```

#### Narrow Content Container

```html
<div class="mx-auto max-w-480 px-6">
  <!-- Content -->
</div>
```

### Grid System

#### 12-Column Grid

```html
<div class="grid gap-8 lg:grid-cols-12">
  <div class="lg:col-span-9">
    <!-- Main content (9 cols) -->
  </div>
  <div class="lg:col-span-3">
    <!-- Sidebar (3 cols) -->
  </div>
</div>
```

#### Two-Column Grid

```html
<div class="grid gap-12 lg:grid-cols-2">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

### Structural Borders

**Critical Rule**: ALL major sections must have borders to expose the grid structure.

```html
<!-- Vertical section divider -->
<section class="border-structural border-b">Content</section>

<!-- Full border box -->
<div class="border-structural border p-8">Content</div>

<!-- Grid with internal dividers -->
<div
  class="border-structural grid gap-px border lg:grid-cols-2"
  style="background-color: var(--color-primary)"
>
  <div class="bg-white p-8">Cell 1</div>
  <div class="bg-white p-8">Cell 2</div>
</div>
```

### Background Patterns

#### Grid Pattern

```css
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, var(--color-border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

#### Diagonal Pattern

```css
.bg-diagonal-pattern {
  --pattern-fg: rgba(0, 0, 0, 0.05);
  background-image: repeating-linear-gradient(
    315deg,
    var(--pattern-fg) 0,
    var(--pattern-fg) 1px,
    transparent 0,
    transparent 50%
  );
  background-size: 10px 10px;
  background-attachment: fixed;
}
```

### Spacing Scale

Use Tailwind's spacing scale with these common patterns:

- **Section padding**: `p-8 md:p-12 lg:p-16`
- **Container padding**: `px-6 md:px-8`
- **Vertical spacing**: `mb-8 md:mb-12`
- **Component gaps**: `gap-4 md:gap-6`

---

## Component Library

### Buttons

#### Primary CTA Button

```html
<a
  href="/signup"
  class="hover-inverse border-structural flex h-14 items-center justify-center border px-8 font-bold tracking-widest uppercase"
  style="background-color: var(--color-accent); color: white; border-color: var(--color-accent)"
>
  Get Started
</a>
```

#### Secondary Button

```html
<a
  href="/docs"
  class="hover-inverse border-structural flex h-14 items-center justify-center border px-8 font-bold tracking-widest uppercase"
  style="background-color: var(--color-background); color: var(--color-primary); 
          border-color: var(--color-primary)"
>
  View Docs
</a>
```

#### Button Specifications

- Height: `h-14` (56px)
- Padding: `px-8` (horizontal)
- Font: Bold, uppercase, wide tracking
- Hover: Color inversion with slight lift
- Border: Always 1px solid

### Cards

#### Standard Card

```html
<div
  class="border-structural border bg-white p-8 transition-colors duration-200 hover:bg-gray-50 md:p-12"
>
  <h3 class="font-label mb-4">FEATURE 01</h3>
  <h4 class="mb-4 text-2xl font-black uppercase">Card Title</h4>
  <p class="font-mono text-sm leading-relaxed">Description text</p>
</div>
```

#### Grid Cards with 1px Dividers

```html
<div
  class="border-structural grid gap-px border lg:grid-cols-2"
  style="background-color: var(--color-primary)"
>
  <div class="bg-white p-8 md:p-12">
    <!-- Card content -->
  </div>
  <div class="bg-white p-8 md:p-12">
    <!-- Card content -->
  </div>
</div>
```

### Labels & Badges

#### Figure Label

```html
<div class="mb-6 flex items-center gap-3">
  <div class="h-3 w-3" style="background-color: var(--color-accent)"></div>
  <h2 class="font-label">FIG 1.0 — TITLE</h2>
</div>
```

#### Status Badge

```html
<span
  class="font-label border px-3 py-1 text-xs tracking-wider"
  style="border-color: var(--color-primary); 
             background-color: var(--color-background); 
             color: var(--color-primary)"
>
  DEV-FIRST DOCUMENT AI
</span>
```

#### Inline Feature Badge

```html
<span
  class="border px-3 py-1.5 font-mono text-sm"
  style="background-color: var(--color-background); 
             border-color: var(--color-primary); 
             color: var(--color-primary)"
>
  ✓ 100 pages free
</span>
```

### Marquee Banner

```html
<div
  class="border-structural overflow-hidden border-t py-2 whitespace-nowrap"
  style="background-color: var(--color-primary); color: var(--color-background)"
>
  <div
    class="animate-marquee inline-block font-mono text-xs font-bold tracking-widest uppercase"
  >
    PDF TO JSON /// INVOICE PROCESSING /// RECEIPT PARSING /// PDF TO JSON ///
    INVOICE PROCESSING /// RECEIPT PARSING ///
  </div>
</div>
```

CSS for marquee:

```css
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  animation: marquee 35s linear infinite;
  will-change: transform;
}
```

### Custom Scrollbar

```css
.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--color-background);
  border-left: 1px solid var(--color-border);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border: 2px solid var(--color-background);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-muted);
}
```

---

## Animation & Motion

### Easing Functions

```css
--ease-mechanical: cubic-bezier(0.19, 1, 0.22, 1); /* Smooth expo out */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Slight overshoot */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1); /* Material design */
--ease-sharp: cubic-bezier(0.4, 0, 0.6, 1); /* Quick response */
```

### Duration Scale

```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 800ms;
```

### Hover Effects

#### Hover Inverse (Color Swap)

```css
.hover-inverse {
  transition:
    background-color var(--duration-fast) var(--ease-mechanical),
    color var(--duration-fast) var(--ease-mechanical),
    transform var(--duration-fast) var(--ease-mechanical);
  will-change: background-color, color, transform;
}

.hover-inverse:hover {
  background-color: var(--color-primary);
  color: var(--color-background);
  transform: translateY(-1px);
}

.hover-inverse:active {
  transform: translateY(0);
  transition-duration: var(--duration-instant);
}
```

#### Hover Signal (Accent Color)

```css
.hover-signal {
  transition:
    background-color var(--duration-fast) var(--ease-mechanical),
    color var(--duration-fast) var(--ease-mechanical),
    transform var(--duration-fast) var(--ease-mechanical);
  will-change: background-color, color, transform;
}

.hover-signal:hover {
  background-color: var(--color-accent);
  color: var(--color-background);
  transform: translateY(-1px);
}

.hover-signal:active {
  transform: translateY(0);
  transition-duration: var(--duration-instant);
}
```

### Fade In Up Animation

Used for staggered content reveals on page load:

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0px);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.9s var(--ease-mechanical) forwards;
  will-change: opacity, transform, filter;
}
```

Usage with staggered delays:

```html
<div class="animate-fade-in-up opacity-0" style="animation-delay: 100ms">
  First element
</div>
<div class="animate-fade-in-up opacity-0" style="animation-delay: 200ms">
  Second element
</div>
<div class="animate-fade-in-up opacity-0" style="animation-delay: 300ms">
  Third element
</div>
```

### Motion Guidelines

- **No Elastic or Bouncy Animations**: Use mechanical easing
- **Keep Durations ≤400ms**: Exception for infinite loops (marquee, etc.)
- **Use `will-change`**: For animated properties
- **Linear for Mechanical Movement**: Marquee and continuous scrolling
- **Slight Y-Translation on Hover**: -1px lift for interactive elements

---

## Responsive Patterns

### Breakpoints

```css
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large screens */
```

### Mobile-First Approach

Always design mobile-first, then enhance for larger screens:

```html
<!-- Typography scales with viewport -->
<h1 class="text-[9vw] sm:text-[7vw] lg:text-[4.5vw]">Fluid Headline</h1>

<!-- Stacks on mobile, grid on desktop -->
<div class="grid gap-8 lg:grid-cols-2">
  <div>Content</div>
  <div>Content</div>
</div>

<!-- Padding increases with screen size -->
<section class="p-8 md:p-12 lg:p-16">Content</section>

<!-- Flex direction changes -->
<div class="flex flex-col gap-4 sm:flex-row">
  <button>Action 1</button>
  <button>Action 2</button>
</div>
```

### Common Responsive Patterns

#### Hero Section

- Mobile: Stack vertically, reduce font size
- Desktop: Center content, increase spacing

#### Navigation

- Mobile: Hamburger menu (if needed)
- Desktop: Horizontal navigation

#### Cards

- Mobile: Single column
- Tablet: 2 columns
- Desktop: 3-4 columns

#### Spacing

- Mobile: `p-6`, `gap-4`
- Tablet: `p-8`, `gap-6`
- Desktop: `p-12`, `gap-8`

---

## Implementation Guide

### Setting Up the Design System

#### 1. Install Dependencies

```bash
npm install tailwindcss @tailwindcss/typography
npm install -D dprint
```

#### 2. Create Global CSS

Create `global.css` with the complete design system:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme inline {
  /* Font Families */
  --font-family-display: "Inter", "Helvetica Neue", Arial, sans-serif;
  --font-family-mono: "JetBrains Mono", "Fira Code", monospace;
  --font-family-cursive-alex: "Alex Brush", cursive;

  /* Core Color System */
  --color-primary: #050505;
  --color-background: #ffffff;
  --color-border: #cccccc;
  --color-accent: #0066ff;

  /* Extended Palette */
  --color-background-pure: #ffffff;
  --color-muted: #6b7280;

  /* Semantic Colors */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: var(--color-accent);

  /* Animation System */
  --ease-mechanical: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 200ms;
  --duration-normal: 300ms;
}

@layer base {
  :root {
    --color-structural: var(--color-border);
  }

  *,
  *::before,
  *::after {
    border-radius: 0px !important;
  }

  body {
    cursor:
      url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="8" height="8" fill="%230066FF"/></svg>')
        8 8,
      default;
  }

  a,
  button,
  input,
  textarea,
  select {
    cursor:
      url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="8" height="8" fill="%230066FF"/></svg>')
        8 8,
      pointer;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 800;
    letter-spacing: -0.04em;
    text-transform: uppercase;
    line-height: 0.9;
  }
}

@layer utilities {
  .border-structural {
    border-color: var(--color-border);
  }

  .font-label {
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.7;
  }

  .hover-inverse {
    transition:
      background-color var(--duration-fast) var(--ease-mechanical),
      color var(--duration-fast) var(--ease-mechanical),
      transform var(--duration-fast) var(--ease-mechanical);
  }
  .hover-inverse:hover {
    background-color: var(--color-primary);
    color: var(--color-background);
    transform: translateY(-1px);
  }

  .hover-signal {
    transition:
      background-color var(--duration-fast) var(--ease-mechanical),
      color var(--duration-fast) var(--ease-mechanical),
      transform var(--duration-fast) var(--ease-mechanical);
  }
  .hover-signal:hover {
    background-color: var(--color-accent);
    color: var(--color-background);
    transform: translateY(-1px);
  }

  .bg-grid-pattern {
    background-image:
      linear-gradient(to right, var(--color-border) 1px, transparent 1px),
      linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .animate-marquee {
    animation: marquee 20s linear infinite;
  }

  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
      filter: blur(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0px);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.9s var(--ease-mechanical) forwards;
  }
}
```

#### 3. Load Web Fonts

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&family=JetBrains+Mono:wght@400;700&family=Alex+Brush&display=swap"
  rel="stylesheet"
/>
```

### Design System Checklist

When implementing in the dashboard, ensure:

- [ ] All borders are 1px solid, no border-radius
- [ ] Custom blue square cursor is implemented
- [ ] Color variables are used (no hardcoded hex values)
- [ ] All headings are uppercase with tight leading
- [ ] Monospace font is used for labels and technical content
- [ ] Hover states use color inversion
- [ ] Grid patterns are used for backgrounds
- [ ] Buttons have 56px height with uppercase text
- [ ] Spacing follows mobile-first responsive scale
- [ ] Animations use mechanical easing
- [ ] No shadows, gradients, or rounded corners anywhere

### Common Mistakes to Avoid

❌ **Don't**: Add border-radius to any element  
✅ **Do**: Keep everything perfectly rectangular

❌ **Don't**: Use hardcoded colors like `#0066ff`  
✅ **Do**: Use CSS variables like `var(--color-accent)`

❌ **Don't**: Mix sentence case with design system elements  
✅ **Do**: Keep all headings and labels uppercase

❌ **Don't**: Use elastic or bouncy animations  
✅ **Do**: Use mechanical easing for all transitions

❌ **Don't**: Forget structural borders on sections  
✅ **Do**: Add `.border-structural` to all major sections

---

## Quick Reference

### Color CSS Variables

```css
var(--color-primary)           /* #050505 - Black */
var(--color-background)        /* #ffffff - White */
var(--color-border)            /* #cccccc - Gray */
var(--color-accent)            /* #0066ff - Blue */
var(--color-muted)             /* #6b7280 - Muted gray */
var(--color-success)           /* #22c55e - Green */
var(--color-warning)           /* #f59e0b - Orange */
var(--color-error)             /* #ef4444 - Red */
```

### Common Utility Classes

```css
.border-structural             /* Standard border color */
.font-label                    /* Monospace label style */
.hover-inverse                 /* Black/white color swap on hover */
.hover-signal                  /* Accent color on hover */
.bg-grid-pattern               /* 40px grid background */
.animate-marquee               /* Infinite horizontal scroll */
.animate-fade-in-up            /* Fade in with upward motion */
```

### Typography Classes

```css
.alex-brush-regular            /* Cursive script font */
.font-mono                     /* JetBrains Mono */
.font-display                  /* Inter */
.font-label                    /* 11px mono uppercase */
```

---

## Support

For questions about implementing this design system in the dashboard:

1. Refer to the marketing site source code at `/src/pages/index.astro`
2. Check global styles at `/src/styles/global.css`
3. Review component examples in `/src/components/sections/`

**Key Principle**: When in doubt, choose the more brutalist, structural option. Expose the grid, keep it rectangular, and let the typography do the talking.
