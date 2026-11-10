import { useEffect, useState } from "react";
import go from "@shikijs/langs/go";
import sql from "@shikijs/langs/sql";
import githubDarkDefault from "@shikijs/themes/github-dark-default";
import githubLightDefault from "@shikijs/themes/github-light-default";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { HighlighterCore } from "@shikijs/types";

export type TokenStyle = Record<string, string>;
export type TokenLine = { content: string; style: TokenStyle }[];

let _hlPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  if (!_hlPromise) {
    _hlPromise = createHighlighterCore({
      themes: [githubLightDefault, githubDarkDefault],
      langs: [go, sql],
      engine: createJavaScriptRegexEngine(),
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
        themes: { light: "github-light-default", dark: "github-dark-default" },
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
