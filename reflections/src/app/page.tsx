"use client";

import { useState } from "react";
import LogForm from "./components/LogForm";

export default function Page() {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(note: string, publish: boolean): Promise<void> {
    try {
      setStatus("Submitting...");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/reflect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note, publish }),
        });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setStatus(`success — GIC Awarded: ${data.gic_awarded ?? 0}`);
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Welcome to Agora!</h1>
      <LogForm onSubmit={handleSubmit} />
      {status && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 6,
            background: status.startsWith("success") ? "#0c2a17" : "#2a0c0c",
            color: status.startsWith("success") ? "#00ffaa" : "#ff6a6a",
          }}
        >
          {status}
        </div>
      )}
    </main>
  );
}
