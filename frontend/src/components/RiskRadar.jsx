import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

export function RiskRadar({ dimensions }) {
  const data = Object.values(dimensions || {}).map((d) => ({
    dim: d.label.replace(" Risk", ""),
    score: d.available && d.score != null ? d.score : 0,
    missing: !d.available,
  }));
  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e8e6e1" />
          <PolarAngleAxis dataKey="dim" tick={{ fill: "#5c6778", fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar dataKey="score" stroke="#1b4f8a" fill="#1b4f8a" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
      <p className="lede" style={{ marginTop: 0 }}>
        Unavailable dimensions are plotted as 0 on the chart and must not be read as “no risk”. See the cards for Data Not Available.
      </p>
    </div>
  );
}
