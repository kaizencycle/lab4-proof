"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Login() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const next = useSearchParams().get("next") || "/companion";
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });
    setLoading(false);
    if (r.ok) router.replace(next);
    else alert((await r.json()).error || "Login failed");
  }

  return (
    <section className="container">
      <h1 className="title">Sign in to Reflections</h1>
      <form className="card" onSubmit={submit}>
        <label>Choose a handle</label>
        <input className="field" value={handle} onChange={e=>setHandle(e.target.value)} placeholder="e.g. mika" />
        <small className="muted">This identifies you in the civic ledger.</small>
        <button className="btn primary" disabled={loading || handle.length < 3}>
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>
    </section>
  );
}
