import { useLayoutEffect, useRef, useState } from "react";

import "./happycontext-blocks.css";
import { useShikiHighlight } from "../useShikiHighlight";

function GoCode({ code }: { code: string }) {
  const lines = useShikiHighlight(code, "go");
  if (!lines) return <pre><code>{code}</code></pre>;
  return (
    <pre>
      <code className="shiki-code">
        {lines.map((line, li) => (
          <span key={li} className="line">
            {line.map((tok, ti) => (
              <span key={ti} style={tok.style as React.CSSProperties}>
                {tok.content}
              </span>
            ))}
            {li < lines.length - 1 ? "\n" : null}
          </span>
        ))}
      </code>
    </pre>
  );
}

const traditionalLogging = `logger.Info(ctx, "Request started")
logger.Info(ctx, "user authenticated", "user_id", userID)
logger.Info(ctx, "fetching cart", "cart_id", cartID)
logger.Info(ctx, "processing payment")
logger.Info(ctx, "payment successful")
logger.Info(ctx, "request completed")`;

const wideEventCode = `// server/api/checkout.post.ts
func checkout(w http.ResponseWriter, r *http.Request) {
  hc.Add(r.Context(), "user_id", "u_8472", "feature", "checkout")
  hc.Add(r.Context(), "cart_id", "c_42", "items", 3, "total_cents", 9999)
  hc.Add(r.Context(), "payment_method", "card", "payment_status", "success")

  w.WriteHeader(http.StatusOK)
}`;

const wideEventOutput = `[INFO] POST /api/checkout (234ms)
  user_id: "u_8472"
  cart_id: "c_42"
  items: 3
  total_cents: 9999
  payment_method: "card"
  payment_status: "success"
  status: 200`;

const lifecycleSteps = [
  {
    title: "Start",
    detail: "Middleware captures method, path, route, and a request timestamp.",
  },
  {
    title: "Enrich",
    detail:
      "Handlers add user, tenant, feature, and domain payload as context arrives.",
  },
  {
    title: "Finalize",
    detail:
      "Status, duration, and error fields are computed once the request is done.",
  },
  {
    title: "Emit",
    detail: "The adapter writes one canonical event to slog, zap, or zerolog.",
  },
];

const wideEventCards = [
  {
    title: "One Event",
    description:
      "Replace noisy middleware and handler logs with one request-scoped payload.",
  },
  {
    title: "Full Context",
    description:
      "Capture HTTP details, user metadata, and business data in one searchable record.",
  },
  {
    title: "Router Scoped",
    description:
      "Add fields as the request travels through net/http, gin, echo, or fiber.",
  },
  {
    title: "Adapter Friendly",
    description:
      "Keep your existing logger stack and switch only the sink integration.",
  },
];

export function HappyContextHero() {
  return (
    <section
      className="hcw-panel hcw-hero not-typography"
      aria-label="happycontext summary"
    >
      <div className="hcw-kicker">Wide Logging for Go Services</div>
      <h2 className="hcw-title">One canonical event per request.</h2>
      <p className="hcw-body">
        Built for Go services: gather context through middleware and handlers,
        then emit one structured request event through your existing logger.
      </p>
      <div className="hcw-metric-grid">
        <div>
          <span className="hcw-metric-value">5</span>
          <span className="hcw-metric-label">router integrations</span>
        </div>
        <div>
          <span className="hcw-metric-value">3</span>
          <span className="hcw-metric-label">logger adapters</span>
        </div>
        <div>
          <span className="hcw-metric-value">15</span>
          <span className="hcw-metric-label">interop combinations</span>
        </div>
      </div>
    </section>
  );
}

export function WideEventValueCards() {
  return (
    <section
      className="hcw-card-grid not-typography"
      aria-label="wide event benefits"
    >
      {wideEventCards.map((card) => (
        <article key={card.title} className="hcw-card">
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </article>
      ))}
    </section>
  );
}

export function WideEventsBeforeAfter() {
  const [activeView, setActiveView] = useState<"code" | "output">("code");

  return (
    <section
      className="hcw-compare not-typography"
      aria-label="Traditional logging versus wide events"
    >
      <article className="hcw-compare-panel">
        <header>
          <p>Traditional logging</p>
        </header>
        <GoCode code={traditionalLogging} />
      </article>

      <article className="hcw-compare-panel hcw-compare-panel-highlighted">
        <header>
          <p>Wide Event (Go)</p>
          <div
            className="hcw-tab-row"
            role="tablist"
            aria-label="Wide event view toggle"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "code"}
              className={activeView === "code" ? "is-active" : ""}
              onClick={() => setActiveView("code")}
            >
              Code
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "output"}
              className={activeView === "output" ? "is-active" : ""}
              onClick={() => setActiveView("output")}
            >
              Output
            </button>
          </div>
        </header>

        {activeView === "code" ? (
          <GoCode code={wideEventCode} />
        ) : (
          <pre><code>{wideEventOutput}</code></pre>
        )}
        <p className="hcw-panel-note">
          One log, all context, emitted once at request completion.
        </p>
      </article>
    </section>
  );
}

export function IntegrationsMatrix() {
  return (
    <section
      className="hcw-panel not-typography"
      aria-label="Integrations and adapters matrix"
    >
      <h3 className="hcw-section-title">Router + Adapter Matrix</h3>
      <div className="hcw-integration-grid">
        <div>
          <p className="hcw-column-title">Router integrations</p>
          <ul>
            <li>integration/std (net/http)</li>
            <li>integration/gin</li>
            <li>integration/echo</li>
            <li>integration/fiber (v2)</li>
            <li>integration/fiberv3 (v3)</li>
          </ul>
        </div>

        <div className="hcw-multiply" aria-hidden="true">
          x
        </div>

        <div>
          <p className="hcw-column-title">Logger adapters</p>
          <ul>
            <li>adapter/slog</li>
            <li>adapter/zap</li>
            <li>adapter/zerolog</li>
          </ul>
        </div>
      </div>
      <p className="hcw-panel-note">
        15 combinations without rewriting domain handlers.
      </p>
    </section>
  );
}

export function RequestLifecycleRail() {
  return (
    <section
      className="hcw-lifecycle not-typography"
      aria-label="Request lifecycle"
    >
      {lifecycleSteps.map((step, index) => (
        <article key={step.title} className="hcw-lifecycle-step">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h3>{step.title}</h3>
          <p>{step.detail}</p>
        </article>
      ))}
    </section>
  );
}

export function SamplingDecisionPanel() {
  return (
    <section
      className="hcw-panel not-typography"
      aria-label="Sampling behavior"
    >
      <h3 className="hcw-section-title">Tail Sampling Rules</h3>
      <div className="hcw-sampling-grid">
        <article>
          <h4>Always keep</h4>
          <ul>
            <li>5xx status or panic</li>
            <li>error field is present</li>
            <li>/admin and /checkout paths</li>
            <li>slow requests above threshold</li>
          </ul>
        </article>
        <article>
          <h4>Sample healthy traffic</h4>
          <ul>
            <li>Apply base rate to successful requests</li>
            <li>Use per-level overrides when needed</li>
            <li>Keep events query-friendly and compact</li>
            <li>Tune rates after dashboard validation</li>
          </ul>
        </article>
      </div>
      <p className="hcw-panel-note">
        Keep incidents at 100%, control cost on happy-path traffic.
      </p>
    </section>
  );
}

// --- Wide Event Builder Simulator (happycontext Go API) ---

const WIDE_BUILDER_STEPS: Array<{
  title: string;
  description: string;
  code: string;
  event: Record<string, unknown>;
}> = [
  {
    title: "Middleware captures request",
    description:
      "happycontext middleware records method, path, route, and start time.",
    code: `mw := stdhc.Middleware(hc.Config{
  Sink:         sink,
  SamplingRate: 1.0,
  Message:      "request_completed",
})`,
    event: {
      time: "2026-02-09T14:03:12.451Z",
      level: "INFO",
      msg: "request_completed",
      "http.method": "GET",
      "http.path": "/orders/123",
      "http.route": "GET /orders/{id}",
    },
  },
  {
    title: "Add user and feature context",
    description:
      "hc.Add accepts key/value pairs; fields are merged into the final event.",
    code: `hc.Add(ctx, "user_id", "u_8472", "feature", "checkout")`,
    event: {
      time: "2026-02-09T14:03:12.451Z",
      level: "INFO",
      msg: "request_completed",
      "http.method": "GET",
      "http.path": "/orders/123",
      "http.route": "GET /orders/{id}",
      user_id: "u_8472",
      feature: "checkout",
    },
  },
  {
    title: "Add cart and order context",
    description: "Add more keys as you process the request.",
    code: `hc.Add(ctx, "order_id", "ord_xyz", "total_cents", 15999)
hc.Add(ctx, "coupon_applied", "SAVE20")`,
    event: {
      time: "2026-02-09T14:03:12.451Z",
      level: "INFO",
      msg: "request_completed",
      "http.method": "GET",
      "http.path": "/orders/123",
      "http.route": "GET /orders/{id}",
      user_id: "u_8472",
      feature: "checkout",
      order_id: "ord_xyz",
      total_cents: 15999,
      coupon_applied: "SAVE20",
    },
  },
  {
    title: "Record payment attempt",
    description: "Add payment or domain fields before responding.",
    code: `hc.Add(ctx, "payment_method", "card", "payment_attempt", 3)
// on error:
hc.Error(ctx, err)`,
    event: {
      time: "2026-02-09T14:03:12.451Z",
      level: "INFO",
      msg: "request_completed",
      "http.method": "GET",
      "http.path": "/orders/123",
      "http.route": "GET /orders/{id}",
      user_id: "u_8472",
      feature: "checkout",
      order_id: "ord_xyz",
      total_cents: 15999,
      coupon_applied: "SAVE20",
      payment_method: "card",
      payment_attempt: 3,
    },
  },
  {
    title: "On error: hc.Error",
    description:
      "hc.Error marks the request as failed; errors are always kept when sampling.",
    code: `hc.Error(ctx, errors.New("checkout failed"))`,
    event: {
      time: "2026-02-09T14:03:12.451Z",
      level: "ERROR",
      msg: "request_completed",
      "http.method": "GET",
      "http.path": "/orders/123",
      "http.route": "GET /orders/{id}",
      "http.status": 500,
      duration_ms: 1247,
      user_id: "u_8472",
      feature: "checkout",
      order_id: "ord_xyz",
      total_cents: 15999,
      coupon_applied: "SAVE20",
      payment_method: "card",
      payment_attempt: 3,
      error: "checkout failed",
    },
  },
  {
    title: "One event at completion",
    description:
      "Middleware writes one canonical event (status, duration_ms, all added fields).",
    code: `// middleware emits after handler returns; Sink receives the final event`,
    event: {
      time: "2026-02-09T14:03:12.451Z",
      level: "ERROR",
      msg: "request_completed",
      "http.method": "GET",
      "http.path": "/orders/123",
      "http.route": "GET /orders/{id}",
      "http.status": 500,
      duration_ms: 1247,
      user_id: "u_8472",
      feature: "checkout",
      order_id: "ord_xyz",
      total_cents: 15999,
      coupon_applied: "SAVE20",
      payment_method: "card",
      payment_attempt: 3,
      error: "checkout failed",
    },
  },
];

// Lightweight JSON syntax highlighter — no external deps
function HighlightedJson({ obj }: { obj: Record<string, unknown> }) {
  const lines = JSON.stringify(obj, null, 2).split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const m = line.match(/^(\s*)("(?:[^"\\]|\\.)*")\s*:\s*(.+)$/);
        if (!m) {
          return (
            <span key={i} className="hjson-bracket">
              {line}
              {"\n"}
            </span>
          );
        }
        const [, indent, keyToken, rest] = m;
        const hasComma = rest.endsWith(",");
        const valRaw = hasComma ? rest.slice(0, -1) : rest;
        const key = keyToken.slice(1, -1);

        let valClass = "hjson-string";
        if (!valRaw.startsWith('"')) {
          valClass = "hjson-number";
          if (key === "http.status" && valRaw === "500")
            valClass = "hjson-val-error";
        } else {
          if (key === "level" && valRaw === '"ERROR"')
            valClass = "hjson-val-error";
          if (key === "level" && valRaw === '"INFO"')
            valClass = "hjson-val-info";
          if (key === "error") valClass = "hjson-val-error";
        }

        return (
          <span key={i}>
            {indent}
            <span className="hjson-key">{keyToken}</span>
            <span className="hjson-punct">{": "}</span>
            <span className={valClass}>{valRaw}</span>
            {hasComma && <span className="hjson-punct">{","}</span>}
            {"\n"}
          </span>
        );
      })}
    </>
  );
}

function countFields(obj: Record<string, unknown>): number {
  let n = 0;
  for (const v of Object.values(obj)) {
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      n += countFields(v as Record<string, unknown>);
    } else {
      n += 1;
    }
  }
  return n;
}

export function WideEventBuilderSimulator() {
  const [step, setStep] = useState(0);
  const current = WIDE_BUILDER_STEPS[step];
  const fieldCount = countFields(current.event);
  const isError = current.event.level === "ERROR";

  return (
    <section
      className="hcw-wide-builder not-typography"
      aria-label="Wide Event Builder Simulator"
    >
      <h3 className="hcw-section-title">Wide Event Builder Simulator</h3>
      <p className="hcw-wide-builder-desc">
        Step through a request lifecycle and watch the wide event accumulate
        context. One event captures everything.
      </p>

      <div
        className="hcw-wide-builder-nav"
        role="group"
        aria-label="Step navigation"
      >
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          aria-label="Previous step"
        >
          ← Previous
        </button>
        <span aria-live="polite">
          Step {step + 1} of {WIDE_BUILDER_STEPS.length}
        </span>
        <button
          type="button"
          onClick={() =>
            setStep((s) => Math.min(WIDE_BUILDER_STEPS.length - 1, s + 1))
          }
          disabled={step === WIDE_BUILDER_STEPS.length - 1}
          aria-label="Next step"
        >
          Next
        </button>
      </div>

      <div className="hcw-wide-builder-step">
        <h4>{current.title}</h4>
        <p>{current.description}</p>
        <div className="hcw-wide-builder-panels">
          <div className="hcw-wide-builder-code">
            <GoCode code={current.code} />
          </div>
          <div className="hcw-wide-builder-live">
            <div
              className={`hcw-wide-builder-live-header${isError ? " is-error" : ""}`}
            >
              <span>LIVE EVENT</span>
              <span>{fieldCount} FIELDS</span>
            </div>
            <pre>
              <code>
                <HighlightedJson obj={current.event} />
              </code>
            </pre>
          </div>
        </div>
      </div>

      <div className="hcw-wide-builder-compare">
        <div>
          <strong>TRADITIONAL APPROACH</strong>
          <p>6 separate log statements, impossible to correlate.</p>
        </div>
        <div>
          <strong>WIDE EVENT APPROACH</strong>
          <p>1 event, complete picture, trivially queryable.</p>
        </div>
      </div>
    </section>
  );
}

// --- The Sampling Trap ---

const TOTAL_EVENTS = 2_000;
// success 70% · warn 15% · slow 10% · error 5%
const SUCCESS_PCT = 0.7;
const WARN_PCT = 0.15;
const SLOW_PCT = 0.1;

type EventType = "success" | "warn" | "slow" | "error";

function buildEventStream(): EventType[] {
  const out: EventType[] = [];
  let idx = 0;
  const nSuccess = Math.floor(TOTAL_EVENTS * SUCCESS_PCT);
  const nWarn = Math.floor(TOTAL_EVENTS * WARN_PCT);
  const nSlow = Math.floor(TOTAL_EVENTS * SLOW_PCT);
  const nError = TOTAL_EVENTS - nSuccess - nWarn - nSlow;
  for (let i = 0; i < nSuccess; i++) out.push("success");
  for (let i = 0; i < nWarn; i++) out.push("warn");
  for (let i = 0; i < nSlow; i++) out.push("slow");
  for (let i = 0; i < nError; i++) out.push("error");
  const rng = (): number => {
    const x = Math.sin(42 * 9999 + idx++) * 10000;
    return x - Math.floor(x);
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const EVENT_STREAM = buildEventStream();

function sampleRandom(rate: number): boolean[] {
  // xorshift32 — sequential RNG produces natural clusters, not a uniform grid
  let s = 0xdeadbeef;
  return EVENT_STREAM.map(() => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff < rate;
  });
}

function computeTailSampling(rate: number): boolean[] {
  let s = 12345;
  return EVENT_STREAM.map((t) => {
    if (t === "error" || t === "slow") return true;
    s = (s * 9301 + 49297) % 233280;
    return s / 233280 < rate;
  });
}

// Matches --color-success / --color-warning / --color-error from global.css
const DOT_COLORS: Record<EventType, string> = {
  success: "#22c55e",
  warn: "#f59e0b",
  slow: "#f97316",
  error: "#ef4444",
};

const CELL_SIZE = 10; // visible box size in px
const CELL_GAP = 2; // gap between boxes in px
const CELL_STRIDE = CELL_SIZE + CELL_GAP;
const MAX_ROWS = 20; // cap so narrow screens stay ~240px tall, not 800px

function drawEventGrid(
  canvas: HTMLCanvasElement,
  stream: EventType[],
  kept: boolean[],
  containerW: number,
) {
  const dpr = Math.min(2, window.devicePixelRatio ?? 1);
  const cols = Math.max(1, Math.floor((containerW + CELL_GAP) / CELL_STRIDE));
  // Limit visible events to MAX_ROWS rows — keeps chart height consistent
  const visibleCount = Math.min(stream.length, cols * MAX_ROWS);
  const rows = Math.ceil(visibleCount / cols);
  const W = cols * CELL_STRIDE - CELL_GAP;
  const H = rows * CELL_STRIDE - CELL_GAP;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const stride = CELL_STRIDE * dpr;
  const size = CELL_SIZE * dpr;
  const radius = 2 * dpr;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      if (i >= visibleCount) break;
      ctx.fillStyle = DOT_COLORS[stream[i]];
      ctx.globalAlpha = kept[i] ? 1 : 0.15;
      const x = col * stride;
      const y = row * stride;
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, radius);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function SamplingTrap() {
  const [sampleRate, setSampleRate] = useState(10);
  const [mode, setMode] = useState<"random" | "tail">("random");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  const rate = sampleRate / 100;
  const kept =
    mode === "random" ? sampleRandom(rate) : computeTailSampling(rate);

  const keptCount = kept.filter(Boolean).length;
  const keptSuccess = EVENT_STREAM.filter(
    (t, i) => t === "success" && kept[i],
  ).length;
  const keptWarn = EVENT_STREAM.filter(
    (t, i) => t === "warn" && kept[i],
  ).length;
  const keptSlow = EVENT_STREAM.filter(
    (t, i) => t === "slow" && kept[i],
  ).length;
  const keptErrors = EVENT_STREAM.filter(
    (t, i) => t === "error" && kept[i],
  ).length;
  const missChance = Math.round((1 - rate) * 100);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // contentRect excludes padding — matches the inner drawing area
    const ro = new ResizeObserver((entries) => {
      setContainerW(Math.floor(entries[0].contentRect.width));
    });
    ro.observe(el);
    setContainerW(Math.floor(el.clientWidth - 21)); // 2×0.65rem padding ≈ 21px
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || containerW === 0) return;
    drawEventGrid(canvas, EVENT_STREAM, kept, containerW);
  }, [sampleRate, mode, containerW]);

  return (
    <section
      className="hcw-sampling-trap not-typography"
      aria-label="The Sampling Trap"
    >
      <h3 className="hcw-section-title">The Sampling Trap</h3>
      <p className="hcw-sampling-trap-desc">
        Random sampling drops events blindly. Tail-based sampling keeps all
        errors and slow requests while sampling success.
      </p>

      <div className="hcw-st-chart-header">
        <span className="hcw-st-stream-label">
          Event Stream ({TOTAL_EVENTS.toLocaleString()}&thinsp;events)
        </span>
        <div className="hcw-st-legend">
          <span className="hcw-st-legend-item">
            <span className="hcw-st-dot hcw-dot-success" />
            Success (70%)
          </span>
          <span className="hcw-st-legend-item">
            <span className="hcw-st-dot hcw-dot-warn" />
            Warn (15%)
          </span>
          <span className="hcw-st-legend-item">
            <span className="hcw-st-dot hcw-dot-slow" />
            Slow (10%)
          </span>
          <span className="hcw-st-legend-item">
            <span className="hcw-st-dot hcw-dot-error" />
            Error (5%)
          </span>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="hcw-st-chart-wrap"
        role="img"
        aria-label={`Event stream: ${keptCount} of ${TOTAL_EVENTS} events kept at ${sampleRate}% ${mode} sampling`}
      >
        <canvas ref={canvasRef} className="hcw-st-canvas" />
      </div>

      <div className="hcw-st-controls">
        <div className="hcw-st-slider-row">
          <label htmlFor="hcw-sample-rate" className="hcw-st-slider-label">
            Sample Rate
          </label>
          <input
            id="hcw-sample-rate"
            type="range"
            className="hcw-st-slider"
            min={1}
            max={100}
            value={sampleRate}
            onChange={(e) => setSampleRate(Number(e.target.value))}
            aria-valuemin={1}
            aria-valuemax={100}
            aria-valuenow={sampleRate}
            aria-valuetext={`${sampleRate}%`}
          />
          <span className="hcw-st-rate-value">{sampleRate}%</span>
        </div>
        <div
          className="hcw-st-mode-buttons"
          role="group"
          aria-label="Sampling type"
        >
          <button
            type="button"
            className={mode === "random" ? "is-active" : ""}
            onClick={() => setMode("random")}
          >
            Random Sampling
          </button>
          <button
            type="button"
            className={mode === "tail" ? "is-active" : ""}
            onClick={() => setMode("tail")}
          >
            Tail Sampling
          </button>
        </div>
      </div>

      <div className="hcw-st-table-wrap">
        <table className="hcw-st-table">
          <thead>
            <tr>
              <th>EVENTS KEPT</th>
              <th>SUCCESS</th>
              <th>WARN</th>
              <th>SLOW</th>
              <th>ERRORS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{keptCount}</td>
              <td className="hcw-st-success">{keptSuccess}</td>
              <td className="hcw-st-warn">{keptWarn}</td>
              <td className="hcw-st-slow">{keptSlow}</td>
              <td className="hcw-st-error">{keptErrors}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="hcw-st-warning">
        {mode === "random" ? (
          <>
            At {sampleRate}% random sampling, you have a{" "}
            <strong>{missChance}% chance</strong> of missing any specific error.
          </>
        ) : (
          <>
            With tail sampling (e.g. <code>hc.KeepErrors()</code>,{" "}
            <code>hc.KeepSlowerThan(...)</code>,{" "}
            <code>hc.RateSampler(...)</code>
            ), all errors and slow requests are kept; only success traffic is
            sampled at {sampleRate}%.
          </>
        )}
      </div>
    </section>
  );
}
