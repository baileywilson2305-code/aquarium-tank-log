import { json, errorResponse, uid, str, readJson, requireTankIdFromUrl } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const tankId = requireTankIdFromUrl(request);
  if (!tankId) return errorResponse('tank_id is required');

  const { results } = await env.DB.prepare(
    'SELECT id, date, medication, dose, reason, notes FROM medications WHERE tank_id = ? ORDER BY date DESC, created_at DESC'
  ).bind(tankId).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const tankId = body ? str(body.tankId) : null;
  if (!tankId) return errorResponse('tankId is required');
  if (!body || !str(body.date) || !str(body.medication)) {
    return errorResponse('date and medication are required');
  }

  const id = uid();
  await env.DB.prepare(
    `INSERT INTO medications (id, date, medication, dose, reason, notes, tank_id) VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, str(body.date), str(body.medication), str(body.dose), str(body.reason), str(body.notes), tankId)
    .run();

  return json({
    id,
    date: str(body.date),
    medication: str(body.medication),
    dose: str(body.dose),
    reason: str(body.reason),
    notes: str(body.notes),
  }, 201);
}
