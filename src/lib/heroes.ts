import { markOf } from './marks'
import type { Post } from './content'
import type { MotifSpec } from '@/components/paper/Motifs'

/** The drawing at the top of each post, by post directory name. */
const heroes: Partial<Record<string, MotifSpec>> = {
  '07-uuidv7-postgres': { name: 'bits' },
  '08-kubernetes-cluster-journey': {
    name: 'chain',
    labels: ['k3s', 'RKE2', 'Cilium'],
  },
  '09-nextjs-self-hosted-production': {
    name: 'chain',
    labels: ['build', 'deploy', 'observe'],
  },
  '10-recreating-planetscale-pg-strict-in-rust': { name: 'pipeline' },
  '2023-dec-zustand-url-state-sharing': {
    name: 'bands',
    labels: ['app.dev/?sort=new&tag=go&page=2'],
  },
  '2024-aug-nextjs-electron-server-components': {
    name: 'chain',
    labels: ['Next.js', 'Electron', 'Server Components'],
  },
  '2024-jun-golang-dockerfile-optimized': { name: 'layers' },
  '2024-sep-nextjs-deploy-any-server': {
    name: 'chain',
    labels: ['next build', 'standalone', 'any server'],
  },
  '2025-feb-text-chunking-rag-systems': { name: 'bands' },
  '2025-jan-kafka-docker-kraft-mode': {
    name: 'chain',
    labels: ['controllers', 'brokers', 'your laptop'],
  },
  '2026-aug-happycontext-performance': { name: 'bars' },
  '2026-aug-lint-ai-generated-code': { name: 'ranks' },
  '2026-aug-prompt-caching-agent-harnesses': { name: 'blocks' },
  '2026-feb-happycontext-wide-logging': { name: 'lanes' },
  '2026-feb-happymode-macos-appearance-scheduler': { name: 'day' },
  '2026-jun-conductor-claude-code-cliproxyapi': {
    name: 'chain',
    labels: ['Conductor', 'Claude Code', 'CLIProxyAPI', 'Codex'],
  },
  '2026-may-cliproxyapi-factory-byok': {
    name: 'chain',
    labels: ['Factory Droid', 'CLIProxyAPI', 'your models'],
  },
  '2026-oct-faster-github-actions': { name: 'lanes' },
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
