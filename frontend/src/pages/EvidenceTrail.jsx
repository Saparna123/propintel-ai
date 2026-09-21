import { useApp } from "../AppContext";
import { Badge } from "../components/Badge";
import { Disclaimer } from "../components/Disclaimer";
import { Layout } from "../components/Layout";

export function EvidenceTrail() {
  const { active } = useApp();
  const trail = active?.evidence_trail || [];
  return (
    <Layout>
      <div className="page">
        <div className="kicker">Evidence & Research Trail</div>
        <h1>Traceable findings</h1>
        <p className="lede">Source references are never invented. If a source does not exist, it is marked Not Available.</p>
        {trail.length === 0 && <div className="callout warn">Required information is unavailable to complete this assessment.</div>}
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Finding</th>
                <th>Source type</th>
                <th>Source reference</th>
                <th>Evidence</th>
                <th>Timestamp</th>
                <th>Agent</th>
                <th>Confidence</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {trail.map((e) => (
                <tr key={e.id}>
                  <td>{e.finding}</td>
                  <td>{e.source_type}</td>
                  <td>{e.source_reference || "Not Available"}</td>
                  <td>{e.evidence}</td>
                  <td>{e.timestamp}</td>
                  <td>{e.agent}</td>
                  <td>
                    <Badge kind={e.confidence} />
                  </td>
                  <td>{e.verification_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Disclaimer />
      </div>
    </Layout>
  );
}
