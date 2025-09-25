// src/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://hive-api-2le8.onrender.com";

// simple wrapper
export async function getReflections() {
  const res = await axios.get(`${API_BASE}/reflections`);
  return res.data;
}

export async function postReflection(content) {
  const res = await axios.post(`${API_BASE}/reflections`, { content });
  return res.data;
}
