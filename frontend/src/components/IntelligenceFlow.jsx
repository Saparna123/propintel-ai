import { useState } from "react";
import { Badge } from "./Badge";

const STAGES = [
  ["ingestion", "Data Ingestion"],
  ["extraction", "Document Extraction"],
  ["geo", "Geospatial Analysis"],
  ["market", "Market Intelligence"],
  ["risk", "Risk Assessment"],
  ["verify", "Verification Checklist"],
  ["report", "Intelligence Report"],
];

export function IntelligenceFlow({ flow = [] }) {
  const [key, setKey] = useState(flow[0]?.key || "ingestion");
  const selected = flow.find((f) => f.key === key) || flow[0];
  return (
    <div>
      <div className="flow" role="list">
        {STAGES.map(([k, title], i) => {
          const stage = flow.find((f) => f.key === k);
          return (
            <button
              key={k}
              type="button"
              className={`flow-step ${key === k ? "active" : ""}`}
              onClick={() => setKey(k)}
            >
              <strong>
                {i + 1}. {title}
              </strong>
              <small>{stage?.status || "waiting"}</small>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>{selected.title}</h3>
          <div className="grid g-2">
            <p>
              <strong>Input.</strong> {selected.input}
            </p>
            <p>
              <strong>Processing.</strong> {selected.processing}
            </p>
            <p>
              <strong>Output.</strong> {selected.output}
            </p>
            <p>
              <strong>Evidence.</strong> {selected.evidence}
            </p>
          </div>
          <div className="toolbar" style={{ marginTop: 8 }}>
            <Badge kind={selected.status === "demo" ? "demo" : selected.status === "unavailable" || selected.status === "data_unavailable" ? "unavailable" : "verified"}>
              Status: {selected.status}
            </Badge>
            <Badge kind={selected.confidence} />
          </div>
          <p className="lede" style={{ marginBottom: 0 }}>
            <strong>Data limitations.</strong> {selected.limitations}
          </p>
        </div>
      )}
    </div>
  );
}
