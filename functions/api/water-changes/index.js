import { json, errorResponse, uid, num, str, readJson } from '../_utils.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, date, percent, notes FROM water_changes ORDER BY date DESC, created_at DESC'
  ).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  if (!body || !str(body.date)) return errorResponse('date is required');

  const id = uid();
  await env.DB.prepare(
    `INSERT INTO water_changes (id, date, percent, notes) VALUES (?, ?, ?, ?)`
  )
    .bind(id, str(body.date), num(body.percent), str(body.notes))
    .run();

  return json({ id, date: str(body.date), percent: num(body.percent), notes: str(body.notes) }, 201);
}
