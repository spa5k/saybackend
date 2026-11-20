import { useRef, useState } from "react";
import { useShikiHighlight } from "../useShikiHighlight";
import "./pgstrict-blocks.css";

function SqlEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const lines = useShikiHighlight(value, "sql");
  const preRef = useRef<HTMLPreElement>(null);

  function syncScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
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
                  {"\n"}
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
  );
}

// ─── SQL analyzer ─────────────────────────────────────────────────────────────
// Mirrors what post_parse_analyze_hook reads from the analyzed Query tree.
// Simplified demo — real extension reads jointree→quals directly.

type CmdType = "UPDATE" | "DELETE" | "OTHER";
type StrictMode = "off" | "warn" | "on";
type CheckResult = "pass" | "warn" | "block";

function parseSqlCommand(sql: string): { cmd: CmdType; hasWhere: boolean } {
  const clean = sql
    .replace(/--[^\n]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const upper = clean.toUpperCase();

  // Skip past CTEs (WITH … AS (…)) to find the main DML statement
  let mainUpper = upper;
  if (/^WITH\s/.test(upper)) {
    let depth = 0;
    for (let i = 0; i < upper.length; i++) {
      if (upper[i] === "(") depth++;
      else if (upper[i] === ")") depth--;
      else if (depth === 0) {
        const rest = upper.slice(i);
        if (/^UPDATE\s/.test(rest) || /^DELETE\s/.test(rest)) {
          mainUpper = rest;
          break;
        }
      }
    }
  }

  const isUpdate = /^UPDATE\s/.test(mainUpper);
  const isDelete = /^DELETE\s/.test(mainUpper);
  if (!isUpdate && !isDelete) return { cmd: "OTHER", hasWhere: true };
  const cmd: CmdType = isUpdate ? "UPDATE" : "DELETE";

  // Scan for WHERE at depth 0 (not inside subqueries / function calls)
  let depth = 0;
  for (let i = 0; i < mainUpper.length; i++) {
    if (mainUpper[i] === "(") {
      depth++;
      continue;
    }
    if (mainUpper[i] === ")") {
      depth--;
      continue;
    }
    if (depth === 0 && /^WHERE\s/.test(mainUpper.slice(i))) {
      return { cmd, hasWhere: true };
    }
  }
  return { cmd, hasWhere: false };
}

function evaluate(
  cmd: CmdType,
  hasWhere: boolean,
  updateMode: StrictMode,
  deleteMode: StrictMode,
): { result: CheckResult; message: string } {
  if (cmd === "OTHER") {
    return {
      result: "pass",
      message: "Not an UPDATE or DELETE — pg_strict passes it through.",
    };
  }
  if (hasWhere) {
    return {
      result: "pass",
      message: `${cmd} has a top-level WHERE clause — pg_strict allows it.`,
    };
  }
  const mode = cmd === "UPDATE" ? updateMode : deleteMode;
  const guc = `pg_strict.require_where_on_${cmd.toLowerCase()}`;
  if (mode === "off")
    return {
      result: "pass",
      message: `${guc} = 'off' — missing WHERE is allowed.`,
    };
  if (mode === "warn")
    return {
      result: "warn",
      message: `WARNING:  pg_strict: ${cmd} without a WHERE clause`,
    };
  return {
    result: "block",
    message: `ERROR:  pg_strict: ${cmd} without a WHERE clause`,
  };
}

// ─── Presets ──────────────────────────────────────────────────────────────────

const PRESETS: { label: string; sql: string }[] = [
  {
    label: "UPDATE (no WHERE)",
    sql: "UPDATE users SET status = 'inactive';",
  },
  {
    label: "UPDATE (with WHERE)",
    sql: "UPDATE users SET status = 'inactive'\nWHERE last_login < now() - interval '180 days';",
  },
  {
    label: "DELETE (no WHERE)",
    sql: "DELETE FROM sessions;",
  },
  {
    label: "DELETE (with WHERE)",
    sql: "DELETE FROM sessions WHERE expires_at < now();",
  },
  {
    label: "CTE — WHERE only in CTE",
    sql: "WITH old_users AS (\n  SELECT id FROM users WHERE last_login < '2024-01-01'\n)\nUPDATE users SET status = 'inactive';",
  },
  {
    label: "CTE — WHERE on UPDATE",
    sql: "WITH old_users AS (\n  SELECT id FROM users WHERE last_login < '2024-01-01'\n)\nUPDATE users SET status = 'inactive'\nWHERE id IN (SELECT id FROM old_users);",
  },
];

// ─── Mode toggle ──────────────────────────────────────────────────────────────

function ModeToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: StrictMode;
  onChange: (m: StrictMode) => void;
}) {
  return (
    <div className="pgs-mode-row">
      <code className="pgs-guc-key">{label}</code>
      <div className="pgs-mode-toggle" role="group" aria-label={label}>
        {(["off", "warn", "on"] as StrictMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={[
              value === m ? "is-active" : "",
              value === m ? `pgs-mode-active-${m}` : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(m)}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PgStrictPlayground ───────────────────────────────────────────────────────

export function PgStrictPlayground() {
  const [sql, setSql] = useState(PRESETS[0].sql);
  const [updateMode, setUpdateMode] = useState<StrictMode>("on");
  const [deleteMode, setDeleteMode] = useState<StrictMode>("on");

  const { cmd, hasWhere } = parseSqlCommand(sql);
  const { result, message } = evaluate(cmd, hasWhere, updateMode, deleteMode);

  return (
    <section
      className="paper-widget pgs-playground not-typography"
      aria-label="pg_strict Playground"
    >
      <h3>pg_strict Playground</h3>
      <p>
        Configure the extension and try your own SQL. The check mirrors what{" "}
        <code>post_parse_analyze_hook</code> reads from the query tree —
        including CTE edge cases.
      </p>

      <div className="pgs-presets" role="group" aria-label="Preset queries">
        <span className="pgs-presets-label">Presets</span>
        <div className="pgs-presets-buttons">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={sql === p.sql ? "is-active" : ""}
              onClick={() => setSql(p.sql)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pgs-panels">
        {/* SQL editor */}
        <div className="pgs-editor-panel">
          <div className="pgs-panel-header">SQL</div>
          <SqlEditor value={sql} onChange={setSql} />
        </div>

        {/* Config + result */}
        <div className="pgs-config-panel">
          <div className="pgs-panel-header">Configuration</div>
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
          </div>

          <div className={`pgs-result pgs-result-${result}`}>
            <div className="pgs-result-badge">
              {result === "pass" && "✓ PASS"}
              {result === "warn" && "⚠ WARN"}
              {result === "block" && "✗ BLOCKED"}
            </div>
            <p className="pgs-result-message">{message}</p>
            {cmd !== "OTHER" && (
              <div className="pgs-result-details">
                <span>
                  <span className="pgs-detail-key">commandType</span>{" "}
                  <span className="pgs-detail-val">{cmd}</span>
                </span>
                <span>
                  <span className="pgs-detail-key">jointree→quals</span>{" "}
                  <span
                    className={`pgs-detail-val ${hasWhere ? "pgs-val-ok" : "pgs-val-null"}`}
                  >
                    {hasWhere ? "not null ✓" : "null"}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="pgs-footnote">
        WHERE inside a CTE does not satisfy the top-level{" "}
        <code>jointree→quals</code> check — only a WHERE on the UPDATE/DELETE
        itself counts.
      </p>
    </section>
  );
}
