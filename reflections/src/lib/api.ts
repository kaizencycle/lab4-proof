export async function saveReflection(civicId: string, message: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/memory/save`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ civic_id: civicId, message })
  });
  return res.json();
}

export async function anchorReflection(civicId: string, message: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_LEDGER_API}/ledger/attest`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type: "reflection_appended",
      civic_id: civicId,
      lab_source: "lab4",
      payload: { message }
    })
  });
  return res.json();
}
