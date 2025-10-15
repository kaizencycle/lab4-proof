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
