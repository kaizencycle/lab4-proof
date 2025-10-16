"use client";
import { useEffect, useState } from "react";

export default function SidebarStatus(){
  const [handle, setHandle] = useState<string>("");
  const [gic, setGic] = useState<number>(0);
  const [trees, setTrees] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/me"); const j = r.ok ? await r.json() : {};
      if (j?.handle) setHandle(j.handle);
    })();
  }, []);

  useEffect(() => {
    if (!handle) return;
    const es = new EventSource(`/api/stream?handle=${encodeURIComponent(handle)}`);
    es.onmessage = (e) => {
      try {
        const m = JSON.parse(e.data);
        if (m?.type === "state") {
          if (m.balance?.total_gic != null) setGic(m.balance.total_gic);
          if (m.forest?.trees != null) setTrees(m.forest.trees);
        }
      } catch {}
    };
    return () => es.close();
  }, [handle]);

  const canConsensus = gic >= 100;
  const p10 = Math.min(100, (gic/10)*100);
  const p100 = Math.min(100, (gic/100)*100);

  return (
    <div className="sb-status">
      <div className="status-header">
        <h4>Status</h4>
      </div>
      
      <div className="status-section">
        <div className="status-item">
          <div className="status-icon">👤</div>
          <div className="status-content">
            <div className="status-label">User</div>
            <div className="status-value">{handle || "guest"}</div>
          </div>
        </div>
        
        <div className="status-item">
          <div className="status-icon">🪙</div>
          <div className="status-content">
            <div className="status-label">GIC Balance</div>
            <div className="status-value">{gic.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-item">
          <div className="progress-header">
            <span className="progress-label">Companion Progress</span>
            <span className="progress-percentage">{Math.round(p10)}%</span>
          </div>
          <div className="prog">
            <div className="bar" style={{width:`${p10}%`}} />
          </div>
          <small className="progress-hint">Next companion at 10 GIC</small>
        </div>

        <div className="progress-item">
          <div className="progress-header">
            <span className="progress-label">Consensus Progress</span>
            <span className="progress-percentage">{Math.round(p100)}%</span>
          </div>
          <div className="prog">
            <div className="bar" style={{width:`${p100}%`}} />
          </div>
          <small className="progress-hint">Consensus at 100 GIC</small>
        </div>
      </div>

      <div className="status-actions">
        <a className="tag" href="/forest" title="Go to Forest">
          🌳 {trees.toFixed(1)} months
        </a>
        {canConsensus && (
          <a className="btn tiny" href="/consensus" title="Enter Consensus">
            Enter Consensus
          </a>
        )}
      </div>
    </div>
  );
}
