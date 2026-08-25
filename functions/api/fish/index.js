import { json, errorResponse, uid, num, str, readJson } from '../_utils.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, date_added AS dateAdded, species, name, quantity, notes FROM fish ORDER BY date_added DESC, created_at DESC'
  ).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  if (!body || !str(body.dateAdded) || !str(body.species)) {
    return errorResponse('dateAdded and species are required');
  }

  const id = uid();
  const quantity = num(body.quantity) ?? 1;
  await env.DB.prepare(
    `INSERT INTO fish (id, date_added, species, name, quantity, notes) VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, str(body.dateAdded), str(body.species), str(body.name), quantity, str(body.notes))
    .run();

  return json({
    id,
    dateAdded: str(body.dateAdded),
    species: str(body.species),
    name: str(body.name),
    quantity,
    notes: str(body.notes),
  }, 201);
}
