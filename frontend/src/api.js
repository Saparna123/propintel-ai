const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail || data.message || "The request could not be completed.";
    const err = new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  meta: () => request("/api/meta"),
  metrics: () => request("/api/metrics"),
  weights: () => request("/api/weights"),
  saveWeights: (body) =>
    request("/api/weights", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  listResearch: () => request("/api/research"),
  getResearch: (id) => request(`/api/research/${id}`),
  createResearch: (formData) =>
    request("/api/research", { method: "POST", body: formData }),
  compare: (ids) =>
    request("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ research_ids: ids }),
    }),
  assistant: (research_id, question) =>
    request("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ research_id, question }),
    }),
};
