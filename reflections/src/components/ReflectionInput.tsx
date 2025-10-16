"use client";
import { useState } from "react";

export default function ReflectionInput({ placeholder, onSubmit, busy }:{
  placeholder:string; onSubmit:(text:string, apprentice:boolean)=>void; busy?:boolean;
}){
  const [text,setText]=useState("");
  const [apprentice,setApprentice]=useState(true);
  return (
    <div className="reflection-input-container">
      <div className="input-header">
        <h3>Share Your Reflection</h3>
        <p className="mini">What insights did you gain today?</p>
      </div>
      <textarea 
        className="input" 
        value={text} 
        onChange={e=>setText(e.target.value)} 
        placeholder={placeholder}
        maxLength={1000}
      />
      <div className="input-footer">
        <div className="input-actions">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={apprentice} 
              onChange={e=>setApprentice(e.target.checked)}
              className="checkbox-input"
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-text">Apprentice Mode (OAA)</span>
          </label>
          <div className="char-count">{text.length}/1000</div>
        </div>
        <button 
          className="btn primary" 
          disabled={busy||!text.trim()} 
          onClick={()=>{ onSubmit(text, apprentice); setText(""); }}
        >
          {busy? (
            <>
              <div className="spinner"></div>
              Reflecting…
            </>
          ) : (
            <>
              ✨ Reflect
            </>
          )}
        </button>
      </div>
    </div>
  );
}