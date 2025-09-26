// src/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://hive-api-2le8.onrender.com";

// simple wrapper
export async function getReflections() {
  const res = await axios.get(`${API_BASE}/reflections`);
  return res.data;
}

export async function memoryAppend(events) {
  const res = await api.post("/memory/append", { events });
  return res.data;
}
export async function memorySummarize() {
  const res = await api.post("/memory/summarize");
  return res.data;
}

export async function postReflection(content) {
  const res = await axios.post(`${API_BASE}/reflections`, { content });
  return res.data;
}

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://hive-api-2le8.onrender.com";

function getToken() {
  return localStorage.getItem("admin_token");
}

export function clearToken() {
  localStorage.removeItem("admin_token");
}

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- reflections ---
export async function getReflections() {
  const res = await api.get("/reflections");
  return res.data;
}
export async function postReflection(content) {
  const res = await api.post("/reflections", { content });
  return res.data;
}

// --- civic auth ---
export async function refreshToken() {
  const token = getToken();
  if (!token) return null;
  const res = await api.post("/auth/refresh", null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.setItem("admin_token", res.data.token);
  return res.data;
}

export async function logoutHard() {
  const token = getToken();
  if (!token) return;
  await api.post("/admin/logout", null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  clearToken();
}

export async function logoutSoft() {
  const token = getToken();
  if (!token) return;
  await api.post("/admin/logout/soft", null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  clearToken();
}

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://hive-api-2le8.onrender.com";

// Get token from localStorage
function getToken() {
  return localStorage.getItem("admin_token");
}

// Axios instance with optional auth
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getReflections() {
  const res = await api.get("/reflections");
  return res.data;
}

export async function postReflection(content) {
  const res = await api.post("/reflections", { content });
  return res.data;
}

// --- Civic auth endpoints ---
export async function registerApp(appId) {
  const res = await api.post("/auth/register_app", { app_id: appId });
  return res.data; // {app_id, secret}
}

export async function issueToken(appId, nonce, signature) {
  const res = await api.post("/auth/issue_token", {
    app_id: appId,
    nonce,
    signature,
  });
  return res.data; // {token, exp}
}

export async function introspectToken(token) {
  const res = await api.post("/auth/introspect", null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getCompanion() {
  const res = await api.get("/companions");
  return res.data;
}

export async function companionRespond() {
  const res = await api.post("/companions/respond");
  return res.data;
}

// Memory
export async function memoryAppend(events) {
  const res = await api.post("/memory/append", { events });
  return res.data;
}

export async function memoryGet() {
  const res = await api.get("/memory");
  return res.data;
}

export async function memorySummarize() {
  const res = await api.post("/memory/summarize");
  return res.data;
}

// Companions
export async function getCompanion() {
  const res = await api.get("/companions");
  return res.data;
}

export async function createCompanion(body) {
  const res = await api.post("/companions", body);
  return res.data;
}

export async function companionRespond() {
  const res = await api.post("/companions/respond");
  return res.data;
}
