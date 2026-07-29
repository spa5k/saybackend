declare module '*.mdx' {
  import type { ComponentType } from 'react'

  export const frontmatter: Record<string, unknown>
  const Component: ComponentType
  export default Component
}

declare module '*.md' {
  import type { ComponentType } from 'react'

  export const frontmatter: Record<string, unknown>
  const Component: ComponentType
  export default Component
}

declare module '*.svg' {
  import type { ComponentType, SVGProps } from 'react'

  const Component: ComponentType<SVGProps<SVGSVGElement>>
  export default Component
}

interface Window {
  PagefindUI?: new (options: {
    element: HTMLElement
    showSubResults?: boolean
    showImages?: boolean
  }) => unknown
}
