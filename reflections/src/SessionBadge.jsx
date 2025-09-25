// src/SessionBadge.jsx
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://hive-api-2le8.onrender.com";

export default function SessionBadge() {
  const [admin, setAdmin] = useState(null);
  const [left, setLeft] = useState(null); // seconds

  async function fetchStatus() {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    const res = await fetch(`${API_BASE}/admin/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.ok) {
      setAdmin(data.admin);
      setLeft(data.expires_in_seconds);
    } else {
      setAdmin(null);
      setLeft(null);
    }
  }

  useEffect(() => {
    fetchStatus();
    const tick = setInterval(() => {
      setLeft((s) => (typeof s === "number" ? Math.max(0, s - 1) : s));
    }, 1000);
    const poll = setInterval(fetchStatus, 30_000); // refresh every 30s
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  if (!admin) return null;

  const mins = Math.floor((left ?? 0) / 60);
  const secs = (left ?? 0) % 60;

  return (
    <div className="fixed top-3 right-3 z-50 bg-black/80 text-white text-xs px-3 py-2 rounded shadow">
      <div className="font-medium">🔒 {admin}</div>
      <div className="opacity-80">{mins}:{secs.toString().padStart(2, "0")} left</div>
    </div>
  );
}
