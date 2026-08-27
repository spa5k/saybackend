import { Circle } from '@phosphor-icons/react'
import type { ComponentPropsWithoutRef } from 'react'

const LANGUAGE_LABELS: Record<string, string> = {
  bash: 'Shell',
  css: 'CSS',
  go: 'Go',
  html: 'HTML',
  javascript: 'JavaScript',
  js: 'JavaScript',
  json: 'JSON',
  jsx: 'JSX',
  markdown: 'Markdown',
  md: 'Markdown',
  rust: 'Rust',
  shell: 'Shell',
  sh: 'Shell',
  sql: 'SQL',
  swift: 'Swift',
  text: 'Plain text',
  ts: 'TypeScript',
  tsx: 'TSX',
  typescript: 'TypeScript',
  yaml: 'YAML',
  yml: 'YAML',
}

const WINDOW_CONTROLS = ['close', 'minimize', 'zoom'] as const

type CodeWindowProps = ComponentPropsWithoutRef<'pre'> & {
  'data-language'?: string
}

export default function CodeWindow({
  children,
  ...properties
}: CodeWindowProps) {
  const language = properties['data-language'] ?? 'text'
  const languageLabel = LANGUAGE_LABELS[language] ?? language.toUpperCase()

  return (
    <figure className="code-window">
      <figcaption className="code-window-toolbar" data-pagefind-ignore="">
        <span className="code-window-controls" aria-hidden>
          {WINDOW_CONTROLS.map((control) => (
            <Circle
              key={control}
              className={`code-window-control code-window-control-${control}`}
              size={12}
              weight="fill"
            />
          ))}
        </span>
        <span className="code-window-title">{languageLabel}</span>
        <span className="code-window-kind">Code</span>
      </figcaption>
      <pre {...properties}>{children}</pre>
    </figure>
  )
}
