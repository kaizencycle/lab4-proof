const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000").replace(/\/+$/, "");

export async function logReflection(data: { note: string; publish: boolean }) {
  const res = await fetch(`${API_BASE}/reflect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${t || res.statusText}`);
  }
  return res.json();
}
