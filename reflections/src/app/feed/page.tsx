"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import "@/app/styles/reflections.css";
import ReflectionInput from "@/components/ReflectionInput";
import ReflectionPost, { Reflection } from "@/components/ReflectionPost";

export default function FeedPage(){
  const [handle,setHandle]=useState<string>("");
  const [gic,setGic]=useState<number>(0);
  const [feed,setFeed]=useState<Reflection[]>([]);
  const [busy,setBusy]=useState(false);

  useEffect(()=>{ (async()=>{
    const me = await fetch("/api/me").then(r=>r.ok?r.json():{}) as { handle?: string };
    if (me?.handle){ setHandle(me.handle); }
    // initial balances (if configured)
    if (process.env.NEXT_PUBLIC_GIC_INDEXER_URL && me?.handle) {
      try{
        const r = await fetch(`${process.env.NEXT_PUBLIC_GIC_INDEXER_URL}/balances/${me.handle}`, { cache:"no-store" });
        if (r.ok){ const j = await r.json(); setGic(j?.total_gic||0); }
      }catch{}
    }
  })(); },[]);

  async function loadFeed(){
    try{
      const r = await fetch("/api/reflections/list", { cache:"no-store" });
      if (r.ok){ const j = await r.json(); setFeed(j.items||[]); }
    }catch{}
  }
  useEffect(()=>{ loadFeed(); const t=setInterval(loadFeed, 15000); return ()=>clearInterval(t); },[]);

  async function onPost(text:string, apprentice:boolean){
    if (!text.trim()) return;
    setBusy(true);
    const r = await fetch("/api/reflections/post", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ user: handle||"guest", text, apprentice })
    });
    setBusy(false);
    if (!r.ok){ const j = await r.json().catch(()=>({error:"post failed"})); alert(j.error||"Post failed"); return; }
    await loadFeed();
  }

  return (
    <>
      <header className="fb-header">
        <div className="inner">
          <div className="brand">
            <div className="brand-icon">
              <Image src="/sigil.svg" alt="Concord Sigil" width={28} height={28} />
            </div>
            <div className="brand-text">
              <span className="brand-title">Reflections</span>
              <span className="brand-subtitle">AI Learning Community</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="balance-pill">
              <span className="balance-icon">🪙</span>
              <span className="balance-amount">{gic.toFixed(2)} GIC</span>
            </div>
            <div className="nav-pills">
              <Link href="/companion" className="pill">
                <span className="pill-icon">🤝</span>
                <span>Companion</span>
              </Link>
              <Link href="/forest" className="pill">
                <span className="pill-icon">🌳</span>
                <span>Forest</span>
              </Link>
              <Link href="/programs" className="pill">
                <span className="pill-icon">✨</span>
                <span>Programs</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="fb-shell">
        <aside className="panel col user-panel">
          <div className="user-card">
            <div className="user-avatar-large">
              <Image src="/sigil.svg" alt="" width={40} height={40}/>
            </div>
            <div className="user-info">
              <div className="user-name">{handle || "Guest"}</div>
              <div className="user-balance">🪙 {gic.toFixed(2)} GIC</div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="panel-section">
            <h4>Archetype Wheel</h4>
            <p className="mini">Discover your learning archetype in the Companion</p>
            <Link href="/companion" className="btn primary">
              <span>Open Companion</span>
              <span>→</span>
            </Link>
          </div>
        </aside>

        <section className="col main-feed">
          <div className="feed-header">
            <h2>Community Reflections</h2>
            <p className="feed-subtitle">Share your insights and learn from others in our AI-powered learning community</p>
            <div className="feed-stats">
              <span className="stat-item">📊 {feed.length} Reflections</span>
              <span className="stat-item">👥 Active Community</span>
              <span className="stat-item">🚀 AI-Powered</span>
            </div>
          </div>
          <div className="panel">
            <ReflectionInput placeholder="What did you learn today?" onSubmit={onPost} busy={busy}/>
          </div>
          <div className="panel feed">
            {feed.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✨</div>
                <h3>No reflections yet</h3>
                <p>Be the first to share your insights with the community</p>
              </div>
            ) : (
              feed.map(p => <ReflectionPost key={p.id} post={p} />)
            )}
          </div>
        </section>

        <aside className="panel rightcard insights-panel">
          <div className="insights-header">
            <h3>Community Insights</h3>
            <p className="mini">How to engage with reflections</p>
          </div>
          <div className="insights-badges">
            <div className="insight-badge">
              <span className="badge-icon">✨</span>
              <div className="badge-content">
                <div className="badge-title">Insight</div>
                <div className="badge-desc">+1 XP</div>
              </div>
            </div>
            <div className="insight-badge">
              <span className="badge-icon">💡</span>
              <div className="badge-content">
                <div className="badge-title">Agree</div>
                <div className="badge-desc">+morale</div>
              </div>
            </div>
            <div className="insight-badge">
              <span className="badge-icon">🪞</span>
              <div className="badge-content">
                <div className="badge-title">Reflect</div>
                <div className="badge-desc">start thread</div>
              </div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="programs-info">
            <h4>Active Programs</h4>
            <p className="mini">Shards (heroes), Healing (sages), Meditation (monks) are active now. Check out <Link href="/programs">Programs</Link> for more.</p>
          </div>
        </aside>
      </main>
    </>
  );
}