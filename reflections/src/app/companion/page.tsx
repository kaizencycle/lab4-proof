"use client";
import { useState, useEffect } from "react";
import { COMPANIONS } from "@/lib/companions";
import ChamberDrawer from "@/components/ChamberDrawer";
import CompanionStore from "@/components/CompanionStore";
import { useRouter } from "next/navigation";

export default function CompanionPage() {
  const [user, setUser] = useState("");
  const [companion, setCompanion] = useState<keyof typeof COMPANIONS>("jade");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [forest, setForest] = useState<any>({ trees: 0, staked_gic: 0 });
  const [forestMonth, setForestMonth] = useState<{trees:number, ym:string} | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  async function loadBalance(handle: string) {
    if (!process.env.NEXT_PUBLIC_GIC_INDEXER_URL || !handle) return;
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_GIC_INDEXER_URL}/balances/${handle}`, { cache: "no-store" });
      if (r.ok) setBalance(await r.json());
    } catch {}
  }
  async function loadForest(handle: string) {
    if (!process.env.NEXT_PUBLIC_GIC_INDEXER_URL || !handle) return;
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_GIC_INDEXER_URL}/forest/user/${handle}`, { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        setForest({ trees: data.trees || 0, staked_gic: data.staked_gic || 0 });
      }
    } catch {}
  }
  async function loadForestMonth(handle: string){
    if (!process.env.NEXT_PUBLIC_GIC_INDEXER_URL || !handle) return;
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const since = new Date(now.getFullYear(), now.getMonth(), 1, 0,0,0).toISOString();
    const until = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59).toISOString();
    try {
      const qs = `?since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}`;
      const r = await fetch(`${process.env.NEXT_PUBLIC_GIC_INDEXER_URL}/forest/user/${handle}${qs}`, { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        setForestMonth({ trees: j.trees || 0, ym });
      }
    } catch {}
  }
  useEffect(() => { if (user) { loadBalance(user); loadForest(user); loadForestMonth(user); } }, [user]);

  // fetch handle from session (server sets cookie)
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/me", { cache: "no-store" }).catch(() => null);
      const j = r && r.ok ? await r.json() : null;
      if (j?.handle) setUser(j.handle);
      setLoadingUser(false);
    })();
  }, []);

  // Live updates via SSE
  useEffect(() => {
    if (!user) return;
    const es = new EventSource(`/api/stream?handle=${encodeURIComponent(user)}`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "state") {
          if (msg.balance) setBalance(msg.balance);
          if (msg.forest) setForest({ trees: msg.forest.trees || 0, staked_gic: msg.forest.staked_gic || 0 });
        }
      } catch {}
    };
    return () => es.close();
  }, [user]);

  async function send() {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", content: text }]);
    const body = { user, text, companion };
    setText("");
    const r = await fetch("/api/reflect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json();
    if (data.reply) setMessages(m => [...m, { role: "assistant", content: `${COMPANIONS[companion].icon} ${data.reply}\n\n(+${data.xpGranted} XP)` }]);
    if (data.error) setMessages(m => [...m, { role: "assistant", content: `⚠️ ${data.error}` }]);
    loadBalance(user);
  }

  // server-truth unlocks
  const [unlocked, setUnlocked] = useState<string[]>(["jade"]);
  useEffect(() => {
    if (!user || !process.env.NEXT_PUBLIC_GIC_INDEXER_URL) return;
    (async () => {
      try {
        const u = await fetch(`${process.env.NEXT_PUBLIC_GIC_INDEXER_URL}/unlocks/${user}`, { cache: "no-store" });
        if (u.ok) {
          const j = await u.json();
          const list = Array.isArray(j.unlocked) ? j.unlocked : ["jade"];
          setUnlocked(list);
          if (!list.includes(companion)) setCompanion(list[0] as any);
        }
      } catch {}
    })();
  }, [user]);

  return (
    <div className="grid-shell">
      {/* Single-chamber drawer */}
      <ChamberDrawer title={`Reflections: ${COMPANIONS[companion].name}`}>
        <div className="stack">
          {Object.entries(COMPANIONS)
            .filter(([k]) => unlocked.includes(k))
            .map(([k, c]) => (
            <button
              key={k}
              onClick={() => setCompanion(k as any)}
              className={companion === k ? "btn sel wfull" : "btn wfull"}
              aria-pressed={companion === k}
            >
              <span className="mr">{c.icon}</span>
              {c.name}
            </button>
          ))}
          <hr className="sep" />
          <CompanionStore
            handle={user}
            balance={balance?.total_gic ?? 0}
            onUnlocked={(k) => setUnlocked(u => Array.from(new Set([...u, k])))}
            cost={10}
          />
        </div>
      </ChamberDrawer>

      <main className="chat">
        <div className="chat-head">
          <div className="comp-title">
            <span className="mr">{COMPANIONS[companion].icon}</span>
            <strong>{COMPANIONS[companion].name}</strong>
          </div>
          <div className="user">
            <input value={user} readOnly className="readonly" />
            {balance && <span className="badge">GIC {balance.total_gic.toFixed(3)}</span>}
            {forestMonth && (
              <a
                className="badge"
                href={`/forest?mode=month&period=${encodeURIComponent(forestMonth.ym)}`}
                title={`This month: ~${forestMonth.trees.toFixed(1)} trees`}
              >
                🌳 {forestMonth.trees.toFixed(1)} (mo)
              </a>
            )}
            {balance?.total_gic >= 100 && (
              <a className="btn" href="/consensus" style={{marginLeft:8}}>Enter Consensus</a>
            )}
          </div>
        </div>

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={m.role==="user" ? "bubble mine" : "bubble"}>{m.content}</div>
          ))}
        </div>

        <div className="composer">
          <textarea rows={2} value={text} onChange={e=>setText(e.target.value)} placeholder="What did today teach you?" />
          <button onClick={send} className="btn primary">Send</button>
        </div>
      </main>
    </div>
  );
}
