import { useEffect, useState } from "react";
import { getReflections, postReflection, logoutSoft } from "./api";
import useTokenRefresh from "./useTokenRefresh";

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useTokenRefresh(); // auto refresh every 2 minutes

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

  async function handleLogout() {
    await logoutSoft(); // or logoutHard()
    window.location.reload();
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🪞 Reflections</h1>
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
