'use client';  
  
import { useState } from 'react';  
  
type Props = { onSubmit: (note: string) => Promise<void> };  
  
export default function LogForm({ onSubmit }: Props) {  
  const [note, setNote] = useState<string>('');  
  const [busy, setBusy] = useState<boolean>(false);  
  
  async function submit(e: React.FormEvent<HTMLFormElement>) {  
    e.preventDefault();  
    const trimmed = note.trim();  
    if (!trimmed) return;  
    try {  
      setBusy(true);  
      await onSubmit(trimmed);  
      setNote('');  
    } finally {  
      setBusy(false);  
    }  
  }  
  
import DemoBadge from '../components/DemoBadge'; // ⬅️ add this import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DemoBadge />   {/* ⬅️ add this line */}
        {children}
      </body>
    </html>
  );
}
  
  return (  
    <form onSubmit={submit} style={{  
      background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16  
    }}>  
      <label style={{ display: 'block', marginBottom: 8, opacity: 0.8 }}>  
        Daily Reflection  
      </label>  
  
      <textarea  
        value={note}  
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}  
        rows={4}  
        placeholder="What did today teach you?"  
        style={{  
          width: '100%', background: '#080b0e', color: '#eeeeea',  
          border: '1px solid #333', borderRadius: 8, padding: 10, outline: 'none'  
        }}  
      />  
  
      <button  
        disabled={busy}  
        style={{  
          marginTop: 12, width: '100%', padding: '12px 16px', borderRadius: 10,  
          background: busy ? '#2a2a2a' : '#36d47c', color: '#080b0e',  
          fontWeight: 700, border: 'none', cursor: busy ? 'default' : 'pointer'  
        }}  
      >  
        {busy ? 'Logging…' : 'Log Reflection'}  
      </button>  
    </form>  
  );  
}  
