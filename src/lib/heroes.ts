import { markOf } from './marks'
import type { Post } from './content'
import type { MotifSpec } from '@/components/paper/Motifs'

/** The drawing at the top of each post, by post directory name. */
const heroes: Partial<Record<string, MotifSpec>> = {
  '07-uuidv7-postgres': { name: 'bits' },
  '10-recreating-planetscale-pg-strict-in-rust': { name: 'pipeline' },
  '2023-dec-zustand-url-state-sharing': {
    name: 'bands',
    labels: ['app.dev/?sort=new&tag=go&page=2'],
  },
  '2024-aug-nextjs-electron-server-components': { name: 'stream' },
  '2024-jun-golang-dockerfile-optimized': { name: 'layers' },
  '2024-sep-nextjs-deploy-any-server': { name: 'shrink' },
  '2025-feb-text-chunking-rag-systems': { name: 'bands' },
  '2025-jan-kafka-docker-kraft-mode': { name: 'quorum' },
  '2026-aug-happycontext-performance': { name: 'bars' },
  '2026-aug-lint-ai-generated-code': { name: 'ranks' },
  '2026-aug-prompt-caching-agent-harnesses': { name: 'blocks' },
  '2026-feb-happycontext-wide-logging': { name: 'lanes' },
  '2026-feb-happymode-macos-appearance-scheduler': { name: 'day' },
  '2026-jun-conductor-claude-code-cliproxyapi': { name: 'merge' },
  '2026-may-cliproxyapi-factory-byok': { name: 'split' },
  '2026-oct-faster-github-actions': { name: 'lanes' },
  '2026-dec-postgresql-19-backend-engineers': { name: 'repack' },
  '2026-dec-self-host-nextjs-16': { name: 'folder' },
  '2026-dec-cliproxyapi-setup-fixes': { name: 'route' },
  '2026-dec-golang-dockerfile-best-practices': { name: 'layers' },
  '2026-dec-uuidv7-postgres-functions-size': { name: 'bits' },
  '2026-nov-code-mode-explained': { name: 'sandbox', accent: 0 },
  '2026-nov-code-mode-pi': { name: 'sandbox', accent: 1 },
  '2026-nov-code-mode-claude-code': { name: 'sandbox', accent: 2 },
  '2026-dec-code-mode-opencode': { name: 'sandbox', accent: 3 },
  '2026-dec-code-mode-compared': { name: 'sandbox', accent: 4 },
  '2026-dec-vllm-fallback-detokenizer': { name: 'window' },
  '2026-dec-nvidia-dynamo-code-audit': { name: 'order' },
  '2026-nov-lint-ratchet': { name: 'ratchet' },
  '2026-nov-agents-prove-changes': { name: 'tiers' },
  '2026-nov-ai-review-agents': { name: 'kept' },
  '2026-dec-github-actions-minutes': { name: 'minutes' },
  '2026-dec-rust-target-disk-space': { name: 'store', accent: 0 },
  '2026-dec-rust-mbx-worktrees': { name: 'store', accent: 1 },
  '2026-dec-git-twig-cow-worktrees': { name: 'store', accent: 2 },
  '2026-dec-faster-rust-dev-builds': { name: 'store', accent: 3 },
  '2026-dec-dockerize-rust-service': { name: 'store', accent: 4 },
  '2026-nov-solid-2-async-reactive-graph': { name: 'graph', accent: 0 },
  '2026-dec-migrate-solidstart-solid-2': { name: 'graph', accent: 1 },
  '2026-dec-solidstart-maintenance-options': { name: 'graph', accent: 2 },
  '2026-dec-self-host-tanstack-start': { name: 'graph', accent: 3 },
  '2026-dec-tanstack-start-server-functions': { name: 'graph', accent: 4 },
  '2026-dec-solid-start-mode-vs-tanstack-start': { name: 'graph', accent: 5 },
  '2026-dec-blog-on-tanstack-start': { name: 'graph', accent: 6 },
}

const byMark: Partial<Record<string, MotifSpec>> = {
  Go: { name: 'lanes' },
  Postgres: { name: 'bits' },
  Agents: { name: 'blocks' },
  Web: { name: 'bands', labels: ['<App />'] },
}

/** A post without its own drawing gets the drawing of its topic. */
export function heroOf(post: Pick<Post, 'id' | 'tags'>): MotifSpec {
  return heroes[post.id] ?? byMark[markOf(post).name] ?? { name: 'squares' }
}
