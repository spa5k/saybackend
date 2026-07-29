"use client";

import {
  ArrowRight,
  GitBranch,
  Path,
} from "@phosphor-icons/react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
} from "@xyflow/react";
import type {
  Edge as FlowEdge,
  Node as FlowNode,
  ReactFlowInstance,
} from "@xyflow/react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, ReactNode } from "react";

import "@xyflow/react/dist/style.css";
import "./InteractiveDiagram.css";

type NodeKind = "decision" | "process" | "terminal" | "datastore";

type DiagramNode = {
  id: string;
  label: string;
  kind: NodeKind;
  group?: string;
};

type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  dashed: boolean;
};

type Diagram = {
  direction: "horizontal" | "vertical";
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: string[];
  raw: string;
};

type Props = {
  code: string;
  title?: string;
};

type ParsedNode = {
  node: DiagramNode;
  length: number;
};

type DiagramFlowNode = FlowNode<{ label: ReactNode }, "default">;

const ARROW_RE = /^(-->|---|-\.-?>|==>|<-->)/;
const ID_RE = /^[A-Za-z0-9_./-]+/;
const IGNORED_LINE_RE =
  /^(?:style|classDef|class|linkStyle|click|direction)\b/i;

function normalizeLabel(value: string) {
  const normalized = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\\"/g, '"')
    .trim();
  const quote = normalized[0];
  return quote &&
    (quote === '"' || quote === "'" || quote === "`") &&
    normalized.at(-1) === quote
    ? normalized.slice(1, -1).trim()
    : normalized;
}

function matchingDelimiter(character: string) {
  if (character === "[") return "]";
  if (character === "{") return "}";
  if (character === "(") return ")";
  return null;
}

function readDelimited(input: string) {
  const closing = matchingDelimiter(input[0]);
  if (!closing) return null;

  const stack = [closing];
  let quoted = false;

  for (let index = 1; index < input.length; index += 1) {
    const character = input[index];
    const previous = input[index - 1];

    if (character === '"' && previous !== "\\") {
      quoted = !quoted;
      continue;
    }
    if (quoted) continue;

    const nestedClosing = matchingDelimiter(character);
    if (nestedClosing) {
      stack.push(nestedClosing);
      continue;
    }
    if (character === stack.at(-1)) {
      stack.pop();
      if (!stack.length) {
        return {
          content: input.slice(1, index),
          length: index + 1,
        };
      }
    }
  }

  return null;
}

function nodeKind(opening: string, content: string): NodeKind {
  if (opening === "{") return "decision";
  if (opening === "[" && /^\(.*\)$/.test(content.trim())) return "datastore";
  if (
    (opening === "(" && /^\[.*\]$/.test(content.trim())) ||
    (opening === "[" && /^\(.*\)$/.test(content.trim()))
  ) {
    return "terminal";
  }
  return "process";
}

function unwrapShapeLabel(opening: string, content: string) {
  const trimmed = content.trim();
  if (
    (opening === "(" && trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (opening === "[" && trimmed.startsWith("(") && trimmed.endsWith(")"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseNodeAt(value: string, group?: string): ParsedNode | null {
  const leadingWhitespace = value.length - value.trimStart().length;
  const input = value.trimStart();
  const idMatch = input.match(ID_RE);
  if (!idMatch) return null;

  const id = idMatch[0];
  let length = id.length;
  let label = id;
  let kind: NodeKind = "process";
  const remainder = input.slice(length);

  if (matchingDelimiter(remainder[0])) {
    const delimited = readDelimited(remainder);
    if (delimited) {
      kind = nodeKind(remainder[0], delimited.content);
      label = normalizeLabel(
        unwrapShapeLabel(remainder[0], delimited.content),
      );
      length += delimited.length;
    }
  }

  return {
    node: { id, label, kind, group },
    length: leadingWhitespace + length,
  };
}

function parseSubgraphLabel(line: string) {
  const value = line.replace(/^subgraph\s+/i, "").trim();
  const openingBracket = value.indexOf("[");
  const bracketed =
    openingBracket !== -1 && value.endsWith("]")
      ? value.slice(openingBracket + 1, -1)
      : value;
  return normalizeLabel(bracketed);
}

function setNode(
  nodes: Map<string, DiagramNode>,
  parsed: DiagramNode,
) {
  const existing = nodes.get(parsed.id);
  nodes.set(parsed.id, {
    ...existing,
    ...parsed,
    label:
      parsed.label === parsed.id && existing?.label
        ? existing.label
        : parsed.label,
    kind:
      parsed.label === parsed.id && existing
        ? existing.kind
        : parsed.kind,
    group: parsed.group ?? existing?.group,
  });
}

function parseEdgeLine(
  line: string,
  group: string | undefined,
  nodes: Map<string, DiagramNode>,
) {
  const edges: DiagramEdge[] = [];
  let cursor = 0;
  let current = parseNodeAt(line, group);
  if (!current) return edges;

  setNode(nodes, current.node);
  cursor += current.length;

  while (cursor < line.length) {
    const remainder = line.slice(cursor).trimStart();
    const whitespace = line.slice(cursor).length - remainder.length;
    const arrow = remainder.match(ARROW_RE);
    if (!arrow) break;

    cursor += whitespace + arrow[0].length;
    let afterArrow = line.slice(cursor).trimStart();
    cursor += line.slice(cursor).length - afterArrow.length;

    let edgeLabel: string | undefined;
    if (afterArrow.startsWith("|")) {
      const closingPipe = afterArrow.indexOf("|", 1);
      if (closingPipe !== -1) {
        edgeLabel = normalizeLabel(afterArrow.slice(1, closingPipe));
        cursor += closingPipe + 1;
        afterArrow = line.slice(cursor);
      }
    }

    const next = parseNodeAt(afterArrow, group);
    if (!next) break;
    setNode(nodes, next.node);

    edges.push({
      from: current.node.id,
      to: next.node.id,
      label: edgeLabel,
      dashed: arrow[0].includes("."),
    });

    cursor += next.length;
    current = next;
  }

  return edges;
}

export function parseDiagram(code: string): Diagram {
  const nodes = new Map<string, DiagramNode>();
  const edges: DiagramEdge[] = [];
  const groups: string[] = [];
  const groupStack: string[] = [];
  let direction: Diagram["direction"] = "vertical";

  const lines = code
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const declaration = line.match(/^(?:flowchart|graph)\s+([A-Z]{2})/i);
    if (declaration) {
      direction = /^(?:LR|RL)$/i.test(declaration[1])
        ? "horizontal"
        : "vertical";
      continue;
    }
    if (/^subgraph\b/i.test(line)) {
      const group = parseSubgraphLabel(line);
      groupStack.push(group);
      if (!groups.includes(group)) groups.push(group);
      continue;
    }
    if (/^end$/i.test(line)) {
      groupStack.pop();
      continue;
    }
    if (IGNORED_LINE_RE.test(line)) continue;

    const group = groupStack.at(-1);
    const parsedEdges = parseEdgeLine(line, group, nodes);
    if (parsedEdges.length) {
      edges.push(...parsedEdges);
      continue;
    }

    const declarationOnly = parseNodeAt(line, group);
    if (
      declarationOnly &&
      line.slice(declarationOnly.length).trim() === ""
    ) {
      setNode(nodes, declarationOnly.node);
    }
  }

  return {
    direction,
    nodes: [...nodes.values()],
    edges,
    groups,
    raw: code.trim(),
  };
}

function getNodeDepths(nodes: DiagramNode[], edges: DiagramEdge[]) {
  const depth = new Map(nodes.map((node) => [node.id, 0]));

  for (const _node of nodes) {
    let changed = false;
    for (const edge of edges) {
      const from = depth.get(edge.from) ?? 0;
      const to = depth.get(edge.to) ?? 0;
      const candidate = Math.min(from + 1, nodes.length - 1);
      if (candidate > to) {
        depth.set(edge.to, candidate);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return depth;
}

function nodeSummary(
  node: DiagramNode,
  edges: DiagramEdge[],
  nodeById: Map<string, DiagramNode>,
) {
  const incoming = edges.filter((edge) => edge.to === node.id);
  const outgoing = edges.filter((edge) => edge.from === node.id);
  const connections = [
    ...incoming.map((edge) => {
      const source = nodeById.get(edge.from)?.label ?? edge.from;
      return `Receives from ${source}${edge.label ? ` via ${edge.label}` : ""}.`;
    }),
    ...outgoing.map((edge) => {
      const target = nodeById.get(edge.to)?.label ?? edge.to;
      return `Continues to ${target}${edge.label ? ` when ${edge.label}` : ""}.`;
    }),
  ];

  return connections.length
    ? connections.join(" ")
    : "This step has no recorded connections.";
}

export default function InteractiveDiagram({
  code,
  title = "Process map",
}: Props) {
  const diagramId = useId();
  const flowInstanceId = `${diagramId}-flow`.replace(/:/g, "");
  const diagram = useMemo(() => parseDiagram(code), [code]);
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(
    diagram.nodes[0]?.id ?? null,
  );
  const [compact, setCompact] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const nodeById = useMemo(
    () => new Map(diagram.nodes.map((node) => [node.id, node])),
    [diagram.nodes],
  );
  const depths = useMemo(
    () => getNodeDepths(diagram.nodes, diagram.edges),
    [diagram.edges, diagram.nodes],
  );
  const orderedNodes = useMemo(
    () =>
      [...diagram.nodes].sort(
        (left, right) =>
          (depths.get(left.id) ?? 0) - (depths.get(right.id) ?? 0),
      ),
    [depths, diagram.nodes],
  );
  const nodeOrder = useMemo(
    () => new Map(orderedNodes.map((node, index) => [node.id, index])),
    [orderedNodes],
  );

  useEffect(() => {
    const element = mapRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const updateLayout = (width: number) => {
      setCompact(width < 640);
    };
    updateLayout(element.clientWidth);
    setMounted(true);

    const observer = new ResizeObserver(([entry]) => {
      updateLayout(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!diagram.nodes.length || !diagram.edges.length) {
    return (
      <aside className="interactive-diagram-fallback" aria-label={title}>
        <p>This diagram could not be converted to the interactive view.</p>
        <pre>
          <code>{diagram.raw}</code>
        </pre>
      </aside>
    );
  }

  const activeNode =
    nodeById.get(activeId ?? "") ?? orderedNodes[0];
  const activeEdges = diagram.edges.filter(
    (edge) => edge.from === activeNode.id || edge.to === activeNode.id,
  );
  const connectedIds = new Set(
    activeEdges.flatMap((edge) => [edge.from, edge.to]),
  );
  const activeIndex = orderedNodes.findIndex(
    (node) => node.id === activeNode.id,
  );

  const selectAndFocus = (
    node: DiagramNode,
    focus = true,
  ) => {
    setActiveId(node.id);
    if (focus) nodeRefs.current.get(node.id)?.focus();
  };

  const handleNodeKeyDown = (
    node: DiagramNode,
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    const currentIndex = nodeOrder.get(node.id) ?? activeIndex;
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = Math.min(currentIndex + 1, orderedNodes.length - 1);
    } else if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowUp"
    ) {
      nextIndex = Math.max(currentIndex - 1, 0);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = orderedNodes.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    selectAndFocus(orderedNodes[nextIndex]);
  };

  const nodesByDepth = new Map<number, DiagramNode[]>();
  orderedNodes.forEach((node) => {
    const depth = depths.get(node.id) ?? 0;
    nodesByDepth.set(depth, [...(nodesByDepth.get(depth) ?? []), node]);
  });
  const maxStageSize = Math.max(
    1,
    ...[...nodesByDepth.values()].map((nodes) => nodes.length),
  );

  const flowNodes: DiagramFlowNode[] = orderedNodes.map((node, index) => {
    const depth = depths.get(node.id) ?? 0;
    const peers = nodesByDepth.get(depth) ?? [node];
    const peerIndex = peers.findIndex((peer) => peer.id === node.id);
    const centeredOffset = (maxStageSize - peers.length) / 2;
    const position = compact
      ? {
          x: (centeredOffset + peerIndex) * 190,
          y: depth * 128,
        }
      : {
          x: depth * 220,
          y: (centeredOffset + peerIndex) * 112,
        };

    return {
      id: node.id,
      type: "default",
      position,
      width: 176,
      height: 84,
      sourcePosition: compact ? Position.Bottom : Position.Right,
      targetPosition: compact ? Position.Top : Position.Left,
      draggable: false,
      selectable: false,
      connectable: false,
      focusable: false,
      data: {
        label: (
          <button
            ref={(element) => {
              if (element) nodeRefs.current.set(node.id, element);
              else nodeRefs.current.delete(node.id);
            }}
            type="button"
            className={[
              "interactive-diagram__node",
              `interactive-diagram__node--${node.kind}`,
              node.id === activeNode.id ? "is-selected" : "",
              node.id !== activeNode.id && connectedIds.has(node.id)
                ? "is-connected"
                : "",
              node.id !== activeNode.id && !connectedIds.has(node.id)
                ? "is-muted"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={node.id === activeNode.id}
            aria-label={`${node.label}. ${nodeSummary(
              node,
              diagram.edges,
              nodeById,
            )}`}
            onClick={() => selectAndFocus(node, false)}
            onFocus={() => selectAndFocus(node, false)}
            onKeyDown={(event) => handleNodeKeyDown(node, event)}
          >
            <span className="interactive-diagram__index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="interactive-diagram__node-copy">
              {node.group ? (
                <span className="interactive-diagram__group">
                  {node.group}
                </span>
              ) : null}
              <span>{node.label}</span>
            </span>
          </button>
        ),
      },
    };
  });

  const flowEdges: FlowEdge[] = diagram.edges.map((edge, index) => {
    const isActive =
      edge.from === activeNode.id || edge.to === activeNode.id;
    const stroke = isActive ? "var(--green)" : "var(--rule)";

    return {
      id: `${edge.from}-${edge.to}-${index}`,
      source: edge.from,
      target: edge.to,
      type: "smoothstep",
      label: edge.label,
      ariaLabel: `${nodeById.get(edge.from)?.label ?? edge.from} to ${
        nodeById.get(edge.to)?.label ?? edge.to
      }${edge.label ? ` via ${edge.label}` : ""}`,
      style: {
        stroke,
        strokeWidth: isActive ? 2 : 1.35,
        strokeDasharray: edge.dashed ? "5 5" : undefined,
        opacity: isActive ? 1 : 0.48,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: stroke,
        width: 14,
        height: 14,
      },
      labelStyle: {
        fill: isActive ? "var(--green)" : "var(--muted)",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      },
      labelBgStyle: {
        fill: "var(--paper-raised)",
        fillOpacity: 0.96,
      },
      labelBgPadding: [5, 3],
      labelBgBorderRadius: 2,
      pathOptions: {
        borderRadius: 12,
        offset: 18,
      },
    };
  });

  const fitFlow = (
    instance: ReactFlowInstance<DiagramFlowNode, FlowEdge>,
  ) => {
    requestAnimationFrame(() => {
      void instance.fitView({
        padding: compact ? 0.12 : 0.08,
        maxZoom: 1,
      });
    });
  };

  return (
    <figure
      className="interactive-diagram"
      aria-labelledby={`${diagramId}-title`}
    >
      <figcaption className="interactive-diagram__header">
        <div>
          <span className="interactive-diagram__eyebrow">
            <Path aria-hidden="true" weight="bold" />
            Interactive field map
          </span>
          <h3 id={`${diagramId}-title`}>{title}</h3>
        </div>
        <p>
          {diagram.nodes.length} steps · {diagram.edges.length} connections
        </p>
      </figcaption>

      {diagram.groups.length ? (
        <div className="interactive-diagram__groups" aria-label="Diagram groups">
          <GitBranch aria-hidden="true" weight="bold" />
          {diagram.groups.join(" · ")}
        </div>
      ) : null}

      <div
        ref={mapRef}
        className={[
          "interactive-diagram__map",
          compact ? "is-compact" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="group"
        aria-label={`${title}. Use the arrow keys to move between steps. Drag the canvas to pan, or use the diagram controls to zoom.`}
      >
        {mounted ? (
          <ReactFlow<DiagramFlowNode, FlowEdge>
            key={compact ? "compact" : "wide"}
            id={flowInstanceId}
            nodes={flowNodes}
            edges={flowEdges}
            onInit={fitFlow}
            fitView
            fitViewOptions={{ padding: compact ? 0.12 : 0.08, maxZoom: 1 }}
            minZoom={0.45}
            maxZoom={1.4}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="var(--rule)"
              gap={18}
              size={1}
            />
            <Controls
              position="bottom-right"
              showInteractive={false}
              fitViewOptions={{ padding: compact ? 0.12 : 0.08 }}
            />
          </ReactFlow>
        ) : (
          <div className="interactive-diagram__loading" aria-hidden="true" />
        )}
      </div>

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
              const isIncoming = edge.to === activeNode.id;
              const related = nodeById.get(
                isIncoming ? edge.from : edge.to,
              );
              if (!related) return null;
              return (
                <li key={`${edge.from}-${edge.to}-${index}`}>
                  <button
                    type="button"
                    onClick={() => selectAndFocus(related)}
                  >
                    <span>{isIncoming ? "From" : edge.label ?? "To"}</span>
                    <strong>{related.label}</strong>
                    <ArrowRight aria-hidden="true" weight="bold" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <p className="interactive-diagram__hint">
        Select a step to trace its immediate path. Arrow keys move through the
        map in reading order.
      </p>
    </figure>
  );
}
