type Node = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: Array<Node>
}

const TITLES = new Set(['Sources', 'References'])

function textOf(node: Node): string {
  if (node.type === 'text') return node.value ?? ''
  return (node.children ?? []).map(textOf).join('')
}

function isHeading(node: Node) {
  return node.type === 'element' && node.tagName === 'h2'
}

/** Folds the closing "Sources" section of a post into a closed <details>. */
export default function rehypeCollapseSources() {
  return (tree: Node) => {
    const children = tree.children ?? []
    const start = children.findIndex(
      (node) => isHeading(node) && TITLES.has(textOf(node).trim()),
    )
    if (start === -1) return
    let end = children.length
    for (let index = start + 1; index < children.length; index++) {
      if (isHeading(children[index])) {
        end = index
        break
      }
    }
    const title = textOf(children[start]).trim()
    const details: Node = {
      type: 'element',
      tagName: 'details',
      properties: { className: ['post-sources'] },
      children: [
        {
          type: 'element',
          tagName: 'summary',
          properties: {},
          children: [{ type: 'text', value: title }],
        },
        ...children.slice(start + 1, end),
      ],
    }
    children.splice(start, end - start, details)
  }
}
