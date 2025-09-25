"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

type Agent = {
  companion_id: string;
  name: string;
  archetype?: string;
  user_id: string;
  reflections: number;
  gic: number;
  since_last: string;
};

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [ok, setOk] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      const [m, a] = await Promise.all([
        adminFetch("/admin/metrics", token),
        adminFetch("/admin/agents", token),
      ]);
      setMetrics(m);
      setAgents(a.agents);
      setOk(true);
    } catch (e: any) {
      setErr(e.message || "Auth failed");
      setOk(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("ADMIN_TOKEN");
    if (saved) setToken(saved);
  }, []);

  // Fixed SSE useEffect
  useEffect(() => {
    if (!ok) return;

    // Build stream URL (proxy recommended for header tokens; see below)
    // Direct to API with token in query for simplicity:
    const base = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
    const url = `${base}/admin/agents/stream?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);

    es.addEventListener("hello", (e) => {
      // optional: console.log("SSE hello", e.data);
    });

    es.addEventListener("snapshot", (e: MessageEvent) => {
      try {
        const { agents: a, totals } = JSON.parse(e.data);
        setAgents(a);
        setMetrics({ totals });
      } catch {}
    });

    es.addEventListener("error", (e: MessageEvent) => {
      // backend emits "error" event with JSON body
      try {
        const payload = JSON.parse(e.data);
        setErr(payload.error || "stream error");
      } catch {
        setErr("stream error");
      }
    });

    es.onerror = () => {
      setErr("connection lost, retrying…");
    };

    // Cleanup function
    return () => {
      es.close();
    };
  }, [ok, token]);

  function onSetToken() {
    sessionStorage.setItem("ADMIN_TOKEN", token);
    load();
  }

  return (
    <main style={{maxWidth: 1080, margin: "32px auto", padding: 16}}>
      <h1>Founder Console</h1>

      {!ok && (
        <div style={{marginTop: 16, padding: 12, border: "1px solid #2a2a2a", borderRadius: 10}}>
          <p>Enter admin token</p>
          <input value={token} onChange={e=>setToken(e.target.value)} placeholder="••••••" style={{padding:8, width:"60%"}}/>
          <button onClick={onSetToken} style={{marginLeft:8, padding:"8px 12px"}}>Unlock</button>
          {err && <div style={{marginTop:8, color:"#ff6a6a"}}>{err}</div>}
        </div>
      )}

      {ok && (
        <>
          <MetricsBar metrics={metrics} onRefresh={load} />
          <NodeGraph agents={agents} />
          <AgentTable agents={agents} />
        </>
      )}
    </main>
  );
}

function MetricsBar({metrics, onRefresh}:{metrics:any, onRefresh:()=>void}) {
  if (!metrics) return null;
  const {totals} = metrics;
  return (
    <div style={{
      margin:"16px 0", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12
    }}>
      {["users","companions","reflections","gic"].map(k=>(
        <div key={k} style={{padding:12, border:"1px solid #2a2a2a", borderRadius:10}}>
          <div style={{opacity:0.7, fontSize:12}}>{k.toUpperCase()}</div>
          <div style={{fontSize:24, fontWeight:700}}>{totals[k]}</div>
        </div>
      ))}
      <button onClick={onRefresh} style={{gridColumn:"1 / -1", padding:"8px 12px"}}>Refresh</button>
    </div>
  );
}

function NodeGraph({agents}:{agents:Agent[]}) {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const nodes = useMemo(()=>{
    // simple radial layout
    const n = agents.length || 1;
    const R = 180;
    return agents.map((a, i)=>({
      ...a,
      x: 220 + R*Math.cos((i/n)*2*Math.PI),
      y: 220 + R*Math.sin((i/n)*2*Math.PI),
    }));
  }, [agents]);
  
  useEffect(()=>{
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const w = 440, h = 440;
    ctx.clearRect(0,0,w,h);

    // center nucleus (PAW)
    ctx.beginPath(); ctx.arc(w/2,h/2,18,0,Math.PI*2); ctx.fillStyle="#36d47c"; ctx.fill();

    // edges
    ctx.strokeStyle = "#2a2a2a";
    nodes.forEach(nd=>{
      ctx.beginPath();
      ctx.moveTo(w/2,h/2);
      ctx.lineTo(nd.x, nd.y);
      ctx.stroke();
    });

    // nodes
    nodes.forEach(nd=>{
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, 10 + Math.min(nd.reflections,40)/12, 0, Math.PI*2);
      ctx.fillStyle = archeColor(nd.archetype);
      ctx.fill}
