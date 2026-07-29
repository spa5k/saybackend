"use client";

import { useMemo, useState } from "react";

type Node = {
  id: string;
  label: string;
};

type Edge = {
  from: string;
  to: string;
  label?: string;
};

type Diagram = {
  title: string;
  nodes: Node[];
  edges: Edge[];
  raw: string;
};

const NODE_RE =
  /^([A-Za-z0-9_./-]+)(?:\s*\[(.*)\])?$/;

function normalizeLabel(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/^["'`]|["'`]$/g, "")
    .trim();
}

function parseNodeToken(token: string): Node | null {
  const cleaned = token.trim().replace(/[{}()]/g, "");
  if (!cleaned) return null;
  const match = cleaned.match(NODE_RE);
  if (match) {
    const id = match[1];
    const label = normalizeLabel(match[2] ?? id);
    return { id, label };
  }
  return {
    id: cleaned.replace(/\s+/g, "-").toLowerCase(),
    label: normalizeLabel(cleaned),
  };
}

function parseMermaid(code: string): Diagram {
  const lines = code
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const edges: Edge[] = [];
  const nodes = new Map<string, Node>();
  let title = "Diagram";

  for (const line of lines) {
    if (/^flowchart|^graph/.test(line)) {
      title = "Interactive flow diagram";
      continue;
    }
    if (/^subgraph\b/i.test(line) || /^end$/i.test(line)) continue;

    const arrow = line.match(
      /(.+?)\s*(?:---|-->|<-->|-.->|==>|-\.->)\s*(.+?)(?:\s*\|(.+?)\|)?$/,
    );
    if (!arrow) {
      continue;
    }

    const left = parseNodeToken(arrow[1]);
    const right = parseNodeToken(arrow[2]);
    if (!left || !right) continue;

    nodes.set(left.id, left);
    nodes.set(right.id, right);
    edges.push({
      from: left.id,
      to: right.id,
      label: arrow[3] ? normalizeLabel(arrow[3]) : undefined,
    });
  }

  return { title, nodes: [...nodes.values()], edges, raw: code.trim() };
}

function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center text-[var(--green)] ${
        direction === "down" ? "rotate-90" : ""
      }`}
    >
      →
    </span>
  );
}

export default function Mermaid({ code }: { code: string }) {
  const [active, setActive] = useState<string | null>(null);
  const diagram = useMemo(() => parseMermaid(code), [code]);

  if (!diagram.nodes.length || !diagram.edges.length) {
    return (
      <pre className="my-6 overflow-x-auto rounded-none border border-[color:var(--rule)] bg-[color:var(--paper-soft)] p-4 text-sm leading-6 text-[color:var(--ink)]">
        <code>{diagram.raw}</code>
      </pre>
    );
  }

  const activeNode = active
    ? diagram.nodes.find((node) => node.id === active) ?? null
    : null;

  return (
    <section className="my-8 rounded-none border border-[color:var(--rule)] bg-[color:var(--paper-soft)] p-4 shadow-[0_16px_44px_rgba(26,34,28,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[color:var(--rule)] pb-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--green)]">
            Interactive diagram
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[color:var(--ink)]">
            {diagram.title}
          </h3>
        </div>
        <button
          type="button"
          className="rounded-full border border-[color:var(--rule)] px-3 py-1 text-xs font-medium text-[color:var(--ink)] transition hover:border-[color:var(--green)] hover:text-[color:var(--green)]"
          onClick={() => setActive(null)}
        >
          Reset
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {diagram.nodes.map((node, index) => {
          const isActive = active === node.id;
          const outgoing = diagram.edges.filter((edge) => edge.from === node.id);
          const incoming = diagram.edges.filter((edge) => edge.to === node.id);
          return (
            <div key={node.id} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-1">
              <button
                type="button"
                onClick={() => setActive(node.id)}
                className={`group rounded-none border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-[color:var(--green)] bg-[color:var(--green-soft)]"
                    : "border-[color:var(--rule)] bg-[color:var(--paper)] hover:border-[color:var(--green)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--green)]">
                      {node.id}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[color:var(--ink)]">
                      {node.label}
                    </div>
                  </div>
                  <div className="text-xs text-[color:var(--ink-soft)]">
                    {incoming.length}/{outgoing.length}
                  </div>
                </div>
              </button>

              {index < diagram.nodes.length - 1 ? (
                <div className="flex justify-center px-2 text-lg">
                  <Arrow />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-none border border-[color:var(--rule)] bg-[color:var(--paper)] p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">
            Connections
          </div>
          <div className="space-y-2">
            {diagram.edges.map((edge, index) => (
              <button
                key={`${edge.from}-${edge.to}-${index}`}
                type="button"
                onClick={() => setActive(edge.from)}
                className="flex w-full items-center justify-between gap-3 rounded-none border border-transparent px-3 py-2 text-left transition hover:border-[color:var(--green)] hover:bg-[color:var(--green-soft)]"
              >
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
                  {diagram.nodes.find((n) => n.id === edge.from)?.label ?? edge.from}
                </span>
                <span className="flex items-center gap-2 text-sm text-[color:var(--green)]">
                  <Arrow />
                  {edge.label ? <span className="text-[color:var(--ink-soft)]">{edge.label}</span> : null}
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
                  {diagram.nodes.find((n) => n.id === edge.to)?.label ?? edge.to}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-none border border-[color:var(--rule)] bg-[color:var(--paper)] p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">
            Focus
          </div>
          {activeNode ? (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--green)]">
                {activeNode.id}
              </div>
              <div className="mt-2 text-base font-semibold text-[color:var(--ink)]">
                {activeNode.label}
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--ink-soft)]">
                Select another node or reset the diagram to inspect a different
                step.
              </p>
            </div>
          ) : (
            <p className="text-sm leading-6 text-[color:var(--ink-soft)]">
              Click a node to highlight it and inspect the flow.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
