// reflections/src/lib/api.ts
import axios from 'axios';

const LAB4 = process.env.NEXT_PUBLIC_API_LAB4 || '';
const LEDGER = process.env.NEXT_PUBLIC_API_LEDGER || '';
const LAB6 = process.env.NEXT_PUBLIC_API_LAB6 || '';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('civic_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** ------- Reflections (Lab4) ------- **/

// Return the latest reflections (shape: [{content, timestamp, companion?}, ...])
export async function getReflections(): Promise<Array<{content: string; timestamp: string; companion?: boolean;}>> {
  try {
    // TODO: swap to your real endpoint once available
    // const { data } = await axios.get(`${LAB4}/reflections`, { headers: authHeaders() });
    // return data?.items ?? [];
    return []; // stub so build doesn't fail if endpoint isn't ready
  } catch {
    return [];
  }
}

export async function postReflection(text: string): Promise<{ ok: boolean }> {
  try {
    // TODO: swap to your real endpoint
    // await axios.post(`${LAB4}/reflections`, { content: text }, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
    return { ok: true }; // stub
  } catch {
    return { ok: false };
  }
}

export async function logoutSoft(): Promise<void> {
  try {
    // TODO: swap to your real endpoint if you have one
    // await axios.post(`${LAB4}/auth/logout_soft`, {}, { headers: authHeaders() });
  } catch {
    /* ignore */
  }
}

export async function getCompanion(): Promise<{ name: string }> {
  try {
    // TODO: swap to your real endpoint
    // const { data } = await axios.get(`${LAB4}/companions/current`, { headers: authHeaders() });
    // return data;
    return { name: 'Jade' }; // stub
  } catch {
    return { name: 'Companion' };
  }
}

export async function companionRespond(): Promise<{ ok: boolean; response: string }> {
  try {
    // TODO: swap to your real endpoint
    // const { data } = await axios.post(`${LAB4}/companions/respond`, {}, { headers: authHeaders() });
    // return { ok: true, response: data?.reply ?? '' };
    return { ok: true, response: 'I hear you. What would you like to explore next?' }; // stub
  } catch {
    return { ok: false, response: '' };
  }
}

/** ------- Memory helpers (Lab4 or Ledger) ------- **/

export async function memoryAppend(
  items: Array<{ type: 'reflection' | 'reply' | string; content: string }>
): Promise<{ ok: boolean }> {
  try {
    // TODO: swap to your real endpoint
    // await axios.post(`${LAB4}/memory/append`, { items }, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
    return { ok: true }; // stub
  } catch {
    return { ok: false };
  }
}

export async function memorySummarize(): Promise<{ ok: boolean }> {
  try {
    // TODO: swap to your real endpoint
    // await axios.post(`${LAB4}/memory/summarize`, {}, { headers: authHeaders() });
    return { ok: true }; // stub
  } catch {
    return { ok: false };
  }
}

/** ------- (Optional) Ledger shortcuts ------- **/

export async function attestToLedger(payload: any): Promise<{ ok: boolean }> {
  try {
    // await axios.post(`${LEDGER}/ledger/attest`, payload, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
    return { ok: true }; // stub
  } catch {
    return { ok: false };
  }
}
