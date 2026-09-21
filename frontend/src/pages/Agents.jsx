import { useApp } from "../AppContext";
import { Disclaimer } from "../components/Disclaimer";
import { Layout } from "../components/Layout";

export function Agents() {
  const { active } = useApp();
  const agents = active?.agents || [];
  return (
    <Layout>
      <div className="page">
        <div className="kicker">Autonomous Research Agents</div>
        <h1>Orchestrated specialists</h1>
        <p className="lede">
          Status is the last genuine backend pipeline state for the selected research job. This screen does not
          simulate live telemetry.
        </p>
        <div className="grid g-2">
          {agents.map((a) => (
            <div className="card" key={a.key}>
              <div className="agent">
                <h3>{a.name}</h3>
                <span>
                  <span className={`status-dot s-${a.status}`} />
                  {a.status}
                </span>
              </div>
              <p>{a.purpose}</p>
              <p>
                <strong>Current task.</strong> {a.current_task}
              </p>
              <p>
                <strong>Input.</strong> {a.input}
              </p>
              <p>
                <strong>Output.</strong> {a.output}
              </p>
              <p>
                <strong>Evidence count.</strong> {a.evidence_count}
              </p>
              <p className="lede" style={{ marginBottom: 0 }}>
                Last activity: {a.last_activity}
              </p>
            </div>
          ))}
        </div>
        {agents.length === 0 && (
          <div className="callout warn">Required information is unavailable to complete this assessment.</div>
        )}
        <Disclaimer />
      </div>
    </Layout>
  );
}
