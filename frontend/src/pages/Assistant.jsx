import { useState } from "react";
import { api } from "../api";
import { useApp } from "../AppContext";
import { Disclaimer } from "../components/Disclaimer";
import { Layout } from "../components/Layout";

export function Assistant() {
  const { active, meta } = useApp();
  const [q, setQ] = useState("What risks were identified?");
  const [thread, setThread] = useState([]);
  const [busy, setBusy] = useState(false);

  const ask = async (question) => {
    if (!active) return;
    setBusy(true);
    setThread((t) => [...t, { role: "user", text: question }]);
    try {
      const res = await api.assistant(active.id, question);
      setThread((t) => [...t, { role: "ai", res }]);
    } catch (e) {
      setThread((t) => [
        ...t,
        {
          role: "ai",
          res: {
            ok: false,
            message: "AI analysis is temporarily unavailable. Previously processed evidence remains accessible.",
          },
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <div className="kicker">Ask PropIntel AI</div>
        <h1>Evidence-bound assistant</h1>
        <p className="lede">
          Answers are constrained to the selected research job. The model must not invent sources, records, prices, or
          legal clearance. Gemini is called only from the backend.
        </p>
        {!meta?.gemini_configured && (
          <div className="callout warn">
            AI analysis is temporarily unavailable. Set GEMINI_API_KEY in backend/.env. Previously processed evidence remains accessible.
          </div>
        )}
        <div className="toolbar" style={{ marginBottom: 12 }}>
          {(meta?.suggested_questions || []).map((s) => (
            <button key={s} className="btn btn-ghost" type="button" onClick={() => setQ(s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="chat">
          {thread.map((m, i) => (
            <div className={`bubble ${m.role}`} key={i}>
              {m.role === "user" ? (
                m.text
              ) : (
                <>
                  {!m.res.ok && <div className="callout err">{m.res.message}</div>}
                  {m.res.ok && <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Plus Jakarta Sans" }}>{m.res.message}</pre>}
                  {m.res.structured && (
                    <div>
                      <p>
                        <strong>Answer.</strong> {m.res.structured.answer}
                      </p>
                      <p>
                        <strong>Evidence.</strong>
                      </p>
                      <ul>
                        {(m.res.structured.evidence || []).map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                      <p>
                        <strong>Explanation.</strong> {m.res.structured.explanation}
                      </p>
                      <p>
                        <strong>Data limitation.</strong> {m.res.structured.data_limitation}
                      </p>
                      <p>
                        <strong>Verification guidance.</strong> {m.res.structured.verification_guidance}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <form
          className="card"
          style={{ marginTop: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            ask(q);
          }}
        >
          <label className="field">
            Question
            <textarea value={q} onChange={(e) => setQ(e.target.value)} rows={3} />
          </label>
          <button className="btn btn-teal" disabled={busy || !active} type="submit">
            {busy ? "Analysing…" : "Ask"}
          </button>
        </form>
        <Disclaimer />
      </div>
    </Layout>
  );
}
