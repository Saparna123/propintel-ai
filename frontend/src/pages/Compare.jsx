import { useEffect, useState } from "react";
import { api } from "../api";
import { useApp } from "../AppContext";
import { Badge } from "../components/Badge";
import { Disclaimer } from "../components/Disclaimer";
import { Layout } from "../components/Layout";

export function Compare() {
  const { items } = useApp();
  const [a, setA] = useState(items[0]?.id || "");
  const [b, setB] = useState(items[1]?.id || "");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!a && items[0]) setA(items[0].id);
    if (!b && items[1]) setB(items[1].id);
  }, [items, a, b]);

  const run = async () => {
    setErr("");
    try {
      const data = await api.compare([a, b]);
      setResult(data);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <Layout>
      <div className="page">
        <div className="kicker">Property Intelligence Comparison</div>
        <h1>Analytical differences only</h1>
        <p className="lede">
          This view does not declare a winner, best property, or recommendation. It reports differences in the available
          dataset.
        </p>
        <div className="card toolbar">
          <select className="select-prop" value={a} onChange={(e) => setA(e.target.value)}>
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.input?.name}
              </option>
            ))}
          </select>
          <select className="select-prop" value={b} onChange={(e) => setB(e.target.value)}>
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.input?.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="button" onClick={run}>
            Compare
          </button>
        </div>
        {err && <div className="callout err">{err}</div>}
        {result && (
          <>
            <div className="card" style={{ marginTop: 16, overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    {["Property", "Price", "Price/sq.ft", "Rental yield", "Market", "Location", "Risk exposure", "Infrastructure", "Documentation", "Confidence"].map(
                      (h) => (
                        <th key={h}>{h}</th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.property}</td>
                      <td>
                        {r.price ?? "Data Not Available"} <Badge kind={r.price_status} />
                      </td>
                      <td>
                        {r.psf ?? "Data Not Available"} <Badge kind={r.psf_status} />
                      </td>
                      <td>
                        Data Not Available <Badge kind="unavailable" />
                      </td>
                      <td>{r.market_indicator}</td>
                      <td>{r.location}</td>
                      <td>{r.risk_exposure}</td>
                      <td>{r.infrastructure}</td>
                      <td>{r.documentation}</td>
                      <td>
                        <Badge kind={r.confidence} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card" style={{ marginTop: 16 }}>
              <h3>Key Differences</h3>
              {(result.key_differences || []).map((d) => (
                <p key={d}>{d}</p>
              ))}
              <p className="lede">{result.note}</p>
            </div>
          </>
        )}
        <Disclaimer />
      </div>
    </Layout>
  );
}
