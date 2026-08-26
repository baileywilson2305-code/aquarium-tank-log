import { json, errorResponse, uid, num, str, readJson, requireTankIdFromUrl } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const tankId = requireTankIdFromUrl(request);
  if (!tankId) return errorResponse('tank_id is required');

  const { results } = await env.DB.prepare(
    `SELECT id, date, category, item, cost, notes
     FROM expenses WHERE tank_id = ? ORDER BY date DESC, created_at DESC`
  ).bind(tankId).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const tankId = body ? str(body.tankId) : null;
  if (!tankId) return errorResponse('tankId is required');
  if (!body || !str(body.date) || !str(body.item)) {
    return errorResponse('date and item are required');
  }

  const id = uid();
  await env.DB.prepare(
    `INSERT INTO expenses (id, date, category, item, cost, notes, tank_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      str(body.date),
      str(body.category),
      str(body.item),
      num(body.cost),
      str(body.notes),
      tankId
    )
    .run();

  return json(
    {
      id,
      date: str(body.date),
      category: str(body.category),
      item: str(body.item),
      cost: num(body.cost),
      notes: str(body.notes),
    },
    201
  );
}
