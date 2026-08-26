import { json, errorResponse, uid, num, str, readJson, requireTankIdFromUrl } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const tankId = requireTankIdFromUrl(request);
  if (!tankId) return errorResponse('tank_id is required');

  const { results } = await env.DB.prepare(
    'SELECT id, date, ph, ammonia, nitrite, nitrate, temp, notes FROM water_tests WHERE tank_id = ? ORDER BY date DESC, created_at DESC'
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
    `INSERT INTO water_tests (id, date, ph, ammonia, nitrite, nitrate, temp, notes, tank_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, str(body.date), num(body.ph), num(body.ammonia), num(body.nitrite), num(body.nitrate), num(body.temp), str(body.notes), tankId)
    .run();

  return json({
    id,
    date: str(body.date),
    ph: num(body.ph),
    ammonia: num(body.ammonia),
    nitrite: num(body.nitrite),
    nitrate: num(body.nitrate),
    temp: num(body.temp),
    notes: str(body.notes),
  }, 201);
}
