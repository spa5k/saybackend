"use client";

import { renderMermaidAscii } from "beautiful-mermaid";

interface Props {
  code: string;
}

export default function MermaidAscii({ code }: Props) {
  const renderedSvg = renderMermaidAscii(code.trim());

  if (!renderedSvg) {
    return <div className="h-64 animate-pulse rounded-lg" />;
  }

  return renderedSvg;
}
