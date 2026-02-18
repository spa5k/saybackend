import { useState, useEffect } from "react";
import { createHighlighter, type Highlighter } from "shiki";

export type TokenStyle = Record<string, string>;
export type TokenLine = { content: string; style: TokenStyle }[];

let _hlPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!_hlPromise) {
    _hlPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["go", "sql"],
    });
  }
  return _hlPromise;
}

/**
 * Returns tokenized lines for dual-theme syntax highlighting.
 * Each token carries { content, style } where style has:
 *   - "color": light-mode hex
 *   - "--shiki-dark": dark-mode hex
 *
 * Render the dark variant via CSS:
 *   .dark .shiki-code span { color: var(--shiki-dark); }
 */
export function useShikiHighlight(
  code: string,
  lang: "go" | "sql",
): TokenLine[] | null {
  const [lines, setLines] = useState<TokenLine[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((hl) => {
      if (cancelled) return;
      const result = hl.codeToTokens(code, {
        lang,
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      });
      setLines(
        result.tokens.map((line) =>
          line.map((token) => ({
            content: token.content,
            style: (token.htmlStyle ?? {}) as TokenStyle,
          })),
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  return lines;
}
