import { useApp } from "../AppContext";
import { Badge } from "../components/Badge";
import { Disclaimer } from "../components/Disclaimer";
import { IntelligenceFlow } from "../components/IntelligenceFlow";
import { Layout } from "../components/Layout";

export function Workspace() {
  const { active } = useApp();
  if (!active) {
    return (
      <Layout>
        <div className="page">
          <div className="callout warn">Required information is unavailable to complete this assessment.</div>
        </div>
      </Layout>
    );
  }
  const profile = active.profile;
  return (
    <Layout>
      <div className="page">
        <div className="kicker">Research execution · {active.data_mode} mode</div>
        <h1>{profile?.name || active.input.name}</h1>
        <p className="lede">
          Location: <strong>{profile?.location}</strong>. No relevant legal issue can be declared from this platform.
          Independent verification is recommended.
        </p>
        {active.limitations?.length > 0 && (
          <div className="callout warn">
            External data unavailable — assessment limited to available information.
            <ul>
              {active.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        )}

        <h3>Pipeline phases</h3>
        <div className="grid g-3">
          {active.phases?.map((p) => (
            <div className="card" key={p.key}>
              <strong>{p.label}</strong>
              <div>
                <span className={`status-dot s-${p.status}`} />
                {p.status}
              </div>
              <p className="lede" style={{ marginBottom: 0 }}>
                {p.note}
              </p>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Property Intelligence Profile</h3>
          <div className="grid g-4">
            {profile?.fields?.map((f) => (
              <div key={f.label}>
                <div className="metric-label">{f.label}</div>
                <div style={{ fontFamily: "Space Grotesk", fontSize: 18 }}>{f.value ?? "Data Not Available"}</div>
                <Badge kind={f.origin} />
                <div className="lede" style={{ margin: "6px 0 0" }}>
                  {f.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Document analysis</h3>
          {(active.documents || []).length === 0 && <p>Data Not Available — no documents uploaded.</p>}
          {(active.documents || []).map((d) => (
            <div key={d.filename} className="card" style={{ marginTop: 8 }}>
              <strong>{d.filename}</strong> · {d.document_type}
              <div className="toolbar" style={{ marginTop: 6 }}>
                <Badge kind="verified">Status: {d.processing_status}</Badge>
                <Badge kind={d.evidence_status} />
                <Badge kind={d.confidence} />
              </div>
              <p>Official verification: No — upload is not an official verification.</p>
              {d.extraction_errors?.length > 0 && (
                <div className="callout err">{d.extraction_errors.join(" ")}</div>
              )}
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                {JSON.stringify(d.extracted_fields, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <h3>Property Intelligence Flow</h3>
          <IntelligenceFlow flow={active.flow} />
        </div>
        <Disclaimer />
      </div>
    </Layout>
  );
}
