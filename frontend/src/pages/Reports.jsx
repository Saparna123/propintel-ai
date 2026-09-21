import { RiskRadar } from "../components/RiskRadar";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "../AppContext";
import { Badge } from "../components/Badge";
import { Disclaimer } from "../components/Disclaimer";
import { Layout } from "../components/Layout";

export function Reports() {
  const { active, meta } = useApp();
  if (!active) {
    return (
      <Layout>
        <div className="page">
          <div className="callout warn">Required information is unavailable to complete this assessment.</div>
        </div>
      </Layout>
    );
  }

  const copySummary = async () => {
    const text = [
      active.profile?.name,
      `Status: ${active.status}`,
      `Composite: ${active.risk?.composite?.band || "Unavailable"}`,
      ...(active.limitations || []),
      meta?.disclaimer,
    ].join("\n");
    await navigator.clipboard.writeText(text);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(active, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const market = active.market;

  return (
    <Layout>
      <div className="page" id="dossier">
        <div className="kicker">Property Intelligence Dossier</div>
        <h1>{active.input.name}</h1>
        <p className="lede">Ten-section intelligence report. Print uses the browser print dialog (Save as PDF).</p>
        <div className="toolbar no-print">
          <button className="btn btn-primary" type="button" onClick={() => window.print()}>
            Print Report
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => window.print()}>
            Export PDF
          </button>
          <button className="btn btn-ghost" type="button" onClick={copySummary}>
            Copy Summary
          </button>
          <button className="btn btn-ghost" type="button" onClick={downloadJson}>
            Download JSON
          </button>
        </div>

        <section className="card" style={{ marginTop: 16 }}>
          <h3>1. Executive Summary</h3>
          <p>
            Research completed for <strong>{active.input.name}</strong> in {active.input.city}. Legal registries are not
            connected. No statement of legal safety is made.{" "}
            {active.risk?.composite?.available
              ? `Composite analytical band: ${active.risk.composite.band} (${active.risk.composite.score}).`
              : "Risk score cannot be reliably calculated because required evidence is incomplete."}
          </p>
          {active.ai_narrative?.ai_narrative_raw && (
            <div className="callout info">
              <Badge kind="ai_inferred" /> {active.ai_narrative.ai_narrative_raw}
            </div>
          )}
        </section>

        <section className="card" style={{ marginTop: 12 }}>
          <h3>2. Property Overview</h3>
          <table className="table">
            <tbody>
              {active.profile?.fields?.map((f) => (
                <tr key={f.label}>
                  <td>{f.label}</td>
                  <td>{f.value ?? "Data Not Available"}</td>
                  <td>
                    <Badge kind={f.origin} />
                  </td>
                  <td>{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card" style={{ marginTop: 12 }}>
          <h3>3. Document Intelligence</h3>
          {(active.documents || []).length === 0 && <p>Data Not Available — no documents uploaded.</p>}
          {(active.documents || []).map((d) => (
            <p key={d.filename}>
              {d.filename} · {d.document_type} · {d.processing_status} · Official verification: No
            </p>
          ))}
        </section>

        <section className="card" style={{ marginTop: 12 }}>
          <h3>4. Location Intelligence</h3>
          <p>{active.location?.message}</p>
          <Badge kind={active.location?.status === "demo" ? "demo" : "unavailable"} />
        </section>

        <section className="card" style={{ marginTop: 12 }}>
          <h3>5. Market Intelligence</h3>
          <p>{market?.message}</p>
          {market?.available && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={market.comparables}>
                <CartesianGrid stroke="#eee" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="psf" fill="#1b4f8a" />
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="lede">Source: {market?.source || "Not Available"}</p>
        </section>

        <section className="card" style={{ marginTop: 12 }}>
          <h3>6. Risk Assessment</h3>
          <p>{active.risk?.composite?.disclaimer}</p>
          <p>Methodology: {active.risk?.composite?.formula}</p>
          {active.risk?.dimensions && <RiskRadar dimensions={active.risk.dimensions} />}
        </section>

        <section className="card" style={{ marginTop: 12 }}>
          <h3>7. Comparable Properties</h3>
          {(market?.comparables || []).length === 0 && <p>Data Not Available</p>}
          <ul>
            {(market?.comparables || []).map((c) => (
              <li key={c.name}>
                {c.name} — psf {c.psf} <Badge kind="demo" />
              </li>
            ))}
          </ul>
        </section>

        <section className="card" style={{ marginTop: 12 }}>
          <h3>8. Evidence & Confidence</h3>
          <p>{(active.evidence_trail || []).length} trail items. Confidence is driven by evidence availability.</p>
          <ul>
            {(active.limitations || []).map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>

        <section className="card" style={{ marginTop: 12 }}>
          <h3>9. Verification Checklist</h3>
          {(active.checklist || []).map((c) => (
            <label key={c.key} style={{ display: "block", marginBottom: 8 }}>
              <input type="checkbox" disabled checked={c.status === "document_uploaded_not_verified" || c.status === "user_supplied_unverified"} />{" "}
              {c.title} — <em>{c.status}</em>
              <div className="lede">
                Evidence: {c.evidence} · Source: {c.source} · {c.verification_requirement}
              </div>
            </label>
          ))}
        </section>

        <section className="card" style={{ marginTop: 12 }}>
          <h3>10. Research Summary</h3>
          <p>
            Pipeline status: {active.status}. Agents completed their last recorded tasks for this job. Missing official
            records were not replaced with generated values.
          </p>
        </section>
        <Disclaimer text={active.report?.disclaimer || meta?.disclaimer} />
      </div>
    </Layout>
  );
}
