import { useState, useEffect, useRef } from "react";
import {
  getReflections,
  postReflection,
  companionRespond,
  memoryAppend,
} from "./api";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

useEffect(() => {
  const el = textareaRef.current;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 6 * 24) + "px"; // 24px line height
}, [text]);

// replace textarea with ref
const textareaRef = useRef(null);
// ...
<textarea ref={textareaRef} ... />

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadHistory() {
    const data = await getReflections();
    setMessages(
      (data || []).map((r) => ({
        role: r.companion ? "companion" : "user",
        content: r.content,
        ts: r.timestamp,
      }))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    // user reflection
    const userMsg = { role: "user", content: text, ts: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      await postReflection(text);
      await memoryAppend([{ type: "reflection", content: text }]);
      setText("");

      // ask companion
      const reply = await companionRespond();
      if (reply.ok) {
        const compMsg = {
          role: "companion",
          content: reply.response,
          ts: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, compMsg]);
        await memoryAppend([{ type: "reply", content: reply.response }]);
      }
    } finally {
      setLoading(false);
    }
  }

// src/ChatBox.jsx
import { useState, useEffect, useRef } from "react";
import {
  getReflections,
  postReflection,
  companionRespond,
  memoryAppend,
} from "./api";
import MemoryPanel from "./MemoryPanel";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadHistory();
    const onKey = (e) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setShowMemory((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showMemory]);

  async function loadHistory() {
    const data = await getReflections();
    setMessages(
      (data || []).map((r) => ({
        role: r.companion ? "companion" : "user",
        content: r.content,
        ts: r.timestamp,
      }))
    );
  }

import { useState, useEffect, useRef } from "react";
import SessionBadge from "./SessionBadge";
// ... other imports unchanged

export default function ChatBox() {
  // ... state & effects unchanged

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      // trigger submit
      const fakeEvent = { preventDefault() {} };
      handleSubmit(fakeEvent);
    }
  }

  return (
    <div className="h-screen flex">
      <SessionBadge />
      {/* Chat column */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto border-r">
        <div className="p-3 border-b flex items-center justify-between">
          <h1 className="font-semibold">🪞 Reflections</h1>
          <button
            onClick={() => setShowMemory((v) => !v)}
            className="text-sm border rounded px-3 py-1 hover:bg-gray-50"
          >
            {showMemory ? "Hide Memory" : "Show Memory"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
          {/* ... messages as before ... */}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t flex space-x-2 bg-white">
          <textarea
            className="flex-1 border rounded px-3 py-2 resize-none"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your reflection… (Enter to send, Shift+Enter for newline)"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "…" : "Send"}
          </button>
        </form>
      </div>

      {showMemory && (
        <div className="hidden md:block w-96">
          <MemoryPanel onClose={() => setShowMemory(false)} />
        </div>
      )}
    </div>
  );
}
  
  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    const userMsg = { role: "user", content: text, ts: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      await postReflection(text);
      await memoryAppend([{ type: "reflection", content: text }]);
      setText("");

      const reply = await companionRespond();
      if (reply.ok) {
        const compMsg = {
          role: "companion",
          content: reply.response,
          ts: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, compMsg]);
        await memoryAppend([{ type: "reply", content: reply.response }]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex">
      {/* Chat column */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto border-r">
        <div className="p-3 border-b flex items-center justify-between">
          <h1 className="font-semibold">🪞 Reflections</h1>
          <button
            onClick={() => setShowMemory((v) => !v)}
            className="text-sm border rounded px-3 py-1 hover:bg-gray-50"
          >
            {showMemory ? "Hide Memory" : "Show Memory"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs ${
                  m.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className="text-[10px] opacity-70 mt-1">{m.role} • {m.ts}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t flex space-x-2 bg-white">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your reflection…"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "…" : "Send"}
          </button>
        </form>
      </div>

      {/* Memory side panel */}
      {showMemory && (
        <div className="hidden md:block w-96">
          <MemoryPanel onClose={() => setShowMemory(false)} />
        </div>
      )}
    </div>
  );
}
  
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border rounded shadow">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-lg max-w-xs ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p>{m.content}</p>
              <p className="text-xs opacity-70">{m.role}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-3 border-t flex space-x-2 bg-white"
      >
        <input
          className="flex-1 border rounded px-3 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your reflection…"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
