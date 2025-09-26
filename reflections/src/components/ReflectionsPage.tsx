'use client';

import { useEffect, useState } from "react";
import { getReflections, postReflection, logoutSoft, getCompanion,companionRespond } 
from "./api"; import useTokenRefresh from "./useTokenRefresh";
import React, { useState, useEffect } from 'react';
import ChatBox from './ChatBox';

export default function ReflectionsPage() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Welcome to Reflections ✨ Your companion awaits.' }
  ]);
  const [input, setInput] = useState('');

  // Handle sending a message
  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    // Stub for companion response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Echo: "${input}"` }
      ]);
    }, 500);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Reflections</h1>
      <p className="subtitle">
        A space for conversations with your AI companion.
      </p>

      <ChatBox messages={messages} />

      <div style={{ marginTop: '1rem', display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your reflection..."
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button onClick={handleSend} style={{ marginLeft: '0.5rem' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [companion, setCompanion] = useState(null);

  useTokenRefresh();

  useEffect(() => {
    refresh();
    loadCompanion();
  }, []);

  async function refresh() {
    const data = await getReflections();
    setReflections(data || []);
  }

  async function loadCompanion() {
    const c = await getCompanion();
    setCompanion(c);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await postReflection(text);
      setText("");
      await refresh();

      // ask companion to respond
      const reply = await companionRespond();
      if (reply.ok) {
        setReflections((prev) => [
          { content: reply.response, timestamp: new Date().toISOString(), companion: true },
          ...prev,
        ]);
      }
    } finally {
      setLoading(false);
    }
  }
  
import { memoryAppend, memorySummarize } from "../lib/api";

async function handleSubmit(e) {
  e.preventDefault();
  if (!text.trim()) return;
  setLoading(true);
  try {
    // 1) Save reflection (your existing endpoint)
    await postReflection(text);

    // 2) Append to memory
    await memoryAppend([{ type: "reflection", content: text }]);

    // 3) (Optional) summarize every 10 reflections (quick heuristic)
    // You could track a local count or just call and ignore errors:
    // await memorySummarize();

    setText("");
    await refresh();

    // 4) Ask companion to respond (will use memory)
    const reply = await companionRespond();
    if (reply.ok) {
      setReflections((prev) => [
        { content: reply.response, timestamp: new Date().toISOString(), companion: true },
        ...prev,
      ]);
      // 5) Also append companion reply to memory
      await memoryAppend([{ type: "reply", content: reply.response }]);
    }
  } finally {
    setLoading(false);
  }
}
  
  async function handleLogout() {
    await logoutSoft();
    window.location.reload();
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🪞 Reflections</h1>
        {companion && <p className="text-sm text-gray-500">with {companion.name}</p>}
        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

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
          {loading ? "Submitting…" : "Submit"}
        </button>
      </form>

      <div className="space-y-2">
        {reflections.length === 0 ? (
          <p className="text-gray-500 text-center">No reflections yet. Be the first ✨</p>
        ) : (
          reflections.map((r, i) => (
            <div
              key={i}
              className={`border rounded p-3 ${
                r.companion ? "bg-yellow-50" : "bg-gray-50"
              }`}
            >
              <p>{r.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {r.companion ? `${companion?.name} (companion)` : "You"} — {r.timestamp}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
