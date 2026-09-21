const MAP = {
  verified: ["Verified Data", "b-verified"],
  ai_inferred: ["AI-Inferred Insight", "b-inferred"],
  inferred: ["AI-Inferred Insight", "b-inferred"],
  demo: ["Demo / Illustrative Data", "b-demo"],
  unavailable: ["Data Not Available", "b-na"],
  high: ["Confidence: High", "b-low"],
  medium: ["Confidence: Medium", "b-mod"],
  limited: ["Confidence: Limited", "b-na"],
  Low: ["Low", "b-low"],
  Moderate: ["Moderate", "b-mod"],
  High: ["High", "b-high"],
  Critical: ["Critical", "b-crit"],
};

export function Badge({ kind, children }) {
  const [label, cls] = MAP[kind] || [children || kind, "b-na"];
  return <span className={`badge ${cls}`}>{children || label}</span>;
}

export function DataModeChip({ mode }) {
  if (mode === "connected") return <span className="demo-chip connected-chip">CONNECTED DATA MODE</span>;
  return <span className="demo-chip">DEMO DATA</span>;
}
