import { useState } from 'react';

export default function LogForm({ onSubmit }: { onSubmit: (note: string) => Promise<void> }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setBusy(true);
    await onSubmit(note.trim());
    setNote('');
    setBusy(false);
  }

  return (
    <form onSubmit={submit} style={{
      background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16
    }}>
      <label style={{ display: 'block', marginBottom: 8, opacity: 0.8 }}>Daily Reflection</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="What did today teach you?"
        style={{
          width: '100%', background: '#0b0b0b', color: '#eaeaea',
          border: '1px solid #333', borderRadius: 8, padding: 10, outline: 'none'
        }}
      />
      <button
        disabled={busy}
        style={{
          marginTop: 12, width: '100%', padding: '12px 16px', borderRadius: 10,
          background: busy ? '#2a2a2a' : '#36d475', color: '#0b0b0b',
          fontWeight: 700, border: 'none', cursor: busy ? 'default' : 'pointer'
        }}
      >
        {busy ? 'Logging…' : 'Log Reflection'}
      </button>
    </form>
  );
}

```
