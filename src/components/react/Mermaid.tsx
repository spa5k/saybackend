"use client";

import { renderMermaid, THEMES } from "beautiful-mermaid";
import { useEffect, useState } from "react";

interface Props {
  code: string;
}

export default function Mermaid({ code }: Props) {
  const [renderedSvg, setRenderedSvg] = useState<string | null>(null);

  useEffect(() => {
    const render = async () => {
      try {
        const isDark = document.documentElement.classList.contains("dark");
        // Use beautiful-mermaid's built-in themes for better aesthetics
        const theme = isDark
          ? THEMES["vitesse-dark"]
          : THEMES["vitesse-light"];
        const svg = await renderMermaid(code.trim(), theme);

        setRenderedSvg(svg);
      } catch (error) {
        console.error("Failed to render Mermaid diagram:", error);
        const svg = await renderMermaid(code.trim());
        setRenderedSvg(svg);
      }
    };

    render();

    // Re-render when dark mode changes
    const observer = new MutationObserver(() => {
      render();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
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
