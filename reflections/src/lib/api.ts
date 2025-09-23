import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

const key = { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" };

export const routes = {
  health: () => api.get("/health"),
  seed:   (p:any) => api.post("/seed", p, { headers: key }),
  sweep:  (p:any) => api.post("/sweep", p, { headers: key }),
  seal:   (p:any) => api.post("/seal",  p, { headers: key }),
  ledger: (d:string)=> api.get(`/ledger/${d}`),
  verify: (d:string)=> api.get(`/verify/${d}`),
  index:  () => api.get("/index"),
};

const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, '') || 'http://127.0.0.1:8000';

export async function getXP() {
  const r = await fetch(`${BASE}/gic/total`, { cache: 'no-store' });
  if (!r.ok) return { total: 0 };
  return r.json();
}

export async function logReflection(payload: { note: string; chamber?: string }) {
  const r = await fetch(`${BASE}/sweep`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'sweep',
      chamber: payload.chamber || 'Lab4',
      note: payload.note,
      meta: {}
    })
  });
  return r.json();
}
