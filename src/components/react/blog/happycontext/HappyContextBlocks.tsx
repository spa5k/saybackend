import { useState } from "react";

import "./happycontext-blocks.css";

const traditionalLogging = `logger.info('Request started')
logger.Info("user authenticated", "user_id", userID)
logger.Info("fetching cart", "cart_id", cartID)
logger.Info("processing payment")
logger.Info("payment successful")
logger.Info("request completed")`;

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
        <pre>
          <code>{traditionalLogging}</code>
        </pre>
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

        <pre>
          <code>{activeView === "code" ? wideEventCode : wideEventOutput}</code>
        </pre>
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
