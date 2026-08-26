import { json, errorResponse, str, readJson, requireTankIdFromUrl } from '../_utils.js';

// Note: tank_name used to live here as a settings key. It now lives on the
// tanks table itself (tanks.name), since a tank's name is a property of the
// tank record, not a per-tank setting — so it's deliberately absent from
// ALLOWED_KEYS.
const ALLOWED_KEYS = new Set([
  'water_test_interval_days',
  'water_change_interval_days',
  'electricity_rate',
]);

export async function onRequestGet({ request, env }) {
  const tankId = requireTankIdFromUrl(request);
  if (!tankId) return errorResponse('tank_id is required');

  const { results } = await env.DB.prepare('SELECT key, value FROM settings WHERE tank_id = ?').bind(tankId).all();
  const out = {};
  for (const row of results) out[row.key] = row.value;
  return json(out);
}

export async function onRequestPut({ request, env }) {
  const body = await readJson(request);
  if (!body || typeof body !== 'object') return errorResponse('expected a JSON object of settings');
  const tankId = str(body.tankId);
  if (!tankId) return errorResponse('tankId is required');

  const updates = Object.entries(body).filter(([key]) => ALLOWED_KEYS.has(key));
  if (!updates.length) return errorResponse('no recognized settings keys in body');

  for (const [key, value] of updates) {
    const v = str(value);
    if (v === null) continue;
    await env.DB.prepare(
      `INSERT INTO settings (tank_id, key, value) VALUES (?, ?, ?)
       ON CONFLICT(tank_id, key) DO UPDATE SET value = excluded.value`
    ).bind(tankId, key, v).run();
  }

  const { results } = await env.DB.prepare('SELECT key, value FROM settings WHERE tank_id = ?').bind(tankId).all();
  const out = {};
  for (const row of results) out[row.key] = row.value;
  return json(out);
}
