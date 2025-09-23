const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function logReflection(data: any) {
  const res = await fetch(`${API_BASE}/reflections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store", // prevent Render caching issues
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}
