"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { logReflection } from "../lib/api";

type ApiResult = {
  status?: string;
  message?: string;
  gic_awarded?: number;
  xp_total?: number;
  error?: string;
};

export default function Page() {
  const [text, setText] = useState("");
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  const today = dayjs().format("YYYY-MM-DD");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setBusy(true);
    setResult(null);
    try {
      const payload = {
        date: today,
        text,
        publish,            // false = private, true = public (higher GIC in future)
        channel: "reflections",
        meta: { client: "web", v: 1 },
      };

      const res = await logReflection(payload);
      setResult(res);
      setText("");
    } catch (err: any) {
      setResult({ error: err?.message ?? "Failed to log reflection" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b0b0f", color: "#eaeaea" }}>
      <div style={{ maxWidth: 680, margin: "40px auto", padding: 16 }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>Reflections</h1>
        <p style={{ opacity: 0.8, marginBottom: 24 }}>
          Log your thoughts. Earn GIC. Seal your day. <span style={{ opacity: 0.6 }}>( {today} )</span>
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How are you feeling today? What did you learn?"
            rows={6}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              background: "#12121a",
              border: "1px solid #1f2030",
              color: "inherit",
              resize: "vertical",
            }}
          />

          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
            />
            <span>Publish this entry (earn a bonus when public sharing is enabled)</span>
          </label>

          <button
            type="submit"
            disabled={busy || !text.trim()}
            style={{
              height: 48,
              borderRadius: 10,
              border: "none",
              background: busy ? "#2a8f47" : "#36c56b",
              color: "#0b0b0f",
              fontWeight: 700,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {busy ? "Logging..." : "Log Reflection"}
          </button>
        </form>

        <div style={{ marginTop: 20 }}>
          {result?.error && (
            <div style={{ padding: 12, borderRadius: 8, background: "#2a1120", border: "1px solid #5b1a2c" }}>
              Error: {result.error}
            </div>
          )}

          {result && !result.error && (
            <div style={{ padding: 12, borderRadius: 8, background: "#11221a", border: "1px solid #1f3b2b" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {result.status ?? "Logged"}
              </div>
              {result.message && <div style={{ opacity: 0.85 }}>{result.message}</div>}
              <div style={{ marginTop: 8, opacity: 0.8 }}>
                GIC Awarded: <b>{result.gic_awarded ?? 0}</b>{' '}
                {typeof result.xp_total === "number" && (
                  <> · Total XP: <b>{result.xp_total}</b></>
                )}
              </div>
            </div>
          )}
        </div>

        <p style={{ marginTop: 24, opacity: 0.6, fontSize: 13 }}>
          API base: <code>{process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000"}</code>
        </p>
      </div>
    </main>
  );
}
