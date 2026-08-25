import { json, errorResponse, str, readJson } from '../_utils.js';

const ALLOWED_KEYS = new Set([
  'tank_name',
  'water_test_interval_days',
  'water_change_interval_days',
  'electricity_rate',
]);

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
  const out = {};
  for (const row of results) out[row.key] = row.value;
  return json(out);
}

export async function onRequestPut({ request, env }) {
  const body = await readJson(request);
  if (!body || typeof body !== 'object') return errorResponse('expected a JSON object of settings');

  const updates = Object.entries(body).filter(([key]) => ALLOWED_KEYS.has(key));
  if (!updates.length) return errorResponse('no recognized settings keys in body');

  for (const [key, value] of updates) {
    const v = str(value);
    if (v === null) continue;
    await env.DB.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).bind(key, v).run();
  }

  const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
  const out = {};
  for (const row of results) out[row.key] = row.value;
  return json(out);
}
