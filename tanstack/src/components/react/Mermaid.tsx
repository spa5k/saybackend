"use client";

import { fromShikiTheme, renderMermaid } from "beautiful-mermaid";
import { useEffect, useState } from "react";
import { getSingletonHighlighter } from "shiki";

interface Props {
  code: string;
}

export default function Mermaid({ code }: Props) {
  const [renderedSvg, setRenderedSvg] = useState<string | null>(null);

  useEffect(() => {
    const render = async () => {
      try {
        // Load any theme from Shiki's registry
        const highlighter = await getSingletonHighlighter({
          themes: ["rose-pine", "material-theme-darker"],
        });

        // Extract diagram colors from the theme
        const colors = fromShikiTheme(highlighter.getTheme("rose-pine"));

        const svg = await renderMermaid(code.trim(), colors);

        setRenderedSvg(svg);
      } catch (error) {
        console.error("Failed to render Mermaid diagram:", error);
        const svg = await renderMermaid(code.trim());
        setRenderedSvg(svg);
      }
    };

    render();
  }, [code]);

  if (!renderedSvg) {
    return <div className="h-64 animate-pulse rounded-lg" />;
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: renderedSvg }}
      className="my-4 flex justify-center"
    />
  );
}
