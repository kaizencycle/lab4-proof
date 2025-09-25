"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [civicId, setCivicId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ civic_id: civicId, password })
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      const token = data.token;

      // Store in localStorage (for simplicity here)
      localStorage.setItem("civic_token", token);
      localStorage.setItem("civic_id", civicId);

      // Redirect to reflections page
      router.push("/reflections");
    } catch (err) {
      setError("⚠️ Invalid credentials, please try again.");
    }
  }

  return (
    <main style={{ maxWidth: "400px", margin: "4rem auto" }}>
      <h1>🔑 Civic Login</h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Civic ID"
          value={civicId}
          onChange={(e) => setCivicId(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <style jsx>{`
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        input, button {
          padding: 0.75rem;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        button {
          background: #0066cc;
          color: white;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}
