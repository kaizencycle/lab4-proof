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
      <div className="meta">
        <span className="name">{post.user}</span>
        <span className="time">· {when}</span>
        {post.archetype && <span className="tag">{post.archetype}</span>}
      </div>
      <div style={{marginTop:6, lineHeight:1.5}}>{post.text}</div>
      {post.lesson && (
        <div className="panel" style={{marginTop:8}}>
          <div className="mini" style={{marginBottom:6}}>Apprentice Lesson</div>
          <div><strong>Topic:</strong> {post.lesson.topic}</div>
          <div style={{marginTop:6}}><strong>Question:</strong> {post.lesson.question}</div>
          <div className="mini" style={{marginTop:6}}><em>Challenge:</em> {post.lesson.challenge}</div>
        </div>
      )}
      {echoes.length>0 && (
        <div className="panel" style={{marginTop:8}}>
          <div className="mini" style={{marginBottom:6}}>OAA Echoes</div>
          {echoes.map((e:any, i:number)=>(
            <div key={i} style={{marginTop:6}}>
              <div className="mini">{new Date(e.ts || Date.now()).toLocaleString()}</div>
              <div>{e?.content?.text || "(echo)"}</div>
            </div>
          ))}
        </div>
      )}
      <div className="reactions">
        <button className="btn" onClick={()=>setAgree(x=>x+1)}>💡 Agree {agree?`(${agree})`:""}</button>
        <button className="btn" onClick={()=>setInsight(x=>x+1)}>✨ Insight {insight?`(${insight})`:""}</button>
        <button className="btn" onClick={()=>alert("Threading coming soon")}>🪞 Reflect</button>
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