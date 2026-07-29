import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Database,
  Play,
  ShieldCheck,
  WarningCircle,
  XCircle,
} from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { useShikiHighlight } from '../useShikiHighlight'
import './pgstrict-blocks.css'

function SqlEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const lines = useShikiHighlight(value, 'sql')
  const preRef = useRef<HTMLPreElement>(null)

  function syncScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop
      preRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  return (
    <div className="pgs-sql-editor">
      {/* Highlighted backdrop — pointer-events:none so the textarea stays interactive */}
      <pre ref={preRef} aria-hidden="true">
        <code className="shiki-code">
          {lines
            ? lines.map((line, li) => (
                <span key={li} className="line">
                  {line.map((tok, ti) => (
                    <span key={ti} style={tok.style as React.CSSProperties}>
                      {tok.content}
                    </span>
                  ))}
                  {'\n'}
                </span>
              ))
            : value}
        </code>
      </pre>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        spellCheck={false}
        rows={7}
        aria-label="SQL query"
      />
    </div>
  )
}

// ─── SQL analyzer ─────────────────────────────────────────────────────────────
// Mirrors what post_parse_analyze_hook reads from the analyzed Query tree.
// Simplified demo — real extension reads jointree→quals directly.

type CmdType = 'UPDATE' | 'DELETE' | 'OTHER'
type StrictMode = 'off' | 'warn' | 'on'
type CheckResult = 'pass' | 'warn' | 'block'

function parseSqlCommand(sql: string): { cmd: CmdType; hasWhere: boolean } {
  const clean = sql
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const upper = clean.toUpperCase()

  // Skip past CTEs (WITH … AS (…)) to find the main DML statement
  let mainUpper = upper
  if (/^WITH\s/.test(upper)) {
    let depth = 0
    for (let i = 0; i < upper.length; i++) {
      if (upper[i] === '(') depth++
      else if (upper[i] === ')') depth--
      else if (depth === 0) {
        const rest = upper.slice(i)
        if (/^UPDATE\s/.test(rest) || /^DELETE\s/.test(rest)) {
          mainUpper = rest
          break
        }
      }
    }
  }

  const isUpdate = /^UPDATE\s/.test(mainUpper)
  const isDelete = /^DELETE\s/.test(mainUpper)
  if (!isUpdate && !isDelete) return { cmd: 'OTHER', hasWhere: true }
  const cmd: CmdType = isUpdate ? 'UPDATE' : 'DELETE'

  // Scan for WHERE at depth 0 (not inside subqueries / function calls)
  let depth = 0
  for (let i = 0; i < mainUpper.length; i++) {
    if (mainUpper[i] === '(') {
      depth++
      continue
    }
    if (mainUpper[i] === ')') {
      depth--
      continue
    }
    if (depth === 0 && /^WHERE\s/.test(mainUpper.slice(i))) {
      return { cmd, hasWhere: true }
    }
  }
  return { cmd, hasWhere: false }
}

function evaluate(
  cmd: CmdType,
  hasWhere: boolean,
  updateMode: StrictMode,
  deleteMode: StrictMode,
): { result: CheckResult; message: string } {
  if (cmd === 'OTHER') {
    return {
      result: 'pass',
      message: 'Not an UPDATE or DELETE — pg_strict passes it through.',
    }
  }
  if (hasWhere) {
    return {
      result: 'pass',
      message: `${cmd} has a top-level WHERE clause — pg_strict allows it.`,
    }
  }
  const mode = cmd === 'UPDATE' ? updateMode : deleteMode
  const guc = `pg_strict.require_where_on_${cmd.toLowerCase()}`
  if (mode === 'off')
    return {
      result: 'pass',
      message: `${guc} = 'off' — missing WHERE is allowed.`,
    }
  if (mode === 'warn')
    return {
      result: 'warn',
      message: `WARNING:  pg_strict: ${cmd} without a WHERE clause`,
    }
  return {
    result: 'block',
    message: `ERROR:  pg_strict: ${cmd} without a WHERE clause`,
  }
}

// ─── Presets ──────────────────────────────────────────────────────────────────

const PRESETS: { label: string; sql: string }[] = [
  {
    label: 'UPDATE (no WHERE)',
    sql: "UPDATE users SET status = 'inactive';",
  },
  {
    label: 'UPDATE (with WHERE)',
    sql: "UPDATE users SET status = 'inactive'\nWHERE last_login < now() - interval '180 days';",
  },
  {
    label: 'DELETE (no WHERE)',
    sql: 'DELETE FROM sessions;',
  },
  {
    label: 'DELETE (with WHERE)',
    sql: 'DELETE FROM sessions WHERE expires_at < now();',
  },
  {
    label: 'CTE — WHERE only in CTE',
    sql: "WITH old_users AS (\n  SELECT id FROM users WHERE last_login < '2024-01-01'\n)\nUPDATE users SET status = 'inactive';",
  },
  {
    label: 'CTE — WHERE on UPDATE',
    sql: "WITH old_users AS (\n  SELECT id FROM users WHERE last_login < '2024-01-01'\n)\nUPDATE users SET status = 'inactive'\nWHERE id IN (SELECT id FROM old_users);",
  },
]

// ─── Mode toggle ──────────────────────────────────────────────────────────────

function ModeToggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: StrictMode
  onChange: (m: StrictMode) => void
}) {
  return (
    <div className="pgs-mode-row">
      <code className="pgs-guc-key">{label}</code>
      <div className="pgs-mode-toggle" role="group" aria-label={label}>
        {(['off', 'warn', 'on'] as StrictMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={[
              value === m ? 'is-active' : '',
              value === m ? `pgs-mode-active-${m}` : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(m)}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── PgStrictPlayground ───────────────────────────────────────────────────────

export function PgStrictPlayground() {
  const [sql, setSql] = useState(PRESETS[0].sql)
  const [updateMode, setUpdateMode] = useState<StrictMode>('on')
  const [deleteMode, setDeleteMode] = useState<StrictMode>('on')
  const [executed, setExecuted] = useState(() => ({
    sql: PRESETS[0].sql,
    updateMode: 'on' as StrictMode,
    deleteMode: 'on' as StrictMode,
  }))

  const { cmd, hasWhere } = parseSqlCommand(executed.sql)
  const { result, message } = evaluate(
    cmd,
    hasWhere,
    executed.updateMode,
    executed.deleteMode,
  )
  const dirty =
    sql !== executed.sql ||
    updateMode !== executed.updateMode ||
    deleteMode !== executed.deleteMode
  const ResultIcon =
    result === 'pass'
      ? CheckCircle
      : result === 'warn'
        ? WarningCircle
        : XCircle
  const resultLabel =
    result === 'pass' ? 'Allowed' : result === 'warn' ? 'Warning' : 'Blocked'
  const pipeline = ['Parser', 'Analyzer', 'Planner', 'Executor']
  const stopAt = result === 'block' ? 1 : pipeline.length - 1

  return (
    <section
      className="pgs-playground not-typography"
      aria-label="pg_strict Playground"
    >
      <header className="pgs-heading">
        <div>
          <span className="pgs-kicker">SQL safety workbench</span>
          <h3 className="pgs-section-title">
            See exactly where an unsafe query stops.
          </h3>
          <p className="pgs-desc">
            Choose a query, tune enforcement, then run it through the same
            semantic check used by <code>post_parse_analyze_hook</code>.
          </p>
        </div>
        <div className={`pgs-header-status pgs-header-status-${result}`}>
          <ResultIcon aria-hidden="true" weight="fill" />
          {resultLabel}
        </div>
      </header>

      <div className="pgs-presets" role="group" aria-label="Preset queries">
        <span className="pgs-presets-label">Query presets</span>
        <div className="pgs-presets-buttons">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={sql === p.sql ? 'is-active' : ''}
              onClick={() => setSql(p.sql)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pgs-workbench">
        <div className="pgs-editor-panel">
          <div className="pgs-panel-header">
            <span>SQL editor</span>
            {dirty ? <span>Changes ready to run</span> : <span>Executed</span>}
          </div>
          <SqlEditor value={sql} onChange={setSql} />
        </div>

        <div className="pgs-config-panel">
          <div className="pgs-panel-header">
            <span>Enforcement</span>
            <ShieldCheck aria-hidden="true" weight="duotone" />
          </div>
          <div className="pgs-config-body">
            <ModeToggle
              label="require_where_on_update"
              value={updateMode}
              onChange={setUpdateMode}
            />
            <ModeToggle
              label="require_where_on_delete"
              value={deleteMode}
              onChange={setDeleteMode}
            />
            <button
              type="button"
              className="pgs-run-button"
              onClick={() => setExecuted({ sql, updateMode, deleteMode })}
            >
              <Play aria-hidden="true" weight="fill" />
              Run query
            </button>
          </div>
        </div>
      </div>

      <div className={`pgs-execution pgs-result-${result}`} aria-live="polite">
        <div
          className="pgs-execution-track"
          aria-label={`Query ${resultLabel.toLowerCase()} at ${pipeline[stopAt]}`}
        >
          <div className="pgs-query-origin">
            <Database aria-hidden="true" weight="duotone" />
            Query
          </div>
          {pipeline.map((phase, index) => {
            const isStopped = result === 'block' && index === stopAt
            const isReached = index <= stopAt
            return (
              <div
                key={phase}
                className={`pgs-execution-phase${isReached ? ' is-reached' : ''}${isStopped ? ' is-stopped' : ''}`}
              >
                <ArrowRight aria-hidden="true" className="pgs-phase-arrow" />
                <span>
                  {isStopped ? (
                    <XCircle aria-hidden="true" weight="fill" />
                  ) : isReached ? (
                    <CheckCircle aria-hidden="true" weight="fill" />
                  ) : null}
                  {phase}
                </span>
              </div>
            )
          })}
        </div>
        <div className="pgs-result-content">
          <ResultIcon aria-hidden="true" weight="fill" />
          <div>
            <span className="pgs-result-badge">{resultLabel}</span>
            <p className="pgs-result-message">{message}</p>
          </div>
          {cmd !== 'OTHER' ? (
            <dl className="pgs-result-details">
              <div>
                <dt>commandType</dt>
                <dd>{cmd}</dd>
              </div>
              <div>
                <dt>jointree→quals</dt>
                <dd className={hasWhere ? 'pgs-val-ok' : 'pgs-val-null'}>
                  {hasWhere ? 'not null' : 'null'}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>

      <p className="pgs-footnote">
        A WHERE inside a CTE does not satisfy the top-level{' '}
        <code>jointree→quals</code> check. Only a WHERE on the UPDATE or DELETE
        itself counts.
      </p>
    </section>
  )
}

// ─── Hook Phase Explorer ──────────────────────────────────────────────────────

const PIPELINE_NODES = [
  { id: 'sql', label: 'SQL', terminal: true },
  { id: 'parser', label: 'Parser', terminal: false },
  { id: 'analyzer', label: 'Analyzer', terminal: false },
  { id: 'planner', label: 'Planner', terminal: false },
  { id: 'executor', label: 'Executor', terminal: false },
  { id: 'results', label: 'Results', terminal: true },
]

type StageStatus = 'flawed' | 'abandoned' | 'slow' | 'correct'

const STAGES: {
  id: number
  label: string
  hook: string
  hookPhase: string
  approach: string
  status: StageStatus
  summary: string
}[] = [
  {
    id: 0,
    label: 'Stage 0',
    hook: 'ExecutorRun_hook',
    hookPhase: 'executor',
    approach: 'String matching',
    status: 'flawed',
    summary:
      'Hooks at execution time and looks for the word WHERE in the raw SQL string. Fooled by CTEs, comments, and subquery WHERE clauses. A WHERE in the wrong place passes the check.',
  },
  {
    id: 1,
    label: 'Stage 1',
    hook: 'ExecutorRun_hook',
    hookPhase: 'executor',
    approach: 'Tree-sitter',
    status: 'abandoned',
    summary:
      'Tried embedding tree-sitter inside the Postgres extension. Build scripts and dynamic linker issues inside the shared-library environment made it impractical. Abandoned quickly.',
  },
  {
    id: 2,
    label: 'Stage 2',
    hook: 'ExecutorRun_hook',
    hookPhase: 'executor',
    approach: 'sqlparser crate',
    status: 'flawed',
    summary:
      'sqlparser is not Postgres. Complex UPDATE…FROM constructs and Postgres-specific casting syntax caused false parse errors. Also double-parses every query — once by Postgres, once by Rust.',
  },
  {
    id: 3,
    label: 'Stage 3',
    hook: 'ExecutorRun_hook',
    hookPhase: 'executor',
    approach: 'pg_parse_query (C)',
    status: 'slow',
    summary:
      "Uses Postgres' own C parser — finally correct. But hooks at execution time, so it re-parses SQL that Postgres already parsed moments before. Correct logic, wasted CPU.",
  },
  {
    id: 4,
    label: 'Stage 4',
    hook: 'post_parse_analyze_hook',
    hookPhase: 'analyzer',
    approach: 'Query tree (jointree→quals)',
    status: 'correct',
    summary:
      "Fires right after Postgres builds the full semantic Query tree — before the planner runs. Zero parsing overhead: just reads jointree→quals, a pointer that's already in memory. Fully correct and efficient.",
  },
]

const STATUS_LABELS: Record<StageStatus, string> = {
  correct: 'Best approach',
  slow: 'Correct, inefficient',
  flawed: 'Flawed',
  abandoned: 'Abandoned',
}

export function HookPhaseExplorer() {
  const [active, setActive] = useState(4)
  const stage = STAGES[active]

  return (
    <section
      className="pgs-hook-explorer not-typography"
      aria-label="Hook Phase Explorer"
    >
      <header className="pgs-heading">
        <div>
          <span className="pgs-kicker">Implementation history</span>
          <h3 className="pgs-section-title">
            Move the hook until the design becomes correct.
          </h3>
          <p className="pgs-desc">
            Step through five approaches to see what each one could observe,
            where it ran, and why the final analyzer hook wins.
          </p>
        </div>
        <span className="pgs-stage-progress">
          {String(active + 1).padStart(2, '0')} /{' '}
          {String(STAGES.length).padStart(2, '0')}
        </span>
      </header>

      <div
        className="pgs-stage-tabs"
        role="group"
        aria-label="Evolution stages"
      >
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={active === s.id}
            className={[
              'pgs-stage-tab',
              `pgs-tab-${s.status}`,
              active === s.id ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActive(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        className="pgs-pipeline"
        role="img"
        aria-label={`Hook fires at: ${stage.hookPhase}`}
      >
        {PIPELINE_NODES.map((node, i) => (
          <div key={node.id} className="pgs-pipeline-segment">
            <div
              className={[
                'pgs-pipeline-node',
                node.terminal ? 'pgs-node-terminal' : '',
                stage.hookPhase === node.id
                  ? `pgs-node-hooked pgs-node-hooked-${stage.status}`
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span>{node.label}</span>
              {stage.hookPhase === node.id && (
                <span className={`pgs-hook-badge pgs-badge-${stage.status}`}>
                  Hook
                </span>
              )}
            </div>
            {i < PIPELINE_NODES.length - 1 && (
              <ArrowRight className="pgs-pipeline-arrow" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <div className={`pgs-stage-card pgs-card-${stage.status}`}>
        <div className="pgs-stage-card-header">
          <div>
            <span className="pgs-stage-card-label">{stage.label}</span>
            <span className="pgs-stage-card-approach">{stage.approach}</span>
          </div>
          <span className={`pgs-status-badge pgs-badge-${stage.status}`}>
            {STATUS_LABELS[stage.status]}
          </span>
        </div>
        <div className="pgs-stage-meta">
          <span className="pgs-meta-item">
            Hook: <code>{stage.hook}</code>
          </span>
        </div>
        <p className="pgs-stage-summary">{stage.summary}</p>
        <div
          className="pgs-stage-nav"
          role="group"
          aria-label="Stage navigation"
        >
          <button
            type="button"
            disabled={active === 0}
            onClick={() => setActive((value) => Math.max(0, value - 1))}
          >
            <ArrowLeft aria-hidden="true" />
            Previous
          </button>
          <button
            type="button"
            disabled={active === STAGES.length - 1}
            onClick={() =>
              setActive((value) => Math.min(STAGES.length - 1, value + 1))
            }
          >
            Next
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
