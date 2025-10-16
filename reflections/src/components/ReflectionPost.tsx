"use client";
import { useEffect, useState } from "react";

export type Reflection = {
  id: string;
  user: string;
  text: string;
  ts: number;           // epoch ms
  archetype?: string;   // dominant tag, optional
  lesson?: { topic: string; question: string; challenge: string } | null;
  traceId?: string | null;
};

export default function ReflectionPost({ post }:{ post:Reflection }){
  const [agree,setAgree]=useState(0);
  const [insight,setInsight]=useState(0);
  const [echoes,setEchoes]=useState<any[]>([]);
  const dt = new Date(post.ts);
  const when = timeAgo(dt);

  useEffect(()=> {
    if (!post.traceId) return;
    let stop=false;
    async function pull(){
      try{
        const r = await fetch(`/api/oaa/echo/since?traceId=${encodeURIComponent(post.traceId!)}`, { cache:"no-store" });
        if (r.ok){
          const j = await r.json();
          if (!stop) setEchoes(j.items||[]);
        }
      }catch{}
    }
    pull();
    const t = setInterval(pull, 20000);
    return ()=>{ stop=true; clearInterval(t); };
  }, [post.traceId]);

  return (
    <article className="post">
      <div className="post-header">
        <div className="user-info">
          <div className="user-avatar">
            <span>{post.user.charAt(0).toUpperCase()}</span>
          </div>
          <div className="user-details">
            <span className="name">{post.user}</span>
            <span className="time">{when}</span>
          </div>
        </div>
        {post.archetype && (
          <div className="archetype-badge">
            <span className="tag">{post.archetype}</span>
          </div>
        )}
      </div>
      
      <div className="post-content">
        <p>{post.text}</p>
      </div>

      {post.lesson && (
        <div className="lesson-card">
          <div className="lesson-header">
            <span className="lesson-icon">🎓</span>
            <span className="lesson-title">Apprentice Lesson</span>
          </div>
          <div className="lesson-content">
            <div className="lesson-item">
              <strong>Topic:</strong> {post.lesson.topic}
            </div>
            <div className="lesson-item">
              <strong>Question:</strong> {post.lesson.question}
            </div>
            <div className="lesson-challenge">
              <em>Challenge:</em> {post.lesson.challenge}
            </div>
          </div>
        </div>
      )}

      {echoes.length>0 && (
        <div className="echoes-card">
          <div className="echoes-header">
            <span className="echoes-icon">🔄</span>
            <span className="echoes-title">OAA Echoes</span>
          </div>
          <div className="echoes-content">
            {echoes.map((e:any, i:number)=>(
              <div key={i} className="echo-item">
                <div className="echo-time">{new Date(e.ts || Date.now()).toLocaleString()}</div>
                <div className="echo-text">{e?.content?.text || "(echo)"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="reactions">
        <button className="reaction-btn" onClick={()=>setAgree(x=>x+1)}>
          <span className="reaction-icon">💡</span>
          <span className="reaction-text">Agree</span>
          {agree > 0 && <span className="reaction-count">({agree})</span>}
        </button>
        <button className="reaction-btn" onClick={()=>setInsight(x=>x+1)}>
          <span className="reaction-icon">✨</span>
          <span className="reaction-text">Insight</span>
          {insight > 0 && <span className="reaction-count">({insight})</span>}
        </button>
        <button className="reaction-btn" onClick={()=>alert("Threading coming soon")}>
          <span className="reaction-icon">🪞</span>
          <span className="reaction-text">Reflect</span>
        </button>
      </div>
    </article>
  );
}
function timeAgo(d:Date){
  const s = Math.floor((Date.now()-d.getTime())/1000);
  if (s<60) return `${s}s`;
  const m = Math.floor(s/60); if (m<60) return `${m}m`;
  const h = Math.floor(m/60); if (h<24) return `${h}h`;
  const dd = Math.floor(h/24); return `${dd}d`;
}