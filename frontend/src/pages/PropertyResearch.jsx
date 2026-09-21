import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../AppContext";
import { Disclaimer } from "../components/Disclaimer";
import { Layout } from "../components/Layout";

const DOC_TYPES = [
  "Sale Deed",
  "RERA Document",
  "Property Brochure",
  "Encumbrance Document",
  "Tax/Registration Document",
];

export function PropertyResearch() {
  const nav = useNavigate();
  const { refreshList, loadActive } = useApp();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    name: "Green Valley Residency",
    address: "OMR, Sholinganallur",
    city: "Chennai, Tamil Nadu",
    latitude: "13.0827",
    longitude: "80.2707",
    property_type: "Apartment",
    estimated_price: "12500000",
    built_up_area: "1480",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onFiles = (list) => {
    const next = [];
    for (const file of list) {
      const item = { file, type: DOC_TYPES[0], error: "" };
      if (file.size > 10 * 1024 * 1024) item.error = "File exceeds 10 MB limit.";
      next.push(item);
    }
    setFiles(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (files.some((f) => f.error)) {
      setErr("The document could not be processed. Please upload a supported or clearer document.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append("files", f.file));
      fd.append("document_types", files.map((f) => f.type).join("|"));
      const job = await api.createResearch(fd);
      await refreshList();
      await loadActive(job.id);
      nav("/workspace");
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <div className="kicker">Property Research Console</div>
        <h1>Start Autonomous Property Research</h1>
        <p className="lede">
          Provide what you know. The platform will not invent missing government records, prices, or nearby facilities.
          Uploading a file does not mean the instrument is officially verified.
        </p>
        <form className="card" onSubmit={submit}>
          <div className="grid g-2">
            {[
              ["name", "Property Name", "text"],
              ["address", "Address", "text"],
              ["city", "City", "text"],
              ["property_type", "Property Type", "text"],
              ["latitude", "Latitude (optional)", "text"],
              ["longitude", "Longitude (optional)", "text"],
              ["estimated_price", "Estimated Price (optional)", "text"],
              ["built_up_area", "Built-up Area (optional)", "text"],
            ].map(([k, label]) => (
              <label className="field" key={k}>
                {label}
                <input value={form[k]} onChange={(e) => set(k, e.target.value)} required={["name", "address", "city", "property_type"].includes(k)} />
              </label>
            ))}
          </div>

          <h3 style={{ marginTop: 20 }}>Upload documents (optional)</h3>
          <p className="lede">PDF, TXT, DOCX, PNG, JPG · max 10 MB. Image OCR is not implemented.</p>
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
            onChange={(e) => onFiles(e.target.files)}
          />
          {files.map((f, i) => (
            <div key={i} className="card" style={{ marginTop: 8 }}>
              <strong>{f.file.name}</strong> · {(f.file.size / 1024).toFixed(1)} KB
              <label className="field">
                Declared type
                <select value={f.type} onChange={(e) => setFiles((arr) => arr.map((x, j) => (j === i ? { ...x, type: e.target.value } : x)))}>
                  {DOC_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              {f.error && <div className="callout err">{f.error}</div>}
            </div>
          ))}

          {err && <div className="callout err" style={{ marginTop: 12 }}>{err}</div>}
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" disabled={busy} type="submit">
              {busy ? "Running pipeline…" : "Launch Autonomous Research"}
            </button>
          </div>
        </form>
        <Disclaimer />
      </div>
    </Layout>
  );
}
