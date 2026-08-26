import { json, errorResponse, uid, num, str, readJson, requireTankIdFromUrl } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const tankId = requireTankIdFromUrl(request);
  if (!tankId) return errorResponse('tank_id is required');

  const { results } = await env.DB.prepare(
    'SELECT id, date, percent, notes FROM water_changes WHERE tank_id = ? ORDER BY date DESC, created_at DESC'
  ).bind(tankId).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const tankId = body ? str(body.tankId) : null;
  if (!tankId) return errorResponse('tankId is required');
  if (!body || !str(body.date)) return errorResponse('date is required');

  const id = uid();
  await env.DB.prepare(
    `INSERT INTO water_changes (id, date, percent, notes, tank_id) VALUES (?, ?, ?, ?, ?)`
  )
    .bind(id, str(body.date), num(body.percent), str(body.notes), tankId)
    .run();

  return json({ id, date: str(body.date), percent: num(body.percent), notes: str(body.notes) }, 201);
}
