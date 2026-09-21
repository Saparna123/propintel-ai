export function Disclaimer({ text }) {
  return (
    <p className="disclaimer">
      {text ||
        "PropIntel AI provides AI-assisted analytical insights based on available data. Results may be incomplete or subject to data limitations and should not be treated as legal, financial, valuation, or investment advice. Users should independently verify relevant information through appropriate authoritative sources."}
    </p>
  );
}

export function ErrorState({ title, message }) {
  return (
    <div className="callout err" role="alert">
      <strong>{title}</strong>
      <div>{message}</div>
    </div>
  );
}
