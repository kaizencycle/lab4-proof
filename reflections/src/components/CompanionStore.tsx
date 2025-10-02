"use client";
import { useEffect, useMemo, useState } from "react";
import { COMPANIONS } from "@/lib/companions";

type Props = {
  handle: string;
  balance: number;       // total_gic
  onUnlocked?: (key: string) => void;
  cost?: number;         // default 10 GIC per unlock
};

const STORAGE_KEY = (h: string) => `unlocked:${h}`;

export default function CompanionStore({ handle, balance, onUnlocked, cost = 10 }: Props) {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  // server-truth unlocks from GIC Indexer
  useEffect(() => {
    if (!handle || !process.env.NEXT_PUBLIC_GIC_INDEXER_URL) return;
    (async () => {
      try {
        const u = await fetch(`${process.env.NEXT_PUBLIC_GIC_INDEXER_URL}/unlocks/${handle}`, { cache: "no-store" });
        if (u.ok) {
          const j = await u.json();
          const list = Array.isArray(j.unlocked) ? j.unlocked : ["jade"];
          setUnlocked(list);
        }
      } catch {}
    })();
  }, [handle]);

  const available = useMemo(() => Object.keys(COMPANIONS).filter(k => !unlocked.includes(k)), [unlocked]);
  const canBuy = balance >= cost;

  async function unlock(key: string) {
    if (!canBuy) return alert("Earn more GIC to unlock.");
    const r = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: handle, companion: key, costGIC: cost })
    });
    if (!r.ok) {
      const err = await r.json().catch(()=>({error:"unlock failed"}));
      return alert(`⚠️ ${err.error || "Unlock failed"}`);
    }
    // Refresh server-truth unlocks
    if (process.env.NEXT_PUBLIC_GIC_INDEXER_URL) {
      try {
        const u = await fetch(`${process.env.NEXT_PUBLIC_GIC_INDEXER_URL}/unlocks/${handle}`, { cache: "no-store" });
        if (u.ok) {
          const j = await u.json();
          const list = Array.isArray(j.unlocked) ? j.unlocked : ["jade"];
          setUnlocked(list);
        }
      } catch {}
    }
    onUnlocked?.(key);
    alert(`🎉 Unlocked ${COMPANIONS[key as keyof typeof COMPANIONS].name}!`);
  }

  return (
    <div className="card mini">
      <div className="row" style={{justifyContent:"space-between"}}>
        <strong>Companion Store</strong>
        <span className="badge">{balance.toFixed(2)} GIC</span>
      </div>
      <small className="muted">Unlock any companion for <b>{cost} GIC</b>.</small>
      <div className="stack" style={{marginTop:8}}>
        {available.length === 0 && <div className="muted">All companions unlocked 🎯</div>}
        {available.map(k => {
          const c = COMPANIONS[k as keyof typeof COMPANIONS];
          return (
            <button key={k}
              onClick={() => unlock(k)}
              className={`btn wfull ${canBuy ? "primary" : ""}`}
              disabled={!canBuy}
            >
              <span className="mr">{c.icon}</span>
              Unlock {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
