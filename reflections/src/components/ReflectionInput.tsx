"use client";
import { useState } from "react";

export default function ReflectionInput({ placeholder, onSubmit, busy }:{
  placeholder:string; onSubmit:(text:string, apprentice:boolean)=>void; busy?:boolean;
}){
  const [text,setText]=useState("");
  const [apprentice,setApprentice]=useState(true);
  return (
    <div>
      <textarea className="input" value={text} onChange={e=>setText(e.target.value)} placeholder={placeholder}/>
      <div className="row" style={{justifyContent:"space-between", marginTop:8}}>
        <label className="row mini">
          <input type="checkbox" checked={apprentice} onChange={e=>setApprentice(e.target.checked)} />
          <span>Apprentice Mode (OAA)</span>
        </label>
        <button className="btn primary" disabled={busy||!text.trim()} onClick={()=>{ onSubmit(text, apprentice); setText(""); }}>
          {busy? "Reflecting…" : "Reflect ✨"}
        </button>
      </div>
    </div>
  );
}