// src/app/reflections/page.tsx
import ReflectionsPage from "../../components/ReflectionsPage";

export default function Page() {
  return <ReflectionsPage />;
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBox from "../../components/ChatBox";

export default function ReflectionsPage() {
  const router = useRouter();
  const [civicId, setCivicId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("civic_id");
    const tok = localStorage.getItem("civic_token");
    
    if (!id || !tok) {
      router.push("/login");
    } else {
      setCivicId(id);
      setToken(tok);
    }
  }, [router]);

  if (!civicId || !token) {
    return <p>Loading…</p>;
  }

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h1>🪞 Reflections</h1>
      <p className="intro">
        Write your thoughts, talk with your companion, and anchor them into memory + ledger.
      </p>
      <ChatBox civicId={civicId} token={token} companion="jade" />
    </main>
  );
}
