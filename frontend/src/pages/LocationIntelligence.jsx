import { useApp } from "../AppContext";
import { Badge } from "../components/Badge";
import { Disclaimer } from "../components/Disclaimer";
import { Layout } from "../components/Layout";

const CATS = [
  ["hospitals", "Hospitals"],
  ["schools", "Schools"],
  ["public_transport", "Public Transport"],
  ["shopping", "Shopping"],
  ["roads", "Roads"],
  ["it_corridors", "IT Corridors"],
  ["airports", "Airports"],
  ["parks", "Parks"],
];

export function LocationIntelligence() {
  const { active } = useApp();
  const loc = active?.location;
  return (
    <Layout>
      <div className="page">
        <div className="kicker">Location Intelligence</div>
        <h1>Coordinate rings — 1 km · 3 km · 5 km</h1>
        <p className="lede">
          Distances are calculated with haversine only when both property coordinates and an applicable demo POI cluster
          exist. Facility names are Illustrative Demo Data — not a live map inventory.
        </p>
        {!loc || loc.status === "unavailable" ? (
          <div className="callout warn">{loc?.message || "Data Not Available"}</div>
        ) : (
          <>
            <div className="callout warn">{loc.message}</div>
            <div className="grid g-23" style={{ marginTop: 16 }}>
              <div className="card">
                <div className="rings">
                  <div className="ring-canvas" aria-hidden>
                    <div className="pin" />
                  </div>
                </div>
                <p className="lede">
                  Pin: user coordinates {loc.property_coordinates?.lat}, {loc.property_coordinates?.lng}{" "}
                  <Badge kind="verified" />
                </p>
              </div>
              <div className="card">
                <h3>Ring legend</h3>
                <p>Inner disc ≈ 1 km · mid ≈ 3 km · outer ≈ 5 km (schematic, not a geographic map).</p>
                <Badge kind="demo">Illustrative Demo Data</Badge>
              </div>
            </div>
            <div className="grid g-2" style={{ marginTop: 16 }}>
              {CATS.map(([key, label]) => (
                <div className="card" key={key}>
                  <h3>{label}</h3>
                  {(loc.categories?.[key] || []).length === 0 && <p>Data Not Available</p>}
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>km</th>
                        <th>Ring</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(loc.categories?.[key] || []).map((p) => (
                        <tr key={p.name}>
                          <td>{p.name}</td>
                          <td>{p.distance_km}</td>
                          <td>{p.ring}</td>
                          <td>
                            <Badge kind="demo" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </>
        )}
        <Disclaimer />
      </div>
    </Layout>
  );
}
