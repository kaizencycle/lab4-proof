// reflections/src/components/ReflectionsPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ChatBox from './ChatBox';

// Adjust these import paths to match your repo layout.
// From your screenshots, api helpers live in `src/lib/api` and the hook in `src/useTokenRefresh.js`.
import {
  getReflections,
  postReflection,
  logoutSoft,
  getCompanion,
  companionRespond,
  memoryAppend,
  // memorySummarize, // optional
} from '../lib/api';
import useTokenRefresh from '../useTokenRefresh';

// --- Types (lightweight to keep TS happy) ---
type Reflection = {
  content: string;
  timestamp: string;
  companion?: boolean;
};

type Companion = {
  name: string;
};

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [companion, setCompanion] = useState<Companion | null>(null);

  // Optional inline chat box log (kept minimal)
  const [messages, setMessages] = useState<{ role: 'system'|'user'|'assistant'; content: string }[]>([
    { role: 'system', content: 'Welcome to Reflections ✨ Your companion awaits.' },
  ]);

  useTokenRefresh();

  useEffect(() => {
    refresh();
    loadCompanion();
  }, []);

  async function refresh() {
    const data = await getReflections();
    setReflections((data as Reflection[]) || []);
  }

  async function loadCompanion() {
    const c = await getCompanion();
    setCompanion(c as Companion);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      // 1) Save your reflection
      await postReflection(text);

      // 2) Append to long-term memory
      await memoryAppend([{ type: 'reflection', content: text }]);

      setText('');
      await refresh();

      // 3) Ask the companion to respond
      const reply = await companionRespond();
      if ((reply as any)?.ok) {
        const content = (reply as any).response as string;

        // Show as a card in the list
        setReflections(prev => [
          { content, timestamp: new Date().toISOString(), companion: true },
          ...prev,
        ]);

        // Also log in the inline chat UI
        setMessages(prev => [
          ...prev,
          { role: 'user', content: text },
          { role: 'assistant', content },
        ]);

        // 4) Add the reply to memory
        await memoryAppend([{ type: 'reply', content }]);
      } else {
        // Fallback “echo” in case companionRespond returns non-ok
        setMessages(prev => [
          ...prev,
          { role: 'user', content: text },
          { role: 'assistant', content: `Echo: "${text}"` },
        ]);
      }

      // (Optional) Summarize periodically
      // await memorySummarize();
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logoutSoft();
    window.location.reload();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🪞 Reflections</h1>
          {companion && <p className="text-sm text-gray-500">with {companion.name}</p>}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      {/* Inline conversation view (compact) */}
      <section className="border rounded p-4 bg-white/50">
        <ChatBox messages={messages} />
      </section>

      {/* Submit a new reflection */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <textarea
          className="border rounded p-2"
          rows={3}
          placeholder="Write your reflection..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Submitting…' : 'Submit'}
        </button>
      </form>

      {/* Reflection cards */}
      <section className="space-y-2">
        {reflections.length === 0 ? (
          <p className="text-gray-500 text-center">No reflections yet. Be the first ✨</p>
        ) : (
          reflections.map((r, i) => (
            <div
              key={`${r.timestamp}-${i}`}
              className={`border rounded p-3 ${r.companion ? 'bg-yellow-50' : 'bg-gray-50'}`}
            >
              <p>{r.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {r.companion ? `${companion?.name ?? 'Companion'}` : 'You'} — {r.timestamp}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
