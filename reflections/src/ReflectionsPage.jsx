// src/ReflectionsPage.jsx
import { useEffect, useState } from "react";
import { getReflections, postReflection } from "./api";

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const data = await getReflections();
    setReflections(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await postReflection(text);
      setText("");
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">🪞 Reflections</h1>

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
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      <div className="space-y-2">
        {reflections.length === 0 ? (
          <p className="text-gray-500 text-center">No reflections yet. Be the first ✨</p>
        ) : (
          reflections.map((r, i) => (
            <div key={i} className="border rounded p-3 bg-gray-50">
              <p>{r.content}</p>
              <p className="text-xs text-gray-500 mt-1">at {r.timestamp}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
