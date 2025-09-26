import ChatBox from "../../components/ChatBox";

export default function ReflectionsPage() {
  // In a real app, civicId + token would come from login/session
  const civicId = "demo-user-001";
  const token = "replace-with-auth-token";
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

  if (!civicId || !token) return <p>Loading…</p>;

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h1>🪞 Reflections</h1>
      <ChatBox civicId={civicId} token={token} companion="jade" />
    </main>
  );
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
