'use client'

import {
  ArrowDown,
  ArrowRight,
  FlowArrow,
  GitBranch,
  Path,
  Stack,
} from '@phosphor-icons/react'
import { useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import './InteractiveDiagram.css'

type NodeKind = 'decision' | 'process' | 'terminal' | 'datastore'

type DiagramNode = {
  id: string
  label: string
  kind: NodeKind
  group?: string
}

type DiagramEdge = {
  from: string
  to: string
  label?: string
  dashed: boolean
}

type Diagram = {
  direction: 'horizontal' | 'vertical'
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  groups: string[]
  raw: string
}

type Props = {
  code: string
  title?: string
  variant?: 'journey' | 'decision' | 'architecture' | 'timeline'
}

type ParsedNode = {
  node: DiagramNode
  length: number
}

const ARROW_RE = /^(-->|---|-\.-?>|==>|<-->)/
const ID_RE = /^[A-Za-z0-9_./-]+/
const IGNORED_LINE_RE = /^(?:style|classDef|class|linkStyle|click|direction)\b/i

function normalizeLabel(value: string) {
  const normalized = value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\\"/g, '"')
    .trim()
  const quote = normalized[0]
  return quote &&
    (quote === '"' || quote === "'" || quote === '`') &&
    normalized.at(-1) === quote
    ? normalized.slice(1, -1).trim()
    : normalized
}

function matchingDelimiter(character: string) {
  if (character === '[') return ']'
  if (character === '{') return '}'
  if (character === '(') return ')'
  return null
}

function readDelimited(input: string) {
  const closing = matchingDelimiter(input[0])
  if (!closing) return null

  const stack = [closing]
  let quoted = false

  for (let index = 1; index < input.length; index += 1) {
    const character = input[index]
    const previous = input[index - 1]

    if (character === '"' && previous !== '\\') {
      quoted = !quoted
      continue
    }
    if (quoted) continue

    const nestedClosing = matchingDelimiter(character)
    if (nestedClosing) {
      stack.push(nestedClosing)
      continue
    }
    if (character === stack.at(-1)) {
      stack.pop()
      if (!stack.length) {
        return {
          content: input.slice(1, index),
          length: index + 1,
        }
      }
    }
  }

  return null
}

function nodeKind(opening: string, content: string): NodeKind {
  if (opening === '{') return 'decision'
  if (opening === '[' && /^\(.*\)$/.test(content.trim())) return 'datastore'
  if (
    (opening === '(' && /^\[.*\]$/.test(content.trim())) ||
    (opening === '[' && /^\(.*\)$/.test(content.trim()))
  ) {
    return 'terminal'
  }
  return 'process'
}

function unwrapShapeLabel(opening: string, content: string) {
  const trimmed = content.trim()
  if (
    (opening === '(' && trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    (opening === '[' && trimmed.startsWith('(') && trimmed.endsWith(')'))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseNodeAt(value: string, group?: string): ParsedNode | null {
  const leadingWhitespace = value.length - value.trimStart().length
  const input = value.trimStart()
  const idMatch = input.match(ID_RE)
  if (!idMatch) return null

  const id = idMatch[0]
  let length = id.length
  let label = id
  let kind: NodeKind = 'process'
  const remainder = input.slice(length)

  if (matchingDelimiter(remainder[0])) {
    const delimited = readDelimited(remainder)
    if (delimited) {
      kind = nodeKind(remainder[0], delimited.content)
      label = normalizeLabel(unwrapShapeLabel(remainder[0], delimited.content))
      length += delimited.length
    }
  }

  return {
    node: { id, label, kind, group },
    length: leadingWhitespace + length,
  }
}

function parseSubgraphLabel(line: string) {
  const value = line.replace(/^subgraph\s+/i, '').trim()
  const openingBracket = value.indexOf('[')
  const bracketed =
    openingBracket !== -1 && value.endsWith(']')
      ? value.slice(openingBracket + 1, -1)
      : value
  return normalizeLabel(bracketed)
}

function setNode(nodes: Map<string, DiagramNode>, parsed: DiagramNode) {
  const existing = nodes.get(parsed.id)
  nodes.set(parsed.id, {
    ...existing,
    ...parsed,
    label:
      parsed.label === parsed.id && existing?.label
        ? existing.label
        : parsed.label,
    kind: parsed.label === parsed.id && existing ? existing.kind : parsed.kind,
    group: parsed.group ?? existing?.group,
  })
}

function parseEdgeLine(
  line: string,
  group: string | undefined,
  nodes: Map<string, DiagramNode>,
) {
  const edges: DiagramEdge[] = []
  let cursor = 0
  let current = parseNodeAt(line, group)
  if (!current) return edges

  setNode(nodes, current.node)
  cursor += current.length

  while (cursor < line.length) {
    const remainder = line.slice(cursor).trimStart()
    const whitespace = line.slice(cursor).length - remainder.length
    const arrow = remainder.match(ARROW_RE)
    if (!arrow) break

    cursor += whitespace + arrow[0].length
    let afterArrow = line.slice(cursor).trimStart()
    cursor += line.slice(cursor).length - afterArrow.length

    let edgeLabel: string | undefined
    if (afterArrow.startsWith('|')) {
      const closingPipe = afterArrow.indexOf('|', 1)
      if (closingPipe !== -1) {
        edgeLabel = normalizeLabel(afterArrow.slice(1, closingPipe))
        cursor += closingPipe + 1
        afterArrow = line.slice(cursor)
      }
    }

    const next = parseNodeAt(afterArrow, group)
    if (!next) break
    setNode(nodes, next.node)

    edges.push({
      from: current.node.id,
      to: next.node.id,
      label: edgeLabel,
      dashed: arrow[0].includes('.'),
    })

    cursor += next.length
    current = next
  }

  return edges
}

export function parseDiagram(code: string): Diagram {
  const nodes = new Map<string, DiagramNode>()
  const edges: DiagramEdge[] = []
  const groups: string[] = []
  const groupStack: string[] = []
  let direction: Diagram['direction'] = 'vertical'

  const lines = code
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    const declaration = line.match(/^(?:flowchart|graph)\s+([A-Z]{2})/i)
    if (declaration) {
      direction = /^(?:LR|RL)$/i.test(declaration[1])
        ? 'horizontal'
        : 'vertical'
      continue
    }
    if (/^subgraph\b/i.test(line)) {
      const group = parseSubgraphLabel(line)
      groupStack.push(group)
      if (!groups.includes(group)) groups.push(group)
      continue
    }
    if (/^end$/i.test(line)) {
      groupStack.pop()
      continue
    }
    if (IGNORED_LINE_RE.test(line)) continue

    const group = groupStack.at(-1)
    const parsedEdges = parseEdgeLine(line, group, nodes)
    if (parsedEdges.length) {
      edges.push(...parsedEdges)
      continue
    }

    const declarationOnly = parseNodeAt(line, group)
    if (declarationOnly && line.slice(declarationOnly.length).trim() === '') {
      setNode(nodes, declarationOnly.node)
    }
  }

  return {
    direction,
    nodes: [...nodes.values()],
    edges,
    groups,
    raw: code.trim(),
  }
}

function getNodeDepths(nodes: DiagramNode[], edges: DiagramEdge[]) {
  const depth = new Map(nodes.map((node) => [node.id, 0]))

  for (const _node of nodes) {
    let changed = false
    for (const edge of edges) {
      const from = depth.get(edge.from) ?? 0
      const to = depth.get(edge.to) ?? 0
      const candidate = Math.min(from + 1, nodes.length - 1)
      if (candidate > to) {
        depth.set(edge.to, candidate)
        changed = true
      }
    }
    if (!changed) break
  }

  return depth
}

function nodeSummary(
  node: DiagramNode,
  edges: DiagramEdge[],
  nodeById: Map<string, DiagramNode>,
) {
  const incoming = edges.filter((edge) => edge.to === node.id)
  const outgoing = edges.filter((edge) => edge.from === node.id)
  const connections = [
    ...incoming.map((edge) => {
      const source = nodeById.get(edge.from)?.label ?? edge.from
      return `Receives from ${source}${edge.label ? ` via ${edge.label}` : ''}.`
    }),
    ...outgoing.map((edge) => {
      const target = nodeById.get(edge.to)?.label ?? edge.to
      return `Continues to ${target}${edge.label ? ` when ${edge.label}` : ''}.`
    }),
  ]

  return connections.length
    ? connections.join(' ')
    : 'This step has no recorded connections.'
}

export default function InteractiveDiagram({
  code,
  title = 'Process map',
  variant = 'journey',
}: Props) {
  const diagramId = useId()
  const diagram = useMemo(() => parseDiagram(code), [code])
  const [activeId, setActiveId] = useState<string | null>(
    diagram.nodes[0]?.id ?? null,
  )
  const [activeGroup, setActiveGroup] = useState<string | null>(
    diagram.groups[0] ?? null,
  )
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>())
  const nodeById = useMemo(
    () => new Map(diagram.nodes.map((node) => [node.id, node])),
    [diagram.nodes],
  )
  const depths = useMemo(
    () => getNodeDepths(diagram.nodes, diagram.edges),
    [diagram.edges, diagram.nodes],
  )
  const orderedNodes = useMemo(
    () =>
      [...diagram.nodes].sort(
        (left, right) =>
          (depths.get(left.id) ?? 0) - (depths.get(right.id) ?? 0),
      ),
    [depths, diagram.nodes],
  )

  if (!diagram.nodes.length || !diagram.edges.length) {
    return (
      <aside className="interactive-diagram-fallback" aria-label={title}>
        <p>This diagram could not be converted to the interactive view.</p>
        <pre>
          <code>{diagram.raw}</code>
        </pre>
      </aside>
    )
  }

  const activeNode = nodeById.get(activeId ?? '') ?? orderedNodes[0]
  const activeEdges = diagram.edges.filter(
    (edge) => edge.from === activeNode.id || edge.to === activeNode.id,
  )
  const connectedIds = new Set(
    activeEdges.flatMap((edge) => [edge.from, edge.to]),
  )
  const activeIndex = orderedNodes.findIndex(
    (node) => node.id === activeNode.id,
  )
  const activeGroupNodes =
    variant === 'architecture' && activeGroup
      ? orderedNodes.filter((node) => node.group === activeGroup)
      : orderedNodes
  const variantMeta = {
    journey: {
      label: 'Interactive journey',
      hint: 'Follow the path in reading order',
      icon: FlowArrow,
    },
    timeline: {
      label: 'Implementation timeline',
      hint: 'Move through the sequence',
      icon: Path,
    },
    decision: {
      label: 'Decision explorer',
      hint: 'Choose a branch to inspect its outcome',
      icon: GitBranch,
    },
    architecture: {
      label: 'Architecture explorer',
      hint: 'Inspect one system layer at a time',
      icon: Stack,
    },
  }[variant]
  const VariantIcon = variantMeta.icon

  const selectAndFocus = (node: DiagramNode) => {
    setActiveId(node.id)
    if (node.group) setActiveGroup(node.group)
    requestAnimationFrame(() => nodeRefs.current.get(node.id)?.focus())
  }

  const handleNodeKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = Math.min(activeIndex + 1, orderedNodes.length - 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = Math.max(activeIndex - 1, 0)
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = orderedNodes.length - 1
    } else {
      return
    }

    event.preventDefault()
    selectAndFocus(orderedNodes[nextIndex])
  }

  const selectGroup = (group: string) => {
    setActiveGroup(group)
    const firstNode = orderedNodes.find((node) => node.group === group)
    if (firstNode) setActiveId(firstNode.id)
  }

  const renderNode = (node: DiagramNode, index: number) => {
    const selected = node.id === activeNode.id
    const connected = connectedIds.has(node.id)
    return (
      <button
        key={node.id}
        ref={(element) => {
          if (element) nodeRefs.current.set(node.id, element)
          else nodeRefs.current.delete(node.id)
        }}
        type="button"
        className={[
          'interactive-diagram__node',
          `interactive-diagram__node--${node.kind}`,
          selected ? 'is-selected' : '',
          !selected && connected ? 'is-connected' : '',
          !selected && !connected ? 'is-muted' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-pressed={selected}
        aria-label={`${node.label}. ${nodeSummary(node, diagram.edges, nodeById)}`}
        onClick={() => setActiveId(node.id)}
        onFocus={() => setActiveId(node.id)}
        onKeyDown={handleNodeKeyDown}
      >
        <span className="interactive-diagram__index">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="interactive-diagram__node-copy">
          {node.group ? (
            <span className="interactive-diagram__group">{node.group}</span>
          ) : null}
          <span>{node.label}</span>
        </span>
      </button>
    )
  }

  return (
    <figure
      className={`interactive-diagram interactive-diagram--${variant}`}
      aria-labelledby={`${diagramId}-title`}
    >
      <figcaption className="interactive-diagram__header">
        <div>
          <span className="interactive-diagram__eyebrow">
            <VariantIcon aria-hidden="true" weight="bold" />
            {variantMeta.label}
          </span>
          <h3 id={`${diagramId}-title`}>{title}</h3>
        </div>
        <p>
          {diagram.nodes.length} steps · {diagram.edges.length} connections
        </p>
      </figcaption>

      {variant === 'architecture' && diagram.groups.length ? (
        <div
          className="interactive-diagram__groups"
          role="group"
          aria-label="System layer"
        >
          {diagram.groups.map((group) => (
            <button
              key={group}
              type="button"
              aria-pressed={activeGroup === group}
              className={activeGroup === group ? 'is-active' : ''}
              onClick={() => selectGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>
      ) : null}

      {variant === 'decision' ? (
        <div className="interactive-diagram__decision">
          <div className="interactive-diagram__decision-question">
            <span>Current decision</span>
            {renderNode(activeNode, activeIndex)}
          </div>
          <div
            className="interactive-diagram__branches"
            aria-label="Available branches"
          >
            {activeEdges.map((edge, index) => {
              const incoming = edge.to === activeNode.id
              const related = nodeById.get(incoming ? edge.from : edge.to)
              if (!related) return null
              return (
                <button
                  key={`${edge.from}-${edge.to}-${index}`}
                  type="button"
                  onClick={() => selectAndFocus(related)}
                >
                  <span>
                    {edge.label ?? (incoming ? 'Previous' : 'Continue')}
                  </span>
                  <strong>{related.label}</strong>
                  <ArrowRight aria-hidden="true" weight="bold" />
                </button>
              )
            })}
          </div>
        </div>
      ) : variant === 'architecture' ? (
        <div className="interactive-diagram__architecture">
          <div className="interactive-diagram__architecture-label">
            <span>Selected layer</span>
            <strong>{activeGroup ?? 'System'}</strong>
            <p>{activeGroupNodes.length} components in this view</p>
          </div>
          <div className="interactive-diagram__architecture-nodes">
            {activeGroupNodes.map((node) =>
              renderNode(
                node,
                orderedNodes.findIndex((item) => item.id === node.id),
              ),
            )}
          </div>
        </div>
      ) : (
        <div
          className={`interactive-diagram__map interactive-diagram__map--${diagram.direction}`}
          aria-label={`${title}. Use the arrow keys to move between steps.`}
        >
          {orderedNodes.map((node, index) => {
            const nextNode = orderedNodes[index + 1]
            const outgoing = diagram.edges.filter(
              (edge) => edge.from === node.id,
            )
            const showConnector =
              outgoing.length === 1 && outgoing[0].to === nextNode?.id
            return (
              <div className="interactive-diagram__step" key={node.id}>
                {renderNode(node, index)}
                {showConnector ? (
                  <span
                    className={[
                      'interactive-diagram__connector',
                      variant === 'timeline' ||
                      diagram.direction === 'horizontal'
                        ? 'interactive-diagram__connector--horizontal'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden="true"
                  >
                    {variant === 'timeline' ||
                    diagram.direction === 'horizontal' ? (
                      <ArrowRight weight="bold" />
                    ) : (
                      <ArrowDown weight="bold" />
                    )}
                  </span>
                ) : outgoing.length ? (
                  <div
                    className="interactive-diagram__outgoing"
                    aria-label={`Branches from ${node.label}`}
                  >
                    {outgoing.map((edge) => {
                      const target = nodeById.get(edge.to)
                      if (!target) return null
                      return (
                        <button
                          key={`${edge.from}-${edge.to}`}
                          type="button"
                          onClick={() => selectAndFocus(target)}
                        >
                          <span>{edge.label ?? 'Continue'}</span>
                          <strong>{target.label}</strong>
                          <ArrowRight aria-hidden="true" />
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      <div className="interactive-diagram__inspector" aria-live="polite">
        <div className="interactive-diagram__focus">
          <span>Selected step</span>
          <strong>{activeNode.label}</strong>
          <p>{nodeSummary(activeNode, diagram.edges, nodeById)}</p>
        </div>
        <div className="interactive-diagram__connections">
          <span>Direct connections</span>
          <ul>
            {activeEdges.map((edge, index) => {
              const isIncoming = edge.to === activeNode.id
              const related = nodeById.get(isIncoming ? edge.from : edge.to)
              if (!related) return null
              return (
                <li key={`${edge.from}-${edge.to}-${index}`}>
                  <button type="button" onClick={() => selectAndFocus(related)}>
                    <span>{isIncoming ? 'From' : (edge.label ?? 'To')}</span>
                    <strong>{related.label}</strong>
                    <ArrowRight aria-hidden="true" weight="bold" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <p className="interactive-diagram__hint">
        {variantMeta.hint}. Arrow keys move through the map in reading order.
      </p>
    </figure>
  )
}
