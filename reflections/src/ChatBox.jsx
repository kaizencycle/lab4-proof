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
