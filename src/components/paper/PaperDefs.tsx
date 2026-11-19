/**
 * Shared SVG definitions for every figure on the site: the marker and
 * hand-ruled-line filters, the graph-paper pattern, and the arrow heads.
 * Rendered once in the site shell and referenced by id.
 */
export function PaperDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute' }}
    >
      <defs>
        <filter
          id="pp-marker"
          x="-6%"
          y="-6%"
          width="112%"
          height="112%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".8"
            numOctaves="2"
            seed="3"
            result="grain"
          />
          <feColorMatrix in="grain" type="luminanceToAlpha" result="alpha" />
          <feComposite
            in="SourceGraphic"
            in2="alpha"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="-.15"
            k4="0"
            result="inked"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".1"
            numOctaves="2"
            seed="8"
            result="warp"
          />
          <feDisplacementMap
            in="inked"
            in2="warp"
            scale="2.8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="pp-rule" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".06"
            numOctaves="2"
            seed="5"
            result="warp"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="1.6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="pp-line" x="-3%" y="-10%" width="106%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".7"
            numOctaves="2"
            seed="2"
            result="grain"
          />
          <feColorMatrix in="grain" type="luminanceToAlpha" result="alpha" />
          <feComposite
            in="SourceGraphic"
            in2="alpha"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="-.1"
            k4="0"
            result="inked"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".05"
            numOctaves="2"
            seed="6"
            result="warp"
          />
          <feDisplacementMap
            in="inked"
            in2="warp"
            scale="1.4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <pattern
          id="pp-grid"
          width="56"
          height="56"
          patternUnits="userSpaceOnUse"
        >
          <path
            className="fig-grid-minor"
            d="M14 0V56M28 0V56M42 0V56M0 14H56M0 28H56M0 42H56"
          />
          <path className="fig-grid-major" d="M0 0V56M0 0H56" />
        </pattern>
        <radialGradient id="pp-fade-gradient">
          <stop offset=".55" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="pp-fade" maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill="url(#pp-fade-gradient)" />
        </mask>
        <marker
          id="pp-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path
            d="M1 1L7 4L1 7"
            fill="none"
            strokeWidth="1.2"
            style={{ stroke: 'var(--muted)' }}
          />
        </marker>
        <marker
          id="pp-ink-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path
            d="M1.5 1.5L8 5L2 8.5"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ stroke: 'var(--pen)' }}
          />
        </marker>
        <symbol id="pp-circle" viewBox="0 0 200 100" preserveAspectRatio="none">
          <path
            className="ink-stroke"
            d="M12 56C6 26 44 7 104 8C162 9 196 26 193 54C190 82 148 95 94 93C42 91 9 78 9 50C9 32 24 17 52 11"
            vectorEffect="non-scaling-stroke"
          />
        </symbol>
        <symbol id="pp-square" viewBox="0 0 20 20">
          <rect
            x="2"
            y="2"
            width="16"
            height="16"
            filter="url(#pp-marker)"
            style={{ fill: 'var(--m-lilac)' }}
          />
        </symbol>
      </defs>
    </svg>
  )
}
