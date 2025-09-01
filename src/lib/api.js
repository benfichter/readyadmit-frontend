const RAW = (import.meta.env.VITE_API_ORIGIN || "").trim();
export const API_BASE = RAW
  ? (/^https?:\/\//i.test(RAW) ? RAW : `https://${RAW}`).replace(/\/+$/,'')
  : ""; // dev: empty => Vite proxy

async function request(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  const data = ct.includes("application/json") ? (text ? JSON.parse(text) : null) : null;
  if (!res.ok) throw new Error(data?.error || `${opts.method || "GET"} ${path} ${res.status} ${text?.slice?.(0,120) || ""}`);
  return data;
}

export const api = {
  listUsers: () => request("/api/users"),
  createUser: (body) => request("/api/users", { method: "POST", body: JSON.stringify(body) }),
};
