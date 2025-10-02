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
  // read unlocked list from localStorage (MVP persistence)
  useEffect(() => {
    if (!handle) return;
    const raw = localStorage.getItem(STORAGE_KEY(handle));
    setUnlocked(raw ? JSON.parse(raw) : ["jade"]); // Jade is default unlocked
  }, [handle]);
  useEffect(() => {
    if (!handle || !unlocked) return;
    localStorage.setItem(STORAGE_KEY(handle), JSON.stringify(unlocked));
  }, [handle, unlocked]);

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
    setUnlocked(list => [...list, key]);
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
