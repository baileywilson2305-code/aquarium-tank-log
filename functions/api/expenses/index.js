import { json, errorResponse, uid, num, str, readJson } from '../_utils.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, date, category, item, cost, notes
     FROM expenses ORDER BY date DESC, created_at DESC`
  ).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  if (!body || !str(body.date) || !str(body.item)) {
    return errorResponse('date and item are required');
  }

  const id = uid();
  await env.DB.prepare(
    `INSERT INTO expenses (id, date, category, item, cost, notes)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      str(body.date),
      str(body.category),
      str(body.item),
      num(body.cost),
      str(body.notes)
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
