import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../AppContext";
import { Badge } from "../components/Badge";
import { Disclaimer } from "../components/Disclaimer";
import { IntelligenceFlow } from "../components/IntelligenceFlow";
import { Layout } from "../components/Layout";

export function Dashboard() {
  const { meta, active, items } = useApp();
  const [metrics, setMetrics] = useState(null);
  useEffect(() => {
    api.metrics().then(setMetrics).catch(() => setMetrics(null));
  }, []);

  return (
    <Layout>
      <div className="page">
        <div className="kicker">Property Intelligence Dashboard</div>
        <h1>Executive overview</h1>
        <p className="lede">
          {meta?.secondary} This console is an intelligence workstation — not a listings marketplace.
          Headline counters below are labelled demonstration metrics unless marked as session-verified.
        </p>

        <div className="grid g-4">
          {[
            ["Properties Researched", metrics?.properties_researched],
            ["Risk Assessments", metrics?.risk_assessments],
            ["High-Risk Cases", metrics?.high_risk_cases],
            ["Research Completion", metrics ? `${metrics.research_completion_pct}%` : "—"],
          ].map(([label, value]) => (
            <div className="card" key={label}>
              <div className="metric-label">{label}</div>
              <div className="metric">{value ?? "—"}</div>
              <Badge kind="demo">Demo / Sample System Metrics</Badge>
            </div>
          ))}
        </div>

        <div className="grid g-23" style={{ marginTop: 16 }}>
          <div className="card">
            <h3>Property Intelligence Flow</h3>
            <p className="lede">Interactive pipeline for the active research record. Stages reflect backend status, not simulated telemetry.</p>
            {active?.flow ? <IntelligenceFlow flow={active.flow} /> : <p>Data Not Available — launch or select a research job.</p>}
          </div>
          <div className="card">
            <h3>Session records</h3>
            <p className="lede">{metrics?.session_note}</p>
            <div className="metric">{metrics?.session_research_count ?? items.length}</div>
            <Badge kind="verified">Verified — this backend process</Badge>
            <ul>
              {items.map((it) => (
                <li key={it.id}>
                  {it.input?.name} — {it.status}
                </li>
              ))}
            </ul>
            <Link className="btn btn-primary" to="/research">
              Start research
            </Link>
          </div>
        </div>
        <Disclaimer text={meta?.disclaimer} />
      </div>
    </Layout>
  );
}
