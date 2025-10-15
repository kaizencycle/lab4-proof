"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { routes } from "@/lib/api";

const today = () => dayjs().format("YYYY-MM-DD");

export default function Home() {
  const [ok, setOk] = useState<null | boolean>(null);
  const [date, setDate] = useState(today());
  const [time, setTime] = useState("09:00:00");
  const [intent, setIntent] = useState("iterate");
  const [note, setNote] = useState("");
  const [xp, setXp] = useState(0);
  const [chamber, setChamber] = useState("Reflections");
  const chambers = ["Reflections","Lab4","Market","CommandLedger","Agora"];

  const [last, setLast] = useState<any>(null);
  const [ledger, setLedger] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);

  useEffect(() => {
    routes.health().then(() => setOk(true)).catch(() => setOk(false));
    loadIndex();
    // default: load today ledger
    loadLedger(today());
  }, []);

  async function onSeed() {
    const res = await routes.seed({ date, time, intent, meta: {} });
    setLast(res.data);
  }
  async function onSweep(publish=false) {
    if (!note.trim()) return;
    // NOTE: if you encrypt for private, swap note/hash here
    const res = await routes.sweep({
      date,
      chamber,
      note,
      meta: {
        gic_intent: publish ? "publish" : "private",
        content_hash: "todo-sha256", // compute in UI later if needed
        ui: "web",
      },
    });
    setLast(res.data);
    setNote("");
    setXp((v) => v + (publish ? 25 : 10));
    // refresh today ledger counts
    loadLedger(date);
  }
  async function onSeal() {
    const res = await routes.seal({
      date,
      wins: "reflections logged",
      blocks: "none",
      tomorrow_intent: intent,
      meta: {},
    });
    setLast(res.data);
    loadIndex();
    loadLedger(date);
  }
  async function loadLedger(d: string) {
    const res = await routes.verify(d); // includes gic.sum, counts, links
    setLedger(res.data);
  }
  async function loadIndex() {
    const res = await routes.index();
    setDays(res.data.items || []);
  }

  return (
    <main className="min-h-screen bg-black">
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Reflections</h1>
        <p className="mt-3 text-zinc-300">Log your thoughts; earn GIC; seal your day.</p>
        <p className="mt-2 text-sm">
          Backend: {ok === null ? "…" : ok ? "online ✅" : "offline ❌"}
        </p>

        {/* Phone-like card */}
        <div className="mx-auto mt-12 w-full max-w-md rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl">
          {/* Reflection area */}
          <div className="rounded-2xl bg-zinc-800/70 p-5 text-left">
            <h3 className="mb-2 text-zinc-300 text-sm">Daily Reflection</h3>
            <textarea
              rows={4}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-transparent p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="What did you learn today?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="mt-3 flex items-center gap-3">
              <select
                className="w-full rounded-lg border border-zinc-700 bg-transparent p-2 text-sm"
                value={chamber}
                onChange={(e) => setChamber(e.target.value)}
              >
                {chambers.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900">{c}</option>
                ))}
              </select>
              <button
                onClick={() => onSweep(false)}
                className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300"
              >
                Private (+10)
              </button>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => onSweep(true)}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20"
              >
                Publish (+25)
              </button>
            </div>
          </div>

          {/* XP */}
          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">Current XP</p>
            <p className="text-5xl font-extrabold text-emerald-400">{xp}</p>
          </div>

          {/* Seed/Seal row */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={onSeed}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-300 hover:bg-emerald-500/20"
            >
              Seed
            </button>
            <button
              onClick={onSeal}
              className="rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-black hover:bg-emerald-300"
            >
              Seal
            </button>
          </div>

          {/* Date/Time/Intent */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-left">
            <Field label="Date" value={date} onChange={setDate}/>
            <Field label="Time" value={time} onChange={setTime}/>
            <Field label="Intent" value={intent} onChange={setIntent}/>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-zinc-300">
          ✨ Your reflections are yours first. Stay private, or publish to the civic library for higher rewards.
        </p>
      </section>

      {/* Ledger + Days */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Ledger (Verify)">
            <div className="flex items-center gap-2 mb-2">
              <input
                className="w-full rounded-lg border border-zinc-700 p-2 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button
                onClick={() => loadLedger(date)}
                className="rounded-lg border border-zinc-700 px-3 py-1 text-sm hover:bg-zinc-800"
              >
                Load
              </button>
            </div>
            <Pre data={ledger}/>
          </Card>

          <Card title="All Days (/index)">
            <button
              onClick={loadIndex}
              className="mb-2 rounded-lg border border-zinc-700 px-3 py-1 text-sm hover:bg-zinc-800"
            >
              Refresh
            </button>
            <Pre data={days}/>
          </Card>
        </div>

        <Card title="Last Response">
          <Pre data={last}/>
        </Card>
      </section>
    </main>
  );
}

function Field({label, value, onChange}:{label:string; value:string; onChange:(v:string)=>void}){
  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-700 p-2 text-sm"
      />
    </div>
  );
}

function Card({title, children}:{title:string; children:any}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {children}
    </div>
  );
}
function Pre({data}:{data:any}) {
  return (
    <pre className="h-72 overflow-auto whitespace-pre-wrap text-zinc-200 text-sm">
      {data ? JSON.stringify(data, null, 2) : "…"}
    </pre>
  );
}
