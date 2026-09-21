import { useEffect, useState } from "react";
import { api } from "../api";
import { useApp } from "../AppContext";
import { Badge } from "../components/Badge";
import { Disclaimer } from "../components/Disclaimer";
import { Layout } from "../components/Layout";
import { RiskRadar } from "../components/RiskRadar";

export function RiskIntelligence() {
  const { active, loadActive, activeId } = useApp();
  const [weights, setWeights] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.weights().then((d) => setWeights(d.weights));
  }, []);

  const save = async () => {
    await api.saveWeights(weights);
    setMsg("Weights saved. Re-run research to recompute scores. Existing jobs keep their stored scores.");
    if (activeId) await loadActive(activeId);
  };

  const risk = active?.risk;
  const composite = risk?.composite;

  return (
    <Layout>
      <div className="page">
        <div className="kicker">Six-Dimensional Risk Intelligence</div>
        <h1>Transparent risk engine</h1>
        <p className="lede">
          Composite Risk Score = Σ (dimension × weight) / Σ available weights. AI does not control this calculation.
          This is an AI-assisted analytical score based on available data — not an official legal or investment rating.
        </p>

        {!composite?.available && (
          <div className="callout warn">
            {composite?.message || "Risk score cannot be reliably calculated because required evidence is incomplete."}
          </div>
        )}

        {composite?.available && (
          <div className="grid g-4">
            <div className="card">
              <div className="metric-label">Composite score</div>
              <div className="metric">{composite.score}</div>
              <Badge kind={composite.band} />
            </div>
            <div className="card">
              <div className="metric-label">Classification</div>
              <div className="metric">{composite.band}</div>
              <span className="lede">0–25 Low · 26–50 Moderate · 51–75 High · 76–100 Critical</span>
            </div>
            <div className="card">
              <div className="metric-label">Evidence coverage</div>
              <div className="metric">{Math.round((composite.coverage_ratio || 0) * 100)}%</div>
              <Badge kind="limited" />
            </div>
            <div className="card">
              <div className="metric-label">Excluded dimensions</div>
              <div>{(composite.excluded_dimensions || []).join(", ") || "None"}</div>
            </div>
          </div>
        )}

        <div className="grid g-23" style={{ marginTop: 16 }}>
          <div className="card">
            <h3>Six-Dimensional Risk Radar</h3>
            {risk?.dimensions ? <RiskRadar dimensions={risk.dimensions} /> : <p>Data Not Available</p>}
          </div>
          <div className="card">
            <h3>Configurable weights</h3>
            {weights &&
              Object.keys(weights).map((k) => (
                <label className="field" key={k}>
                  {k} ({weights[k]})
                  <input
                    type="range"
                    min="0"
                    max="0.4"
                    step="0.01"
                    value={weights[k]}
                    onChange={(e) => setWeights({ ...weights, [k]: Number(e.target.value) })}
                  />
                </label>
              ))}
            <button className="btn btn-ghost" type="button" onClick={save}>
              Save weights
            </button>
            {msg && <p className="lede">{msg}</p>}
          </div>
        </div>

        <div className="grid g-2" style={{ marginTop: 16 }}>
          {Object.values(risk?.dimensions || {}).map((d) => (
            <div className="card risk-card" key={d.key}>
              <div className="toolbar">
                <h3 style={{ margin: 0 }}>{d.label}</h3>
                <Badge kind={d.status} />
                {d.band && <Badge kind={d.band} />}
                <Badge kind={d.confidence} />
              </div>
              <div>
                <strong>Risk detected</strong>
                <p>{d.risk_detected}</p>
              </div>
              <div>
                <strong>Evidence</strong>
                {(d.evidence || []).map((e) => (
                  <p key={e}>• {e}</p>
                ))}
              </div>
              <div>
                <strong>Explanation</strong>
                <p>{d.explanation}</p>
              </div>
              <div>
                <strong>Suggested verification</strong>
                <p>{d.verification}</p>
              </div>
            </div>
          ))}
        </div>
        <Disclaimer />
      </div>
    </Layout>
  );
}
