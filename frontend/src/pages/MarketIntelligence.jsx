import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "../AppContext";
import { Badge } from "../components/Badge";
import { Disclaimer } from "../components/Disclaimer";
import { Layout } from "../components/Layout";

export function MarketIntelligence() {
  const { active } = useApp();
  const m = active?.market;
  const inp = active?.input;
  const userPsf =
    inp?.estimated_price && inp?.built_up_area ? Math.round((inp.estimated_price / inp.built_up_area) * 100) / 100 : null;

  return (
    <Layout>
      <div className="page">
        <div className="kicker">Market Intelligence</div>
        <h1>Comparables, trend, and yield</h1>
        <p className="lede">
          Source / Dataset is shown on every chart. If no live market source exists, values are labelled illustrative
          demo data. Rental yield is never invented.
        </p>
        {!m?.available ? (
          <div className="callout warn">{m?.message || "External data is currently unavailable. The system will not infer missing information."}</div>
        ) : (
          <>
            <div className="callout warn">{m.message}</div>
            <div className="grid g-4" style={{ marginTop: 16 }}>
              <div className="card">
                <div className="metric-label">Property value (user)</div>
                <div className="metric">{inp?.estimated_price ?? "Data Not Available"}</div>
                <Badge kind={inp?.estimated_price != null ? "verified" : "unavailable"} />
              </div>
              <div className="card">
                <div className="metric-label">Price per sq.ft</div>
                <div className="metric">{userPsf ?? "Data Not Available"}</div>
                <Badge kind={userPsf != null ? "verified" : "unavailable"} />
              </div>
              <div className="card">
                <div className="metric-label">Rental yield</div>
                <div className="metric">Data Not Available</div>
                <Badge kind="unavailable" />
                <p className="lede">{m.rental_yield_note}</p>
              </div>
              <div className="card">
                <div className="metric-label">Demo price range (psf)</div>
                <div className="metric">
                  {m.demo_psf_low}–{m.demo_psf_high}
                </div>
                <Badge kind="demo" />
              </div>
            </div>

            <div className="grid g-2" style={{ marginTop: 16 }}>
              <div className="card">
                <h3>Price trend (index)</h3>
                <p className="lede">Source: {m.source}</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={m.trend}>
                    <CartesianGrid stroke="#eee" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="index" stroke="#1b4f8a" />
                  </LineChart>
                </ResponsiveContainer>
                <Badge kind="demo">Illustrative series — not historical transactions</Badge>
              </div>
              <div className="card">
                <h3>Comparable distribution (psf)</h3>
                <p className="lede">Source: {m.source}</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={m.comparables}>
                    <CartesianGrid stroke="#eee" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="psf" fill="#0d7377" />
                  </BarChart>
                </ResponsiveContainer>
                <Badge kind="demo" />
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <h3>Comparable properties</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>City</th>
                    <th>Price</th>
                    <th>Area</th>
                    <th>Psf</th>
                    <th>Demo yield %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {m.comparables.map((c) => (
                    <tr key={c.name}>
                      <td>{c.name}</td>
                      <td>{c.city}</td>
                      <td>{c.price}</td>
                      <td>{c.area}</td>
                      <td>{c.psf}</td>
                      <td>{c.yield_pct}</td>
                      <td>
                        <Badge kind="demo" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="lede">Demo yield column is illustrative and is not applied to the subject property.</p>
            </div>
          </>
        )}
        <Disclaimer />
      </div>
    </Layout>
  );
}
