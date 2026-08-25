// Shared helpers for the tank-log API. Plain D1 access, no framework —
// Cloudflare Pages Functions route each file by its path under /functions.

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function errorResponse(message, status = 400) {
  return json({ error: message }, status);
}

export function uid() {
  return crypto.randomUUID();
}

// Coerce a form value to a number for storage, treating '', null and
// undefined as "no reading" rather than 0 — a blank ammonia field should
// stay unknown, not silently become a measured zero.
export function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function str(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
