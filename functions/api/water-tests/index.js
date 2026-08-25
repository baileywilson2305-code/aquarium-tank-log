import { json, errorResponse, uid, num, str, readJson } from '../_utils.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, date, ph, ammonia, nitrite, nitrate, temp, notes FROM water_tests ORDER BY date DESC, created_at DESC'
  ).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  if (!body || !str(body.date)) return errorResponse('date is required');

  const id = uid();
  await env.DB.prepare(
    `INSERT INTO water_tests (id, date, ph, ammonia, nitrite, nitrate, temp, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, str(body.date), num(body.ph), num(body.ammonia), num(body.nitrite), num(body.nitrate), num(body.temp), str(body.notes))
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
